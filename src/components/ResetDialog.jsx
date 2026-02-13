import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ResetDialog({ isOpen, onClose, theme }) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${theme.modalOverlay} backdrop-blur-sm flex items-center justify-center`}>
      <div className={`relative w-[90vw] max-w-md rounded-xl border ${theme.border} ${theme.card} shadow-2xl p-6`}>
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 rounded-full ${theme.button} ${theme.textMuted}`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-400" />
          <h2 className={`text-lg font-bold ${theme.text}`}>Code Changed</h2>
        </div>

        <p className={`${theme.textMuted} text-sm mb-6`}>
          The assembly code has been modified. Please reset the simulation before running to load the new code.
        </p>

        <button
          onClick={onClose}
          className={`w-full px-4 py-2 rounded-lg font-bold text-sm transition-colors ${theme.card} border ${theme.border} ${theme.textMuted} hover:${theme.header}`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
