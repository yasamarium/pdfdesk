import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header, type DeviceViewMode } from './components/Header';
import { DropZone } from './components/DropZone';
import { DesktopLayout } from './components/DesktopLayout';
import { MobileLayout } from './components/MobileLayout';
import { PdfEditorView } from './components/PdfEditorView';
import { CloudVaultView } from './components/CloudVaultView';
import { AuthModal } from './components/AuthModal';
import { PagePreviewModal } from './components/PagePreviewModal';
import { ResultPreviewModal } from './components/ResultPreviewModal';
import { PublicPdfViewer } from './components/PublicPdfViewer';
import type { PDFFileMetadata, PageInfo, SplitOptions, AppTab, AppUser } from './types';
import { loadPDFDocument, renderPageThumbnail } from './utils/pdfParser';
import { parseRangeString, formatPagesToRange } from './utils/rangeParser';
import {
  splitMergePages,
  splitIndividualPagesToZip,
  splitIntoChunksToZip,
  downloadBlob,
} from './utils/pdfSplitter';
import type { SplitResult } from './utils/pdfSplitter';
import { getCurrentUser, signOutUser, uploadPdfToCloud } from './services/githubDatabase';

function getInitialRouteCode(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  // 1. Path route: /v/<shortCode>
  const pathMatch = path.match(/^\/v\/([a-zA-Z0-9_-]+)/i);
  if (pathMatch && pathMatch[1]) return pathMatch[1];

  // 2. Query param: ?v=<shortCode>
  const searchParams = new URLSearchParams(search);
  const vParam = searchParams.get('v');
  if (vParam) return vParam;

  // 3. Hash route: #/v/<shortCode> or #v=<shortCode>
  const hashMatch = hash.match(/#\/?v[=/]([a-zA-Z0-9_-]+)/i);
  if (hashMatch && hashMatch[1]) return hashMatch[1];

  return null;
}

export const App: React.FC = () => {
  // Navigation suite tab: splitter, editor, or vault
  const [activeTab, setActiveTab] = useState<AppTab>('splitter');

  // Authenticated user
  const [user, setUser] = useState<AppUser | null>(null);
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);

  // Document state
  const [metadata, setMetadata] = useState<PDFFileMetadata | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});

  // View mode switcher: auto, mobile, or desktop
  const [viewMode, setViewMode] = useState<DeviceViewMode>('auto');

  // App processing state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Modals state
  const [lightboxPage, setLightboxPage] = useState<number | null>(null);
  const [previewResult, setPreviewResult] = useState<SplitResult | null>(null);

  // Split options
  const [options, setOptions] = useState<SplitOptions>({
    mode: 'range',
    rangeString: '',
    fromPage: 1,
    toPage: 1,
    chunkSize: 2,
    outputFilename: 'document_split',
    mergeIntoSingle: true,
  });

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // In-browser Public PDF Viewer routing (/v/:shortCode)
  const [viewingShortCode, setViewingShortCode] = useState<string | null>(getInitialRouteCode);

  useEffect(() => {
    const checkRoute = () => {
      setViewingShortCode(getInitialRouteCode());
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // Check stored user session on mount
  useEffect(() => {
    const cached = getCurrentUser();
    if (cached) setUser(cached);
  }, []);

  const handleSignOut = () => {
    signOutUser();
    setUser(null);
  };

  // Load PDF file from ArrayBuffer
  const processArrayBuffer = async (arrayBuffer: ArrayBuffer, fileName: string) => {
    setIsLoading(true);
    try {
      const doc = await loadPDFDocument(arrayBuffer);
      const total = doc.numPages;

      setMetadata({
        name: fileName,
        size: arrayBuffer.byteLength,
        pageCount: total,
        arrayBuffer,
      });

      setPdfDoc(doc);
      setRotations({});

      const initialPages: PageInfo[] = [];
      for (let i = 1; i <= total; i++) {
        initialPages.push({
          pageNumber: i,
          thumbnailUrl: '',
          width: 0,
          height: 0,
          rotation: 0,
          selected: true,
        });
      }
      setPages(initialPages);

      const baseName = fileName.replace(/\.pdf$/i, '').trim();
      setOptions({
        mode: 'range',
        rangeString: total > 1 ? `1-${total}` : '1',
        fromPage: 1,
        toPage: total,
        chunkSize: Math.max(1, Math.min(2, total)),
        outputFilename: `${baseName}_split`,
        mergeIntoSingle: true,
      });

      // Stream thumbnails render
      for (let i = 1; i <= total; i++) {
        renderPageThumbnail(doc, i, 0.45)
          .then((thumb) => {
            setPages((prev) =>
              prev.map((p) =>
                p.pageNumber === i
                  ? {
                      ...p,
                      thumbnailUrl: thumb.dataUrl,
                      width: thumb.width,
                      height: thumb.height,
                    }
                  : p
              )
            );
          })
          .catch((e) => console.error(`Error rendering thumb for page ${i}`, e));
      }
    } catch (err: any) {
      console.error('Failed to load PDF:', err);
      alert('Could not load PDF document. Please verify the file is not password-protected or corrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        processArrayBuffer(arrayBuffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadSample = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/sample.pdf');
      if (!response.ok) throw new Error('Could not fetch sample document');
      const arrayBuffer = await response.arrayBuffer();
      await processArrayBuffer(arrayBuffer, 'sample_document.pdf');
    } catch (err) {
      console.error('Failed to load sample:', err);
      alert('Could not load the built-in sample document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMetadata(null);
    setPdfDoc(null);
    setPages([]);
    setRotations({});
    setLightboxPage(null);
    setPreviewResult(null);
    setProgress(0);
    setIsProcessing(false);
    setActiveTab('splitter');
  };

  // Range updates
  const handleApplyRange = (rangeStr: string) => {
    if (!metadata) return;
    const selectedNums = new Set(parseRangeString(rangeStr, metadata.pageCount));
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        selected: selectedNums.has(p.pageNumber),
      }))
    );
  };

  // Toggle single page selection
  const handleToggleSelect = (pageNumber: number) => {
    setPages((prev) => {
      const updated = prev.map((p) =>
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      );
      const selectedPages = updated.filter((p) => p.selected).map((p) => p.pageNumber);
      const formatted = formatPagesToRange(selectedPages);
      setOptions((opt) => ({ ...opt, rangeString: formatted }));
      return updated;
    });
  };

  // Selection presets
  const handleSelectAll = useCallback(() => {
    if (!metadata) return;
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
    setOptions((opt) => ({
      ...opt,
      fromPage: 1,
      toPage: metadata.pageCount,
      rangeString: `1-${metadata.pageCount}`,
    }));
  }, [metadata]);

  const handleDeselectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
    setOptions((opt) => ({ ...opt, rangeString: '' }));
  };

  const handleInvertSelection = () => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, selected: !p.selected }));
      const selectedPages = updated.filter((p) => p.selected).map((p) => p.pageNumber);
      setOptions((opt) => ({ ...opt, rangeString: formatPagesToRange(selectedPages) }));
      return updated;
    });
  };

  const handleSelectOdd = () => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, selected: p.pageNumber % 2 !== 0 }));
      const selectedPages = updated.filter((p) => p.selected).map((p) => p.pageNumber);
      setOptions((opt) => ({ ...opt, rangeString: formatPagesToRange(selectedPages) }));
      return updated;
    });
  };

  const handleSelectEven = () => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, selected: p.pageNumber % 2 === 0 }));
      const selectedPages = updated.filter((p) => p.selected).map((p) => p.pageNumber);
      setOptions((opt) => ({ ...opt, rangeString: formatPagesToRange(selectedPages) }));
      return updated;
    });
  };

  // Page rotation
  const handleRotatePage = (pageNumber: number) => {
    setRotations((prev) => {
      const current = prev[pageNumber] || 0;
      const next = (current + 90) % 360;
      return { ...prev, [pageNumber]: next };
    });
    setPages((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNumber ? { ...p, rotation: ((p.rotation || 0) + 90) % 360 } : p
      )
    );
  };

  const handleRotateAllSelected = (deg: number) => {
    setPages((prev) =>
      prev.map((p) => {
        if (!p.selected) return p;
        const next = ((p.rotation || 0) + deg) % 360;
        setRotations((r) => ({ ...r, [p.pageNumber]: next }));
        return { ...p, rotation: next };
      })
    );
  };

  // Perform PDF Split
  const performSplit = async (forPreview: boolean = false): Promise<SplitResult | null> => {
    if (!metadata) return null;

    setIsProcessing(true);
    setProgress(0);

    try {
      const selectedPages = pages.filter((p) => p.selected).map((p) => p.pageNumber);
      let result: SplitResult;

      const cleanCustomName = options.outputFilename.trim() || 'split_document';

      if (options.mode === 'extract_all') {
        const allNums = Array.from({ length: metadata.pageCount }, (_, i) => i + 1);
        result = await splitIndividualPagesToZip(
          metadata.arrayBuffer,
          allNums,
          cleanCustomName,
          rotations,
          (prog) => setProgress(prog)
        );
      } else if (options.mode === 'chunks') {
        result = await splitIntoChunksToZip(
          metadata.arrayBuffer,
          options.chunkSize,
          metadata.pageCount,
          cleanCustomName,
          rotations,
          (prog) => setProgress(prog)
        );
      } else if (options.mergeIntoSingle) {
        if (selectedPages.length === 0) {
          alert('Please select at least one page to extract.');
          setIsProcessing(false);
          return null;
        }
        result = await splitMergePages(
          metadata.arrayBuffer,
          selectedPages,
          rotations,
          cleanCustomName.endsWith('.pdf') ? cleanCustomName : `${cleanCustomName}.pdf`
        );
      } else {
        if (selectedPages.length === 0) {
          alert('Please select at least one page to extract.');
          setIsProcessing(false);
          return null;
        }
        result = await splitIndividualPagesToZip(
          metadata.arrayBuffer,
          selectedPages,
          cleanCustomName,
          rotations,
          (prog) => setProgress(prog)
        );
      }

      if (!forPreview) {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.8 },
          colors: ['#0A84FF', '#5E5CE6', '#30D158', '#FFFFFF'],
        });

        downloadBlob(result.blob, result.filename);
      }

      return result;
    } catch (err: any) {
      console.error('Split error:', err);
      alert(`Split operation failed: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitAndDownload = () => {
    performSplit(false);
  };

  const handlePreviewResult = async () => {
    const res = await performSplit(true);
    if (res) {
      setPreviewResult(res);
    }
  };

  // Cloud Save Handler
  const handleSaveToCloud = async (blob: Blob, name: string) => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    try {
      await uploadPdfToCloud(blob, name, user);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#30D158', '#0A84FF', '#BF5AF2', '#FFFFFF'],
      });
      alert(`"${name}" was saved to your private Cloud Drive successfully!`);
      setActiveTab('vault');
    } catch (err: any) {
      alert(`Cloud sync failed: ${err.message || 'Unknown error'}`);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to split
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (metadata && !isProcessing && activeTab === 'splitter') {
          handleSplitAndDownload();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metadata, isProcessing, pages, options, activeTab]);

  const selectedPagesCount = pages.filter((p) => p.selected).length;

  // Render In-Browser Secure PDF Viewer if route is /v/:shortCode
  if (viewingShortCode) {
    return (
      <PublicPdfViewer
        shortCode={viewingShortCode}
        onOpenInStudio={async (buffer, fileName, targetTab) => {
          setViewingShortCode(null);
          window.history.pushState({}, '', '/');
          await processArrayBuffer(buffer, fileName);
          setActiveTab(targetTab);
        }}
        onBackToStudio={() => {
          setViewingShortCode(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col font-sans selection:bg-[#0A84FF] selection:text-white">
      {/* Hidden File Picker */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* iOS Top Bar with Suite Navigation */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasFile={!!metadata}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        user={user}
        onOpenSignIn={() => setShowSignInModal(true)}
        onSignOut={handleSignOut}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {/* TAB 1: CLOUD VAULT */}
        {activeTab === 'vault' ? (
          <CloudVaultView
            user={user}
            onOpenSignIn={() => setShowSignInModal(true)}
            currentPdfBlob={metadata ? new Blob([metadata.arrayBuffer], { type: 'application/pdf' }) : null}
            currentPdfName={metadata?.name}
            onOpenDocumentViewer={(code) => {
              setViewingShortCode(code);
              window.history.pushState({}, '', `/v/${code}`);
            }}
          />
        ) : !metadata ? (
          /* When no file is loaded, show the DropZone */
          <DropZone
            mode={activeTab === 'editor' ? 'editor' : 'splitter'}
            onFileSelect={handleFileSelect}
            onLoadSample={handleLoadSample}
            isLoading={isLoading}
          />
        ) : activeTab === 'editor' ? (
          /* TAB 2: PDF EDITOR */
          <PdfEditorView
            metadata={metadata}
            pdfDoc={pdfDoc}
            user={user}
            onOpenSignIn={() => setShowSignInModal(true)}
            onSaveToCloud={handleSaveToCloud}
            viewMode={viewMode}
          />
        ) : (
          /* TAB 3: PDF SPLITTER */
          <div className="w-full flex-1">
            {/* If viewMode is desktop: render DesktopLayout only */}
            {viewMode === 'desktop' && (
              <DesktopLayout
                metadata={metadata}
                pages={pages}
                options={options}
                selectedCount={selectedPagesCount}
                rotations={rotations}
                isProcessing={isProcessing}
                progress={progress}
                onOptionsChange={(newOpt) => setOptions((prev) => ({ ...prev, ...newOpt }))}
                onApplyRange={handleApplyRange}
                onToggleSelect={handleToggleSelect}
                onPreviewPage={(pageNum) => setLightboxPage(pageNum)}
                onRotatePage={handleRotatePage}
                onRotateAllSelected={handleRotateAllSelected}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onInvertSelection={handleInvertSelection}
                onSelectOdd={handleSelectOdd}
                onSelectEven={handleSelectEven}
                onChangeFile={() => hiddenFileInputRef.current?.click()}
                onReset={handleReset}
                onSplit={handleSplitAndDownload}
                onPreviewResult={handlePreviewResult}
              />
            )}

            {/* If viewMode is mobile: render MobileLayout centered */}
            {viewMode === 'mobile' && (
              <div className="max-w-md mx-auto">
                <MobileLayout
                  metadata={metadata}
                  pages={pages}
                  options={options}
                  selectedCount={selectedPagesCount}
                  rotations={rotations}
                  isProcessing={isProcessing}
                  progress={progress}
                  onOptionsChange={(newOpt) => setOptions((prev) => ({ ...prev, ...newOpt }))}
                  onApplyRange={handleApplyRange}
                  onToggleSelect={handleToggleSelect}
                  onPreviewPage={(pageNum) => setLightboxPage(pageNum)}
                  onRotatePage={handleRotatePage}
                  onRotateAllSelected={handleRotateAllSelected}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onInvertSelection={handleInvertSelection}
                  onSelectOdd={handleSelectOdd}
                  onSelectEven={handleSelectEven}
                  onChangeFile={() => hiddenFileInputRef.current?.click()}
                  onReset={handleReset}
                  onSplit={handleSplitAndDownload}
                  onPreviewResult={handlePreviewResult}
                />
              </div>
            )}

            {/* If viewMode is auto: responsive switch based on screen width */}
            {viewMode === 'auto' && (
              <>
                <div className="block lg:hidden">
                  <MobileLayout
                    metadata={metadata}
                    pages={pages}
                    options={options}
                    selectedCount={selectedPagesCount}
                    rotations={rotations}
                    isProcessing={isProcessing}
                    progress={progress}
                    onOptionsChange={(newOpt) => setOptions((prev) => ({ ...prev, ...newOpt }))}
                    onApplyRange={handleApplyRange}
                    onToggleSelect={handleToggleSelect}
                    onPreviewPage={(pageNum) => setLightboxPage(pageNum)}
                    onRotatePage={handleRotatePage}
                    onRotateAllSelected={handleRotateAllSelected}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onInvertSelection={handleInvertSelection}
                    onSelectOdd={handleSelectOdd}
                    onSelectEven={handleSelectEven}
                    onChangeFile={() => hiddenFileInputRef.current?.click()}
                    onReset={handleReset}
                    onSplit={handleSplitAndDownload}
                    onPreviewResult={handlePreviewResult}
                  />
                </div>

                <div className="hidden lg:block">
                  <DesktopLayout
                    metadata={metadata}
                    pages={pages}
                    options={options}
                    selectedCount={selectedPagesCount}
                    rotations={rotations}
                    isProcessing={isProcessing}
                    progress={progress}
                    onOptionsChange={(newOpt) => setOptions((prev) => ({ ...prev, ...newOpt }))}
                    onApplyRange={handleApplyRange}
                    onToggleSelect={handleToggleSelect}
                    onPreviewPage={(pageNum) => setLightboxPage(pageNum)}
                    onRotatePage={handleRotatePage}
                    onRotateAllSelected={handleRotateAllSelected}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onInvertSelection={handleInvertSelection}
                    onSelectOdd={handleSelectOdd}
                    onSelectEven={handleSelectEven}
                    onChangeFile={() => hiddenFileInputRef.current?.click()}
                    onReset={handleReset}
                    onSplit={handleSplitAndDownload}
                    onPreviewResult={handlePreviewResult}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showSignInModal && (
        <AuthModal
          onClose={() => setShowSignInModal(false)}
          onSuccess={(u) => setUser(u)}
        />
      )}

      {/* Lightbox Live Page Preview Modal */}
      {lightboxPage !== null && (
        <PagePreviewModal
          pdfDoc={pdfDoc}
          pageNumber={lightboxPage}
          totalPages={metadata?.pageCount || 1}
          isSelected={pages.find((p) => p.pageNumber === lightboxPage)?.selected ?? true}
          rotation={rotations[lightboxPage] || 0}
          onClose={() => setLightboxPage(null)}
          onNavigate={(nextPage) => setLightboxPage(nextPage)}
          onToggleSelect={handleToggleSelect}
          onRotatePage={handleRotatePage}
        />
      )}

      {/* Final Split Output Preview Modal */}
      {previewResult && (
        <ResultPreviewModal
          blob={previewResult.blob}
          filename={previewResult.filename}
          isZip={previewResult.isZip}
          pageCount={previewResult.pageCount}
          onClose={() => setPreviewResult(null)}
        />
      )}
    </div>
  );
};

export default App;
