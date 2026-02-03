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
    return saved ? JSON.parse(saved) : true;
  });
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  useEffect(() => { localStorage.setItem('8051_theme', JSON.stringify(isDarkMode)); }, [isDarkMode]);

  const codeRef = useRef(DEFAULT_CODE);
  const isModifiedRef = useRef(false);
  const [cpu, setCpu] = useState({ A: 0, B: 0, PSW: 0, SP: 0x07, PC: 0, DPTR: 0, R: [0,0,0,0,0,0,0,0], RAM: new Array(256).fill(0), cycles: 0, stack: [] });
  const [isRunning, setIsRunning] = useState(false);
  const [parsedLines, setParsedLines] = useState([]);
  const [labels, setLabels] = useState({});
  const [view, setView] = useState('sim');
  const [hexDump, setHexDump] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [traceLog, setTraceLog] = useState([]);

  const intervalRef = useRef(null);
  const FLAG_CY = 0x80;
  const FLAG_AC = 0x40;
  const FLAG_F0 = 0x20;
  const FLAG_RS1 = 0x10;
  const FLAG_RS0 = 0x08;
  const FLAG_OV = 0x04;
  const FLAG_P = 0x01;

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

  const resetSim = useCallback(() => {
      const initRam = new Array(256).fill(0);
      initRam[0x80]=0xFF; initRam[0x90]=0xFF; initRam[0xA0]=0xFF; initRam[0xB0]=0xFF;
      
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
      
      let pc = 0;
      for(let i=0; i<pLines.length; i++) { if(pLines[i] && pLines[i].mnemonic && pLines[i].mnemonic !== 'ORG') { pc = i; break; } }

      setCpu({ A: 0, B: 0, PSW: 0, SP: 0x07, PC: pc, DPTR: 0, R: [0,0,0,0,0,0,0,0], RAM: initRam, cycles: 0, stack: [] });
      setIsRunning(false);
      setErrorMsg(null);
      isModifiedRef.current = false;
      setIsModified(false);
  }, []);

  const stepSim = () => {
      if(isModified) { alert("Code changed. Please Reset simulation."); return; }
      setCpu(prev => {
          if (prev.PC >= parsedLines.length) { setIsRunning(false); return prev; }
          let next = { ...prev, RAM: [...prev.RAM], R: [...prev.R] };
          const line = parsedLines[prev.PC];
          if (!line || !line.mnemonic || line.mnemonic === 'ORG' || line.mnemonic === 'EQU' || line.mnemonic === 'DB') return { ...next, PC: next.PC + 1 };

          const newTrace = { pc: prev.PC, inst: line.mnemonic + ' ' + line.operands.join(','), A: prev.A.toString(16).toUpperCase().padStart(2,'0'), R: prev.R.map(r => r.toString(16).toUpperCase()) };
          setTraceLog(old => [newTrace, ...old]); 

          try {
              const op1 = line.operands[0]; const op2 = line.operands[1];
              const getVal = (op) => {
                  if (!op) return 0;
                  if (op === 'A') return next.A;
                  if (op.match(/^R[0-7]$/)) return next.R[parseInt(op[1])];
                  if (op.startsWith('#')) return parseValue(op, labels);
                  if (SFR_MAP[op]) return next.RAM[SFR_MAP[op]];
                  if (labels[op] !== undefined) return next.RAM[labels[op]]; 
                  const addr = parseValue(op, labels); return next.RAM[addr] || 0;
              };
              const setVal = (op, val) => {
                  val = val & 0xFF;
                  if (op === 'A') next.A = val;
                  else if (op.match(/^R[0-7]$/)) next.R[parseInt(op[1])] = val;
                  else if (op === 'DPTR') next.DPTR = val & 0xFFFF;
                  else { let addr = SFR_MAP[op] !== undefined ? SFR_MAP[op] : parseValue(op, labels); if (addr >= 0 && addr <= 255) next.RAM[addr] = val; }
              };
              let parityUpdated = false;
              let psw = next.PSW;
              switch (line.mnemonic) {
                  case 'MOV': {
                      if(op1 === 'DPTR') next.DPTR = parseValue(op2, labels);
                      else setVal(op1, getVal(op2));
                      if (op1 === 'A') {
                        next.PSW = updateParity(next.PSW, next.A);
                        parityUpdated = true;
                      }
                      next.PC++; next.cycles += 1; break;
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
                      next.PC++; next.cycles += 1; break;
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
                      next.PC++; next.cycles += 1; break;
                  }
                  case 'INC': {
                      if(op1 === 'DPTR') next.DPTR = (next.DPTR + 1) & 0xFFFF;
                      else setVal(op1, getVal(op1) + 1);
                      if (op1 === 'A') {
                        next.PSW = updateParity(next.PSW, next.A);
                        parityUpdated = true;
                      }
                      next.PC++; next.cycles += 1; break;
                  }
                  case 'DEC': {
                      setVal(op1, (getVal(op1) - 1 + 256) & 0xFF);
                      if (op1 === 'A') {
                        next.PSW = updateParity(next.PSW, next.A);
                        parityUpdated = true;
                      }
                      next.PC++; next.cycles += 1; break;
                  }
                  case 'CPL': {
                      if (op1.includes('.')) {
                        const [port, bit] = op1.split('.');
                        const addr = SFR_MAP[port] || parseValue(port);
                        const mask = 1 << parseInt(bit);
                        next.RAM[addr] ^= mask;
                      } else {
                        setVal(op1, ~getVal(op1));
                        if (op1 === 'A') {
                          next.PSW = updateParity(next.PSW, next.A);
                          parityUpdated = true;
                        }
                      }
                      next.PC++; next.cycles += 1; break;
                  }
                  case 'SETB': case 'CLR': if (op1.includes('.')) { const [port, bit] = op1.split('.'); const addr = SFR_MAP[port] || parseValue(port); const mask = 1 << parseInt(bit); next.RAM[addr] = line.mnemonic === 'SETB' ? (next.RAM[addr] | mask) : (next.RAM[addr] & ~mask); } next.PC++; break;
                  case 'SJMP': case 'LJMP': case 'AJMP': const target = labels[op1]; if (target !== undefined) next.PC = target; else throw new Error(`Label ${op1} not found`); next.cycles += 2; break;
                  case 'DJNZ': const v = (getVal(op1) - 1 + 256) & 0xFF; setVal(op1, v); if (v !== 0) { const tgt = labels[op2]; if (tgt !== undefined) next.PC = tgt; else throw new Error(`Label ${op2} not found`); } else { next.PC++; } next.cycles += 2; break;
                  case 'ACALL': case 'LCALL': next.stack.push(next.PC + 1); const callTgt = labels[op1]; if (callTgt !== undefined) next.PC = callTgt; else throw new Error(`Label ${op1} not found`); next.cycles += 2; break;
                  case 'RET': const retAddr = next.stack.pop(); if (retAddr !== undefined) next.PC = retAddr; else next.PC++; next.cycles += 2; break;
                  case 'NOP': default: next.PC++; break;
              }
              if (!parityUpdated && next.A !== prev.A) {
                next.PSW = updateParity(next.PSW, next.A);
              }
          } catch (e) { setErrorMsg(e.message); setIsRunning(false); }
          return next;
      });
  };
  useEffect(() => { if (isRunning) intervalRef.current = setInterval(stepSim, 100); return () => clearInterval(intervalRef.current); }, [isRunning, parsedLines, labels, isModified]);
  useEffect(() => { resetSim(); }, []);
  const toggleGPIO = (addr, bit) => { setCpu(prev => { const next = {...prev, RAM: [...prev.RAM]}; next.RAM[addr] ^= (1 << bit); return next; }); };

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

      <main className="flex-1 overflow-hidden p-2 lg:p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          initialCode={codeRef.current}
          onCodeChange={handleCodeChange}
          theme={theme}
          isDarkMode={isDarkMode}
          pc={cpu.PC}
          errorMsg={errorMsg}
        />

        <div className="flex flex-col gap-4 overflow-hidden h-[50vh] lg:h-auto">
            {view === 'sim' && (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className={`p-2 text-xs font-bold rounded flex items-center gap-2 justify-center transition-colors ${isModified ? theme.statusWarn : `${theme.header} ${theme.textMuted}`}`}>
                        {isModified ? <><AlertCircle className="w-4 h-4"/> CODE CHANGED - PRESS RESET TO RELOAD</> : <><CheckCircle className="w-4 h-4"/> SIMULATOR READY - PRESS RUN OR STEP</>}
                    </div>
                    <div className={`${theme.card} rounded-lg shadow p-3 border ${theme.border} shrink-0`}>
                        <div className={`text-xs font-bold ${theme.panelHeader} mb-2 flex items-center gap-2`}><Activity className="w-3 h-3"/> REGISTERS</div>
                        <RegisterView state={cpu} theme={theme} />
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
