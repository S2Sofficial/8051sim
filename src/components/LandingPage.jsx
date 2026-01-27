import React from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import { THEMES } from '../data/constants';

const LandingPage = ({ onStart, isDark }) => {
    const theme = isDark ? THEMES.dark : THEMES.light;
    
    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 ${theme.bg} ${theme.text} transition-all duration-300`}>
            <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
                    <div className="relative bg-linear-to-br from-[#cb4b16] to-[#b58900] w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl mx-auto transform hover:scale-105 transition-transform duration-500">
                        <Cpu className="text-white w-12 h-12" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-mono">
                        8051<span className={theme.accent}>.sim</span>
                    </h1>
                    <p className={`text-xl md:text-2xl ${theme.textMuted} font-light max-w-md mx-auto`}>
                        A modern, web-based assembly simulator & debugger for the MCS-51 architecture.
                    </p>
                </div>
                <div className="pt-8">
                    <button onClick={onStart} className={`group relative px-8 py-4 bg-[#2aa198] hover:bg-[#207c74] text-white text-lg font-bold rounded-full shadow-[0_0_20px_rgba(42,161,152,0.3)] hover:shadow-[0_0_30px_rgba(42,161,152,0.5)] transition-all flex items-center gap-3 mx-auto`}>
                        Start Debugging <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
            <div className={`absolute bottom-8 left-0 w-full text-center ${theme.textMuted} text-sm`}>
                <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="font-medium tracking-wide uppercase text-[10px]">Support the creator</span>
                    <a href="https://x.com/S2SmeX" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-stone-100'} shadow-sm transition-colors border ${theme.border}`}>
                        <span className={`font-bold ${theme.accent}`}>@S2SmeX</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;