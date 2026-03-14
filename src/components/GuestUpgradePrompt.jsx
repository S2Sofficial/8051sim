import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/react';

export default function GuestUpgradePrompt({ isOpen, onClose, theme, isDarkMode, runsUsed, hasClerk }) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.modalOverlay}`} onClick={onClose}>
      <div
        className={`${theme.card} border ${theme.border} w-full max-w-md rounded-2xl shadow-2xl overflow-hidden`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`p-5 border-b ${theme.border} ${theme.header}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-400/15 text-amber-300' : 'bg-[#b58900]/10 text-[#9a6e00]'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${theme.text}`}>Unlock Power User Mode</h2>
              <p className={`text-sm ${theme.textMuted}`}>Guest users can run the simulator twice. You&apos;ve used {runsUsed}/2 runs.</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className={`rounded-xl border ${theme.border} p-4 ${theme.header}`}>
            <div className="flex items-center gap-2 mb-2">
              <Lock className={`w-4 h-4 ${theme.accent}`} />
              <span className={`font-bold text-sm ${theme.text}`}>Power User unlocks</span>
            </div>
            <ul className={`text-sm space-y-2 ${theme.textMuted}`}>
              <li>Unlimited runs</li>
              <li>Breakpoints and run-to-line</li>
              <li>Watch expressions and execution timeline</li>
            </ul>
          </div>

          {hasClerk ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <SignUpButton mode="modal">
                <button className={`flex-1 rounded-xl px-4 py-3 font-bold ${isDarkMode ? 'bg-amber-400 text-slate-900' : 'bg-[#b58900] text-white'}`}>
                  Sign Up for Power User
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className={`flex-1 rounded-xl px-4 py-3 font-bold border ${theme.border} ${theme.button} ${theme.text}`}>
                  Log In
                </button>
              </SignInButton>
            </div>
          ) : (
            <div className={`rounded-xl border ${theme.border} p-4 text-sm ${theme.textMuted}`}>
              Clerk isn&apos;t configured yet. Add your Clerk publishable key to enable sign-up and login.
            </div>
          )}

          <button onClick={onClose} className={`w-full rounded-xl px-4 py-3 text-sm font-bold border ${theme.border} ${theme.button} ${theme.textMuted}`}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
