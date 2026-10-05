import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';

export interface SplitResult {
  blob: Blob;
  filename: string;
  isZip: boolean;
  pageCount: number;
}

/**
 * Merges selected pages from the source PDF into a single new PDF document.
 * @param arrayBuffer The raw source PDF bytes
 * @param pageNumbers 1-indexed list of pages to include
 * @param rotations Optional map of pageNumber -> additional rotation degrees (0, 90, 180, 270)
 */
export async function splitMergePages(
  arrayBuffer: ArrayBuffer,
  pageNumbers: number[],
  rotations: Record<number, number> = {},
  outputFilename: string = 'split-document.pdf'
): Promise<SplitResult> {
  if (pageNumbers.length === 0) {
    throw new Error('No pages selected to split.');
  }

  const srcDoc = await PDFDocument.load(arrayBuffer);
  const destDoc = await PDFDocument.create();

  // Convert 1-indexed page numbers to 0-indexed indices
  const pageIndices = pageNumbers.map(n => n - 1);
  const copiedPages = await destDoc.copyPages(srcDoc, pageIndices);

  copiedPages.forEach((page, index) => {
    const origPageNumber = pageNumbers[index];
    const extraRotation = rotations[origPageNumber] || 0;
    if (extraRotation !== 0) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + extraRotation) % 360));
    }
    destDoc.addPage(page);
  });

  const pdfBytes = await destDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

  const finalName = outputFilename.endsWith('.pdf') ? outputFilename : `${outputFilename}.pdf`;

  return {
    blob,
    filename: finalName,
    isZip: false,
    pageCount: pageNumbers.length,
  };
}

/**
 * Splits each selected page into its own individual PDF file and bundles them into a ZIP.
 */
export async function splitIndividualPagesToZip(
  arrayBuffer: ArrayBuffer,
  pageNumbers: number[],
  baseFilename: string,
  rotations: Record<number, number> = {},
  onProgress?: (progress: number) => void
): Promise<SplitResult> {
  if (pageNumbers.length === 0) {
    throw new Error('No pages selected to split.');
  }

  const srcDoc = await PDFDocument.load(arrayBuffer);
  const zip = new JSZip();
  const cleanBaseName = baseFilename.replace(/\.pdf$/i, '');

  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNum = pageNumbers[i];
    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [pageNum - 1]);
    
    const extraRotation = rotations[pageNum] || 0;
    if (extraRotation !== 0) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRotation + extraRotation) % 360));
    }

    singleDoc.addPage(copiedPage);
    const pdfBytes = await singleDoc.save();
    
    // Format filename with leading zero padding if needed
    const padLength = Math.max(2, String(pageNumbers.length).length);
    const paddedIndex = String(pageNum).padStart(padLength, '0');
    zip.file(`${cleanBaseName}_page_${paddedIndex}.pdf`, pdfBytes);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pageNumbers.length) * 100));
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    blob: zipBlob,
    filename: `${cleanBaseName}_individual_pages.zip`,
    isZip: true,
    pageCount: pageNumbers.length,
  };
}

/**
 * Splits document into chunks of N pages and bundles into a ZIP.
 */
export async function splitIntoChunksToZip(
  arrayBuffer: ArrayBuffer,
  chunkSize: number,
  totalPages: number,
  baseFilename: string,
  rotations: Record<number, number> = {},
  onProgress?: (progress: number) => void
): Promise<SplitResult> {
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const zip = new JSZip();
  const cleanBaseName = baseFilename.replace(/\.pdf$/i, '');
  
  const totalChunks = Math.ceil(totalPages / chunkSize);

  for (let c = 0; c < totalChunks; c++) {
    const startPage = c * chunkSize + 1;
    const endPage = Math.min((c + 1) * chunkSize, totalPages);
    const pageIndices: number[] = [];

    for (let p = startPage; p <= endPage; p++) {
      pageIndices.push(p - 1);
    }

    const chunkDoc = await PDFDocument.create();
    const copiedPages = await chunkDoc.copyPages(srcDoc, pageIndices);

    copiedPages.forEach((page, idx) => {
      const origPageNum = startPage + idx;
      const extraRotation = rotations[origPageNum] || 0;
      if (extraRotation !== 0) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + extraRotation) % 360));
      }
      chunkDoc.addPage(page);
    });

    const pdfBytes = await chunkDoc.save();
    zip.file(`${cleanBaseName}_part_${c + 1}_(pages_${startPage}-${endPage}).pdf`, pdfBytes);

    if (onProgress) {
      onProgress(Math.round(((c + 1) / totalChunks) * 100));
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    blob: zipBlob,
    filename: `${cleanBaseName}_chunks.zip`,
    isZip: true,
    pageCount: totalPages,
  };
}

/**
 * Helper to trigger browser download for a Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
