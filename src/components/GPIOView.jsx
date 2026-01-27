import React from 'react';

const GPIOView = ({ ram, onToggle, theme }) => {
    const ports = [ { name: 'P0', addr: 0x80 }, { name: 'P1', addr: 0x90 }, { name: 'P2', addr: 0xA0 }, { name: 'P3', addr: 0xB0 } ];
    return (
        <div className="space-y-2 p-2">
            {ports.map(p => {
                const val = ram[p.addr];
                return (
                    <div key={p.name} className={`flex items-center gap-2 ${theme.text}`}>
                        <span className="font-mono text-xs font-bold w-6">{p.name}</span>
                        <div className="flex gap-1 flex-1 justify-between">
                            {[7,6,5,4,3,2,1,0].map(bit => {
                                const logicLevel = (val >> bit) & 1;
                                return (
                                    <button key={bit} onClick={() => onToggle(p.addr, bit)} className={`w-3 h-5 sm:w-4 sm:h-6 rounded-sm border text-[8px] flex items-center justify-center transition-all ${logicLevel ? 'bg-[#859900] border-[#859900] text-white shadow-[0_0_5px_rgba(133,153,0,0.6)]' : `bg-stone-200 border-stone-300 text-stone-400 opacity-50`}`} title={`${p.name}.${bit} (Click to Toggle)`}>{bit}</button>
                                )
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GPIOView;