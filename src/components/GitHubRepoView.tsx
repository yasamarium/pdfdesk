import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Star,
  Eye,
  GitFork,
  GitBranch,
  GitCommit,
  ArrowLeft,
  Copy,
  Check,
  Search,
  BookOpen,
  Tag,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Code,
  SlidersHorizontal,
} from 'lucide-react';

interface GitHubRepoViewProps {
  onBackToStudio: () => void;
}

interface RepoFile {
  name: string;
  type: 'folder' | 'file';
  commitMessage: string;
  updatedAt: string;
  size?: string;
  lines?: number;
  content?: string;
  children?: RepoFile[];
}

// Simulated repository file structure with real source code snippets
const REPO_TREE: RepoFile[] = [
  {
    name: 'api',
    type: 'folder',
    commitMessage: 'feat: add NVIDIA NIM serverless chat proxy with CORS headers',
    updatedAt: '2 hours ago',
    children: [
      {
        name: 'chat.js',
        type: 'file',
        size: '1.4 KB',
        lines: 48,
        commitMessage: 'feat: add NVIDIA NIM serverless chat proxy with CORS headers',
        updatedAt: '2 hours ago',
        content: `// Vercel Serverless Function Proxy for NVIDIA NIM API
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { model, messages, temperature = 0.5, max_tokens = 1024 } = req.body || {};

  try {
    const upstreamResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${process.env.NVIDIA_API_KEY}\`,
      },
      body: JSON.stringify({
        model: model || 'meta/llama-3.1-70b-instruct',
        messages,
        temperature,
        max_tokens,
      }),
    });

    const data = await upstreamResponse.json();
    return res.status(upstreamResponse.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}`,
      },
      {
        name: 'pdf',
        type: 'folder',
        commitMessage: 'feat: secure public release link proxy',
        updatedAt: '3 hours ago',
        children: [
          {
            name: '[id].ts',
            type: 'file',
            size: '2.1 KB',
            lines: 62,
            commitMessage: 'feat: secure public release link proxy',
            updatedAt: '3 hours ago',
            content: `// Secure Document Delivery Proxy
export default async function handler(req: any, res: any) {
  const { id } = req.query;
  if (!id) return res.status(400).send('Document ID required');

  // Stream binary without exposing storage backend
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', \`inline; filename="document_\${id}.pdf"\`);
  
  // Client-side verification and stream
  res.status(200).send({ status: 'active', code: id });
}`,
          },
        ],
      },
    ],
  },
  {
    name: 'public',
    type: 'folder',
    commitMessage: 'chore: add sample document and assets',
    updatedAt: '1 day ago',
    children: [
      {
        name: 'favicon.svg',
        type: 'file',
        size: '1.2 KB',
        lines: 32,
        commitMessage: 'chore: brand assets and favicon',
        updatedAt: '2 days ago',
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A84FF" />
      <stop offset="100%" stop-color="#5E5CE6" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#g)" />
  <path d="M30 25 h30 l15 15 v35 h-45 z" fill="#ffffff" />
</svg>`,
      },
      {
        name: 'sample.pdf',
        type: 'file',
        size: '142 KB',
        lines: 0,
        commitMessage: 'chore: add 8-page sample document',
        updatedAt: '1 day ago',
        content: `[Binary PDF Data - 8-Page Sample Document]`,
      },
    ],
  },
  {
    name: 'src',
    type: 'folder',
    commitMessage: 'feat: responsive touch layout and client-side wasm engine',
    updatedAt: '1 hour ago',
    children: [
      {
        name: 'components',
        type: 'folder',
        commitMessage: 'fix(mobile): resolve top bar collision with responsive layout',
        updatedAt: '30 mins ago',
        children: [
          {
            name: 'Header.tsx',
            type: 'file',
            size: '8.4 KB',
            lines: 240,
            commitMessage: 'fix(mobile): resolve top bar collision with responsive two-row layout',
            updatedAt: '30 mins ago',
            content: `// PDFDesk iOS Navigation Header
export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, user }) => {
  return (
    <header className="sticky top-0 z-40 w-full ios-glass-header transition-all">
      {/* Row 1: Brand & User Controls */}
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <BrandLogo />
        <NavigationControls />
      </div>
      {/* Row 2: Mobile Segmented Control Bar */}
      <div className="md:hidden px-3 pb-2.5">
        <MobileSegmentedNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </header>
  );
};`,
          },
          {
            name: 'MobileEditorLayout.tsx',
            type: 'file',
            size: '24.1 KB',
            lines: 590,
            commitMessage: 'feat: mobile touch studio editor with sticky drawer controls',
            updatedAt: '1 hour ago',
            content: `// Touch-First Mobile PDF Studio Layout
export const MobileEditorLayout = (props) => {
  return (
    <div className="w-full flex flex-col min-h-screen pb-36">
      <StickyMobileTopBar />
      <TouchZoomableCanvasViewport />
      <FloatingToolsDock />
    </div>
  );
};`,
          },
          {
            name: 'PdfEditorView.tsx',
            type: 'file',
            size: '34.2 KB',
            lines: 920,
            commitMessage: 'feat: freehand markup, digital signature & watermark stamps',
            updatedAt: '1 hour ago',
            content: `// Interactive PDF Editor Studio Engine
export const PdfEditorView = ({ metadata, pdfDoc }) => {
  // WebAssembly PDF Canvas rendering & vector rasterization
  return <StudioCanvas />;
};`,
          },
          {
            name: 'CloudVaultView.tsx',
            type: 'file',
            size: '16.7 KB',
            lines: 406,
            commitMessage: 'feat: private personal encrypted cloud vault',
            updatedAt: '3 hours ago',
            content: `// Personal Cloud Vault View
export const CloudVaultView = ({ user }) => {
  return <EncryptedVaultContainer user={user} />;
};`,
          },
        ],
      },
      {
        name: 'utils',
        type: 'folder',
        commitMessage: 'feat: client-side pdf-lib wasm splitter and parser',
        updatedAt: '1 day ago',
        children: [
          {
            name: 'pdfParser.ts',
            type: 'file',
            size: '6.2 KB',
            lines: 168,
            commitMessage: 'feat: high-res thumbnail rendering with Web Workers',
            updatedAt: '1 day ago',
            content: `// Client-side PDF.js rendering pipeline
import * as pdfjs from 'pdfjs-dist';

export async function loadPDFDocument(arrayBuffer: ArrayBuffer) {
  return pdfjs.getDocument({ data: arrayBuffer }).promise;
}`,
          },
          {
            name: 'pdfSplitter.ts',
            type: 'file',
            size: '8.9 KB',
            lines: 245,
            commitMessage: 'feat: split into single pages, ranges and zip chunks',
            updatedAt: '1 day ago',
            content: `// PDF-Lib in-memory manipulation
import { PDFDocument } from 'pdf-lib';

export async function splitMergePages(arrayBuffer: ArrayBuffer, pages: number[]) {
  const src = await PDFDocument.load(arrayBuffer);
  const dest = await PDFDocument.create();
  const copied = await dest.copyPages(src, pages.map(p => p - 1));
  copied.forEach(page => dest.addPage(page));
  const bytes = await dest.save();
  return { blob: new Blob([bytes], { type: 'application/pdf' }) };
}`,
          },
        ],
      },
      {
        name: 'App.tsx',
        type: 'file',
        size: '23.2 KB',
        lines: 678,
        commitMessage: 'feat: suite navigation with splitter, editor, vault & public viewer',
        updatedAt: '1 hour ago',
        content: `// PDFDesk Application Root
export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('splitter');
  // 100% In-Browser Client Side App
  return <MainLayout />;
};`,
      },
    ],
  },
  {
    name: '.gitignore',
    type: 'file',
    size: '280 B',
    lines: 18,
    commitMessage: 'chore: initial gitignore',
    updatedAt: '2 days ago',
    content: `node_modules
dist
dist-ssr
*.local
.env
.env.*
.DS_Store`,
  },
  {
    name: 'LICENSE',
    type: 'file',
    size: '1.1 KB',
    lines: 21,
    commitMessage: 'docs: add MIT license',
    updatedAt: '2 days ago',
    content: `MIT License

Copyright (c) 2026 PDFDesk Open Source Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.`,
  },
  {
    name: 'package.json',
    type: 'file',
    size: '1.3 KB',
    lines: 42,
    commitMessage: 'chore: bump version to 2.4.0 with NVIDIA NIM integration',
    updatedAt: '30 mins ago',
    content: `{
  "name": "pdfdesk",
  "private": true,
  "version": "2.4.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
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
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "vite": "^8.3.2"
  }
}`,
  },
  {
    name: 'README.md',
    type: 'file',
    size: '5.2 KB',
    lines: 160,
    commitMessage: 'docs: update architecture specs and privacy guarantees',
    updatedAt: '15 mins ago',
    content: `# PDFDesk Pro — Pure Client-Side PDF Engine & Interactive Studio

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Version](https://img.shields.io/badge/version-2.4.0-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-purple)](#)
[![Security](https://img.shields.io/badge/privacy-100%25%20client--side-success)](#)
[![AI Engine](https://img.shields.io/badge/AI-NVIDIA%20NIM-76B900)](#)

> **Minimalist, privacy-first in-browser PDF manipulation suite.**  
> Split, reorder, draw, sign, stamp, and analyze PDFs with zero file uploads to external servers.

---

### Key Capabilities

- ✂️ **Surgical Page Splitter**: Extract custom page ranges, visual page cards, odd/even subsets, or split all pages into a ZIP bundle.
- ✏️ **Interactive Studio Canvas**: Freehand ink markup, text annotations, highlighters, digital signature stamps & custom watermarks.
- 🤖 **NVIDIA NIM AI Assistant**: In-browser document summarizer, translation assistant, and QA partner with instant stamp-to-page capability.
- ☁️ **Private Cloud Vault**: Isolated, password-protected cloud synchronization across all personal devices.
- 🔒 **100% Client-Side Privacy**: All parsing, rendering, and vector reconstruction executes strictly within your browser's Web Worker threads.

---

### Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite, Tailwind CSS
- **PDF Engine**: \`pdf-lib\` (Vector assembly) & \`pdfjs-dist\` (Hardware-accelerated rendering)
- **AI Processing**: NVIDIA NIM Enterprise LLMs & Vision Models
- **Package Manager**: NPM / Vite / Rollup

---

### Privacy Guarantee

PDFDesk processes all document bytes directly in browser memory (\`ArrayBuffer\`).  
No external servers, trackers, or telemetries receive your documents unless you explicitly choose to save to your private encrypted Cloud Vault.`,
  },
  {
    name: 'tsconfig.json',
    type: 'file',
    size: '720 B',
    lines: 28,
    commitMessage: 'chore: configure typescript 5.6',
    updatedAt: '2 days ago',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}`,
  },
  {
    name: 'vercel.json',
    type: 'file',
    size: '480 B',
    lines: 22,
    commitMessage: 'chore: setup rewrites for public viewer routing',
    updatedAt: '3 hours ago',
    content: `{
  "rewrites": [
    {
      "source": "/api/chat",
      "destination": "/api/chat.js"
    },
    {
      "source": "/v/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`,
  },
];

export const GitHubRepoView: React.FC<GitHubRepoViewProps> = ({ onBackToStudio }) => {
  // Navigation inside repo: current path stack
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [starred, setStarred] = useState<boolean>(false);
  const [starCount, setStarCount] = useState<number>(849);
  const [activeTab, setActiveTab] = useState<'code' | 'issues' | 'pulls' | 'releases'>('code');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCloneDropdown, setShowCloneDropdown] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Find current directory contents based on currentPath
  const getCurrentItems = (): RepoFile[] => {
    let current = REPO_TREE;
    for (const folder of currentPath) {
      const match = current.find((item) => item.name === folder && item.type === 'folder');
      if (match && match.children) {
        current = match.children;
      }
    }
    return current;
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFile(null);
    setCurrentPath((prev) => [...prev, folderName]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setSelectedFile(null);
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath((prev) => prev.slice(0, index + 1));
    }
  };

  const handleFileClick = (file: RepoFile) => {
    setSelectedFile(file);
  };

  const toggleStar = () => {
    if (starred) {
      setStarred(false);
      setStarCount((c) => c - 1);
    } else {
      setStarred(true);
      setStarCount((c) => c + 1);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentItems = getCurrentItems().filter((item) =>
    item.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#1f6feb] selection:text-white">
      {/* Top GitHub Navigation Bar */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Back to Studio CTA */}
          <button
            type="button"
            onClick={onBackToStudio}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-white border border-[#30363d] transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to PDFDesk Studio</span>
          </button>

          {/* GitHub Octocat Icon */}
          <div className="flex items-center gap-2 pl-2 text-white">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="font-semibold text-sm hidden sm:inline">pdfdesk</span>
            <span className="text-zinc-500 hidden sm:inline">/</span>
            <span className="font-bold text-sm text-white">pdfdesk-core</span>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search repository files..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md pl-8 pr-3 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none w-48 lg:w-64"
            />
          </div>

          {/* Quick star CTA */}
          <button
            type="button"
            onClick={toggleStar}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
              starred
                ? 'bg-[#238636] text-white border-[#2ea043]'
                : 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border-[#30363d]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${starred ? 'fill-current' : ''}`} />
            <span>{starred ? 'Starred' : 'Star'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#30363d] text-[10px] font-mono">
              {starCount}
            </span>
          </button>
        </div>
      </header>

      {/* Repo Sub-Header */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 lg:px-8 pt-5">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs & Visibility */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-[#58a6ff] hover:underline cursor-pointer">pdfdesk</span>
              <span className="text-[#8b949e]">/</span>
              <span className="font-bold text-white hover:underline cursor-pointer">pdfdesk-core</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] font-medium ml-1">
                Public
              </span>
            </div>

            {/* Header Badges */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-[#30363d] overflow-hidden text-xs">
                <button
                  type="button"
                  className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Watch</span>
                </button>
                <span className="px-2 py-1 bg-[#0d1117] text-zinc-400 font-mono text-[11px] border-l border-[#30363d]">
                  142
                </span>
              </div>

              <div className="inline-flex rounded-md border border-[#30363d] overflow-hidden text-xs">
                <button
                  type="button"
                  className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] flex items-center gap-1.5"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Fork</span>
                </button>
                <span className="px-2 py-1 bg-[#0d1117] text-zinc-400 font-mono text-[11px] border-l border-[#30363d]">
                  38
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'border-[#f78166] text-white'
                  : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('issues')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'issues'
                  ? 'border-[#f78166] text-white'
                  : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Issues</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#30363d] text-[10px]">0</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pulls')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'pulls'
                  ? 'border-[#f78166] text-white'
                  : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <GitFork className="w-4 h-4 rotate-180" />
              <span>Pull requests</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#30363d] text-[10px]">0</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('releases')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'releases'
                  ? 'border-[#f78166] text-white'
                  : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Releases</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#238636]/20 text-[#3fb950] text-[10px] font-mono">
                v2.4.0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'issues' || activeTab === 'pulls' ? (
          <div className="py-24 text-center rounded-xl border border-[#30363d] bg-[#161b22] space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#3fb950] mx-auto" />
            <h3 className="text-lg font-bold text-white">No Open {activeTab === 'issues' ? 'Issues' : 'Pull Requests'}</h3>
            <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
              Production build is verified. All WebAssembly PDF workers and client-side modules are operating at 100% stability.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold"
            >
              Back to Code
            </button>
          </div>
        ) : activeTab === 'releases' ? (
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-[#30363d] bg-[#161b22] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>PDFDesk v2.4.0 Production Release</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#238636]/20 text-[#3fb950] font-mono">
                      Latest
                    </span>
                  </h3>
                  <span className="text-xs text-[#8b949e]">Shipped with NVIDIA NIM AI Assistant & Mobile Touch Studio</span>
                </div>
                <button
                  type="button"
                  onClick={onBackToStudio}
                  className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold"
                >
                  Launch Live Studio
                </button>
              </div>

              <div className="text-xs text-[#c9d1d9] space-y-2 border-t border-[#30363d] pt-4">
                <p>• Added full-featured mobile touch drawing canvas with sticky control dock</p>
                <p>• Integrated NVIDIA NIM enterprise AI helper for in-browser PDF summarization</p>
                <p>• Isolated Private Cloud Vault with zero telemetry</p>
                <p>• Upgraded WebAssembly vector parsing pipeline for instant lossless exports</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left 9 Columns: Code Explorer & README */}
            <div className="col-span-12 lg:col-span-9 space-y-4">
              {/* Branch Bar & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  {/* Branch selector */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-white font-medium">
                    <GitBranch className="w-3.5 h-3.5 text-[#8b949e]" />
                    <span>main</span>
                  </div>

                  {/* Branches & Tags stats */}
                  <span className="text-[#8b949e] flex items-center gap-1 ml-2">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span className="text-white font-semibold">1</span> branch
                  </span>
                  <span className="text-[#8b949e] flex items-center gap-1 ml-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="text-white font-semibold">1</span> tag
                  </span>
                </div>

                {/* Right: Code Download Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCloneDropdown(!showCloneDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Code</span>
                    <span className="text-[10px]">▼</span>
                  </button>

                  {/* Clone Dropdown */}
                  {showCloneDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-4 z-30 space-y-3 animate-ios-enter">
                      <div className="text-xs font-semibold text-white flex items-center justify-between">
                        <span>Clone Repository</span>
                        <span className="text-[#8b949e] font-mono text-[10px]">HTTPS</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-md p-1.5">
                        <input
                          type="text"
                          readOnly
                          value="https://dnpdf.vercel.app/code.git"
                          className="bg-transparent text-xs text-white font-mono flex-1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyCode('https://dnpdf.vercel.app/code.git')}
                          className="p-1 rounded hover:bg-[#21262d] text-zinc-400 hover:text-white"
                          title="Copy clone link"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="pt-2 border-t border-[#30363d] flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={onBackToStudio}
                          className="text-[#58a6ff] hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Open in PDFDesk Studio</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Latest Commit Bar */}
              <div className="rounded-t-xl bg-[#161b22] border border-[#30363d] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center text-[10px] font-bold text-white">
                    P
                  </div>
                  <span className="font-semibold text-white">pdfdesk-bot</span>
                  <span className="text-[#8b949e] truncate max-w-md">
                    fix(mobile): resolve top bar collision with responsive two-row layout
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[#8b949e] shrink-0 font-mono text-[11px]">
                  <span className="hover:text-[#58a6ff] cursor-pointer">fc927f4</span>
                  <span>•</span>
                  <span>just now</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-white">
                    <GitCommit className="w-3 h-3 text-[#8b949e]" />
                    <span>32 commits</span>
                  </span>
                </div>
              </div>

              {/* Breadcrumb path indicator if inside folder */}
              {currentPath.length > 0 && (
                <div className="bg-[#161b22] border-x border-[#30363d] px-3 py-2 text-xs flex items-center gap-1.5 text-[#8b949e]">
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(-1)}
                    className="text-[#58a6ff] hover:underline"
                  >
                    pdfdesk-core
                  </button>
                  {currentPath.map((folder, idx) => (
                    <React.Fragment key={folder}>
                      <span>/</span>
                      <button
                        type="button"
                        onClick={() => handleBreadcrumbClick(idx)}
                        className={`hover:underline ${
                          idx === currentPath.length - 1 ? 'font-semibold text-white' : 'text-[#58a6ff]'
                        }`}
                      >
                        {folder}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* If a file is selected: Code Viewer */}
              {selectedFile ? (
                <div className="rounded-b-xl border border-t-0 border-[#30363d] bg-[#0d1117] overflow-hidden">
                  {/* File Header */}
                  <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#8b949e]" />
                      <span className="font-semibold text-white">{selectedFile.name}</span>
                      <span className="text-[#8b949e] font-mono text-[11px]">
                        ({selectedFile.lines} lines • {selectedFile.size})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedFile.content || '')}
                        className="px-2.5 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] text-zinc-300 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="px-2.5 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] text-zinc-300 hover:text-white text-[11px]"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Code Content with Line Numbers */}
                  <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed bg-[#0d1117]">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        {(selectedFile.content || '').split('\n').map((line, idx) => (
                          <tr key={idx} className="hover:bg-[#161b22]">
                            <td className="w-10 select-none text-[#484f58] text-right pr-4 align-top">
                              {idx + 1}
                            </td>
                            <td className="text-[#c9d1d9] whitespace-pre pl-2">
                              {line}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* File Explorer Table */
                <div className="rounded-b-xl border border-t-0 border-[#30363d] bg-[#0d1117] overflow-hidden divide-y divide-[#21262d] text-xs">
                  {currentPath.length > 0 && (
                    <div
                      onClick={() => handleBreadcrumbClick(currentPath.length - 2)}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#161b22] cursor-pointer text-[#58a6ff] font-medium"
                    >
                      <Folder className="w-4 h-4 fill-[#58a6ff]/20 text-[#58a6ff]" />
                      <span>..</span>
                    </div>
                  )}

                  {currentItems.map((item) => (
                    <div
                      key={item.name}
                      onClick={() =>
                        item.type === 'folder'
                          ? handleFolderClick(item.name)
                          : handleFileClick(item)
                      }
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-[#161b22] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs">
                        {item.type === 'folder' ? (
                          <Folder className="w-4 h-4 fill-[#58a6ff]/20 text-[#58a6ff] shrink-0" />
                        ) : item.name.endsWith('.md') ? (
                          <BookOpen className="w-4 h-4 text-[#8b949e] shrink-0" />
                        ) : (
                          <FileCode className="w-4 h-4 text-[#8b949e] shrink-0" />
                        )}
                        <span className="text-[#c9d1d9] group-hover:text-[#58a6ff] group-hover:underline truncate font-medium">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 flex-1 pl-4 min-w-0">
                        <span className="text-[#8b949e] truncate hidden md:inline max-w-sm">
                          {item.commitMessage}
                        </span>
                        <span className="text-[#8b949e] text-right font-mono text-[11px] shrink-0 ml-auto">
                          {item.updatedAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GitHub README Preview Section */}
              <div className="rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden mt-6">
                <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center gap-2 text-xs font-semibold text-white">
                  <BookOpen className="w-4 h-4 text-[#8b949e]" />
                  <span>README.md</span>
                </div>

                <div className="p-6 text-sm text-[#c9d1d9] space-y-5 leading-relaxed">
                  <div className="border-b border-[#30363d] pb-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>PDFDesk Pro</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#238636]/20 text-[#3fb950] font-mono">
                        v2.4.0
                      </span>
                    </h1>
                    <p className="text-xs text-[#8b949e] mt-1">
                      Pure client-side in-browser PDF manipulation studio, precision splitter & NVIDIA NIM helper.
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg border border-[#30363d] bg-[#161b22] space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-white text-xs">
                        <SlidersHorizontal className="w-4 h-4 text-[#58a6ff]" />
                        <span>Surgical PDF Splitter</span>
                      </div>
                      <p className="text-[11px] text-[#8b949e]">
                        Extract custom page ranges, visual selections, odd/even, or split all pages into ZIP.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-[#30363d] bg-[#161b22] space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-white text-xs">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Interactive Studio Editor</span>
                      </div>
                      <p className="text-[11px] text-[#8b949e]">
                        Freehand ink, highlighters, digital signature stamps, and customizable watermarks.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-[#30363d] bg-[#161b22] space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-white text-xs">
                        <Sparkles className="w-4 h-4 text-[#76B900]" />
                        <span>NVIDIA NIM Assistant</span>
                      </div>
                      <p className="text-[11px] text-[#8b949e]">
                        In-browser document analysis, page summary, question answering & direct note stamping.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-[#30363d] bg-[#161b22] space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-white text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#3fb950]" />
                        <span>Zero Upload Privacy</span>
                      </div>
                      <p className="text-[11px] text-[#8b949e]">
                        100% processed in local browser memory. Files never leave your device.
                      </p>
                    </div>
                  </div>

                  {/* Architecture Overview */}
                  <div className="pt-4 border-t border-[#30363d] space-y-2">
                    <h3 className="text-base font-semibold text-white">Client Architecture</h3>
                    <p className="text-xs text-[#8b949e]">
                      PDFDesk is engineered using WebAssembly and Web Worker pipelines. All rendering is carried out through hardware-accelerated canvas contexts, preserving original vector resolutions, typography, and bookmark structures without quality degradation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 3 Columns: Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* About Box */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">About</h4>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Minimalist, zero-upload PDF manipulation studio and splitter engine with NVIDIA NIM AI integration.
                </p>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-[#58a6ff]">
                    <ExternalLink className="w-3.5 h-3.5 text-[#8b949e]" />
                    <span className="hover:underline cursor-pointer" onClick={onBackToStudio}>
                      https://dnpdf.vercel.app
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['pdf', 'client-side', 'react', 'typescript', 'pdf-lib', 'wasm', 'nvidia-nim'].map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#161b22] border border-[#30363d] text-[#58a6ff] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Releases */}
              <div className="pt-4 border-t border-[#30363d] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Releases</h4>
                <div className="flex items-center gap-2 text-xs">
                  <Tag className="w-3.5 h-3.5 text-[#3fb950]" />
                  <span className="font-semibold text-white">v2.4.0</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#238636]/20 text-[#3fb950] font-mono">
                    Latest
                  </span>
                </div>
              </div>

              {/* Languages breakdown */}
              <div className="pt-4 border-t border-[#30363d] space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Languages</h4>
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full overflow-hidden flex bg-[#21262d]">
                  <div className="bg-[#3178c6] h-full" style={{ width: '93.8%' }} />
                  <div className="bg-[#563d7c] h-full" style={{ width: '3.9%' }} />
                  <div className="bg-[#e34c26] h-full" style={{ width: '2.3%' }} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6]" />
                    <span className="text-white font-medium">TypeScript</span>
                    <span className="text-[#8b949e] text-[11px]">93.8%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#563d7c]" />
                    <span className="text-white font-medium">CSS</span>
                    <span className="text-[#8b949e] text-[11px]">3.9%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e34c26]" />
                    <span className="text-white font-medium">HTML</span>
                    <span className="text-[#8b949e] text-[11px]">2.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
