import React, { useState, useEffect } from 'react';
import { BookOpen, X, Copy, Check } from 'lucide-react';
import { THEMES } from '../data/constants';
import { SNIPPET_CATEGORIES } from '../data/snippets';
import SyntaxHighlighter from './SyntaxHighlighter';

const SnippetsModal = ({ isOpen, onClose, isDark }) => {
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [selectedSnippet, setSelectedSnippet] = useState(SNIPPET_CATEGORIES[0].items[0]);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        if(isOpen) {
            setSelectedCategory(0);
            setSelectedSnippet(SNIPPET_CATEGORIES[0].items[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const modalTheme = isDark ? THEMES.dark : THEMES.light;
    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(selectedSnippet.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedId(selectedSnippet.id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${modalTheme.modalOverlay} p-4`}>
            <div className={`w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-150 ${modalTheme.bg}`}>
                <div className={`p-4 border-b flex justify-between items-center ${modalTheme.header} ${modalTheme.border}`}>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${modalTheme.text}`}>
                        <BookOpen className="w-5 h-5"/> Code Snippets
                    </h2>
                    <button onClick={onClose} className={`${modalTheme.textMuted} hover:text-red-500 transition-colors`}>
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex flex-1 overflow-hidden">
                    <div className={`w-64 border-r overflow-y-auto ${modalTheme.bg} ${modalTheme.border}`}>
                        {SNIPPET_CATEGORIES.map((cat, catIdx) => (
                            <div key={catIdx}>
                                <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${modalTheme.textMuted} bg-opacity-10 bg-black/5 mt-2 first:mt-0`}>
                                    {cat.name}
                                </div>
                                <div>
                                    {cat.items.map((snippet) => (
                                        <button 
                                            key={snippet.id}
                                            onClick={() => setSelectedSnippet(snippet)}
                                            className={`w-full text-left px-4 py-2 text-sm border-l-2 transition-colors ${selectedSnippet.id === snippet.id ? `border-[#b58900] ${modalTheme.select} font-medium` : `border-transparent ${modalTheme.text} hover:${modalTheme.button.replace('hover:', '')} opacity-80 hover:opacity-100`}`}
                                        >
                                            {snippet.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`flex-1 flex flex-col ${modalTheme.bg} p-0 overflow-hidden relative`}>
                        <div className={`p-4 border-b ${modalTheme.border} ${modalTheme.header} flex justify-between items-start`}>
                            <div>
                                <h3 className={`${modalTheme.accent} font-bold text-xl`}>{selectedSnippet.title}</h3>
                                <p className={`${modalTheme.textMuted} text-sm mt-1`}>{selectedSnippet.desc}</p>
                            </div>
                            <button 
                                onClick={() => handleCopy(selectedSnippet.code)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all shadow-sm ${copiedId === selectedSnippet.id ? 'bg-green-600 text-white' : `${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-stone-200 hover:bg-stone-300'} ${modalTheme.text}`}`}
                            >
                                {copiedId === selectedSnippet.id ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                                {copiedId === selectedSnippet.id ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto relative p-4">
                            <div className={`absolute inset-0 p-4 min-h-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#fdf6e3]'}`}>
                                <SyntaxHighlighter code={selectedSnippet.code} isDark={isDark} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnippetsModal;