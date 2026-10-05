import React, { useState } from 'react';
import { X, ShieldCheck, Key, Loader2, Sparkles, User } from 'lucide-react';
import { signInWithToken, DEFAULT_TOKEN, REPO_OWNER, DATABASE_REPO } from '../services/githubCloud';
import type { CloudUser } from '../types';

interface SignInModalProps {
  onClose: () => void;
  onSuccess: (user: CloudUser) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ onClose, onSuccess }) => {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (tokenToUse: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithToken(tokenToUse);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your GitHub token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-ios-enter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md ios-glass-popover rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Sign In to Cloud Vault</h3>
              <p className="text-xs text-zinc-400">Store PDFs in {REPO_OWNER}/{DATABASE_REPO}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info callout */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/5 text-xs text-zinc-300 space-y-1.5">
          <div className="flex items-center gap-2 text-white font-medium">
            <ShieldCheck className="w-4 h-4 text-[#30D158]" />
            <span>GitHub Database Integration</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Your login record and uploaded PDF documents will be securely cataloged and stored in the{' '}
            <strong className="text-white">{DATABASE_REPO}</strong> repository releases.
          </p>
        </div>

        {/* 1-Click Quick Sign In as Owner if configured */}
        <div className="space-y-3">
          {DEFAULT_TOKEN ? (
            <>
              <button
                type="button"
                onClick={() => handleSignIn(DEFAULT_TOKEN)}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>1-Click Sign In as @{REPO_OWNER}</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider">or custom token</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          ) : null}

          {/* Token input */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>GitHub Personal Access Token (PAT)</span>
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="github_pat_..."
              className="w-full bg-black/60 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={() => handleSignIn(tokenInput)}
              disabled={loading || !tokenInput.trim()}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-medium text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sign In with Token
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span>Connected with GitHub Releases & REST API</span>
        </div>
      </div>
    </div>
  );
};
