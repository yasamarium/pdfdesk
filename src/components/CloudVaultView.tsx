import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Download,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  FileText,
  UploadCloud,
  ShieldCheck,
  Loader2,
  Search,
  LogIn,
} from 'lucide-react';
import { listCloudDocuments, deleteCloudDocument, uploadPdfToCloud, REPO_OWNER, DATABASE_REPO } from '../services/githubCloud';
import type { CloudUser, CloudDocument } from '../types';

interface CloudVaultViewProps {
  user: CloudUser | null;
  onOpenSignIn: () => void;
  currentPdfBlob?: Blob | null;
  currentPdfName?: string;
  onLoadCloudDocument?: (doc: CloudDocument) => void;
}

export const CloudVaultView: React.FC<CloudVaultViewProps> = ({
  user,
  onOpenSignIn,
  currentPdfBlob,
  currentPdfName,
}) => {
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await listCloudDocuments(user);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load cloud docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleUploadCurrent = async () => {
    if (!currentPdfBlob) {
      alert('Please load or create a PDF first in Splitter or Editor.');
      return;
    }
    setUploading(true);
    setUploadStatus('Preparing PDF for cloud upload...');
    try {
      const name = currentPdfName || 'document.pdf';
      const doc = await uploadPdfToCloud(currentPdfBlob, name, user, (msg) => setUploadStatus(msg));
      setDocuments((prev) => [doc, ...prev]);
      alert(`Document "${doc.name}" saved to GitHub Releases Cloud Vault!`);
    } catch (err: any) {
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const handleDelete = async (doc: CloudDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}" from Cloud Vault?`)) return;
    try {
      const ok = await deleteCloudDocument(doc.assetId, user);
      if (ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      } else {
        alert('Could not delete file from GitHub releases.');
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleCopyLink = (doc: CloudDocument) => {
    navigator.clipboard.writeText(doc.downloadUrl);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBytes = documents.reduce((acc, d) => acc + (d.size || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-ios-enter">
      {/* Top Banner & Stats Card */}
      <div className="ios-glass rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cloud className="w-48 h-48 text-[#0A84FF]" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-[#0A84FF]">
              <Cloud className="w-3.5 h-3.5" />
              <span>GitHub Releases Storage Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              PDFDesk Cloud Vault
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Store and retrieve your processed PDFs securely using GitHub Releases of the{' '}
              <a
                href={`https://github.com/${REPO_OWNER}/${DATABASE_REPO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A84FF] underline underline-offset-2 hover:text-blue-400 font-mono"
              >
                {REPO_OWNER}/{DATABASE_REPO}
              </a>{' '}
              repository. Permanent direct CDN download links.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {!user ? (
              <button
                type="button"
                onClick={onOpenSignIn}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0071e3] hover:brightness-110 active:scale-95 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with GitHub</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-white/10">
                <img
                  src={user.avatarUrl || 'https://github.com/github.png'}
                  alt={user.username}
                  className="w-6 h-6 rounded-full ring-1 ring-white/20"
                />
                <span className="text-xs font-medium text-white">@{user.username}</span>
                <span className="w-2 h-2 rounded-full bg-[#30D158] ml-1" title="Connected" />
              </div>
            )}

            {currentPdfBlob && (
              <button
                type="button"
                onClick={handleUploadCurrent}
                disabled={uploading}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-medium text-xs flex items-center gap-2 border border-white/10 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                )}
                <span>Save Current PDF to Cloud</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchDocuments}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer"
              title="Refresh Cloud Vault"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className="mt-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/5">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-zinc-500 block uppercase font-medium">Cloud Documents</span>
            <span className="text-lg font-bold text-white font-mono">{documents.length} files</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-zinc-500 block uppercase font-medium">Storage Allocated</span>
            <span className="text-lg font-bold text-white font-mono">{formatSize(totalBytes)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 block uppercase font-medium">Vault Status</span>
            <span className="text-sm font-semibold text-[#30D158] flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Releases Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cloud documents..."
            className="w-full bg-zinc-950/80 border border-white/10 focus:border-[#0A84FF] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <span className="text-xs text-zinc-400 font-mono">
          Showing {filteredDocs.length} of {documents.length} files
        </span>
      </div>

      {/* Cloud Documents Grid / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A84FF]" />
          <span className="text-xs">Fetching documents from GitHub Cloud Releases...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-16 text-center rounded-3xl ios-glass border border-white/5 space-y-3 p-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-zinc-500">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-white">No Cloud Documents Found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No documents match your search query.'
              : 'You have not uploaded any PDFs to GitHub Releases yet. Split or edit a PDF, then click "Save Current PDF to Cloud".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="ios-glass-card rounded-2xl p-4 border border-white/10 shadow-lg space-y-3 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#0A84FF] border border-blue-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 block">
                      {new Date(doc.uploadedAt).toLocaleDateString()} at{' '}
                      {new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Delete from cloud"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Meta pills */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 font-mono">
                  {formatSize(doc.size)}
                </span>
                <span>•</span>
                <span className="text-zinc-500">By @{doc.uploadedBy || 'user'}</span>
              </div>

              {/* Actions strip */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(doc)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy permanent direct cloud download URL"
                >
                  {copiedId === doc.id ? (
                    <>
                      <Check className="w-3 h-3 text-[#30D158]" />
                      <span className="text-[#30D158]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={doc.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-xl bg-[#0A84FF] hover:bg-blue-600 text-[11px] font-semibold text-white transition-all flex items-center gap-1 shadow-md shadow-blue-500/20"
                  download={doc.name}
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
