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

export type AppTab = 'splitter' | 'editor' | 'vault';

export type EditorTool = 'select' | 'text' | 'draw' | 'highlight' | 'shape' | 'signature' | 'erase';
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

export interface TextAnnotation {
  id: string;
  pageNumber: number;
  text: string;
  x: number; // percentage (0..100) or pixels
  y: number; // percentage (0..100) or pixels
  fontSize: number;
  color: string;
  isBold?: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number; // 0.1 to 1.0
  fontSize: number;
  color: string;
  diagonal: boolean;
  allPages: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export type CloudUser = AppUser;

export interface CloudDocument {
  id: string | number;
  name: string;
  size: number;
  downloadUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  releaseId: number;
  assetId: number;
  browserUrl?: string;
}
