import React from 'react';
import { Download, Eye, Loader2, Sparkles, Edit3 } from 'lucide-react';
import type { SplitOptions } from '../types';

interface FloatingActionBarProps {
  options: SplitOptions;
  selectedCount: number;
  totalPages: number;
  isProcessing: boolean;
  progress: number;
  onSplit: () => void;
  onPreviewResult: () => void;
  onFilenameChange: (name: string) => void;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  options,
  selectedCount,
  totalPages,
  isProcessing,
  progress,
  onSplit,
  onPreviewResult,
  onFilenameChange,
}) => {
  const isSplitAll = options.mode === 'extract_all';
  const isChunks = options.mode === 'chunks';
  const effectiveCount = isSplitAll || isChunks ? totalPages : selectedCount;
  const canProceed = effectiveCount > 0;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="ios-glass rounded-3xl p-3 sm:p-4 border border-white/15 shadow-2xl shadow-black/90 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-2xl ring-1 ring-white/10">
          {/* Left: Summary & Filename edit */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden xs:flex w-10 h-10 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 text-[#0A84FF]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {isSplitAll
                    ? `Splitting All ${totalPages} Pages`
                    : isChunks
                    ? `${totalPages} pages (${Math.ceil(totalPages / options.chunkSize)} parts)`
                    : `${selectedCount} of ${totalPages} pages selected`}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
                  {options.mergeIntoSingle && !isSplitAll && !isChunks ? 'PDF' : 'ZIP'}
                </span>
              </div>

              {/* Filename input */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <Edit3 className="w-3 h-3 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={options.outputFilename}
                  onChange={(e) => onFilenameChange(e.target.value)}
                  placeholder="Output filename"
                  className="bg-transparent text-xs text-zinc-300 hover:text-white focus:text-white focus:outline-none focus:border-b focus:border-[#0A84FF] border-b border-transparent font-medium py-0.5 w-44 sm:w-56 truncate"
                  title="Click to rename output file"
                />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Live Preview Button (only for single PDF merge) */}
            {options.mergeIntoSingle && !isSplitAll && !isChunks && (
              <button
                type="button"
                onClick={onPreviewResult}
                disabled={!canProceed || isProcessing}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-medium text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Preview merged PDF before downloading"
              >
                <Eye className="w-4 h-4 text-[#0A84FF]" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}

            {/* Split & Download Primary CTA */}
            <button
              type="button"
              onClick={onSplit}
              disabled={!canProceed || isProcessing}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer ${
                canProceed && !isProcessing
                  ? 'bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50 shadow-none'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {progress > 0 ? `Processing (${progress}%)` : 'Splitting...'}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {isSplitAll
                      ? 'Download All Pages (.zip)'
                      : isChunks
                      ? 'Split into Chunks (.zip)'
                      : options.mergeIntoSingle
                      ? `Split & Download (${effectiveCount} Pages)`
                      : `Download Pages (.zip)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
