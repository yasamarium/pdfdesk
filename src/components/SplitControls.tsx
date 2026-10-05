import React from 'react';
import {
  SlidersHorizontal,
  CheckSquare,
  Files,
  Scissors,
  RotateCw,
  Info,
} from 'lucide-react';
import type { SplitMode, SplitOptions } from '../types';

interface SplitControlsProps {
  totalPages: number;
  options: SplitOptions;
  onOptionsChange: (newOptions: Partial<SplitOptions>) => void;
  onApplyRange: (rangeStr: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onSelectOdd: () => void;
  onSelectEven: () => void;
  onRotateAllSelected: (degrees: number) => void;
  selectedPagesCount: number;
}

export const SplitControls: React.FC<SplitControlsProps> = ({
  totalPages,
  options,
  onOptionsChange,
  onApplyRange,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onSelectOdd,
  onSelectEven,
  onRotateAllSelected,
  selectedPagesCount,
}) => {
  const modes: { id: SplitMode; label: string; icon: React.ReactNode }[] = [
    { id: 'range', label: 'Range / From-To', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'visual', label: 'Visual Selection', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'extract_all', label: 'Split Every Page', icon: <Files className="w-4 h-4" /> },
    { id: 'chunks', label: 'Split by Chunks', icon: <Scissors className="w-4 h-4" /> },
  ];

  const handleFromChange = (val: number) => {
    const from = Math.max(1, Math.min(val, totalPages));
    const to = Math.max(from, options.toPage);
    onOptionsChange({ fromPage: from, toPage: to });
    onApplyRange(`${from}-${to}`);
  };

  const handleToChange = (val: number) => {
    const to = Math.max(1, Math.min(val, totalPages));
    const from = Math.min(options.fromPage, to);
    onOptionsChange({ fromPage: from, toPage: to });
    onApplyRange(`${from}-${to}`);
  };

  const handleRangeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onOptionsChange({ rangeString: text });
    onApplyRange(text);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="ios-glass rounded-3xl p-5 md:p-6 border border-white/10 shadow-xl space-y-6">
        {/* iOS Segmented Control Bar */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-inner max-w-full overflow-x-auto scrollbar-none">
            {modes.map((mode) => {
              const isActive = options.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onOptionsChange({ mode: mode.id })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0A84FF] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 1: Range Selector */}
        {options.mode === 'range' && (
          <div className="animate-ios-enter space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Range Inputs: From Page X to Page Y */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Page Span (From - To)
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-zinc-500 block mb-1">From Page</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={options.fromPage}
                        onChange={(e) => handleFromChange(parseInt(e.target.value) || 1)}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3 py-2 text-white font-medium text-center text-sm"
                      />
                    </div>
                  </div>

                  <span className="text-zinc-500 font-bold pt-4">→</span>

                  <div className="flex-1">
                    <label className="text-[11px] text-zinc-500 block mb-1">To Page</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={options.toPage}
                        onChange={(e) => handleToChange(parseInt(e.target.value) || totalPages)}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3 py-2 text-white font-medium text-center text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="range"
                    min={1}
                    max={totalPages}
                    value={options.toPage}
                    onChange={(e) => handleToChange(parseInt(e.target.value))}
                    className="w-full accent-[#0A84FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Page 1</span>
                    <span>Page {totalPages}</span>
                  </div>
                </div>
              </div>

              {/* Custom Expression input */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Custom Range Syntax
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Example: 1-3, 5, 7-{totalPages}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 1-4, 6, 8-10"
                  value={options.rangeString}
                  onChange={handleRangeTextChange}
                  className="w-full bg-black/60 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3.5 py-2.5 text-white font-mono text-sm placeholder:text-zinc-600"
                />
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>
                    Separate single pages with commas or specify ranges with hyphens.
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <span className="text-xs text-zinc-500 mr-2">Quick Presets:</span>
              <button
                type="button"
                onClick={onSelectAll}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                All Pages (1-{totalPages})
              </button>
              <button
                type="button"
                onClick={() => {
                  const mid = Math.ceil(totalPages / 2);
                  onOptionsChange({ fromPage: 1, toPage: mid });
                  onApplyRange(`1-${mid}`);
                }}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                First Half (1-{Math.ceil(totalPages / 2)})
              </button>
              {totalPages > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const mid = Math.ceil(totalPages / 2) + 1;
                    onOptionsChange({ fromPage: mid, toPage: totalPages });
                    onApplyRange(`${mid}-${totalPages}`);
                  }}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
                >
                  Second Half ({Math.ceil(totalPages / 2) + 1}-{totalPages})
                </button>
              )}
              <button
                type="button"
                onClick={onSelectOdd}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                Odd Pages
              </button>
              <button
                type="button"
                onClick={onSelectEven}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                Even Pages
              </button>
            </div>
          </div>
        )}

        {/* Panel 2: Visual Selection */}
        {options.mode === 'visual' && (
          <div className="animate-ios-enter flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">
                Click any thumbnail in the grid below to toggle selection:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onSelectAll}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-medium text-white transition-all cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={onDeselectAll}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={onInvertSelection}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              >
                Invert
              </button>
              <button
                onClick={() => onRotateAllSelected(90)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Rotate all selected pages 90 degrees clockwise"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Rotate Selected (90°)</span>
              </button>
            </div>
          </div>
        )}

        {/* Panel 3: Split Every Page */}
        {options.mode === 'extract_all' && (
          <div className="animate-ios-enter p-5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-[#BF5AF2] shrink-0">
              <Files className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Extract Every Page as a Separate PDF</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Splits your {totalPages}-page document into {totalPages} individual single-page PDF files
                (e.g., <code className="text-[#0A84FF]">page_01.pdf</code>, <code className="text-[#0A84FF]">page_02.pdf</code>, etc.)
                and automatically packs them into a single clean ZIP archive for download.
              </p>
            </div>
          </div>
        )}

        {/* Panel 4: Chunks */}
        {options.mode === 'chunks' && (
          <div className="animate-ios-enter p-5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Split into Equal Parts / Chunks</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Split your {totalPages}-page document into smaller multi-page parts.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Pages per part:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={options.chunkSize}
                  onChange={(e) =>
                    onOptionsChange({ chunkSize: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-20 bg-black/60 border border-white/10 focus:border-[#0A84FF] rounded-xl px-3 py-1.5 text-white font-medium text-center text-sm"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-400 flex items-center justify-between">
              <span>
                Total parts to be generated:{' '}
                <strong className="text-white">
                  {Math.ceil(totalPages / options.chunkSize)} files
                </strong>
              </span>
              <span className="text-zinc-500">
                (Packaged in a ZIP archive)
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Status Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0A84FF]" />
            <span className="text-zinc-400">
              Currently targeting:{' '}
              <strong className="text-white">
                {options.mode === 'extract_all'
                  ? `All ${totalPages} pages`
                  : options.mode === 'chunks'
                  ? `${totalPages} pages across ${Math.ceil(totalPages / options.chunkSize)} files`
                  : `${selectedPagesCount} of ${totalPages} pages`}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400 cursor-pointer flex items-center gap-2 select-none">
              <span className="text-zinc-400 hidden sm:inline">Output format:</span>
              <button
                type="button"
                onClick={() => onOptionsChange({ mergeIntoSingle: !options.mergeIntoSingle })}
                disabled={options.mode === 'extract_all' || options.mode === 'chunks'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  options.mergeIntoSingle ? 'bg-[#0A84FF]' : 'bg-zinc-800'
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    options.mergeIntoSingle ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-white font-medium">
                {options.mode === 'extract_all' || options.mode === 'chunks'
                  ? 'ZIP Archive'
                  : options.mergeIntoSingle
                  ? 'Single PDF'
                  : 'ZIP of Pages'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
