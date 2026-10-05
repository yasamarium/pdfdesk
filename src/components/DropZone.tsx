import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  PenTool,
  FileSignature,
  Bot,
} from 'lucide-react';

interface DropZoneProps {
  mode?: 'splitter' | 'editor';
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  mode = 'splitter',
  onFileSelect,
  onLoadSample,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };


  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileSelect(file);
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  };

  const isEditorMode = mode === 'editor';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center animate-ios-enter">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-6 backdrop-blur-md">
        <span className={`w-2 h-2 rounded-full ${isEditorMode ? 'bg-purple-500' : 'bg-[#0A84FF]'}`}></span>
        <span>{isEditorMode ? 'Interactive PDF Studio & Canvas Editor' : 'Pure Client-Side PDF Engine'}</span>
      </div>

      {/* Main Headline */}
      {isEditorMode ? (
        <>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center tracking-tight leading-tight max-w-2xl mb-4">
            Edit & Annotate PDFs with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-[#0A84FF]">
              pro studio tools
            </span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 text-center max-w-xl mb-10 leading-relaxed">
            Freehand drawing, highlighters, digital signatures, watermark stamps & NVIDIA NIM AI assistance.
            100% private in your browser.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center tracking-tight leading-tight max-w-2xl mb-4">
            Split PDF files with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A84FF] via-[#5E5CE6] to-[#BF5AF2]">
              surgical precision
            </span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 text-center max-w-xl mb-10 leading-relaxed">
            Extract custom page ranges, visual selections, or split every single page.
            100% private in your browser with real-time live preview.
          </p>
        </>
      )}

      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full relative group cursor-pointer rounded-3xl p-8 md:p-14 transition-all duration-300 flex flex-col items-center justify-center text-center border-2 ${
          isDragOver
            ? isEditorMode
              ? 'border-purple-500 bg-purple-500/10 shadow-2xl shadow-purple-500/20 scale-[1.01]'
              : 'border-[#0A84FF] bg-blue-500/10 shadow-2xl shadow-blue-500/20 scale-[1.01]'
            : 'border-dashed border-white/15 hover:border-white/30 bg-zinc-950/70 hover:bg-zinc-900/60 shadow-2xl shadow-black/80'
        } backdrop-blur-xl`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={isLoading}
        />

        {/* Glow backdrop */}
        <div
          className={`absolute inset-0 rounded-3xl pointer-events-none ${
            isEditorMode
              ? 'bg-gradient-to-b from-purple-500/5 to-transparent'
              : 'bg-gradient-to-b from-blue-500/5 to-transparent'
          }`}
        />

        {/* Floating Upload Icon */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 rounded-3xl bg-zinc-900/90 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-300 ${
              isEditorMode
                ? 'text-purple-400 group-hover:border-purple-500/40'
                : 'text-[#0A84FF] group-hover:border-[#0A84FF]/40'
            }`}
          >
            {isLoading ? (
              <div
                className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${
                  isEditorMode ? 'border-purple-400' : 'border-[#0A84FF]'
                }`}
              />
            ) : isEditorMode ? (
              <PenTool className="w-10 h-10 group-hover:text-white transition-colors" />
            ) : (
              <UploadCloud className="w-10 h-10 group-hover:text-white transition-colors" />
            )}
          </div>
          <div
            className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg ring-2 ring-black ${
              isEditorMode ? 'bg-purple-600' : 'bg-[#0A84FF]'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-2 z-10">
          <p className="text-xl font-semibold text-white">
            {isLoading
              ? 'Processing document...'
              : isEditorMode
              ? 'Drop PDF here to open in Editor Studio'
              : 'Drop your PDF file here'}
          </p>
          <p className="text-sm text-zinc-400">
            or{' '}
            <span
              className={`underline underline-offset-4 font-medium ${
                isEditorMode
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-[#0A84FF] hover:text-blue-400'
              }`}
            >
              browse files
            </span>{' '}
            from your device
          </p>
          <p className="text-xs text-zinc-500 pt-2">
            Supports all standard PDF documents • No file size limits
          </p>
        </div>

        {/* Quick Sample CTA */}
        <div
          className="mt-8 pt-6 border-t border-white/10 w-full max-w-sm flex items-center justify-center z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-medium text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isEditorMode ? 'text-purple-400' : 'text-[#0A84FF]'}`} />
            <span>
              {isEditorMode
                ? 'Test editor with 8-page sample document'
                : "Don't have a PDF? Test with 8-page sample document"}
            </span>
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-10">
        {isEditorMode ? (
          <>
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Interactive Markup</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Draw, highlight, erase, add text annotations, and rotate pages on the fly.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <FileSignature className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Signatures & Watermarks</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Stamp digital signatures and customize diagonal or header watermark seals.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">NVIDIA NIM Assistant</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ask AI to summarize, translate, or extract points, and stamp notes right onto pages.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#0A84FF] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Client-Side</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Processing runs directly inside your browser. No files are uploaded to any server.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-[#BF5AF2] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Instant & Lossless</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Preserves original vector quality, embedded fonts, and bookmarks with zero loss.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-[#30D158] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Safe for Confidential Docs</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Works completely offline. Ideal for sensitive contracts, statements, and IDs.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
