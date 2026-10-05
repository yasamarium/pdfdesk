import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckSquare,
  Files,
  Scissors,
  RotateCw,
  Eye,
  Download,
  Loader2,
  FileText,
  Layers,
  ArrowLeftRight,
  Trash2,
  Settings2,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { CustomNameInput } from './CustomNameInput';
import type { PDFFileMetadata, PageInfo, SplitOptions, SplitMode } from '../types';

interface MobileLayoutProps {
  metadata: PDFFileMetadata;
  pages: PageInfo[];
  options: SplitOptions;
  selectedCount: number;
  rotations: Record<number, number>;
  isProcessing: boolean;
  progress: number;
  onOptionsChange: (newOptions: Partial<SplitOptions>) => void;
  onApplyRange: (rangeStr: string) => void;
  onToggleSelect: (pageNumber: number) => void;
  onPreviewPage: (pageNumber: number) => void;
  onRotatePage: (pageNumber: number) => void;
  onRotateAllSelected: (degrees: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onSelectOdd: () => void;
  onSelectEven: () => void;
  onChangeFile: () => void;
  onReset: () => void;
  onSplit: () => void;
  onPreviewResult: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  metadata,
  pages,
  options,
  selectedCount,
  isProcessing,
  progress,
  onOptionsChange,
  onApplyRange,
  onToggleSelect,
  onPreviewPage,
  onRotatePage,
  onRotateAllSelected,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onSelectOdd,
  onSelectEven,
  onChangeFile,
  onReset,
  onSplit,
  onPreviewResult,
}) => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  const modes: { id: SplitMode; label: string; icon: React.ReactNode }[] = [
    { id: 'range', label: 'Range', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'visual', label: 'Visual', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'extract_all', label: 'All Pages', icon: <Files className="w-3.5 h-3.5" /> },
    { id: 'chunks', label: 'Chunks', icon: <Scissors className="w-3.5 h-3.5" /> },
  ];

  const handleFromChange = (val: number) => {
    const from = Math.max(1, Math.min(val, metadata.pageCount));
    const to = Math.max(from, options.toPage);
    onOptionsChange({ fromPage: from, toPage: to });
    onApplyRange(`${from}-${to}`);
  };

  const handleToChange = (val: number) => {
    const to = Math.max(1, Math.min(val, metadata.pageCount));
    const from = Math.min(options.fromPage, to);
    onOptionsChange({ fromPage: from, toPage: to });
    onApplyRange(`${from}-${to}`);
  };

  const isZip = !options.mergeIntoSingle || options.mode === 'extract_all' || options.mode === 'chunks';
  const effectiveCount = options.mode === 'extract_all' || options.mode === 'chunks' ? metadata.pageCount : selectedCount;

  return (
    <div className="w-full px-3 py-3 space-y-4 pb-36">
      {/* Mobile File Info Strip */}
      <div className="ios-glass rounded-2xl p-3 border border-white/10 shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-white truncate max-w-[170px]" title={metadata.name}>
              {metadata.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-zinc-500" />
                {metadata.pageCount} pages
              </span>
              <span>•</span>
              <span className="text-[#0A84FF] font-medium">{selectedCount} selected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onChangeFile}
            className="p-1.5 rounded-xl bg-white/5 active:bg-white/15 text-zinc-300 transition-all border border-white/5"
            title="Change PDF"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-xl bg-red-500/10 active:bg-red-500/20 text-red-400 transition-all border border-red-500/20"
            title="Close"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Segmented Pill Bar */}
      <div className="flex justify-center overflow-x-auto scrollbar-none py-0.5">
        <div className="inline-flex p-1 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-inner">
          {modes.map((mode) => {
            const isActive = options.mode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onOptionsChange({ mode: mode.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0A84FF] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'text-zinc-400 active:bg-white/5'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Range Controls for Mobile */}
      {options.mode === 'range' && (
        <div className="ios-glass rounded-2xl p-3.5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span>Page Range (From - To)</span>
            <span className="text-[10px] text-zinc-500">1 to {metadata.pageCount}</span>
          </div>

          {/* Stepper Inputs for Finger Touch */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* From Stepper */}
            <div className="bg-black/60 rounded-xl p-2 border border-white/10 space-y-1">
              <span className="text-[10px] text-zinc-500 block">From Page</span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleFromChange(options.fromPage - 1)}
                  className="w-8 h-8 rounded-lg bg-white/5 active:bg-white/15 flex items-center justify-center text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold text-white font-mono">{options.fromPage}</span>
                <button
                  type="button"
                  onClick={() => handleFromChange(options.fromPage + 1)}
                  className="w-8 h-8 rounded-lg bg-white/5 active:bg-white/15 flex items-center justify-center text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* To Stepper */}
            <div className="bg-black/60 rounded-xl p-2 border border-white/10 space-y-1">
              <span className="text-[10px] text-zinc-500 block">To Page</span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToChange(options.toPage - 1)}
                  className="w-8 h-8 rounded-lg bg-white/5 active:bg-white/15 flex items-center justify-center text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold text-white font-mono">{options.toPage}</span>
                <button
                  type="button"
                  onClick={() => handleToChange(options.toPage + 1)}
                  className="w-8 h-8 rounded-lg bg-white/5 active:bg-white/15 flex items-center justify-center text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Custom Range text input */}
          <div>
            <input
              type="text"
              value={options.rangeString}
              onChange={(e) => {
                onOptionsChange({ rangeString: e.target.value });
                onApplyRange(e.target.value);
              }}
              placeholder={`e.g. 1-3, 5, 7`}
              className="w-full bg-black/60 border border-white/10 focus:border-[#0A84FF] rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1 pt-1">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/5"
            >
              All
            </button>
            <button
              type="button"
              onClick={onSelectOdd}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/5"
            >
              Odd
            </button>
            <button
              type="button"
              onClick={onSelectEven}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/5"
            >
              Even
            </button>
            <button
              type="button"
              onClick={() => {
                const mid = Math.ceil(metadata.pageCount / 2);
                onOptionsChange({ fromPage: 1, toPage: mid });
                onApplyRange(`1-${mid}`);
              }}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/5"
            >
              1st Half
            </button>
          </div>
        </div>
      )}

      {/* Visual Selection Quick Bar on Mobile */}
      {options.mode === 'visual' && (
        <div className="ios-glass rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-1.5">
          <span className="text-[11px] text-zinc-400">Tap cards to select:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-[10px] px-2 py-1 rounded-lg bg-white/10 text-white font-medium"
            >
              All
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-zinc-400"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onInvertSelection}
              className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-zinc-400"
            >
              Invert
            </button>
            <button
              type="button"
              onClick={() => onRotateAllSelected(90)}
              className="p-1 rounded-lg bg-white/5 text-blue-400"
              title="Rotate Selected"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Chunks mode */}
      {options.mode === 'chunks' && (
        <div className="ios-glass rounded-2xl p-3 border border-white/10 flex items-center justify-between text-xs text-zinc-300">
          <span>Pages per file:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onOptionsChange({ chunkSize: Math.max(1, options.chunkSize - 1) })
              }
              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-bold font-mono text-sm">{options.chunkSize}</span>
            <button
              type="button"
              onClick={() =>
                onOptionsChange({ chunkSize: Math.min(metadata.pageCount, options.chunkSize + 1) })
              }
              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Extract All mode */}
      {options.mode === 'extract_all' && (
        <div className="ios-glass rounded-2xl p-3 border border-purple-500/20 bg-purple-500/10 text-xs text-purple-200">
          Extracting all {metadata.pageCount} pages as single files in a ZIP.
        </div>
      )}

      {/* Expandable Custom Name & Output Settings Drawer */}
      <div className="ios-glass rounded-2xl border border-white/10 overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-200 active:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-[#0A84FF]" />
            <span>Export File Name & Options</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-[11px] truncate max-w-[130px] font-mono text-zinc-400">
              {options.outputFilename || 'Set name'}
            </span>
            {showSettingsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showSettingsDrawer && (
          <div className="p-3.5 border-t border-white/5 space-y-3 bg-black/40 animate-ios-enter">
            {/* Custom Name Component */}
            <CustomNameInput
              value={options.outputFilename}
              originalName={metadata.name}
              rangeString={options.rangeString}
              selectedCount={selectedCount}
              isZip={isZip}
              onChange={(name) => onOptionsChange({ outputFilename: name })}
            />

            {/* Output format toggle */}
            {options.mode !== 'extract_all' && options.mode !== 'chunks' && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Export as:</span>
                <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ mergeIntoSingle: true })}
                    className={`px-3 py-1 rounded-lg ${
                      options.mergeIntoSingle ? 'bg-[#0A84FF] text-white font-medium' : 'text-zinc-400'
                    }`}
                  >
                    Single PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ mergeIntoSingle: false })}
                    className={`px-3 py-1 rounded-lg ${
                      !options.mergeIntoSingle ? 'bg-[#0A84FF] text-white font-medium' : 'text-zinc-400'
                    }`}
                  >
                    ZIP Bundle
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile 2-Column Touch Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {pages.map((page) => {
          const isSelected = page.selected;
          const rotationAngle = page.rotation || 0;

          return (
            <div
              key={page.pageNumber}
              onClick={() => onToggleSelect(page.pageNumber)}
              className={`relative rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-150 select-none flex flex-col ${
                isSelected
                  ? 'bg-zinc-900 ring-2 ring-[#0A84FF] shadow-lg shadow-blue-500/20'
                  : 'bg-zinc-950/70 ring-1 ring-white/10 opacity-70'
              }`}
            >
              {/* Header */}
              <div className="p-2 flex items-center justify-between bg-zinc-900/90 border-b border-white/5">
                <span className="text-[11px] font-semibold text-zinc-200">
                  Page {page.pageNumber}
                </span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#0A84FF] text-white' : 'border border-zinc-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="relative aspect-[1/1.3] w-full p-2 flex items-center justify-center bg-zinc-950">
                {page.thumbnailUrl ? (
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="max-w-full max-h-full object-contain rounded shadow"
                    style={{ transform: `rotate(${rotationAngle}deg)` }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                )}

                {/* Touch buttons */}
                <div className="absolute bottom-1 right-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onPreviewPage(page.pageNumber)}
                    className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur border border-white/10 active:scale-90"
                    title="Zoom"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRotatePage(page.pageNumber)}
                    className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur border border-white/10 active:scale-90"
                    title="Rotate"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Mobile Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-black via-black/90 to-transparent pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="ios-glass rounded-2xl p-2.5 border border-white/15 shadow-2xl flex items-center gap-2">
          {/* Quick Name Badge & tap to open settings */}
          <button
            type="button"
            onClick={() => setShowSettingsDrawer(true)}
            className="flex-1 min-w-0 text-left px-2 py-1 rounded-xl active:bg-white/5"
          >
            <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
              <span>{isZip ? 'ZIP' : 'PDF'}:</span>
              <span className="text-white font-medium truncate">{options.outputFilename}</span>
            </div>
            <div className="text-[11px] font-semibold text-[#0A84FF]">
              {selectedCount} of {metadata.pageCount} pages selected
            </div>
          </button>

          {/* Preview button */}
          {options.mergeIntoSingle && options.mode !== 'extract_all' && options.mode !== 'chunks' && (
            <button
              type="button"
              onClick={onPreviewResult}
              disabled={effectiveCount === 0 || isProcessing}
              className="p-2.5 rounded-xl bg-white/10 active:bg-white/20 text-white border border-white/10 disabled:opacity-40"
              title="Preview"
            >
              <Eye className="w-4 h-4 text-[#0A84FF]" />
            </button>
          )}

          {/* Primary Split & Download button */}
          <button
            type="button"
            onClick={onSplit}
            disabled={effectiveCount === 0 || isProcessing}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 active:scale-95 transition-all ${
              effectiveCount > 0 && !isProcessing
                ? 'bg-gradient-to-r from-[#0A84FF] to-[#0071e3]'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{progress > 0 ? `${progress}%` : 'Working'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Split & Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
