import React from 'react';
import { TerminalSquare, XCircle, Trash2 } from 'lucide-react';

export default function ErrorTerminal({ isOpen, entries, onToggle, onClear, theme }) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${theme.modalOverlay} backdrop-blur-sm`}>
      <div className="absolute inset-0" onClick={onToggle} />
      <div className={`absolute left-1/2 top-1/2 w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-xl border ${theme.border} ${theme.card} shadow-2xl flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 py-3 ${theme.header} border-b ${theme.border}`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <TerminalSquare className="w-4 h-4" /> ERROR TERMINAL
            <span className={`ml-2 px-2 py-0.5 rounded ${theme.border} border text-[10px] ${theme.textMuted}`}>
              {entries.length} log{entries.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClear} className={`px-2 py-1 text-[10px] font-bold rounded ${theme.button} ${theme.textMuted} border ${theme.border}`} title="Clear error log">
              <Trash2 className="w-3 h-3" />
            </button>
            <button onClick={onToggle} className={`px-2 py-1 text-[10px] font-bold rounded ${theme.button} ${theme.textMuted} border ${theme.border}`} title="Close terminal">
              <XCircle className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className={`flex-1 overflow-y-auto p-4 font-mono text-xs ${theme.textMuted}`}>
          {entries.length === 0 ? (
            <div className="italic">No errors recorded.</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className={`mb-3 p-3 rounded border ${theme.border} ${theme.header}`}>
                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wide">
                  <span className="font-bold text-red-400">{entry.type}</span>
                  <span>{entry.timestamp}</span>
                  <span>PC: {entry.pc}</span>
                  <span className={`text-[10px] ${theme.text}`}>{entry.instruction}</span>
                </div>
                <div className={`mt-2 text-sm ${theme.text}`}>
                  {entry.message}
                </div>
                {entry.details && (
                  <pre className={`mt-2 text-[10px] whitespace-pre-wrap ${theme.textMuted}`}>
                    {JSON.stringify(entry.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
