export interface PDFFileMetadata {
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

export interface PageInfo {
  pageNumber: number; // 1-indexed
  thumbnailUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
}

export type SplitMode = 'range' | 'visual' | 'extract_all' | 'chunks';

export interface SplitOptions {
  mode: SplitMode;
  rangeString: string; // e.g. "1-3, 5, 8"
  fromPage: number;
  toPage: number;
  chunkSize: number; // split every N pages
  outputFilename: string;
  mergeIntoSingle: boolean; // if true merge selected into 1 PDF, if false zip individual pages
}
