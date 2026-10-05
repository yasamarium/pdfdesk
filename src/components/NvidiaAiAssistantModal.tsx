import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  FileText,
  Languages,
  ListFilter,
  FileCheck2,
  AlertCircle,
  Loader2,
  ChevronDown,
  KeyRound,
  Eye,
  PenTool,
  RefreshCw,
} from 'lucide-react';
import {
  VERIFIED_NVIDIA_MODELS,
  sendNvidiaChat,
  saveCustomNvidiaApiKey,
  hasCustomApiKey,
  type NvidiaModelInfo,
} from '../services/nvidiaNim';

interface NvidiaAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  pageSnapshotUrl: string | null;
  onStampTextToPdf: (text: string) => void;
}

export const NvidiaAiAssistantModal: React.FC<NvidiaAiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  pageSnapshotUrl,
  onStampTextToPdf,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(VERIFIED_NVIDIA_MODELS[0].id);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [stamped, setStamped] = useState<boolean>(false);

  // Custom API key drawer
  const [showKeySettings, setShowKeySettings] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [keySavedMessage, setKeySavedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentModelInfo: NvidiaModelInfo =
    VERIFIED_NVIDIA_MODELS.find((m) => m.id === selectedModel) || VERIFIED_NVIDIA_MODELS[0];

  const handleExecutePrompt = async (promptText: string, customSystemPrompt?: string) => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setError(null);
    setCopied(false);
    setStamped(false);

    try {
      const result = await sendNvidiaChat({
        model: selectedModel,
        prompt: promptText,
        systemPrompt:
          customSystemPrompt ||
          'You are an expert AI assistant embedded inside the PDFDesk editor. Provide clear, direct, and concise output suitable for document notes and executive review.',
        pageImageBase64: pageSnapshotUrl,
      });
      setResponse(result);
    } catch (err: any) {
      console.error('NVIDIA AI query failed:', err);
      setError(err.message || 'Failed to generate response from NVIDIA NIM.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionType: 'summarize' | 'extract' | 'translate_hi' | 'translate_es' | 'polish') => {
    let q = '';
    let sys = '';

    if (actionType === 'summarize') {
      q = `Please examine Page ${currentPage} of this document and provide a concise 3-bullet point executive summary highlighting the most critical information, parties, or terms.`;
      sys = 'You are a concise executive assistant. Summarize clearly and objectively in bullet points.';
    } else if (actionType === 'extract') {
      q = `Extract all key metadata visible on Page ${currentPage}, such as dates, monetary amounts, deadlines, organization names, and actionable items.`;
      sys = 'Extract only facts, numbers, dates, and entities into a clean checklist.';
    } else if (actionType === 'translate_hi') {
      q = `Translate the visible text and key information on Page ${currentPage} into fluent, natural Hindi (हिंदी).`;
      sys = 'You are a professional Hindi translator. Translate accurately preserving formal terminology.';
    } else if (actionType === 'translate_es') {
      q = `Translate the visible text and key information on Page ${currentPage} into clean, formal Spanish.`;
      sys = 'You are a professional Spanish translator.';
    } else if (actionType === 'polish') {
      q = `Based on Page ${currentPage}, compose a short, 2-line professional annotation note or verification stamp that can be placed on this document.`;
      sys = 'Generate a high-grade professional approval or verification memo.';
    }

    setPrompt(q);
    handleExecutePrompt(q, sys);
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStamp = () => {
    if (!response) return;
    // Use first 200 chars or summary lines as annotation note
    const cleanNote = response
      .replace(/[#*`_]/g, '')
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .slice(0, 3)
      .join(' ')
      .trim();

    onStampTextToPdf(cleanNote || response.slice(0, 100));
    setStamped(true);
    setTimeout(() => setStamped(false), 2500);
  };

  const handleSaveKey = () => {
    saveCustomNvidiaApiKey(customKeyInput);
    setKeySavedMessage('API Key configuration updated!');
    setTimeout(() => setKeySavedMessage(null), 2500);
    setShowKeySettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">NVIDIA NIM Assistant</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                  Page {currentPage}
                </span>
                {currentModelInfo.supportsVision && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Eye className="w-3 h-3" />
                    <span>Vision Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                GPU-accelerated document intelligence & instant text drafting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeySettings((prev) => !prev)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="API Key Configuration"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom API Key Drawer (Optional) */}
        {showKeySettings && (
          <div className="p-4 bg-zinc-900/90 border-b border-white/10 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-semibold">NVIDIA NIM Cloud API Key</span>
              <span className="text-emerald-400 font-mono">
                {hasCustomApiKey() ? 'Custom Key Set' : 'Default Preconfigured Key Active'}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="nvapi-..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white cursor-pointer transition-all"
              >
                Save
              </button>
              {hasCustomApiKey() && (
                <button
                  type="button"
                  onClick={() => {
                    saveCustomNvidiaApiKey('');
                    setCustomKeyInput('');
                    setKeySavedMessage('Reverted to default system key');
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer transition-all"
                >
                  Reset
                </button>
              )}
            </div>
            {keySavedMessage && (
              <p className="text-[11px] text-emerald-400">{keySavedMessage}</p>
            )}
          </div>
        )}

        {/* Model Selector Strip */}
        <div className="p-3 sm:px-5 bg-black/40 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400 shrink-0">Model:</span>
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-zinc-900 border border-white/15 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {VERIFIED_NVIDIA_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${currentModelInfo.badgeColor}`}
            >
              {currentModelInfo.badge}
            </span>
            <span className="text-[11px] text-zinc-400 truncate hidden md:inline">
              {currentModelInfo.tagline}
            </span>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="p-3 sm:px-5 bg-zinc-950 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-white/5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickAction('summarize')}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/30 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Summarize Page</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickAction('extract')}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/30 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Extract Key Points</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickAction('translate_hi')}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/30 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Languages className="w-3.5 h-3.5 text-orange-400" />
            <span>Translate to Hindi</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickAction('translate_es')}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/30 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Languages className="w-3.5 h-3.5 text-yellow-400" />
            <span>Translate to Spanish</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickAction('polish')}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/30 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Draft Memo Stamp</span>
          </button>
        </div>

        {/* Content Body: Chat Response & Prompt Input */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold">AI Execution Failed</p>
                <p className="text-[11px] text-red-400 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {response ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap select-text">
                {response}
              </div>

              {/* Action Bar for Generated Text */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStamp}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Insert this insight as a text note on the PDF canvas"
                  >
                    {stamped ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <PenTool className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>{stamped ? 'Stamped on PDF!' : 'Stamp Note to PDF'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleExecutePrompt(prompt)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">Ask anything about Page {currentPage}</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Use one of the instant quick actions above or type custom instructions below.
                Llama 3.2 Vision will analyze the page layout and graphics in real-time.
              </p>
            </div>
          ) : null}

          {isLoading && (
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col items-center justify-center space-y-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin absolute -top-1 -right-1" />
              </div>
              <p className="text-xs font-semibold text-white">
                Thinking with {currentModelInfo.name}...
              </p>
              <p className="text-[11px] text-zinc-500">
                GPU inference streaming via NVIDIA NIM
              </p>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 sm:p-5 bg-zinc-900/60 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecutePrompt(prompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ask ${currentModelInfo.name} about page ${currentPage}...`}
              disabled={isLoading}
              className="flex-1 bg-black/60 border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
