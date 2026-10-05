import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { renderPageHighRes } from '../utils/pdfParser';
import { compileEditedPdf } from '../utils/pdfEditorEngine';
import { downloadBlob } from '../utils/pdfSplitter';
import { SignatureModal } from './SignatureModal';
import { WatermarkModal } from './WatermarkModal';
import { CustomNameInput } from './CustomNameInput';
import { NvidiaAiAssistantModal } from './NvidiaAiAssistantModal';
import type { PDFFileMetadata, TextAnnotation, WatermarkConfig, EditorTool, CloudUser } from '../types';

interface PdfEditorViewProps {
  metadata: PDFFileMetadata;
  pdfDoc: any;
  user: CloudUser | null;
  onOpenSignIn: () => void;
  onSaveToCloud: (blob: Blob, name: string) => Promise<void>;
}

export const PdfEditorView: React.FC<PdfEditorViewProps> = ({
  metadata,
  pdfDoc,
  user,
  onOpenSignIn,
  onSaveToCloud,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<EditorTool>('draw');
  const [strokeColor, setStrokeColor] = useState<string>('#0A84FF');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [zoom, setZoom] = useState<number>(1);

  // Page transformations & edits
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [drawings, setDrawings] = useState<Record<number, string>>({}); // pageNum -> dataUrl
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENTIAL',
    opacity: 0.25,
    fontSize: 54,
    color: '#888888',
    diagonal: true,
    allPages: true,
  });

  // Export settings
  const [outputFilename, setOutputFilename] = useState<string>(
    `${metadata.name.replace(/\.pdf$/i, '')}_edited`
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCloudSaving, setIsCloudSaving] = useState<boolean>(false);

  // Modals
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);

  // Canvas refs
  const pageImageRef = useRef<HTMLImageElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const historyRef = useRef<Record<number, ImageData[]>>({});

  // Current page high-res URL
  const [pageDataUrl, setPageDataUrl] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  // Initialize page order
  useEffect(() => {
    if (metadata.pageCount) {
      setPageOrder(Array.from({ length: metadata.pageCount }, (_, i) => i + 1));
    }
  }, [metadata.pageCount]);

  // Load high-res render of current page
  useEffect(() => {
    let active = true;
    setPageLoading(true);

    if (pdfDoc && currentPage) {
      renderPageHighRes(pdfDoc, currentPage, 1.8)
        .then((res) => {
          if (active) {
            setPageDataUrl(res.dataUrl);
            setPageLoading(false);
          }
        })
        .catch((e) => {
          console.error('Page render error:', e);
          if (active) setPageLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [pdfDoc, currentPage]);

  // Sync drawing canvas overlay when current page changes
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const savedDrawing = drawings[currentPage];
    if (savedDrawing) {
      const img = new Image();
      img.src = savedDrawing;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [currentPage, drawings]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select' || activeTool === 'text') return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Save history state for undo
    if (!historyRef.current[currentPage]) historyRef.current[currentPage] = [];
    historyRef.current[currentPage].push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'highlight') {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 18;
      ctx.lineCap = 'square';
    } else if (activeTool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 4;
      ctx.lineCap = 'round';
    } else {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    // Reset composite operation
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
    }

    // Persist drawing data URL
    const dataUrl = canvas.toDataURL('image/png');
    setDrawings((prev) => ({ ...prev, [currentPage]: dataUrl }));
  };

  // Add text annotation on click
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'text') return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    const xPercent = Math.max(5, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(5, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    const defaultText = prompt('Enter text annotation:', 'Approved');
    if (defaultText && defaultText.trim()) {
      const newAnnotation: TextAnnotation = {
        id: Math.random().toString(36).substring(2, 9),
        pageNumber: currentPage,
        text: defaultText.trim(),
        x: xPercent,
        y: yPercent,
        fontSize: 16,
        color: strokeColor,
        isBold: true,
      };
      setTextAnnotations((prev) => [...prev, newAnnotation]);
      setActiveTool('select');
    }
  };

  const handleApplySignature = (sigDataUrl: string) => {
    // Stamp signature into current page's drawing canvas
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = sigDataUrl;
    img.onload = () => {
      // Place signature at bottom center of the page
      const sigWidth = canvas.width * 0.35;
      const sigHeight = sigWidth * (img.height / img.width);
      const x = (canvas.width - sigWidth) / 2;
      const y = canvas.height - sigHeight - 40;

      ctx.drawImage(img, x, y, sigWidth, sigHeight);
      setDrawings((prev) => ({ ...prev, [currentPage]: canvas.toDataURL('image/png') }));
    };
  };

  const handleStampTextFromAi = (text: string) => {
    const newAnnotation: TextAnnotation = {
      id: `ai_${Date.now()}`,
      pageNumber: currentPage,
      text: text.trim(),
      x: 10,
      y: 12,
      fontSize: 14,
      color: strokeColor === '#000000' ? '#0A84FF' : strokeColor,
      isBold: true,
    };
    setTextAnnotations((prev) => [...prev, newAnnotation]);
    setActiveTool('select');
  };

  const handleUndo = () => {
    const history = historyRef.current[currentPage];
    if (history && history.length > 0) {
      const lastState = history.pop();
      const canvas = drawingCanvasRef.current;
      if (canvas && lastState) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(lastState, 0, 0);
          setDrawings((prev) => ({ ...prev, [currentPage]: canvas.toDataURL('image/png') }));
        }
      }
    }
  };

  const handleClearPageDrawings = () => {
    if (!confirm('Clear all drawings and annotations on this page?')) return;
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setDrawings((prev) => ({ ...prev, [currentPage]: '' }));
    setTextAnnotations((prev) => prev.filter((t) => t.pageNumber !== currentPage));
  };

  const handleRotateCurrentPage = () => {
    setPageRotations((prev) => ({
      ...prev,
      [currentPage]: ((prev[currentPage] || 0) + 90) % 360,
    }));
  };

  const handleDeleteCurrentPage = () => {
    if (pageOrder.length <= 1) {
      alert('Cannot delete the only page.');
      return;
    }
    if (!confirm(`Delete page ${currentPage}?`)) return;
    const newOrder = pageOrder.filter((p) => p !== currentPage);
    setPageOrder(newOrder);
    setCurrentPage(newOrder[0]);
  };

  // Compile & Export
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const result = await compileEditedPdf({
        arrayBuffer: metadata.arrayBuffer,
        pageOrder,
        pageRotations,
        drawings,
        textAnnotations,
        watermark,
        outputFilename,
      });

      downloadBlob(result.blob, result.filename);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloudSavePdf = async () => {
    if (!user) {
      onOpenSignIn();
      return;
    }
    setIsCloudSaving(true);
    try {
      const result = await compileEditedPdf({
        arrayBuffer: metadata.arrayBuffer,
        pageOrder,
        pageRotations,
        drawings,
        textAnnotations,
        watermark,
        outputFilename,
      });

      await onSaveToCloud(result.blob, result.filename);
    } catch (err: any) {
      console.error('Cloud save error:', err);
      alert(`Cloud save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsCloudSaving(false);
    }
  };

  const currentRotation = pageRotations[currentPage] || 0;
  const pageTexts = textAnnotations.filter((t) => t.pageNumber === currentPage);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-4 animate-ios-enter">
      {/* Top Floating iOS Studio Toolbar */}
      <div className="ios-glass rounded-3xl p-3 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Tool Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-black/60 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTool('draw')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'draw'
                ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Pen / Freehand Draw"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Draw</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('highlight')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'highlight'
                ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Highlighter Tool"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('text')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'text'
                ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Click to Add Text"
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Add Text</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSignatureModal(true)}
            className="p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Digital Signature Stamp"
          >
            <FileSignature className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Sign</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWatermarkModal(true)}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              watermark.enabled ? 'text-orange-400' : 'text-zinc-400 hover:text-white'
            }`}
            title="Watermark Settings"
          >
            <Stamp className="w-4 h-4" />
            <span className="hidden sm:inline">Watermark</span>
            {watermark.enabled && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('erase')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'erase'
                ? 'bg-red-500/20 text-red-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Eraser Tool"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Color Palette & Stroke Controls */}
        <div className="flex items-center gap-3">
          {activeTool !== 'erase' && (
            <div className="flex items-center gap-1.5">
              {['#0A84FF', '#FF453A', '#30D158', '#FFD60A', '#FFFFFF', '#000000'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStrokeColor(c)}
                  className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                    strokeColor === c ? 'scale-125 border-white shadow-sm' : 'border-zinc-700'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          {/* Stroke Width Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
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

          {/* Undo / Clear */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Undo last stroke"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClearPageDrawings}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
              title="Clear current page drawings"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions: AI Helper, Save & Cloud */}
        <div className="flex items-center gap-2">
          {/* NVIDIA NIM AI Helper */}
          <button
            type="button"
            onClick={() => setShowAiAssistant(true)}
            className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 active:scale-95 text-xs font-semibold text-purple-200 hover:text-white transition-all flex items-center gap-1.5 border border-purple-500/30 shadow-md shadow-purple-500/10 cursor-pointer"
            title="NVIDIA NIM AI Assistant - Summarize, translate & query page"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">AI Helper</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">NVIDIA</span>
          </button>

          <button
            type="button"
            onClick={handleCloudSavePdf}
            disabled={isCloudSaving || isExporting}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer disabled:opacity-50"
            title="Save document to your secure Cloud Drive"
          >
            {isCloudSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>Save to Cloud Drive</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting || isCloudSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>Export & Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left: Page Navigator Strip (3 cols) */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="ios-glass rounded-3xl p-4 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Pages ({pageOrder.length})</span>
              <span className="text-zinc-500">Click to edit</span>
            </div>

            {/* Thumbnail list */}
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {pageOrder.map((pageNum, idx) => {
                const isActive = pageNum === currentPage;
                const hasDrawing = !!drawings[pageNum];
                const textsCount = textAnnotations.filter((t) => t.pageNumber === pageNum).length;

                return (
                  <div
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`p-2 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-zinc-900 border border-[#0A84FF] shadow-md shadow-blue-500/20'
                        : 'bg-zinc-950/60 border border-white/5 hover:border-white/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-white">
                        Page {pageNum}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px]">
                      {hasDrawing && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[#0A84FF] font-medium">
                          Ink
                        </span>
                      )}
                      {textsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                          {textsCount}T
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page Actions */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleRotateCurrentPage}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Rotate current page 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Rotate (90°)</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteCurrentPage}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1 cursor-pointer"
                title="Delete this page"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Custom Export Name */}
            <div className="pt-3 border-t border-white/5">
              <CustomNameInput
                value={outputFilename}
                originalName={metadata.name}
                rangeString="edited"
                selectedCount={pageOrder.length}
                isZip={false}
                onChange={(name) => setOutputFilename(name)}
              />
            </div>
          </div>
        </aside>

        {/* Right: Interactive Drawing & Canvas Canvas Area (9 cols) */}
        <section className="col-span-12 lg:col-span-9 flex flex-col items-center">
          {/* Zoom & Page Stepper bar */}
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const idx = pageOrder.indexOf(currentPage);
                  if (idx > 0) setCurrentPage(pageOrder[idx - 1]);
                }}
                disabled={pageOrder.indexOf(currentPage) <= 0}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-white">
                Page {currentPage} of {pageOrder.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  const idx = pageOrder.indexOf(currentPage);
                  if (idx < pageOrder.length - 1) setCurrentPage(pageOrder[idx + 1]);
                }}
                disabled={pageOrder.indexOf(currentPage) >= pageOrder.length - 1}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-zinc-400 px-1">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
                title="Reset zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Document Page Frame */}
          <div className="relative w-full overflow-auto max-h-[75vh] flex items-center justify-center p-4 bg-zinc-950/80 rounded-3xl border border-white/10 shadow-2xl">
            {pageLoading ? (
              <div className="py-24 flex flex-col items-center gap-3 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#0A84FF]" />
                <span className="text-xs">Rendering High-Resolution Canvas...</span>
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
                {/* Background PDF page rendered high-res */}
                <img
                  ref={pageImageRef}
                  src={pageDataUrl}
                  alt={`Page ${currentPage}`}
                  className="max-h-[68vh] max-w-full object-contain pointer-events-none select-none block"
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
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 w-full h-full touch-none z-10"
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
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    {item.text}
                  </div>
                ))}

                {/* Watermark Preview Overlay */}
                {watermark.enabled && (watermark.allPages || currentPage === 1) && (
                  <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none select-none">
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
              <div className="text-zinc-500 text-xs">Failed to render page.</div>
            )}
          </div>
        </section>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignatureModal
          onClose={() => setShowSignatureModal(false)}
          onSaveSignature={handleApplySignature}
        />
      )}

      {/* Watermark Modal */}
      {showWatermarkModal && (
        <WatermarkModal
          watermark={watermark}
          onChange={(newWm) => setWatermark(newWm)}
          onClose={() => setShowWatermarkModal(false)}
        />
      )}

      {/* NVIDIA NIM AI Assistant Modal */}
      <NvidiaAiAssistantModal
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        currentPage={currentPage}
        pageSnapshotUrl={pageDataUrl}
        onStampTextToPdf={handleStampTextFromAi}
      />
    </div>
  );
};
