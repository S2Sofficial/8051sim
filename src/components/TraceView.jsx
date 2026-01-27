import React from 'react';

const TraceView = ({ trace, theme }) => (
    <div className={`w-full h-full flex flex-col ${theme.text}`}>
        <div className={`flex text-[10px] font-bold ${theme.textMuted} border-b ${theme.border} pb-2 mb-2`}>
            <div className="w-12">PC</div>
            <div className="w-24">INSTRUCTION</div>
            <div className="flex-1">REGISTERS (A, R0-R7)</div>
        </div>
        <div className="flex-1 overflow-auto space-y-1 font-mono text-xs">
            {trace.length === 0 ? <div className={`text-center mt-10 italic ${theme.textMuted}`}>Run simulation to see execution history</div> : trace.map((step, idx) => (
                <div key={idx} className={`flex py-1 border-b ${theme.border} border-dashed opacity-80 hover:opacity-100`}>
                    <div className={`w-12 ${theme.accent}`}>{step.pc}</div>
                    <div className="w-24 font-bold">{step.inst}</div>
                    <div className={`flex-1 ${theme.textMuted} text-[10px]`}>A:{step.A} R:{step.R.join(' ')}</div>
                </div>
            ))}
        </div>
    </div>
);

export default TraceView;