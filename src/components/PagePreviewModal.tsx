import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  Maximize2,
} from 'lucide-react';
import { renderPageHighRes } from '../utils/pdfParser';

interface PagePreviewModalProps {
  pdfDoc: any;
  pageNumber: number;
  totalPages: number;
  isSelected: boolean;
  rotation: number;
  onClose: () => void;
  onNavigate: (newPageNumber: number) => void;
  onToggleSelect: (pageNumber: number) => void;
  onRotatePage: (pageNumber: number) => void;
}

export const PagePreviewModal: React.FC<PagePreviewModalProps> = ({
  pdfDoc,
  pageNumber,
  totalPages,
  isSelected,
  rotation,
  onClose,
  onNavigate,
  onToggleSelect,
  onRotatePage,
}) => {
  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);

  // Load high-resolution render of the current page
  useEffect(() => {
    let active = true;
    setLoading(true);

    if (pdfDoc && pageNumber) {
      renderPageHighRes(pdfDoc, pageNumber, 1.8)
        .then((res) => {
          if (active) {
            setHighResUrl(res.dataUrl);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to render high res preview:', err);
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && pageNumber > 1) {
        onNavigate(pageNumber - 1);
      } else if (e.key === 'ArrowRight' && pageNumber < totalPages) {
        onNavigate(pageNumber + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, totalPages, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-ios-enter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl ios-glass-popover overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Modal Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">
              Page {pageNumber} <span className="text-zinc-500 font-normal">of {totalPages}</span>
            </span>

            {/* Toggle selection switch */}
            <button
              onClick={() => onToggleSelect(pageNumber)}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0A84FF] text-white shadow-sm'
                  : 'bg-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
              <span>{isSelected ? 'Included in Split' : 'Excluded'}</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-zinc-400 font-mono px-1">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => onRotatePage(pageNumber)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all border border-white/5 cursor-pointer"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all ml-1 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="relative flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center min-h-[350px] max-h-[72vh] bg-black/50">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              <div className="w-8 h-8 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Rendering High-Resolution Preview...</span>
            </div>
          ) : highResUrl ? (
            <div
              className="transition-transform duration-200 flex items-center justify-center"
              style={{
                transform: `scale(${zoom}) rotate(${rotation || 0}deg)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={highResUrl}
                alt={`Page ${pageNumber}`}
                className="max-h-[64vh] max-w-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
              />
            </div>
          ) : (
            <div className="text-zinc-500 text-xs">Failed to load preview</div>
          )}

          {/* Previous Page arrow button */}
          {pageNumber > 1 && (
            <button
              onClick={() => onNavigate(pageNumber - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/10 shadow-xl transition-all active:scale-90 cursor-pointer"
              title="Previous Page (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next Page arrow button */}
          {pageNumber < totalPages && (
            <button
              onClick={() => onNavigate(pageNumber + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/10 shadow-xl transition-all active:scale-90 cursor-pointer"
              title="Next Page (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-zinc-950/80 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
          <span className="hidden sm:inline">Use Arrow keys ← → to browse pages • Esc to close</span>
          <span className="ml-auto">
            Page {pageNumber} of {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};
