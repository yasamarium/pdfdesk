import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { TextAnnotation, WatermarkConfig } from '../types';

export interface EditorExportPayload {
  arrayBuffer: ArrayBuffer;
  pageOrder: number[]; // 1-indexed list of pages to include in the order
  pageRotations: Record<number, number>; // pageNumber -> additional rotation
  drawings: Record<number, string>; // pageNumber -> PNG data URL of drawing canvas overlay
  textAnnotations: TextAnnotation[];
  watermark: WatermarkConfig;
  outputFilename: string;
}

/**
 * Parses Hex color string (e.g. "#FF0000" or "#0A84FF") to pdf-lib rgb(r, g, b)
 */
function hexToPdfRgb(hex: string) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

/**
 * Converts a base64 data URL to Uint8Array bytes
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compiles edited PDF with drawings, text annotations, watermarks, and page adjustments
 */
export async function compileEditedPdf(payload: EditorExportPayload): Promise<{ blob: Blob; filename: string }> {
  const {
    arrayBuffer,
    pageOrder,
    pageRotations,
    drawings,
    textAnnotations,
    watermark,
    outputFilename,
  } = payload;

  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  const fontRegular = await newDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await newDoc.embedFont(StandardFonts.HelveticaBold);

  // Copy pages in the requested order
  const pageIndices = pageOrder.map((num) => num - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

  for (let i = 0; i < copiedPages.length; i++) {
    const page = copiedPages[i];
    const originalPageNum = pageOrder[i];
    const { width, height } = page.getSize();

    // 1. Apply Rotation
    const extraRot = pageRotations[originalPageNum] || 0;
    if (extraRot !== 0) {
      const curRot = page.getRotation().angle;
      page.setRotation(degrees((curRot + extraRot) % 360));
    }

    // 2. Embed Drawing Overlay if present
    const drawingDataUrl = drawings[originalPageNum];
    if (drawingDataUrl && drawingDataUrl.length > 50) {
      try {
        const pngBytes = dataUrlToBytes(drawingDataUrl);
        const pngImage = await newDoc.embedPng(pngBytes);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      } catch (err) {
        console.warn(`Failed to embed drawing on page ${originalPageNum}:`, err);
      }
    }

    // 3. Add Text Annotations for this page
    const pageTexts = textAnnotations.filter((t) => t.pageNumber === originalPageNum);
    for (const textItem of pageTexts) {
      if (!textItem.text.trim()) continue;

      const font = textItem.isBold ? fontBold : fontRegular;
      const color = hexToPdfRgb(textItem.color || '#000000');
      const fontSize = Math.max(8, textItem.fontSize || 16);

      // Convert percentage coordinates (0..100) to PDF points
      const pdfX = (textItem.x / 100) * width;
      // In PDF coordinate system, Y=0 is bottom
      const pdfY = height - (textItem.y / 100) * height - fontSize;

      page.drawText(textItem.text, {
        x: Math.max(10, Math.min(width - 50, pdfX)),
        y: Math.max(10, Math.min(height - 20, pdfY)),
        size: fontSize,
        font: font,
        color: color,
      });
    }

    // 4. Add Watermark if enabled
    if (watermark.enabled && watermark.text.trim()) {
      if (watermark.allPages || originalPageNum === 1) {
        const wmColor = hexToPdfRgb(watermark.color || '#888888');
        const wmSize = watermark.fontSize || 54;
        const textWidth = fontBold.widthOfTextAtSize(watermark.text, wmSize);
        const textHeight = fontBold.heightAtSize(wmSize);

        const centerX = (width - textWidth) / 2;
        const centerY = (height - textHeight) / 2;

        page.drawText(watermark.text, {
          x: centerX,
          y: centerY,
          size: wmSize,
          font: fontBold,
          color: wmColor,
          opacity: Math.max(0.05, Math.min(1, watermark.opacity || 0.25)),
          rotate: watermark.diagonal ? degrees(45) : degrees(0),
        });
      }
    }

    newDoc.addPage(page);
  }

  const pdfBytes = await newDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

  const finalName = outputFilename.endsWith('.pdf') ? outputFilename : `${outputFilename}.pdf`;
  return { blob, filename: finalName };
}
