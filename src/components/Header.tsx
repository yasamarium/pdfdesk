import React from 'react';
import {
  FileText,
  Sparkles,
  RefreshCw,
  Smartphone,
  Monitor,
  Scissors,
  PenTool,
  Cloud,
  User,
  LogOut,
} from 'lucide-react';
import type { AppTab, CloudUser } from '../types';

export type DeviceViewMode = 'auto' | 'mobile' | 'desktop';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasFile: boolean;
  isLoading: boolean;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  user: CloudUser | null;
  onOpenSignIn: () => void;
  onSignOut: () => void;
  viewMode?: DeviceViewMode;
  onViewModeChange?: (mode: DeviceViewMode) => void;
  onOpenRepo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  hasFile,
  isLoading,
  activeTab,
  onTabChange,
  user,
  onOpenSignIn,
  onSignOut,
  viewMode = 'auto',
  onViewModeChange,
  onOpenRepo,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full ios-glass-header transition-all border-b border-white/5">
      {/* Row 1: Brand, Desktop Navigation, View Switcher & Action Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-2">
        {/* Brand & Desktop Suite Tabs */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-tight text-white font-sans block leading-none">
                PDFDesk
              </span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                Pro Suite
              </span>
            </div>
          </div>

          {/* Desktop Suite Tabs (hidden on mobile, visible md+) */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-zinc-900/90 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => onTabChange('splitter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'splitter'
                  ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Splitter</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Interactive PDF Editor Studio"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('vault')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud Vault</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            </button>
          </nav>
        </div>

        {/* Center: Device View Switcher (Desktop only) */}
        {hasFile && onViewModeChange && (activeTab === 'splitter' || activeTab === 'editor') && (
          <div className="hidden xl:flex items-center p-1 rounded-2xl bg-zinc-900/90 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => onViewModeChange('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>PC View</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Phone View</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('auto')}
              className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'auto'
                  ? 'bg-[#0A84FF] text-white font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Auto
            </button>
          </div>
        )}

        {/* Right actions: User Profile & Quick Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Profile Pill */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 pr-1 sm:pr-1.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs shrink-0">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center text-[9px] font-bold text-white uppercase shrink-0">
                {user.username.slice(0, 2)}
              </div>
              <span className="text-zinc-200 font-semibold hidden sm:inline max-w-[90px] truncate">
                @{user.username}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] shrink-0" title="Cloud Synced" />
              <button
                type="button"
                onClick={onSignOut}
                className="p-1 rounded-full text-zinc-500 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenSignIn}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {!hasFile ? (
            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-medium text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer disabled:opacity-50 shrink-0"
              title="Load Sample Document"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span className="hidden sm:inline">Try Sample</span>
            </button>
          ) : (
            <button
              onClick={onReset}
              className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 cursor-pointer shrink-0"
              title="New / Clear File"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenRepo}
            className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all border border-white/5 shrink-0 cursor-pointer"
            title="Repository & Code"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Row 2: Mobile Suite Navigation Bar (visible < md, hidden md+) */}
      <div className="md:hidden px-3 pb-2.5 pt-0.5">
        <nav className="grid grid-cols-3 p-1 rounded-2xl bg-zinc-900/95 border border-white/10 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => onTabChange('splitter')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer font-medium ${
              activeTab === 'splitter'
                ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
                : 'text-zinc-400 active:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Splitter</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('editor')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer font-medium ${
              activeTab === 'editor'
                ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
                : 'text-zinc-400 active:text-white'
            }`}
            title="Interactive PDF Editor Studio"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('vault')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer font-medium ${
              activeTab === 'vault'
                ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
                : 'text-zinc-400 active:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Vault</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
          </button>
        </nav>
      </div>
    </header>
  );
};
