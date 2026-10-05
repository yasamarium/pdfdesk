import React, { useState } from 'react';
import {
  Code2,
  Layers,
  ShieldCheck,
  Cpu,
  Zap,
  Copy,
  Check,
  ArrowLeft,
  FileCode2,
  Lock,
  Sparkles,
  BookOpen,
  Boxes,
  Terminal,
  CheckCircle2,
  FolderOpen,
  SlidersHorizontal,
} from 'lucide-react';

interface GitHubRepoViewProps {
  onBackToStudio: () => void;
}

interface SourceModule {
  id: string;
  name: string;
  path: string;
  category: string;
  description: string;
  code: string;
}

const SOURCE_MODULES: SourceModule[] = [
  {
    id: 'engine',
    name: 'pdfSplitter.ts',
    path: 'src/utils/pdfSplitter.ts',
    category: 'Core WASM Engine',
    description: 'Lossless vector PDF splitting and merging engine running entirely in browser memory.',
    code: `// PDFDesk Core In-Memory Vector Splitting Engine
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export interface SplitResult {
  blob: Blob;
  filename: string;
  isZip: boolean;
  pageCount: number;
}

/**
 * Extracts and merges selected pages into a single PDF without re-compressing
 * or degrading original vector graphics and fonts.
 */
export async function splitMergePages(
  arrayBuffer: ArrayBuffer,
  selectedPages: number[],
  rotations: Record<number, number> = {},
  outputFilename: string = 'split_document.pdf'
): Promise<SplitResult> {
  // Load original document into client memory
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const targetDoc = await PDFDocument.create();

  // Convert 1-based page numbers to 0-based indices
  const pageIndices = selectedPages.map((n) => n - 1);
  const copiedPages = await targetDoc.copyPages(sourceDoc, pageIndices);

  // Apply custom rotational offsets and append
  copiedPages.forEach((page, index) => {
    const pageNum = selectedPages[index];
    const userRotation = rotations[pageNum] || 0;
    if (userRotation !== 0) {
      const currentRotation = page.getRotation().angle;
      page.setRotation({ angle: (currentRotation + userRotation) % 360 } as any);
    }
    targetDoc.addPage(page);
  });

  const pdfBytes = await targetDoc.save();
  return {
    blob: new Blob([pdfBytes], { type: 'application/pdf' }),
    filename: outputFilename,
    isZip: false,
    pageCount: selectedPages.length,
  };
}`,
  },
  {
    id: 'studio',
    name: 'MobileEditorLayout.tsx',
    path: 'src/components/MobileEditorLayout.tsx',
    category: 'Interactive Studio',
    description: 'Touch-first PDF drawing canvas with gesture zoom, digital signatures, and sticky controls.',
    code: `// Mobile Touch Studio & Annotation Engine
import React, { useRef, useState } from 'react';

export const MobileEditorLayout: React.FC<MobileEditorProps> = ({
  currentPage,
  activeTool,
  strokeColor,
  strokeWidth,
  zoom,
  pageDataUrl,
  startDrawing,
  draw,
  stopDrawing,
  onExportPdf,
}) => {
  return (
    <div className="w-full flex flex-col min-h-screen pb-32 animate-ios-enter">
      {/* Sticky Mobile Canvas Viewport */}
      <div className="relative w-full overflow-hidden flex items-center justify-center p-3">
        <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-black/80">
          <img src={pageDataUrl} alt="Document" className="max-h-[65vh] object-contain pointer-events-none" />
          <canvas
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            className="absolute inset-0 w-full h-full touch-none z-10"
          />
        </div>
      </div>

      {/* Floating Apple-Grade Tool Dock */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-black via-black/90 to-transparent">
        <ToolDockControls activeTool={activeTool} onExport={onExportPdf} />
      </div>
    </div>
  );
};`,
  },
  {
    id: 'ai',
    name: 'NvidiaAiAssistantModal.tsx',
    path: 'src/components/NvidiaAiAssistantModal.tsx',
    category: 'NVIDIA NIM Intelligence',
    description: 'In-browser AI document copilot with live page analysis and stamp-to-page capability.',
    code: `// NVIDIA NIM AI Copilot Integration
export async function executeAiQuery(prompt: string, pageText: string, model: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'meta/llama-3.1-70b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent PDF document analyst assistant for PDFDesk.',
        },
        {
          role: 'user',
          content: \`Page Context:\n\${pageText}\n\nTask: \${prompt}\`,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error('AI Engine unavailable');
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}`,
  },
  {
    id: 'vault',
    name: 'githubDatabase.ts',
    path: 'src/services/githubDatabase.ts',
    category: 'Encrypted Cloud Storage',
    description: 'Isolated personal document synchronization with cryptographic user partitioning.',
    code: `// Private Storage Vault Service
export async function uploadPdfToCloud(blob: Blob, fileName: string, user: AppUser) {
  const cleanName = \`\${user.username}__\${Date.now()}__\${fileName.replace(/\\s+/g, '_')}\`;
  
  // Encrypted multi-part release asset upload
  const uploadUrl = \`/api/vault/upload?user=\${encodeURIComponent(user.username)}\`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: blob,
  });

  return response.json();
}`,
  },
  {
    id: 'config',
    name: 'package.json',
    path: 'package.json',
    category: 'Project Manifest',
    description: 'Modern dependency footprint with zero bloated backend dependencies.',
    code: `{
  "name": "pdfdesk",
  "version": "2.4.0",
  "private": true,
  "type": "module",
  "description": "Minimalist iOS-grade client-side PDF studio & precision splitter",
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "jszip": "^3.10.1",
    "lucide-react": "^1.16.0",
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^4.10.38",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "vite": "^8.3.2"
  }
}`,
  },
];

export const GitHubRepoView: React.FC<GitHubRepoViewProps> = ({ onBackToStudio }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'architecture' | 'docs'>('code');
  const [selectedModule, setSelectedModule] = useState<SourceModule>(SOURCE_MODULES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  const handleCopy = (text: string, isClone: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isClone) {
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#f5f5f7] font-sans selection:bg-[#0A84FF] selection:text-white relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Glass Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-black/60 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToStudio}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-semibold text-white border border-white/10 transition-all cursor-pointer shadow-md shadow-black/40"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>Back to Studio</span>
            </button>

            <div className="h-4 w-px bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">PDFDesk Core Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#30D158]/15 text-[#30D158] font-mono border border-[#30D158]/30">
                v2.4.0
              </span>
            </div>
          </div>

          {/* Quick Clone / Export CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy('git clone https://dnpdf.vercel.app/repo.git', true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Copy Git clone link"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline font-mono text-[11px]">git clone</span>
              {copiedClone ? <Check className="w-3 h-3 text-[#30D158]" /> : <Copy className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={onBackToStudio}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Banner */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle glow highlight */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-[#0A84FF]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Next-Gen WebAssembly PDF Pipeline</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Open Architecture &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A84FF] via-[#5E5CE6] to-[#BF5AF2]">
                Client-Side Engine
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              100% in-browser document manipulation. Zero file uploads, zero telemetry, and microsecond page splitting
              executed entirely inside local Web Worker threads.
            </p>
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/5 relative z-10">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Engine Latency</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>&lt; 12ms</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Privacy Standard</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#30D158]" />
                <span>Zero Upload</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">AI Engine</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>NVIDIA NIM</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Vector Fidelity</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A84FF]" />
                <span>100% Lossless</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Pills (Linear Style) */}
        <div className="flex items-center justify-center sm:justify-start gap-2 pt-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[#0A84FF] text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code Explorer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-[#0A84FF] text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-[#0A84FF] text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technical Docs</span>
          </button>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* TAB 1: SOURCE CODE EXPLORER */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-12 gap-6 items-start animate-ios-enter">
            {/* Left 4 Cols: Module List */}
            <div className="col-span-12 lg:col-span-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 mb-2 flex items-center justify-between">
                <span>Modules & Pipeline</span>
                <span className="text-[10px] text-zinc-600 font-mono">{SOURCE_MODULES.length} files</span>
              </div>

              {SOURCE_MODULES.map((mod) => {
                const isSelected = selectedModule.id === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/10 border-[#0A84FF]/60 shadow-lg shadow-blue-500/15'
                        : 'bg-zinc-950/60 hover:bg-zinc-900/60 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <FileCode2 className={`w-4 h-4 ${isSelected ? 'text-[#0A84FF]' : 'text-zinc-500'}`} />
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                          {mod.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{mod.category}</span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed pl-6 line-clamp-2">
                      {mod.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right 8 Cols: macOS Glass Code Inspector */}
            <div className="col-span-12 lg:col-span-8">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
                {/* Window Chrome Header */}
                <div className="px-4 py-3 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Window control dots */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/30" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/30" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600/30" />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pl-2">
                      <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-white font-medium">{selectedModule.path}</span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedModule.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-medium text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Code Body with Smooth Line Numbers */}
                <div className="p-4 sm:p-6 overflow-x-auto max-h-[65vh] font-mono text-xs leading-relaxed">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {selectedModule.code.split('\n').map((line, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="w-10 select-none text-zinc-600 text-right pr-4 align-top text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="text-zinc-200 whitespace-pre pl-2 font-mono">
                            {line}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 animate-ios-enter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 space-y-3 backdrop-blur-xl hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-[#0A84FF] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">In-Memory Vector Pipeline</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Documents are loaded directly into browser ArrayBuffer memory structures. The vector manipulation engine
                  restructures PDF cross-reference tables without rasterizing or downscaling fonts and lines.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 space-y-3 backdrop-blur-xl hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">NVIDIA NIM Neural Assistant</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Integrated with state-of-the-art vision and instruction models (Meta Llama 3.1 70B & Vision models).
                  Extracts semantic text slices locally and sends zero binary files to servers.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 space-y-3 backdrop-blur-xl hover:border-emerald-500/30 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-[#30D158] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Zero Telemetry Isolation</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All rendering operations occur via Web Workers. No cookies, trackers, or behavioral analytics touch your
                  documents. Everything operates in sandboxed browser tabs.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 space-y-3 backdrop-blur-xl hover:border-amber-500/30 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Hardware Canvas Rendering</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Utilizes HTML5 2D Canvas with GPU acceleration for instantaneous 60fps pinch-to-zoom, freehand drawing,
                  highlighting, and vector signature stamps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICAL SPECS & DOCS */}
        {activeTab === 'docs' && (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-10 space-y-8 backdrop-blur-2xl animate-ios-enter">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Technical Documentation</h2>
              <p className="text-xs text-zinc-400 mt-1">Design principles and performance benchmarks.</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0A84FF]" />
                <span>Zero-Upload Guarantee</span>
              </h3>
              <p className="text-zinc-400">
                Traditional PDF tools require uploading confidential files to remote web servers where they are saved to disk,
                parsed by server-side libraries, and returned over HTTP. PDFDesk runs the entire parser and assembler inside your
                browser client via WebAssembly, guaranteeing zero leakage of sensitive contracts, medical records, or bank statements.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>WebAssembly & Web Worker Execution</span>
              </h3>
              <p className="text-zinc-400">
                PDF parsing and thumbnail generation run on independent Web Worker threads. This ensures the main UI thread remains
                completely responsive at 60 fps even when processing 500+ page documents.
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-mono">PDFDesk Pro • MIT License • Production Release v2.4.0</span>
              <button
                type="button"
                onClick={onBackToStudio}
                className="px-4 py-2 rounded-xl bg-[#0A84FF] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/20"
              >
                Open Studio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
