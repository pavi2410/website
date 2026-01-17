import type { PDFDocumentProxy } from 'pdfjs-dist'

export interface PdfFile {
  id: string
  name: string
  data: Uint8Array
  pageCount: number
  isLocked: boolean
  needsPassword: boolean
  pdfJsDoc: PDFDocumentProxy | null
}

export interface PageInfo {
  fileId: string
  pageIndex: number
  rotation: number
  id: string
  thumbnailUrl: string | null
}

export type Mode = 'idle' | 'merge' | 'split' | 'unlock'
