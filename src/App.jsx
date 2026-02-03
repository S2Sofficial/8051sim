import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Play, Activity, AlertCircle, CheckCircle, Info, Cpu, List, Binary, StepForward, RotateCcw, Pause, Layers, Zap, X, Download, BookOpen, Copy, Check, Moon, Sun, History } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// Imports from our new folder structure
import { THEMES, SFR_MAP } from './data/constants';
import { DEFAULT_CODE } from './data/snippets';
import { parseValue, parseLine } from './utils/helpers';
import LandingPage from './components/LandingPage';
import CodeEditor from './components/CodeEditor';
import RegisterView from './components/RegisterView';
import TraceView from './components/TraceView';
import GPIOView from './components/GPIOView';
import SnippetsModal from './components/SnippetModal';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('8051_theme');
    return saved ? JSON.parse(saved) : false;
  });
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  useEffect(() => { localStorage.setItem('8051_theme', JSON.stringify(isDarkMode)); }, [isDarkMode]);

  const codeRef = useRef(DEFAULT_CODE);
  const isModifiedRef = useRef(false);
  const [cpu, setCpu] = useState({ A: 0, B: 0, PSW: 0, SP: 0x07, PC: 0, DPTR: 0, R: [0,0,0,0,0,0,0,0], RAM: new Array(256).fill(0), cycles: 0, stack: [], serialTx: { pending: false, remaining: 0 } });
  const [isRunning, setIsRunning] = useState(false);
  const [parsedLines, setParsedLines] = useState([]);
  const [labels, setLabels] = useState({});
  const [view, setView] = useState('sim');
  const [hexDump, setHexDump] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [traceLog, setTraceLog] = useState([]);
  const [serialLog, setSerialLog] = useState([]);
  const [serialInput, setSerialInput] = useState('');

  const intervalRef = useRef(null);
  const FLAG_CY = 0x80;
  const FLAG_AC = 0x40;
  const FLAG_F0 = 0x20;
  const FLAG_RS1 = 0x10;
  const FLAG_RS0 = 0x08;
  const FLAG_OV = 0x04;
  const FLAG_P = 0x01;
  const TCON_TF1 = 0x80;
  const TCON_TR1 = 0x40;
  const TCON_TF0 = 0x20;
  const TCON_TR0 = 0x10;
  const TCON_IE1 = 0x08;
  const TCON_IE0 = 0x02;
  const SCON_TI = 0x02;
  const SCON_RI = 0x01;
  const IE_EA = 0x80;
  const IE_ES = 0x10;
  const IE_ET1 = 0x08;
  const IE_EX1 = 0x04;
  const IE_ET0 = 0x02;
  const IE_EX0 = 0x01;

  const setFlag = (psw, flag, value) => (value ? (psw | flag) : (psw & ~flag));
  const updateParity = (psw, acc) => {
    let ones = 0;
    for (let i = 0; i < 8; i += 1) ones ^= (acc >> i) & 1;
    return setFlag(psw, FLAG_P, ones === 1);
  };

  const handleCodeChange = useCallback((nextCode) => {
    codeRef.current = nextCode;
    if (!isModifiedRef.current) {
      isModifiedRef.current = true;
      setIsModified(true);
    }
  }, []);
  const handleDownload = () => {
    const blob = new Blob([codeRef.current], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'code.asm';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  const compileHex = () => {
    const lines = codeRef.current.split('\n');
    let location = 0;
    const output = [];
    lines.forEach(line => {
        const p = parseLine(line, 0);
        if(p && p.mnemonic === 'ORG') location = parseValue(p.operands[0]);
        else if(p && p.mnemonic && p.mnemonic !== 'EQU') { output.push({ address: location, bytes: [0x00] }); location++; }
    });
    setHexDump(output);
  };

  const getRegisterBankOffset = (psw) => psw & 0x18;
  const getBankedRegisters = (ram, psw) => {
    const offset = getRegisterBankOffset(psw);
    return Array.from({ length: 8 }, (_, i) => ram[offset + i] || 0);
  };
  const updateSfr = (next, address, value) => {
    const val = value & 0xFF;
    next.RAM[address] = val;
    if (address === SFR_MAP.ACC) next.A = val;
    if (address === SFR_MAP.B) next.B = val;
    if (address === SFR_MAP.PSW) next.PSW = val;
    if (address === SFR_MAP.SP) next.SP = val;
  };
  const pushStack = (next, value) => {
    next.SP = (next.SP + 1) & 0xFF;
    next.RAM[next.SP] = value & 0xFF;
    updateSfr(next, SFR_MAP.SP, next.SP);
  };
  const popStack = (next) => {
    const value = next.RAM[next.SP] || 0;
    next.SP = (next.SP - 1) & 0xFF;
    updateSfr(next, SFR_MAP.SP, next.SP);
    return value;
  };
  const resolveBitAddress = (operand) => {
    if (operand.includes('.')) {
      const [port, bitStr] = operand.split('.');
      const addr = SFR_MAP[port] !== undefined ? SFR_MAP[port] : parseValue(port);
      return { address: addr, mask: 1 << parseInt(bitStr, 10) };
    }
    const bitAddress = parseValue(operand);
    if (bitAddress <= 0x7F) {
      const byteAddr = 0x20 + (bitAddress >> 3);
      return { address: byteAddr, mask: 1 << (bitAddress & 0x07) };
    }
    const byteAddr = bitAddress & 0xF8;
    return { address: byteAddr, mask: 1 << (bitAddress & 0x07) };
  };
  const getOpcodeInfo = (mnemonic, operands) => {
    const op1 = operands[0];
    const op2 = operands[1];
    const isReg = (op) => /^R[0-7]$/i.test(op);
    const regIndex = (op) => parseInt(op[1], 10);
    const isImm = (op) => op?.startsWith('#');
    const isDirect = (op) => SFR_MAP[op] !== undefined || /^[0-9]/.test(op) || /H$/i.test(op) || /B$/i.test(op);
    const opcodeTable = Array.from({ length: 256 }, () => ({ cycles: 1 }));
    opcodeTable[0x00] = { cycles: 1 };
    opcodeTable[0x01] = { cycles: 2 };
    opcodeTable[0x02] = { cycles: 2 };
    opcodeTable[0x11] = { cycles: 2 };
    opcodeTable[0x12] = { cycles: 2 };
    opcodeTable[0x22] = { cycles: 2 };
    opcodeTable[0x32] = { cycles: 2 };
    opcodeTable[0x80] = { cycles: 2 };
    opcodeTable[0xD5] = { cycles: 2 };
    opcodeTable[0xD2] = { cycles: 1 };
    opcodeTable[0xC2] = { cycles: 1 };
    opcodeTable[0xF4] = { cycles: 1 };
    opcodeTable[0xE4] = { cycles: 1 };
    opcodeTable[0x04] = { cycles: 1 };
    opcodeTable[0x14] = { cycles: 1 };
    opcodeTable[0x24] = { cycles: 1 };
    opcodeTable[0x25] = { cycles: 2 };
    opcodeTable[0x94] = { cycles: 1 };
    opcodeTable[0x95] = { cycles: 2 };
    opcodeTable[0x74] = { cycles: 1 };
    opcodeTable[0x75] = { cycles: 2 };
    opcodeTable[0xE5] = { cycles: 2 };
    opcodeTable[0xF5] = { cycles: 2 };
    opcodeTable[0xC0] = { cycles: 2 };
    opcodeTable[0xD0] = { cycles: 2 };

    let opcode = 0x00;
    switch (mnemonic) {
      case 'NOP': opcode = 0x00; break;
      case 'LJMP': opcode = 0x02; break;
      case 'AJMP': opcode = 0x01; break;
      case 'ACALL': opcode = 0x11; break;
      case 'LCALL': opcode = 0x12; break;
      case 'RET': opcode = 0x22; break;
      case 'RETI': opcode = 0x32; break;
      case 'SJMP': opcode = 0x80; break;
      case 'DJNZ':
        if (isReg(op1)) opcode = 0xD8 + regIndex(op1);
        else opcode = 0xD5;
        break;
      case 'SETB': opcode = 0xD2; break;
      case 'CLR': opcode = op1 === 'A' ? 0xE4 : 0xC2; break;
      case 'CPL': opcode = op1 === 'A' ? 0xF4 : 0xB2; break;
      case 'INC':
        if (op1 === 'A') opcode = 0x04;
        else if (isReg(op1)) opcode = 0x08 + regIndex(op1);
        else opcode = 0x05;
        break;
      case 'DEC':
        if (op1 === 'A') opcode = 0x14;
        else if (isReg(op1)) opcode = 0x18 + regIndex(op1);
        else opcode = 0x15;
        break;
      case 'ADD':
        if (isImm(op2)) opcode = 0x24;
        else if (isReg(op2)) opcode = 0x28 + regIndex(op2);
        else opcode = 0x25;
        break;
      case 'SUBB':
        if (isImm(op2)) opcode = 0x94;
        else if (isReg(op2)) opcode = 0x98 + regIndex(op2);
        else opcode = 0x95;
        break;
      case 'MOV':
        if (op1 === 'A' && isImm(op2)) opcode = 0x74;
        else if (isReg(op1) && isImm(op2)) opcode = 0x78 + regIndex(op1);
        else if (op1 === 'A' && isDirect(op2)) opcode = 0xE5;
        else if (isDirect(op1) && op2 === 'A') opcode = 0xF5;
        else if (isDirect(op1) && isImm(op2)) opcode = 0x75;
        else if (op1 === 'A' && isReg(op2)) opcode = 0xE8 + regIndex(op2);
        else if (isReg(op1) && op2 === 'A') opcode = 0xF8 + regIndex(op1);
        else opcode = 0x75;
        break;
      case 'PUSH': opcode = 0xC0; break;
      case 'POP': opcode = 0xD0; break;
      default: opcode = 0x00;
    }
    return { opcode, cycles: opcodeTable[opcode]?.cycles ?? 1 };
  };

  const resetSim = useCallback(() => {
      const initRam = new Array(256).fill(0);
      initRam[0x80]=0xFF; initRam[0x90]=0xFF; initRam[0xA0]=0xFF; initRam[0xB0]=0xFF;
      initRam[SFR_MAP.PSW] = 0x00;
      initRam[SFR_MAP.ACC] = 0x00;
      initRam[SFR_MAP.B] = 0x00;
      initRam[SFR_MAP.SP] = 0x07;
      initRam[SFR_MAP.TCON] = 0x00;
      initRam[SFR_MAP.TMOD] = 0x00;
      initRam[SFR_MAP.TL0] = 0x00;
      initRam[SFR_MAP.TH0] = 0x00;
      initRam[SFR_MAP.TL1] = 0x00;
      initRam[SFR_MAP.TH1] = 0x00;
      initRam[SFR_MAP.IE] = 0x00;
      initRam[SFR_MAP.IP] = 0x00;
      initRam[SFR_MAP.SCON] = 0x00;
      initRam[SFR_MAP.SBUF] = 0x00;
      initRam[SFR_MAP.PCON] = 0x00;
      
      const lines = codeRef.current.split('\n');
      const pLines = [];
      const newLabels = {};
      lines.forEach((line, i) => {
          const parsed = parseLine(line, i + 1);
          pLines.push(parsed);
          if (parsed && parsed.label) {
             if(parsed.mnemonic === 'EQU') newLabels[parsed.label] = parseValue(parsed.operands[0]);
             else newLabels[parsed.label] = i; 
          }
      });
      setParsedLines(pLines);
      setLabels(newLabels);
      setTraceLog([]);
      setSerialLog([]);
      
      let pc = 0;
      for(let i=0; i<pLines.length; i++) { if(pLines[i] && pLines[i].mnemonic && pLines[i].mnemonic !== 'ORG') { pc = i; break; } }

      setCpu({ A: 0, B: 0, PSW: 0x00, SP: 0x07, PC: pc, DPTR: 0, R: [0,0,0,0,0,0,0,0], RAM: initRam, cycles: 0, stack: [], serialTx: { pending: false, remaining: 0 } });
      setIsRunning(false);
      setErrorMsg(null);
      isModifiedRef.current = false;
      setIsModified(false);
  }, []);

  const applyTimerTicks = (next, cycles) => {
    const tcon = next.RAM[SFR_MAP.TCON] || 0;
    const tmod = next.RAM[SFR_MAP.TMOD] || 0;
    const tickTimer = (timerIndex) => {
      const isTimer1 = timerIndex === 1;
      const trBit = isTimer1 ? TCON_TR1 : TCON_TR0;
      const tfBit = isTimer1 ? TCON_TF1 : TCON_TF0;
      if (!(tcon & trBit)) return;
      const mode = isTimer1 ? ((tmod >> 4) & 0x03) : (tmod & 0x03);
      const tlAddr = isTimer1 ? SFR_MAP.TL1 : SFR_MAP.TL0;
      const thAddr = isTimer1 ? SFR_MAP.TH1 : SFR_MAP.TH0;
      let tl = next.RAM[tlAddr] || 0;
      let th = next.RAM[thAddr] || 0;
      let overflow = false;

      if (mode === 0) {
        let value = ((th & 0x1F) << 8) | tl;
        value += cycles;
        if (value > 0x1FFF) {
          overflow = true;
          value &= 0x1FFF;
        }
        th = (value >> 8) & 0x1F;
        tl = value & 0xFF;
      } else if (mode === 1) {
        let value = (th << 8) | tl;
        value += cycles;
        if (value > 0xFFFF) {
          overflow = true;
          value &= 0xFFFF;
        }
        th = (value >> 8) & 0xFF;
        tl = value & 0xFF;
      } else if (mode === 2) {
        for (let i = 0; i < cycles; i += 1) {
          tl = (tl + 1) & 0xFF;
          if (tl === 0x00) {
            overflow = true;
            tl = th;
          }
        }
      } else if (mode === 3 && !isTimer1) {
        let low = tl;
        let high = th;
        for (let i = 0; i < cycles; i += 1) {
          low = (low + 1) & 0xFF;
          if (low === 0x00) overflow = true;
        }
        tl = low;
        th = high;
      }

      next.RAM[tlAddr] = tl;
      next.RAM[thAddr] = th;
      if (overflow) next.RAM[SFR_MAP.TCON] = next.RAM[SFR_MAP.TCON] | tfBit;
    };

    tickTimer(0);
    tickTimer(1);
  };

  const handleSerialTransmit = (next, cycles, opcodeInfo) => {
    if (!next.serialTx) next.serialTx = { pending: false, remaining: 0 };
    if (next.serialTx.pending) {
      next.serialTx.remaining -= cycles;
      if (next.serialTx.remaining <= 0) {
        next.serialTx.pending = false;
        next.RAM[SFR_MAP.SCON] = next.RAM[SFR_MAP.SCON] | SCON_TI;
        const byte = next.RAM[SFR_MAP.SBUF] || 0;
        setSerialLog((prev) => [...prev, { direction: 'TX', value: String.fromCharCode(byte) }]);
      }
    }
    if (opcodeInfo?.wroteSbuf) {
      const th1 = next.RAM[SFR_MAP.TH1] || 0;
      const tcon = next.RAM[SFR_MAP.TCON] || 0;
      const timerRunning = (tcon & TCON_TR1) !== 0;
      const reload = 256 - th1;
      const baudCycles = timerRunning ? Math.max(12, reload * 12) : 120;
      next.serialTx.pending = true;
      next.serialTx.remaining = baudCycles;
      next.RAM[SFR_MAP.SCON] = next.RAM[SFR_MAP.SCON] & ~SCON_TI;
    }
  };

  const serviceInterrupts = (next) => {
    const ie = next.RAM[SFR_MAP.IE] || 0;
    if (!(ie & IE_EA)) return;
    const tcon = next.RAM[SFR_MAP.TCON] || 0;
    const scon = next.RAM[SFR_MAP.SCON] || 0;
    const ip = next.RAM[SFR_MAP.IP] || 0;
    const pending = [];
    if ((ie & IE_EX0) && (tcon & TCON_IE0)) pending.push({ name: 'INT0', vector: 0x0003, flag: TCON_IE0, sfr: SFR_MAP.TCON, priority: (ip & IE_EX0) ? 1 : 0 });
    if ((ie & IE_ET0) && (tcon & TCON_TF0)) pending.push({ name: 'T0', vector: 0x000B, flag: TCON_TF0, sfr: SFR_MAP.TCON, priority: (ip & IE_ET0) ? 1 : 0 });
    if ((ie & IE_EX1) && (tcon & TCON_IE1)) pending.push({ name: 'INT1', vector: 0x0013, flag: TCON_IE1, sfr: SFR_MAP.TCON, priority: (ip & IE_EX1) ? 1 : 0 });
    if ((ie & IE_ET1) && (tcon & TCON_TF1)) pending.push({ name: 'T1', vector: 0x001B, flag: TCON_TF1, sfr: SFR_MAP.TCON, priority: (ip & IE_ET1) ? 1 : 0 });
    if ((ie & IE_ES) && (scon & (SCON_RI | SCON_TI))) pending.push({ name: 'SER', vector: 0x0023, flag: (SCON_RI | SCON_TI), sfr: SFR_MAP.SCON, priority: (ip & IE_ES) ? 1 : 0 });
    if (pending.length === 0) return;
    pending.sort((a, b) => b.priority - a.priority);
    const selected = pending[0];
    pushStack(next, (next.PC >> 8) & 0xFF);
    pushStack(next, next.PC & 0xFF);
    next.PC = selected.vector;
    next.RAM[selected.sfr] = next.RAM[selected.sfr] & ~selected.flag;
  };

  const stepSim = () => {
      if(isModified) { alert("Code changed. Please Reset simulation."); return; }
      setCpu(prev => {
          if (prev.PC >= parsedLines.length) { setIsRunning(false); return prev; }
          let next = { ...prev, RAM: [...prev.RAM], R: [...prev.R], serialTx: prev.serialTx || { pending: false, remaining: 0 } };
          const line = parsedLines[prev.PC];
          if (!line || !line.mnemonic || line.mnemonic === 'ORG' || line.mnemonic === 'EQU' || line.mnemonic === 'DB') return { ...next, PC: next.PC + 1 };

          const bankedRegisters = getBankedRegisters(prev.RAM, prev.PSW);
          const newTrace = { pc: prev.PC, inst: line.mnemonic + ' ' + line.operands.join(','), A: prev.A.toString(16).toUpperCase().padStart(2,'0'), R: bankedRegisters.map(r => r.toString(16).toUpperCase()) };
          setTraceLog(old => [newTrace, ...old]); 

          try {
              const op1 = line.operands[0]; const op2 = line.operands[1];
              const opcodeInfo = getOpcodeInfo(line.mnemonic, line.operands);
              let cyclesUsed = opcodeInfo.cycles || 1;
              const getVal = (op) => {
                  if (!op) return 0;
                  if (op === 'A') return next.A;
                  if (op.match(/^R[0-7]$/)) {
                    const offset = getRegisterBankOffset(next.PSW);
                    return next.RAM[offset + parseInt(op[1], 10)] || 0;
                  }
                  if (op.startsWith('#')) return parseValue(op, labels);
                  if (SFR_MAP[op] !== undefined) return next.RAM[SFR_MAP[op]] || 0;
                  if (labels[op] !== undefined) return next.RAM[labels[op]]; 
                  const addr = parseValue(op, labels); return next.RAM[addr] || 0;
              };
              const setVal = (op, val) => {
                  val = val & 0xFF;
                  if (op === 'A') next.A = val;
                  else if (op.match(/^R[0-7]$/)) {
                    const offset = getRegisterBankOffset(next.PSW);
                    next.RAM[offset + parseInt(op[1], 10)] = val;
                  }
                  else if (op === 'DPTR') next.DPTR = val & 0xFFFF;
                  else {
                    let addr = SFR_MAP[op] !== undefined ? SFR_MAP[op] : parseValue(op, labels);
                    if (addr >= 0 && addr <= 255) updateSfr(next, addr, val);
                  }
              };
              let parityUpdated = false;
              let psw = next.PSW;
              let wroteSbuf = false;
              const syncSfrAddresses = [SFR_MAP.ACC, SFR_MAP.B, SFR_MAP.PSW, SFR_MAP.SP];
              switch (line.mnemonic) {
                  case 'MOV': {
                      if(op1 === 'DPTR') next.DPTR = parseValue(op2, labels);
                      else setVal(op1, getVal(op2));
                      const op1Addr = SFR_MAP[op1] !== undefined ? SFR_MAP[op1] : parseValue(op1, labels);
                      if (op1Addr === SFR_MAP.SBUF) wroteSbuf = true;
                      if (op1 === 'A') {
                        next.PSW = updateParity(next.PSW, next.A);
                        parityUpdated = true;
                      }
                      next.PC++; break;
                  }
                  case 'ADD': {
                      const acc = next.A;
                      const val = getVal(op2);
                      const sum = acc + val;
                      next.A = sum & 0xFF;
                      psw = setFlag(psw, FLAG_CY, sum > 0xFF);
                      psw = setFlag(psw, FLAG_AC, ((acc & 0x0F) + (val & 0x0F)) > 0x0F);
                      psw = setFlag(psw, FLAG_OV, ((~(acc ^ val) & (acc ^ sum)) & 0x80) !== 0);
                      next.PSW = updateParity(psw, next.A);
                      parityUpdated = true;
                      next.PC++; break;
                  }
                  case 'SUBB': {
                      const acc = next.A;
                      const val = getVal(op2);
                      const carry = (psw & FLAG_CY) ? 1 : 0;
                      const diff = acc - val - carry;
                      next.A = diff & 0xFF;
                      psw = setFlag(psw, FLAG_CY, diff < 0);
                      psw = setFlag(psw, FLAG_AC, ((acc & 0x0F) - (val & 0x0F) - carry) < 0);
                      psw = setFlag(psw, FLAG_OV, (((acc ^ val) & (acc ^ diff)) & 0x80) !== 0);
                      next.PSW = updateParity(psw, next.A);
                      parityUpdated = true;
                      next.PC++; break;
                  }
                  case 'INC': {
                      if(op1 === 'DPTR') next.DPTR = (next.DPTR + 1) & 0xFFFF;
                      else setVal(op1, getVal(op1) + 1);
                      if (op1 === 'A') {
                        next.PSW = updateParity(next.PSW, next.A);
                        parityUpdated = true;
                      }
                      next.PC++; break;
                  }
                  case 'DEC': {
                      setVal(op1, (getVal(op1) - 1 + 256) & 0xFF);
                      if (op1 === 'A') {
                        next.PSW = updateParity(next.PSW, next.A);
                        parityUpdated = true;
                      }
                      next.PC++; break;
                  }
                  case 'CPL': {
                      if (op1.includes('.') || /^[0-9]/.test(op1)) {
                        const { address, mask } = resolveBitAddress(op1);
                        next.RAM[address] ^= mask;
                        if (syncSfrAddresses.includes(address)) {
                          updateSfr(next, address, next.RAM[address]);
                        }
                      } else {
                        setVal(op1, ~getVal(op1));
                        if (op1 === 'A') {
                          next.PSW = updateParity(next.PSW, next.A);
                          parityUpdated = true;
                        }
                      }
                      next.PC++; break;
                  }
                  case 'SETB':
                  case 'CLR': {
                      if (op1.includes('.') || /^[0-9]/.test(op1)) {
                        const { address, mask } = resolveBitAddress(op1);
                        next.RAM[address] = line.mnemonic === 'SETB' ? (next.RAM[address] | mask) : (next.RAM[address] & ~mask);
                        if (syncSfrAddresses.includes(address)) {
                          updateSfr(next, address, next.RAM[address]);
                        }
                      }
                      next.PC++; break;
                  }
                  case 'SJMP': case 'LJMP': case 'AJMP': const target = labels[op1]; if (target !== undefined) next.PC = target; else throw new Error(`Label ${op1} not found`); break;
                  case 'DJNZ': {
                      const v = (getVal(op1) - 1 + 256) & 0xFF;
                      setVal(op1, v);
                      if (v !== 0) { const tgt = labels[op2]; if (tgt !== undefined) next.PC = tgt; else throw new Error(`Label ${op2} not found`); }
                      else { next.PC++; }
                      break;
                  }
                  case 'ACALL':
                  case 'LCALL': {
                      pushStack(next, ((next.PC + 1) >> 8) & 0xFF);
                      pushStack(next, (next.PC + 1) & 0xFF);
                      const callTgt = labels[op1];
                      if (callTgt !== undefined) next.PC = callTgt;
                      else throw new Error(`Label ${op1} not found`);
                      break;
                  }
                  case 'RET': {
                      const low = popStack(next);
                      const high = popStack(next);
                      next.PC = (high << 8) | low;
                      break;
                  }
                  case 'RETI': {
                      const low = popStack(next);
                      const high = popStack(next);
                      next.PC = (high << 8) | low;
                      break;
                  }
                  case 'NOP': default: next.PC++; break;
              }
              if (wroteSbuf) opcodeInfo.wroteSbuf = true;
              if (!parityUpdated && next.A !== prev.A) {
                next.PSW = updateParity(next.PSW, next.A);
              }
              updateSfr(next, SFR_MAP.ACC, next.A);
              updateSfr(next, SFR_MAP.PSW, next.PSW);
              updateSfr(next, SFR_MAP.B, next.B);
              updateSfr(next, SFR_MAP.SP, next.SP);
              next.cycles += cyclesUsed;
              applyTimerTicks(next, cyclesUsed);
              handleSerialTransmit(next, cyclesUsed, opcodeInfo);
              serviceInterrupts(next);
          } catch (e) { setErrorMsg(e.message); setIsRunning(false); }
          return next;
      });
  };
  useEffect(() => { if (isRunning) intervalRef.current = setInterval(stepSim, 100); return () => clearInterval(intervalRef.current); }, [isRunning, parsedLines, labels, isModified]);
  useEffect(() => { resetSim(); }, []);
  const toggleGPIO = (addr, bit) => { setCpu(prev => { const next = {...prev, RAM: [...prev.RAM]}; next.RAM[addr] ^= (1 << bit); return next; }); };
  const handleSerialReceive = () => {
    if (!serialInput) return;
    const byte = serialInput.charCodeAt(0);
    setCpu(prev => {
      const next = { ...prev, RAM: [...prev.RAM] };
      updateSfr(next, SFR_MAP.SBUF, byte);
      next.RAM[SFR_MAP.SCON] = (next.RAM[SFR_MAP.SCON] || 0) | SCON_RI;
      return next;
    });
    setSerialLog((prev) => [...prev, { direction: 'RX', value: serialInput[0] }]);
    setSerialInput('');
  };

  if (!hasStarted) return <LandingPage onStart={() => setHasStarted(true)} isDark={isDarkMode} />;
  return (
    <div className={`flex flex-col h-screen lg:h-screen min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-opacity-30 selection:bg-blue-500`}>
      <header className={`flex-none p-4 lg:px-6 h-auto lg:h-16 border-b ${theme.border} ${theme.header} flex flex-col md:flex-row items-center justify-between shadow-sm gap-4 z-20`}>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-8 h-8 bg-[#cb4b16] rounded-sm flex items-center justify-center shadow-md"><Cpu className="text-white w-5 h-5" /></div>
          <h1 className={`text-2xl font-bold tracking-tight ${theme.text} font-mono`}>8051<span className={theme.accent}>.sim</span></h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end w-full md:w-auto">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${theme.button} ${theme.textMuted} transition-colors`} title="Toggle Dark Mode">{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <div className={`flex items-center gap-2 border-r ${theme.border} pr-4`}>
                <button onClick={() => setShowSnippets(true)} className={`flex items-center gap-2 text-xs font-bold ${theme.textMuted} hover:${theme.highlightText} px-2 py-1 rounded ${theme.button}`}><BookOpen className="w-4 h-4" /> Snippets</button>
                <button onClick={handleDownload} className={`flex items-center gap-2 text-xs font-bold ${theme.textMuted} hover:${theme.highlightText} px-2 py-1 rounded ${theme.button}`}><Save className="w-4 h-4" /> Save</button>
            </div>
            <div className={`flex ${theme.card} rounded-md border ${theme.border} overflow-hidden shadow-sm`}>
                <button onClick={() => setView('sim')} className={`px-3 py-2 text-xs font-bold flex items-center gap-2 ${view === 'sim' ? theme.select : `hover:${theme.header}`}`}><Zap className="w-3 h-3"/> Simulator</button>
                <button onClick={() => setView('trace')} className={`px-3 py-2 text-xs font-bold flex items-center gap-2 ${view === 'trace' ? theme.select : `hover:${theme.header}`}`}><History className="w-3 h-3"/> Trace</button>
                <button onClick={() => { setView('hex'); compileHex(); }} className={`px-3 py-2 text-xs font-bold flex items-center gap-2 ${view === 'hex' ? theme.select : `hover:${theme.header}`}`}><Binary className="w-3 h-3"/> Hex</button>
            </div>
            {view === 'sim' && (
                 <div className={`flex items-center gap-1 ${theme.card} p-1 rounded border ${theme.border}`}>
                     <button onClick={resetSim} className={`p-2 rounded ${isModified ? 'text-[#d33682] animate-pulse' : theme.textMuted} ${theme.button}`} title="Reset Simulation"><RotateCcw className="w-4 h-4" /></button>
                     <button onClick={stepSim} className={`p-2 rounded text-[#268bd2] ${theme.button}`} title="Step Forward"><StepForward className="w-4 h-4" /></button>
                     <button onClick={() => setIsRunning(!isRunning)} className={`p-2 rounded flex items-center gap-2 font-bold text-xs px-3 shadow-sm transition-all ${isRunning ? 'bg-[#b58900] text-white' : `${theme.card} border ${theme.border} text-[#859900] ${theme.button}`}`}>{isRunning ? <><Pause className="w-3 h-3"/> PAUSE</> : <><Play className="w-3 h-3"/> RUN</>}</button>
                 </div>
             )}
        </div>
      </header>

      <SnippetsModal isOpen={showSnippets} onClose={() => setShowSnippets(false)} isDark={isDarkMode} />

      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-2 lg:p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          initialCode={codeRef.current}
          onCodeChange={handleCodeChange}
          theme={theme}
          isDarkMode={isDarkMode}
          pc={cpu.PC}
          errorMsg={errorMsg}
        />

        <div className="flex flex-col gap-4 overflow-visible lg:overflow-hidden h-auto lg:h-auto">
            {view === 'sim' && (
                <div className="flex-1 flex flex-col gap-4 overflow-visible lg:overflow-hidden">
                    <div className={`p-2 text-xs font-bold rounded flex items-center gap-2 justify-center transition-colors ${isModified ? theme.statusWarn : `${theme.header} ${theme.textMuted}`}`}>
                        {isModified ? <><AlertCircle className="w-4 h-4"/> CODE CHANGED - PRESS RESET TO RELOAD</> : <><CheckCircle className="w-4 h-4"/> SIMULATOR READY - PRESS RUN OR STEP</>}
                    </div>
                    <div className={`${theme.card} rounded-lg shadow p-3 border ${theme.border} shrink-0`}>
                        <div className={`text-xs font-bold ${theme.panelHeader} mb-2 flex items-center gap-2`}><Activity className="w-3 h-3"/> REGISTERS</div>
                        <RegisterView state={cpu} theme={theme} />
                    </div>
                    <div className={`${theme.card} rounded-lg shadow p-3 border ${theme.border} shrink-0`}>
                        <div className={`text-xs font-bold ${theme.panelHeader} mb-2 flex items-center gap-2`}><Activity className="w-3 h-3"/> SERIAL BUFFER <span className="italic text-[10px]">(Under development)</span></div>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                              value={serialInput}
                              onChange={(e) => setSerialInput(e.target.value.slice(0, 1))}
                              placeholder="Char"
                              className={`flex-1 rounded px-2 py-1 text-xs ${theme.header} ${theme.text} border ${theme.border} outline-none`}
                            />
                            <button onClick={handleSerialReceive} className={`px-2 py-1 text-[10px] font-bold rounded ${theme.button} ${theme.textMuted} border ${theme.border}`}>Receive</button>
                        </div>
                        <div className={`h-20 overflow-y-auto rounded border ${theme.border} px-2 py-1 text-[10px] font-mono ${theme.textMuted}`}>
                            {serialLog.length === 0 ? (
                              <div className="italic">No serial activity yet</div>
                            ) : (
                              serialLog.map((entry, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="font-bold">{entry.direction}</span>
                                  <span>{entry.value}</span>
                                </div>
                              ))
                            )}
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                        <div className={`${theme.card} rounded-lg shadow p-3 border ${theme.border} flex flex-col min-h-0 overflow-hidden`}>
                             <div className={`text-xs font-bold text-[#2aa198] mb-2 flex items-center gap-2 shrink-0`}><Layers className="w-3 h-3"/> GPIO (Click to Toggle)</div>
                             <div className="flex-1 overflow-y-auto"><GPIOView ram={cpu.RAM} onToggle={toggleGPIO} theme={theme} /></div>
                        </div>
                        <div className={`${theme.card} rounded-lg shadow p-3 border ${theme.border} flex flex-col min-h-0 overflow-hidden`}>
                             <div className={`text-xs font-bold text-[#d33682] mb-2 flex items-center gap-2 shrink-0`}><Binary className="w-3 h-3"/> INTERNAL RAM</div>
                             <div className="flex-1 overflow-y-auto">
                                 <div className="grid grid-cols-8 gap-1 text-[10px] font-mono">
                                     {Array.from({length: 64}).map((_, i) => ( <div key={i} className={`text-center p-0.5 rounded ${cpu.RAM[i] ? `${theme.header} ${theme.accent} font-bold` : `${theme.textMuted} opacity-50`}`}>{cpu.RAM[i].toString(16).toUpperCase().padStart(2,'0')}</div> ))}
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            {view === 'trace' && (
                <div className={`${theme.card} rounded-lg shadow p-3 border ${theme.border} h-full flex flex-col`}>
                     <div className={`text-xs font-bold ${theme.panelHeader} mb-2 flex items-center gap-2`}><History className="w-3 h-3"/> EXECUTION TRACE</div>
                     <TraceView trace={traceLog} theme={theme} />
                </div>
            )}
            {view === 'hex' && (
                <div className={`flex-1 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#002b36]'} rounded-lg shadow overflow-auto p-4 font-mono text-sm text-[#839496]`}>
                     <div className="mb-2 text-[#2aa198] font-bold border-b border-[#586e75] pb-1">Intel HEX Preview</div>
                     {hexDump.map((line, i) => ( <div key={i} className="flex gap-4 hover:bg-[#ffffff]/5"><span className="text-[#b58900]">{line.address.toString(16).toUpperCase().padStart(4,'0')}:</span><span>{line.bytes.map(b => b.toString(16).toUpperCase().padStart(2,'0')).join(' ')}</span></div>))}
                </div>
            )}
            <div className={`h-8 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#002b36]'} text-[#839496] rounded-md shadow-inner flex items-center px-4 text-[10px] font-mono justify-between shrink-0`}>
                <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#859900] animate-pulse' : 'bg-[#dc322f]'}`}></div>{isRunning ? 'RUNNING' : 'HALTED'}</div>
                <div>PC: {cpu.PC} | CYCLES: {cpu.cycles}</div>
            </div>
        </div>
      </main>
      <Analytics />
    </div>
  );
}
