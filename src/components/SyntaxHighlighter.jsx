import React from 'react';
import { INSTRUCTION_SET } from '../data/constants';

const SyntaxHighlighter = ({ code, isDark }) => (
    <div className="absolute top-0 left-0 w-full min-h-full pointer-events-none p-4 pl-4 font-mono text-sm leading-6 whitespace-pre overflow-hidden text-transparent" aria-hidden="true">
        {code.split('\n').map((line, i) => {
            const commentSplit = line.split(';');
            const codePart = commentSplit[0];
            const commentPart = commentSplit.length > 1 ? ';' + commentSplit.slice(1).join(';') : '';
        
            const parts = codePart.split(/([,\s]+)/).map((token, j) => {
                if (!token) return null;
                const upper = token.toUpperCase();
                const colors = isDark ? {
                    mnemonic: 'text-[#38bdf8]', label: 'text-[#fbbf24]', imm: 'text-[#f472b6]', hex: 'text-[#4ade80]', default: 'text-[#94a3b8]'
                } : {
                    mnemonic: 'text-[#268bd2]', label: 'text-[#b58900]', imm: 'text-[#d33682]', hex: 'text-[#2aa198]', default: 'text-[#657b83]'
                };
                if (INSTRUCTION_SET[upper]) return <span key={j} className={`${colors.mnemonic} font-bold`}>{token}</span>;
                if (token.endsWith(':')) return <span key={j} className={`${colors.label} font-bold`}>{token}</span>;
                if (token.startsWith('#')) return <span key={j} className={colors.imm}>{token}</span>;
                if (token.match(/^[0-9A-Fa-f]+[Hh]$/)) return <span key={j} className={colors.hex}>{token}</span>;
                return <span key={j} className={colors.default}>{token}</span>;
            });
            return (
                <div key={i}>
                    {parts}
                    {commentPart && <span className={`${isDark ? 'text-[#475569]' : 'text-[#93a1a1]'} italic`}>{commentPart}</span>}
                    {line.length === 0 && <span>&nbsp;</span>}
                </div>
            );
        })}
    </div>
);

export default SyntaxHighlighter;