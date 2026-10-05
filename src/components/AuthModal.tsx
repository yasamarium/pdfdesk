import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  UserPlus,
  LogIn,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { signInUser, signUpUser } from '../services/githubDatabase';
import type { AppUser } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await signInUser(username, password);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await signUpUser(username, password, displayName);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to sign in as demo user, or create demo user if not existing
      try {
        const user = await signInUser('demo', 'demo123');
        onSuccess(user);
        onClose();
      } catch {
        const user = await signUpUser('demo', 'demo123', 'Demo User');
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
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
        className="relative w-full max-w-md ios-glass-popover rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              {mode === 'signin' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'signin' ? 'Sign In to PDFDesk' : 'Create an Account'}
              </h3>
              <p className="text-xs text-zinc-400">
                {mode === 'signin'
                  ? 'Access your cloud vault and saved documents'
                  : 'Join to save and sync your PDFs to cloud'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-2xl bg-black/60 p-1 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#0A84FF] text-white shadow-md shadow-blue-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#0A84FF] text-white shadow-md shadow-blue-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3.5">
          {/* Username Field */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium">Username</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul, alex, john_doe"
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-black/50 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 font-medium"
              />
            </div>
          </div>

          {/* Optional Display Name for Sign Up */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">
                Full Name / Display Name <span className="text-zinc-600">(Optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-black/50 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600"
              />
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-black/50 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-zinc-600 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field for Sign Up */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full bg-black/50 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 font-medium"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signin' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{mode === 'signin' ? 'Sign In' : 'Create Account & Sign In'}</span>
          </button>
        </form>

        {/* Demo Login Quick CTA */}
        {mode === 'signin' && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-2 border border-white/5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>1-Click Demo Login (Instant Access)</span>
            </button>
          </div>
        )}

        {/* Security badge footer */}
        <div className="pt-1 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
          <span>End-to-End Encrypted Cloud Authentication</span>
        </div>
      </div>
    </div>
  );
};
