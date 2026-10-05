import React from 'react';
import { FileText, HardDrive, Layers, ArrowLeftRight, Trash2 } from 'lucide-react';
import type { PDFFileMetadata } from '../types';

interface DocumentInfoBarProps {
  metadata: PDFFileMetadata;
  selectedCount: number;
  onChangeFile: () => void;
  onReset: () => void;
}

export const DocumentInfoBar: React.FC<DocumentInfoBarProps> = ({
  metadata,
  selectedCount,
  onChangeFile,
  onReset,
}) => {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="ios-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-lg">
        {/* Document Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md md:max-w-lg" title={metadata.name}>
              {metadata.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                {metadata.pageCount} {metadata.pageCount === 1 ? 'page' : 'pages'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                {formatSize(metadata.size)}
              </span>
              <span>•</span>
              <span className="text-[#0A84FF] font-medium">
                {selectedCount} selected
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onChangeFile}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-medium text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Upload a different PDF file"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change File</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/20 transition-all cursor-pointer"
            title="Remove file"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
