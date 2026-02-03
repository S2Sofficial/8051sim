import React from 'react';

const RegisterView = ({ state, theme }) => {
    const flags = {
        CY: (state.PSW & 0x80) !== 0,
        AC: (state.PSW & 0x40) !== 0,
        F0: (state.PSW & 0x20) !== 0,
        RS1: (state.PSW & 0x10) !== 0,
        RS0: (state.PSW & 0x08) !== 0,
        OV: (state.PSW & 0x04) !== 0,
        P: (state.PSW & 0x01) !== 0,
    };

    return (
        <div className={`grid grid-cols-4 gap-2 text-xs font-mono p-2 rounded border ${theme.card} ${theme.border} ${theme.text}`}>
            <div className="flex flex-col"><span className={theme.textMuted}>A</span><span className={`font-bold ${theme.accent}`}>{state.A.toString(16).toUpperCase().padStart(2,'0')}</span></div>
            <div className="flex flex-col"><span className={theme.textMuted}>B</span><span className="font-bold">{state.B.toString(16).toUpperCase().padStart(2,'0')}</span></div>
            <div className="flex flex-col"><span className={theme.textMuted}>SP</span><span>{state.SP.toString(16).toUpperCase().padStart(2,'0')}</span></div>
            <div className="flex flex-col"><span className={theme.textMuted}>PC</span><span className="text-[#38bdf8]">{state.PC}</span></div>
            <div className="col-span-2 flex flex-col"><span className={theme.textMuted}>DPTR</span><span>{state.DPTR.toString(16).toUpperCase().padStart(4,'0')}</span></div>
            <div className="flex flex-col"><span className={theme.textMuted}>PSW</span><span>{state.PSW.toString(16).toUpperCase().padStart(2,'0')}</span></div>
            <div className="flex flex-col"><span className={theme.textMuted}>CYCLES</span><span>{state.cycles}</span></div>
            <div className={`col-span-4 h-px ${theme.border.replace('/20', '')} opacity-20 my-1 bg-current`}></div>
            {state.R.map((r, i) => (
                 <div key={i} className="flex gap-1 items-center justify-between px-1">
                     <span className={theme.textMuted}>R{i}</span>
                     <span className="font-bold">{r.toString(16).toUpperCase().padStart(2,'0')}</span>
                 </div>
            ))}
            <div className={`col-span-4 h-px ${theme.border.replace('/20', '')} opacity-20 my-1 bg-current`}></div>
            <div className="col-span-4 grid grid-cols-7 gap-2 text-[10px]">
                {Object.entries(flags).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between px-1">
                        <span className={theme.textMuted}>{label}</span>
                        <span className={`font-bold ${value ? theme.accent : ''}`}>{value ? '1' : '0'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RegisterView;
