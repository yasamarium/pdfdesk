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
  HardDrive,
  Layers,
  ArrowLeftRight,
  Trash2,
  Check,
} from 'lucide-react';
import { CustomNameInput } from './CustomNameInput';
import type { PDFFileMetadata, PageInfo, SplitOptions, SplitMode } from '../types';

interface DesktopLayoutProps {
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

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
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
  const [gridCols, setGridCols] = useState<number>(4);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

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
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Fixed Desktop Control Panel (5 cols) */}
        <aside className="col-span-12 lg:col-span-4 xl:col-span-4 space-y-5 sticky top-20">
          {/* Document Summary Card */}
          <div className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/25 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate" title={metadata.name}>
                    {metadata.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-zinc-500" />
                      {metadata.pageCount} pages
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-zinc-500" />
                      {formatSize(metadata.size)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={onChangeFile}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
                  title="Change PDF File"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer border border-red-500/20"
                  title="Close PDF"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="pt-2 border-t border-white/5">
              <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-black/60 border border-white/10">
                {modes.map((mode) => {
                  const isActive = options.mode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onOptionsChange({ mode: mode.id })}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0A84FF] text-white shadow-md shadow-blue-500/25 font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {mode.icon}
                      <span className="text-[11px] mt-1">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Mode Sub-Settings */}
            {options.mode === 'range' && (
              <div className="space-y-4 pt-2">
                {/* From-To Page Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 font-medium block mb-1">From Page</label>
                    <input
                      type="number"
                      min={1}
                      max={metadata.pageCount}
                      value={options.fromPage}
                      onChange={(e) => handleFromChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-black/50 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3 py-2 text-white font-medium text-center text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 font-medium block mb-1">To Page</label>
                    <input
                      type="number"
                      min={1}
                      max={metadata.pageCount}
                      value={options.toPage}
                      onChange={(e) => handleToChange(parseInt(e.target.value) || metadata.pageCount)}
                      className="w-full bg-black/50 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3 py-2 text-white font-medium text-center text-sm"
                    />
                  </div>
                </div>

                {/* Range String input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] text-zinc-400 font-medium">Custom Range Expression</label>
                    <span className="text-[10px] text-zinc-500 font-mono">e.g. 1-3, 5, 7</span>
                  </div>
                  <input
                    type="text"
                    value={options.rangeString}
                    onChange={(e) => {
                      onOptionsChange({ rangeString: e.target.value });
                      onApplyRange(e.target.value);
                    }}
                    placeholder={`e.g. 1-${Math.min(5, metadata.pageCount)}`}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#0A84FF] focus:outline-none rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                  >
                    All ({metadata.pageCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mid = Math.ceil(metadata.pageCount / 2);
                      onOptionsChange({ fromPage: 1, toPage: mid });
                      onApplyRange(`1-${mid}`);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                  >
                    1st Half (1-{Math.ceil(metadata.pageCount / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={onSelectOdd}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                  >
                    Odd Pages
                  </button>
                  <button
                    type="button"
                    onClick={onSelectEven}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                  >
                    Even Pages
                  </button>
                </div>
              </div>
            )}

            {options.mode === 'chunks' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Pages per Part:</span>
                  <input
                    type="number"
                    min={1}
                    max={metadata.pageCount}
                    value={options.chunkSize}
                    onChange={(e) =>
                      onOptionsChange({ chunkSize: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-20 bg-black/50 border border-white/10 focus:border-[#0A84FF] rounded-xl px-3 py-1.5 text-white font-medium text-center text-sm"
                  />
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-400">
                  Total files to generate: <strong className="text-white">{Math.ceil(metadata.pageCount / options.chunkSize)} parts</strong>
                </div>
              </div>
            )}

            {options.mode === 'extract_all' && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-zinc-300 space-y-1">
                <p className="font-semibold text-purple-300">Extracting All Pages</p>
                <p className="text-zinc-400 text-[11px]">
                  All {metadata.pageCount} pages will be exported as individual PDF files in a ZIP archive.
                </p>
              </div>
            )}

            {/* Custom Filename Section */}
            <div className="pt-3 border-t border-white/5">
              <CustomNameInput
                value={options.outputFilename}
                originalName={metadata.name}
                rangeString={options.rangeString}
                selectedCount={selectedCount}
                isZip={isZip}
                onChange={(name) => onOptionsChange({ outputFilename: name })}
              />
            </div>

            {/* Output Format Switcher */}
            {options.mode !== 'extract_all' && options.mode !== 'chunks' && (
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Output Format:</span>
                <div className="inline-flex p-1 rounded-xl bg-black/50 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ mergeIntoSingle: true })}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      options.mergeIntoSingle
                        ? 'bg-[#0A84FF] text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Single PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ mergeIntoSingle: false })}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      !options.mergeIntoSingle
                        ? 'bg-[#0A84FF] text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ZIP Bundle
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/5 space-y-2.5">
              {/* Primary Split Button */}
              <button
                type="button"
                onClick={onSplit}
                disabled={effectiveCount === 0 || isProcessing}
                className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all duration-200 cursor-pointer ${
                  effectiveCount > 0 && !isProcessing
                    ? 'bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50 shadow-none'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing {progress > 0 ? `(${progress}%)` : '...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {options.mode === 'extract_all'
                        ? `Download All ${metadata.pageCount} Pages (.zip)`
                        : options.mode === 'chunks'
                        ? `Download Chunks (.zip)`
                        : options.mergeIntoSingle
                        ? `Split & Download (${selectedCount} Pages)`
                        : `Download Pages (.zip)`}
                    </span>
                  </>
                )}
              </button>

              {/* Preview Button */}
              {options.mergeIntoSingle && options.mode !== 'extract_all' && options.mode !== 'chunks' && (
                <button
                  type="button"
                  onClick={onPreviewResult}
                  disabled={effectiveCount === 0 || isProcessing}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-medium text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Eye className="w-4 h-4 text-[#0A84FF]" />
                  <span>Preview Split Result</span>
                </button>
              )}

              {/* Keyboard Shortcut Note */}
              <div className="text-center pt-1 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                <span>Shortcut:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono text-[10px]">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono text-[10px]">
                  Enter
                </kbd>
                <span>to split</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Interactive Studio Canvas & Thumbnail Grid (8 cols) */}
        <section className="col-span-12 lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Studio Top Control Strip */}
          <div className="ios-glass rounded-2xl p-4 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white">
                Selected: <span className="text-[#0A84FF]">{selectedCount}</span> of {metadata.pageCount} pages
              </span>
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onInvertSelection}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  Invert
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRotateAllSelected(90)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                title="Rotate selected pages 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Rotate Selected (90°)</span>
              </button>

              {/* Grid Column Selector */}
              <div className="hidden md:flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
                {[3, 4, 5].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => setGridCols(cols)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      gridCols === cols
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={`${cols} columns`}
                  >
                    {cols}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid of Pages */}
          <div
            className={`grid gap-4 sm:gap-5 ${
              gridCols === 3
                ? 'grid-cols-3'
                : gridCols === 5
                ? 'grid-cols-5'
                : 'grid-cols-4'
            }`}
          >
            {pages.map((page) => {
              const isSelected = page.selected;
              const rotationAngle = page.rotation || 0;

              return (
                <div
                  key={page.pageNumber}
                  onClick={() => onToggleSelect(page.pageNumber)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 select-none flex flex-col ${
                    isSelected
                      ? 'bg-zinc-900/90 ring-2 ring-[#0A84FF] shadow-lg shadow-blue-500/15 translate-y-[-2px]'
                      : 'bg-zinc-950/60 ring-1 ring-white/10 opacity-70 hover:opacity-100 hover:ring-white/20'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="p-2.5 flex items-center justify-between z-10 bg-zinc-900/80 backdrop-blur-md border-b border-white/5">
                    <span className="text-xs font-semibold text-zinc-300">
                      Page {page.pageNumber}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#0A84FF] text-white shadow-sm'
                          : 'border-1.5 border-zinc-600 bg-black/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative aspect-[1/1.35] w-full p-2 flex items-center justify-center overflow-hidden bg-zinc-950">
                    {page.thumbnailUrl ? (
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="max-w-full max-h-full object-contain rounded-md shadow-md transition-transform duration-300"
                        style={{ transform: `rotate(${rotationAngle}deg)` }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                        <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mb-2" />
                        <span className="text-[10px]">Rendering...</span>
                      </div>
                    )}

                    {/* Quick Action Overlay */}
                    <div
                      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewPage(page.pageNumber);
                        }}
                        className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-90"
                        title="High-Res Live Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotatePage(page.pageNumber);
                        }}
                        className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-90"
                        title="Rotate 90° Clockwise"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-2.5 py-1.5 bg-black/30 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{page.width ? `${Math.round(page.width)}×${Math.round(page.height)}` : 'PDF'}</span>
                    {rotationAngle > 0 && <span className="text-blue-400 font-mono">+{rotationAngle}°</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
