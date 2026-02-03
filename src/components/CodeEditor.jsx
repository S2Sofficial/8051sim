import React, { memo, useCallback, useRef, useState } from 'react';
import { FileCode, AlertCircle } from 'lucide-react';
import SyntaxHighlighter from './SyntaxHighlighter';

const CodeEditor = memo(function CodeEditor({
  initialCode,
  onCodeChange,
  theme,
  isDarkMode,
  pc,
  errorMsg,
}) {
  const [code, setCode] = useState(initialCode);
  const textAreaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (textAreaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  }, []);

  const handleChange = useCallback((event) => {
    const nextCode = event.target.value;
    setCode(nextCode);
    onCodeChange(nextCode);
  }, [onCodeChange]);

  const lineCount = Math.max(code.split('\n').length, 1);
  const contentHeight = lineCount * 24 + 32;

  return (
    <div className={`flex flex-col ${theme.card} rounded-lg shadow-lg border ${theme.border} overflow-hidden relative h-[50vh] lg:h-auto`}>
      <div className={`absolute top-0 left-0 w-full h-8 ${theme.header} border-b ${theme.border} flex items-center px-4 text-xs font-mono ${theme.textMuted} z-10`}>
        <FileCode className="w-3 h-3 mr-2" /> EDITOR {errorMsg && <span className="ml-auto text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errorMsg}</span>}
      </div>
      <div className="flex-1 relative mt-8 overflow-hidden group">
        <div ref={lineNumbersRef} className={`absolute left-0 top-0 bottom-0 w-12 ${theme.editorGutter} ${theme.textMuted} text-right pr-3 pt-4 select-none border-r ${theme.border} overflow-hidden text-sm font-mono leading-6`}>
          {code.split('\n').map((_, i) => (
            <div key={i} className={`relative ${pc === i ? `${theme.accent} font-bold` : ''}`}>
              {pc === i && <div className="absolute right-0 top-1.5 w-1.5 h-1.5 rounded-full translate-x-1/2 bg-current"></div>}
              {i + 1}
            </div>
          ))}
          <div className="h-48"></div>
        </div>
        <div className="absolute left-12 top-0 right-0 bottom-0 h-full overflow-auto" onScroll={handleScroll} ref={textAreaRef}>
          <div className="relative min-h-full">
            <SyntaxHighlighter code={code} isDark={isDarkMode} />
            <textarea
              value={code}
              onChange={handleChange}
              className={`absolute top-0 left-0 w-full p-4 pl-4 bg-transparent text-transparent ${theme.highlightCaret} whitespace-pre font-mono text-sm leading-6 outline-none resize-none border-none z-10 selection:bg-[#b58900]/20 overflow-hidden`}
              style={{ height: `${contentHeight}px` }}
              spellCheck="false"
              autoComplete="off"
            />
            <div className="h-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CodeEditor;
