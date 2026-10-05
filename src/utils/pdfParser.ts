import { pdfjsLib } from './pdfWorker';
import type { PageInfo } from '../types';

export interface PDFLoadResult {
  numPages: number;
  pdfDoc: any;
}

/**
 * Loads a PDF document from an ArrayBuffer using PDF.js
 */
export async function loadPDFDocument(arrayBuffer: ArrayBuffer): Promise<any> {
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer.slice(0),
    cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Renders a single PDF page into a data URL (image/webp or image/png)
 */
export async function renderPageThumbnail(
  pdfDoc: any,
  pageNumber: number,
  scale: number = 0.4
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Could not create canvas 2d context');

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // Fill with pure white background before drawing
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

  return {
    dataUrl,
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Renders high-resolution image for preview modal
 */
export async function renderPageHighRes(
  pdfDoc: any,
  pageNumber: number,
  scale: number = 1.6
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Could not create canvas 2d context');

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  return {
    dataUrl,
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Generates initial PageInfo array with placeholder thumbnails and streams thumbnail updates
 */
export async function generatePageThumbnails(
  pdfDoc: any,
  onPageRendered?: (pageInfo: PageInfo) => void
): Promise<PageInfo[]> {
  const numPages = pdfDoc.numPages;
  const pages: PageInfo[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const { dataUrl, width, height } = await renderPageThumbnail(pdfDoc, pageNum);
    const pageInfo: PageInfo = {
      pageNumber: pageNum,
      thumbnailUrl: dataUrl,
      width,
      height,
      rotation: 0,
      selected: true, // by default all pages selected
    };
    pages.push(pageInfo);
    if (onPageRendered) {
      onPageRendered(pageInfo);
    }
  }

  return pages;
}
