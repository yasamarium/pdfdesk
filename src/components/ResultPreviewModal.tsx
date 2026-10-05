import React, { useEffect, useState } from 'react';
import { X, Download, FileCheck, ExternalLink } from 'lucide-react';
import { downloadBlob } from '../utils/pdfSplitter';

interface ResultPreviewModalProps {
  blob: Blob | null;
  filename: string;
  isZip: boolean;
  pageCount: number;
  onClose: () => void;
}

export const ResultPreviewModal: React.FC<ResultPreviewModalProps> = ({
  blob,
  filename,
  isZip,
  pageCount,
  onClose,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [blob]);

  if (!blob) return null;

  const handleDownload = () => {
    downloadBlob(blob, filename);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-ios-enter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl ios-glass-popover overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#30D158] border border-emerald-500/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-sm">
                Split Output Preview
              </h3>
              <p className="text-xs text-zinc-400">
                {isZip
                  ? `ZIP archive containing ${pageCount} individual files`
                  : `Merged PDF with ${pageCount} selected pages`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#0A84FF] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download ({filename})</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="relative flex-1 p-4 bg-black/60 overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          {isZip ? (
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#0A84FF]">
                <FileCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">ZIP Bundle Ready</h4>
              <p className="text-xs text-zinc-400 mb-6">
                Your PDF has been split into {pageCount} individual files and compressed into{' '}
                <span className="text-white font-mono">{filename}</span>.
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-2xl bg-[#0A84FF] hover:bg-blue-600 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all cursor-pointer"
              >
                Download ZIP Bundle
              </button>
            </div>
          ) : objectUrl ? (
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
              <iframe
                src={`${objectUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-none"
                title="Split PDF Preview"
              />
            </div>
          ) : (
            <div className="text-zinc-500 text-sm">Loading preview...</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950/80 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
          <span>Processed 100% locally on your computer</span>
          {objectUrl && !isZip && (
            <a
              href={objectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A84FF] hover:underline flex items-center gap-1"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
