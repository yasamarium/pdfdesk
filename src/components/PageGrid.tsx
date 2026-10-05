import React from 'react';
import { Check, ZoomIn, RotateCw } from 'lucide-react';
import type { PageInfo } from '../types';

interface PageGridProps {
  pages: PageInfo[];
  onToggleSelect: (pageNumber: number) => void;
  onPreviewPage: (pageNumber: number) => void;
  onRotatePage: (pageNumber: number) => void;
}

export const PageGrid: React.FC<PageGridProps> = ({
  pages,
  onToggleSelect,
  onPreviewPage,
  onRotatePage,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
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
              {/* Top Header inside thumbnail */}
              <div className="p-2.5 flex items-center justify-between z-10 bg-zinc-900/80 backdrop-blur-md border-b border-white/5">
                <span className="text-xs font-semibold text-zinc-300">
                  Page {page.pageNumber}
                </span>

                {/* iOS Checkmark Indicator */}
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

              {/* Thumbnail Container */}
              <div className="relative aspect-[1/1.35] w-full p-2.5 flex items-center justify-center overflow-hidden bg-zinc-950">
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

                {/* Hover overlay actions */}
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
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(page.pageNumber);
                    }}
                    className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-90"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-2.5 py-1.5 bg-black/30 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                <span>{page.width ? `${Math.round(page.width)}×${Math.round(page.height)}` : 'PDF Page'}</span>
                {rotationAngle > 0 && (
                  <span className="text-blue-400 font-mono">+{rotationAngle}°</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
