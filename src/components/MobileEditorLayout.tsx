import React, { useState } from 'react';
import {
  PenTool,
  Highlighter,
  Type,
  RotateCw,
  Trash2,
  Download,
  UploadCloud,
  Stamp,
  Eraser,
  Undo,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileSignature,
  Loader2,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { CustomNameInput } from './CustomNameInput';
import type { TextAnnotation, EditorTool, WatermarkConfig } from '../types';

interface MobileEditorLayoutProps {
  originalName: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pageOrder: number[];
  pageRotations: Record<number, number>;
  drawings: Record<number, string>;
  textAnnotations: TextAnnotation[];
  watermark: WatermarkConfig;
  pageDataUrl: string | null;
  pageLoading: boolean;
  outputFilename: string;
  setOutputFilename: (name: string) => void;
  isExporting: boolean;
  isCloudSaving: boolean;
  onExportPdf: () => void;
  onCloudSavePdf: () => void;
  onRotateCurrentPage: () => void;
  onDeleteCurrentPage: () => void;
  onUndo: () => void;
  onClearPageDrawings: () => void;
  onOpenSignatureModal: () => void;
  onOpenWatermarkModal: () => void;
  onOpenAiAssistant: () => void;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  handleCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  currentRotation: number;
  pageTexts: TextAnnotation[];
  pageImageRef: React.RefObject<HTMLImageElement | null>;
  drawingCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const MobileEditorLayout: React.FC<MobileEditorLayoutProps> = ({
  originalName,
  currentPage,
  setCurrentPage,
  activeTool,
  setActiveTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  zoom,
  setZoom,
  pageOrder,
  drawings,
  textAnnotations,
  watermark,
  pageDataUrl,
  pageLoading,
  outputFilename,
  setOutputFilename,
  isExporting,
  isCloudSaving,
  onExportPdf,
  onCloudSavePdf,
  onRotateCurrentPage,
  onDeleteCurrentPage,
  onUndo,
  onClearPageDrawings,
  onOpenSignatureModal,
  onOpenWatermarkModal,
  onOpenAiAssistant,
  startDrawing,
  draw,
  stopDrawing,
  handleCanvasClick,
  currentRotation,
  pageTexts,
  pageImageRef,
  drawingCanvasRef,
}) => {
  const [showPagesDrawer, setShowPagesDrawer] = useState<boolean>(false);
  const [showExportDrawer, setShowExportDrawer] = useState<boolean>(false);

  const currentIndex = pageOrder.indexOf(currentPage);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < pageOrder.length - 1;

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    startDrawing(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    draw(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col min-h-[calc(100vh-5rem)] pb-24 relative select-none animate-ios-enter">
      {/* 1. Sticky Mobile Top Control Bar */}
      <div className="sticky top-16 z-30 w-full ios-glass px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2 shadow-lg">
        {/* Left: Pages Sheet trigger & Rotate */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPagesDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white transition-all cursor-pointer border border-white/10"
          >
            <Layers className="w-3.5 h-3.5 text-[#0A84FF]" />
            <span>
              {currentPage} / {pageOrder.length}
            </span>
          </button>

          <button
            type="button"
            onClick={onRotateCurrentPage}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 transition-all cursor-pointer"
            title="Rotate Page 90°"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>

        {/* Center: Quick Stepper & Undo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (canGoPrev) setCurrentPage(pageOrder[currentIndex - 1]);
            }}
            disabled={!canGoPrev}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onUndo}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 transition-all cursor-pointer"
            title="Undo last stroke"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (canGoNext) setCurrentPage(pageOrder[currentIndex + 1]);
            }}
            disabled={!canGoNext}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: AI Helper & Export Sheet Trigger */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="px-2.5 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/35 active:scale-95 text-xs font-semibold text-purple-200 border border-purple-500/30 flex items-center gap-1 shadow-sm shadow-purple-500/20 cursor-pointer"
            title="NVIDIA NIM AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>AI</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportDrawer(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0071e3] active:scale-95 text-xs font-semibold text-white shadow-md shadow-blue-500/25 flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* 2. Floating Zoom & Orientation Indicator */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-zinc-400">
        <span className="font-mono text-xs">
          Page {currentPage} of {pageOrder.length} {currentRotation > 0 ? `(${currentRotation}°)` : ''}
        </span>

        {/* Floating Zoom Bar */}
        <div className="flex items-center gap-1 bg-black/60 rounded-xl px-2 py-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="font-mono text-[10px] text-zinc-300 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 text-zinc-400 hover:text-white"
            title="Reset"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. Main Touch Canvas Viewport */}
      <div className="flex-1 w-full flex items-center justify-center p-2 min-h-[50vh] max-h-[68vh] overflow-auto rounded-3xl bg-zinc-950/90 border border-white/10 shadow-2xl relative my-1">
        {pageLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A84FF]" />
            <span className="text-xs">Loading page for mobile editor...</span>
          </div>
        ) : pageDataUrl ? (
          <div
            onClick={handleCanvasClick}
            className={`relative shadow-2xl rounded-lg overflow-hidden transition-transform select-none ${
              activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair'
            }`}
            style={{
              transform: `scale(${zoom}) rotate(${currentRotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Background PDF page rendered */}
            <img
              ref={pageImageRef}
              src={pageDataUrl}
              alt={`Page ${currentPage}`}
              className="max-h-[62vh] max-w-full object-contain pointer-events-none select-none block"
              draggable={false}
            />

            {/* Transparent Interactive Drawing Overlay Canvas */}
            <canvas
              ref={drawingCanvasRef}
              width={pageImageRef.current?.naturalWidth || 800}
              height={pageImageRef.current?.naturalHeight || 1100}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
              className="absolute inset-0 w-full h-full touch-none select-none z-10"
            />

            {/* Rendered Text Annotations */}
            {pageTexts.map((item) => (
              <div
                key={item.id}
                className="absolute z-20 pointer-events-none px-2 py-0.5 rounded shadow-sm"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  color: item.color,
                  fontSize: `${item.fontSize}px`,
                  fontWeight: item.isBold ? 'bold' : 'normal',
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                {item.text}
              </div>
            ))}

            {/* Watermark overlay preview */}
            {watermark.enabled && (
              <div className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center overflow-hidden">
                <span
                  style={{
                    color: watermark.color,
                    opacity: watermark.opacity,
                    fontSize: `${watermark.fontSize}px`,
                    transform: watermark.diagonal ? 'rotate(-45deg)' : 'none',
                    fontWeight: '900',
                    letterSpacing: '0.1em',
                  }}
                >
                  {watermark.text}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-zinc-500 text-xs">Failed to load page image.</div>
        )}
      </div>

      {/* 4. Active Tool Floating Options Sub-Bar (When Pen, Highlighter or Text is active) */}
      {(activeTool === 'draw' || activeTool === 'highlight' || activeTool === 'text') && (
        <div className="fixed bottom-20 left-3 right-3 max-w-lg mx-auto z-40 bg-zinc-900/95 border border-white/15 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 animate-fade-in">
          {/* Color Palette Dots */}
          <div className="flex items-center gap-2">
            {['#0A84FF', '#FF453A', '#30D158', '#FFD60A', '#FFFFFF', '#000000'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setStrokeColor(c)}
                className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                  strokeColor === c ? 'scale-125 border-white shadow-md' : 'border-zinc-700'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Stroke Widths */}
          <div className="flex items-center gap-1 bg-black/60 rounded-xl p-1 border border-white/5">
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setStrokeWidth(w)}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  strokeWidth === w ? 'bg-white/20 text-white font-bold' : 'text-zinc-500'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>

          {/* Clear Ink */}
          <button
            type="button"
            onClick={onClearPageDrawings}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
            title="Clear current page"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Fixed Mobile Bottom Tool Dock */}
      <div className="fixed bottom-2 left-2 right-2 max-w-lg mx-auto z-40 bg-zinc-950/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTool('draw')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
            activeTool === 'draw'
              ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Draw</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('highlight')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
            activeTool === 'highlight'
              ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Highlighter className="w-4 h-4" />
          <span>Highlight</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('text')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
            activeTool === 'text'
              ? 'bg-[#0A84FF] text-white font-semibold shadow-md shadow-blue-500/25'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Text</span>
        </button>

        <button
          type="button"
          onClick={onOpenSignatureModal}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <FileSignature className="w-4 h-4 text-emerald-400" />
          <span>Sign</span>
        </button>

        <button
          type="button"
          onClick={onOpenWatermarkModal}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
            watermark.enabled ? 'text-orange-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span>Stamp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('erase')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
            activeTool === 'erase' ? 'bg-red-500/20 text-red-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Eraser className="w-4 h-4" />
          <span>Erase</span>
        </button>
      </div>

      {/* 6. Pages Drawer (Slide-up Sheet) */}
      {showPagesDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
          onClick={() => setShowPagesDrawer(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-zinc-950 border-t border-white/15 rounded-t-3xl p-5 max-h-[75vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle & Header */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0A84FF]" />
                <h3 className="text-sm font-bold text-white">
                  Document Pages ({pageOrder.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPagesDrawer(false)}
                className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 gap-3 overflow-y-auto py-4 flex-1 scrollbar-thin">
              {pageOrder.map((pageNum, idx) => {
                const isActive = pageNum === currentPage;
                const hasDrawing = !!drawings[pageNum];
                const textsCount = textAnnotations.filter((t) => t.pageNumber === pageNum).length;

                return (
                  <div
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      setShowPagesDrawer(false);
                    }}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-blue-500/15 border-[#0A84FF] shadow-lg shadow-blue-500/20'
                        : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-white">
                      {idx + 1}
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-300">Page {pageNum}</span>
                    <div className="flex items-center gap-1 text-[9px]">
                      {hasDrawing && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-[#0A84FF]">Ink</span>
                      )}
                      {textsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                          {textsCount}T
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page Actions Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onRotateCurrentPage();
                  setShowPagesDrawer(false);
                }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Rotate Current</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteCurrentPage();
                  setShowPagesDrawer(false);
                }}
                className="flex-1 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-xs font-semibold text-red-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Page</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Export & Save Slide-Up Sheet */}
      {showExportDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
          onClick={() => setShowExportDrawer(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-zinc-950 border-t border-white/15 rounded-t-3xl p-5 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Save & Export Edited Document</h3>
              <button
                type="button"
                onClick={() => setShowExportDrawer(false)}
                className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Filename */}
            <CustomNameInput
              value={outputFilename}
              originalName={originalName}
              rangeString="edited"
              selectedCount={pageOrder.length}
              isZip={false}
              onChange={(name) => setOutputFilename(name)}
            />

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isExporting || isCloudSaving}
                onClick={() => {
                  onExportPdf();
                  setShowExportDrawer(false);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0071e3] text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download & Export PDF</span>
              </button>

              <button
                type="button"
                disabled={isCloudSaving || isExporting}
                onClick={() => {
                  onCloudSavePdf();
                  setShowExportDrawer(false);
                }}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-sm font-semibold text-white flex items-center justify-center gap-2 border border-white/10 cursor-pointer disabled:opacity-50"
              >
                {isCloudSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                )}
                <span>Save to Cloud Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
