import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Download,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  ShieldCheck,
  ArrowLeft,
  Layers,
  Scissors,
  Edit3,
} from 'lucide-react';
import type { CloudDocument } from '../types';
import { getDocumentByShortCode, fetchDocumentBlob, getShareableLink } from '../services/githubDatabase';
import { loadPDFDocument, renderPageThumbnail } from '../utils/pdfParser';
import { downloadBlob } from '../utils/pdfSplitter';

interface PublicPdfViewerProps {
  shortCode: string;
  onOpenInStudio?: (arrayBuffer: ArrayBuffer, filename: string, targetTab: 'splitter' | 'editor') => void;
  onBackToStudio: () => void;
}

export const PublicPdfViewer: React.FC<PublicPdfViewerProps> = ({
  shortCode,
  onOpenInStudio,
  onBackToStudio,
}) => {
  const [docMeta, setDocMeta] = useState<CloudDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>('Connecting to secure cloud vault...');
  const [error, setError] = useState<string | null>(null);

  // PDF.js document state
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any | null>(null);

  // 1. Fetch document and binary data
  useEffect(() => {
    let isCancelled = false;

    async function loadDocument() {
      setLoading(true);
      setError(null);
      setLoadingProgress('Resolving cloud document record...');

      try {
        const found = await getDocumentByShortCode(shortCode);
        if (isCancelled) return;

        if (!found) {
          setError('Document not found or private. Please verify the URL.');
          setLoading(false);
          return;
        }

        setDocMeta(found);
        setLoadingProgress('Decrypting & streaming PDF binary...');

        const { blob, arrayBuffer: buf } = await fetchDocumentBlob(found);
        if (isCancelled) return;

        setPdfBlob(blob);
        setArrayBuffer(buf);
        setLoadingProgress('Initializing PDF engine...');

        const loadedDoc = await loadPDFDocument(buf);
        if (isCancelled) return;

        setPdfDoc(loadedDoc);
        setNumPages(loadedDoc.numPages);
        setCurrentPage(1);

        // Preload first few thumbnails in background
        for (let i = 1; i <= Math.min(10, loadedDoc.numPages); i++) {
          renderPageThumbnail(loadedDoc, i, 0.3)
            .then((t) => {
              if (!isCancelled) {
                setThumbnails((prev) => ({ ...prev, [i]: t.dataUrl }));
              }
            })
            .catch(() => {});
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load shared PDF:', err);
          setError(err.message || 'Could not load document from cloud vault.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadDocument();
    return () => {
      isCancelled = true;
    };
  }, [shortCode]);

  // 2. Render current page on canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      setIsRenderingPage(true);

      // Cancel ongoing render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const totalRotation = (page.rotate + rotation) % 360;
        const viewport = page.getViewport({ scale, rotation: totalRotation });

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      } finally {
        setIsRenderingPage(false);
      }
    },
    [pdfDoc, scale, rotation]
  );

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((p) => Math.min(numPages, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(3.0, s + 0.2));
      } else if (e.key === '-') {
        setScale((s) => Math.max(0.5, s - 0.2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  // Copy clean proxy link
  const handleCopyShareLink = () => {
    if (!docMeta) return;
    const link = getShareableLink(docMeta);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct secure download without exposing raw URLs
  const handleDownload = () => {
    if (pdfBlob && docMeta) {
      downloadBlob(pdfBlob, docMeta.name);
    }
  };

  // Browser print
  const handlePrint = () => {
    if (!pdfBlob) return;
    const blobUrl = URL.createObjectURL(pdfBlob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => {
        iframe.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 200);
    };
  };

  const handleFitWidth = () => {
    if (!containerRef.current) return;
    const availableWidth = containerRef.current.clientWidth - 48;
    if (availableWidth > 200) {
      setScale(Math.max(0.6, Math.min(2.5, availableWidth / 620)));
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-6 animate-ios-enter">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center text-white shadow-2xl shadow-blue-500/25 animate-pulse">
            <FileText className="w-8 h-8" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white tracking-tight">PDFDesk Secure Viewer™</h3>
          <p className="text-xs text-zinc-400 font-mono">{loadingProgress}</p>
        </div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#0A84FF] to-[#30D158] w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !docMeta) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center animate-ios-enter">
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center text-red-400 mb-6 shadow-2xl">
          <FileText className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Document Unavailable</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          {error || 'This cloud link may have expired or is restricted to its owner.'}
        </p>
        <button
          type="button"
          onClick={onBackToStudio}
          className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to PDFDesk Studio</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-[#0A84FF]/30">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Back */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToStudio}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Open PDFDesk Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md" title={docMeta.name}>
                {docMeta.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#30D158]/10 text-[#30D158] text-[10px] font-medium border border-[#30D158]/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Vault</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span>{formatSize(docMeta.size)}</span>
              <span>•</span>
              <span>{numPages} {numPages === 1 ? 'Page' : 'Pages'}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Open in PDFDesk Studio */}
          {onOpenInStudio && arrayBuffer && (
            <div className="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => onOpenInStudio(arrayBuffer, docMeta.name, 'editor')}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Edit this document in PDFDesk Studio"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenInStudio(arrayBuffer, docMeta.name, 'splitter')}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Split this document in PDFDesk Studio"
              >
                <Scissors className="w-3.5 h-3.5 text-purple-400" />
                <span>Split</span>
              </button>
            </div>
          )}

          {/* Copy Clean Share Link */}
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="py-2 px-3 sm:px-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-medium text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy clean shareable link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#30D158]" />
                <span className="hidden sm:inline text-[#30D158]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Link</span>
              </>
            )}
          </button>

          {/* Download PDF button */}
          <button
            type="button"
            onClick={handleDownload}
            className="py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </header>

      {/* Reader Floating Toolbar */}
      <div className="sticky top-[57px] z-30 bg-zinc-900/90 backdrop-blur-xl border-b border-white/5 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
        {/* Page Switcher */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-mono text-zinc-300 px-2 py-1 rounded-lg bg-black/40 border border-white/10">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= numPages) setCurrentPage(val);
              }}
              className="w-8 text-center bg-transparent text-white font-bold focus:outline-none"
            />
            <span className="text-zinc-500">of {numPages}</span>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Controls: Zoom, Rotate, Fit Width */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-zinc-400 w-12 text-center select-none">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            className="hidden sm:inline-flex px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Fit to Width"
          >
            Fit Width
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Rotate View 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowThumbnails((t) => !t)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              showThumbnails ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Page Navigation Thumbnails"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Reading Canvas Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Optional Page Thumbnails Sidebar */}
        {showThumbnails && (
          <aside className="w-48 bg-zinc-950/90 border-r border-white/5 overflow-y-auto p-3 space-y-3 shrink-0 animate-ios-enter">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Pages ({numPages})
            </div>
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setCurrentPage(pNum)}
                className={`w-full p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  currentPage === pNum
                    ? 'border-[#0A84FF] bg-blue-500/10 shadow-md shadow-blue-500/10'
                    : 'border-white/5 bg-zinc-900/50 hover:border-white/20'
                }`}
              >
                <div className="w-full aspect-[3/4] bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {thumbnails[pNum] ? (
                    <img src={thumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-zinc-500 text-xs font-mono">{pNum}</span>
                  )}
                </div>
                <span className={`text-[10px] font-mono ${currentPage === pNum ? 'text-blue-400 font-bold' : 'text-zinc-400'}`}>
                  Page {pNum}
                </span>
              </button>
            ))}
          </aside>
        )}

        {/* PDF Page Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-zinc-950 relative"
        >
          <div className="relative shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-white">
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
            {isRenderingPage && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-[#0A84FF] rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Mobile Stepper */}
      <footer className="sm:hidden border-t border-white/10 bg-zinc-950/90 backdrop-blur-xl p-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-2 rounded-xl bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-mono text-zinc-300">
          Page {currentPage} of {numPages}
        </span>

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
          disabled={currentPage >= numPages}
          className="p-2 rounded-xl bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
