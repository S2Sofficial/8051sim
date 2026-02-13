import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ResetDialog({ isOpen, onClose, theme }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle outside click dismissal
    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Handle escape key dismissal
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Subtle overlay background */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-10' : 'opacity-0'}`} style={{backgroundColor: theme.text}} />

      {/* Bottom sheet toast */}
      <div
        ref={dialogRef}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className={`${theme.card} border-t ${theme.border} shadow-2xl rounded-t-2xl p-4 sm:p-6 max-w-2xl mx-auto w-full`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
            
            <div className="flex-grow">
              <h2 className={`text-base sm:text-lg font-bold ${theme.text}`}>Code Changed</h2>
              <p className={`${theme.textMuted} text-sm mt-1`}>
                The assembly code has been modified. Please reset the simulation before running to load the new code.
              </p>
            </div>

            {/* Quick dismiss hint */}
            <div className={`text-xs ${theme.textMuted} flex-shrink-0 text-right`}>
              Click outside<br/>to dismiss
            </div>
          </div>

          {/* Progress indicator showing it's dismissible */}
          <div className={`mt-3 h-1 w-full ${theme.border} rounded-full overflow-hidden bg-opacity-20`}>
            <div className={`h-full bg-orange-400 animate-pulse`} style={{width: '100%'}} />
          </div>
        </div>
      </div>
    </>
  );
}
