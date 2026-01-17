import { useState, useCallback, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import type { PdfFile, PageInfo } from './types'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const generateId = () => Math.random().toString(36).substring(2, 9)

export function usePdfEditor() {
  const [files, setFiles] = useState<PdfFile[]>([])
  const [pages, setPages] = useState<PageInfo[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedPage, setDraggedPage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [lockedFileId, setLockedFileId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<{ file: File; password?: string } | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const thumbnailCache = useRef<Map<string, string>>(new Map())

  // Generate thumbnail for a page using PDF.js
  const generateThumbnail = useCallback(async (
    pdfJsDoc: pdfjsLib.PDFDocumentProxy,
    pageIndex: number
  ): Promise<string> => {
    const page = await pdfJsDoc.getPage(pageIndex + 1)
    const scale = 0.5
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    const context = canvas.getContext('2d')!
    await page.render({ canvasContext: context, viewport, canvas } as any).promise
    
    return canvas.toDataURL('image/jpeg', 0.7)
  }, [])

  const loadPdf = useCallback(async (file: File, password?: string): Promise<PdfFile | null> => {
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    let pdfJsDoc: pdfjsLib.PDFDocumentProxy | null = null
    let isLocked = false
    let pageCount = 0
    
    try {
      const loadingTask = pdfjsLib.getDocument({ 
        data: data.slice(),
        password: password || undefined
      })
      pdfJsDoc = await loadingTask.promise
      pageCount = pdfJsDoc.numPages
      
      return {
        id: generateId(),
        name: file.name,
        data,
        pageCount,
        isLocked: false,
        needsPassword: false,
        pdfJsDoc
      }
    } catch (pdfJsError: any) {
      console.log('PDF.js error:', pdfJsError.name, pdfJsError.message)
      
      const errorMsg = (pdfJsError?.message || '').toLowerCase()
      const isPasswordNeeded = pdfJsError.name === 'PasswordException' || 
        errorMsg.includes('password') || 
        errorMsg.includes('incorrect password')
      
      if (isPasswordNeeded && !password) {
        try {
          const loadingTask = pdfjsLib.getDocument({ 
            data: data.slice(),
            password: ''
          })
          pdfJsDoc = await loadingTask.promise
          pageCount = pdfJsDoc.numPages
          
          return {
            id: generateId(),
            name: file.name,
            data,
            pageCount,
            isLocked: true,
            needsPassword: false,
            pdfJsDoc
          }
        } catch {
          return {
            id: generateId(),
            name: file.name,
            data,
            pageCount: 0,
            isLocked: true,
            needsPassword: true,
            pdfJsDoc: null
          }
        }
      }
      
      if (isPasswordNeeded && password) {
        throw new Error('Incorrect password')
      }
      
      try {
        const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true })
        pageCount = pdfDoc.getPageCount()
        isLocked = (pdfDoc as any).isEncrypted || false
        
        if (isLocked && !password) {
          return {
            id: generateId(),
            name: file.name,
            data,
            pageCount: 0,
            isLocked: true,
            needsPassword: true,
            pdfJsDoc: null
          }
        }
        
        return {
          id: generateId(),
          name: file.name,
          data,
          pageCount,
          isLocked,
          needsPassword: false,
          pdfJsDoc: null
        }
      } catch {
        return {
          id: generateId(),
          name: file.name,
          data,
          pageCount: 0,
          isLocked: true,
          needsPassword: true,
          pdfJsDoc: null
        }
      }
    }
  }, [])

  const handleFiles = useCallback(async (fileList: FileList, password?: string) => {
    setError(null)
    setIsProcessing(true)

    const pdfFiles: PdfFile[] = []
    const newPages: PageInfo[] = []

    for (const file of Array.from(fileList)) {
      if (file.type !== 'application/pdf') {
        setError('Please select PDF files only.')
        continue
      }

      try {
        const pdfFile = await loadPdf(file, password)
        if (pdfFile) {
          if (pdfFile.needsPassword) {
            setPendingFile({ file })
            setIsProcessing(false)
            return
          }
          
          pdfFiles.push(pdfFile)
          
          for (let i = 0; i < pdfFile.pageCount; i++) {
            const pageId = generateId()
            let thumbnailUrl: string | null = null
            
            if (pdfFile.pdfJsDoc) {
              try {
                thumbnailUrl = await generateThumbnail(pdfFile.pdfJsDoc, i)
                thumbnailCache.current.set(`${pdfFile.id}-${i}`, thumbnailUrl)
              } catch (e) {
                console.warn('Failed to generate thumbnail for page', i, e)
              }
            }
            
            newPages.push({
              fileId: pdfFile.id,
              pageIndex: i,
              rotation: 0,
              id: pageId,
              thumbnailUrl
            })
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load PDF')
      }
    }

    setFiles(prev => [...prev, ...pdfFiles])
    setPages(prev => [...prev, ...newPages])
    setIsProcessing(false)
    setPendingFile(null)
  }, [loadPdf, generateThumbnail])

  const handlePasswordSubmit = useCallback(async () => {
    if (!pendingFile) return
    
    const fileList = new DataTransfer()
    fileList.items.add(pendingFile.file)
    await handleFiles(fileList.files, unlockPassword)
    setUnlockPassword('')
  }, [pendingFile, unlockPassword, handleFiles])

  const bypassRestrictions = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const sourcePdf = await PDFDocument.load(file.data, { ignoreEncryption: true })
      const newPdf = await PDFDocument.create()
      const pageIndices = sourcePdf.getPageIndices()
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices)
      
      for (const page of copiedPages) {
        newPdf.addPage(page)
      }

      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `unrestricted_${file.name}`
      link.click()

      URL.revokeObjectURL(url)
    } catch (e) {
      setError('Failed to bypass restrictions. The PDF may have user-password encryption.')
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }, [files])

  const bypassPendingFile = useCallback(async () => {
    if (!pendingFile) return
    setIsProcessing(true)
    setModalError(null)
    
    try {
      const arrayBuffer = await pendingFile.file.arrayBuffer()
      const data = new Uint8Array(arrayBuffer)
      const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true })
      const newPdf = await PDFDocument.create()
      const pageIndices = pdfDoc.getPageIndices()
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
      
      for (const page of copiedPages) {
        newPdf.addPage(page)
      }
      
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bypassed_${pendingFile.file.name}`
      link.click()
      URL.revokeObjectURL(url)
      setPendingFile(null)
      setUnlockPassword('')
    } catch {
      setModalError('Bypass failed. This PDF has strong encryption that requires the correct password.')
    } finally {
      setIsProcessing(false)
    }
  }, [pendingFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
    e.target.value = ''
  }, [handleFiles])

  const rotatePage = useCallback((pageId: string, degrees: number) => {
    setPages(prev => prev.map(p => 
      p.id === pageId 
        ? { ...p, rotation: (p.rotation + degrees + 360) % 360 }
        : p
    ))
  }, [])

  const deletePage = useCallback((pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId))
    setSelectedPages(prev => {
      const next = new Set(prev)
      next.delete(pageId)
      return next
    })
  }, [])

  const deleteSelectedPages = useCallback(() => {
    setPages(prev => prev.filter(p => !selectedPages.has(p.id)))
    setSelectedPages(new Set())
  }, [selectedPages])

  const togglePageSelection = useCallback((pageId: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev)
      if (next.has(pageId)) {
        next.delete(pageId)
      } else {
        next.add(pageId)
      }
      return next
    })
  }, [])

  const selectAllPages = useCallback(() => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set())
    } else {
      setSelectedPages(new Set(pages.map(p => p.id)))
    }
  }, [pages, selectedPages.size])

  const handlePageDragStart = useCallback((e: React.DragEvent, pageId: string) => {
    setDraggedPage(pageId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handlePageDragOver = useCallback((e: React.DragEvent, targetPageId: string) => {
    e.preventDefault()
    if (!draggedPage || draggedPage === targetPageId) return

    setPages(prev => {
      const draggedIndex = prev.findIndex(p => p.id === draggedPage)
      const targetIndex = prev.findIndex(p => p.id === targetPageId)
      if (draggedIndex === -1 || targetIndex === -1) return prev

      const newPages = [...prev]
      const [removed] = newPages.splice(draggedIndex, 1)
      newPages.splice(targetIndex, 0, removed)
      return newPages
    })
  }, [draggedPage])

  const handlePageDragEnd = useCallback(() => {
    setDraggedPage(null)
  }, [])

  const exportPdf = useCallback(async () => {
    if (pages.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const mergedPdf = await PDFDocument.create()

      for (const page of pages) {
        const file = files.find(f => f.id === page.fileId)
        if (!file) continue

        const sourcePdf = await PDFDocument.load(file.data, { ignoreEncryption: true })
        const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [page.pageIndex])
        
        if (page.rotation !== 0) {
          copiedPage.setRotation({ angle: page.rotation, type: 0 } as any)
        }
        
        mergedPdf.addPage(copiedPage)
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = files.length === 1 ? `edited_${files[0].name}` : 'merged.pdf'
      link.click()

      URL.revokeObjectURL(url)
    } catch (e) {
      setError('Failed to export PDF')
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }, [pages, files])

  const exportSelectedPages = useCallback(async () => {
    if (selectedPages.size === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const newPdf = await PDFDocument.create()
      const selectedPagesList = pages.filter(p => selectedPages.has(p.id))

      for (const page of selectedPagesList) {
        const file = files.find(f => f.id === page.fileId)
        if (!file) continue

        const sourcePdf = await PDFDocument.load(file.data, { ignoreEncryption: true })
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [page.pageIndex])
        
        if (page.rotation !== 0) {
          copiedPage.setRotation({ angle: page.rotation, type: 0 } as any)
        }
        
        newPdf.addPage(copiedPage)
      }

      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'extracted_pages.pdf'
      link.click()

      URL.revokeObjectURL(url)
    } catch (e) {
      setError('Failed to export selected pages')
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }, [selectedPages, pages, files])

  const unlockPdf = useCallback(async (fileId: string, password: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const sourcePdf = await PDFDocument.load(file.data, { 
        ignoreEncryption: true,
        password 
      } as any)

      const unlockedPdf = await PDFDocument.create()
      const pageIndices = sourcePdf.getPageIndices()
      const copiedPages = await unlockedPdf.copyPages(sourcePdf, pageIndices)
      
      for (const page of copiedPages) {
        unlockedPdf.addPage(page)
      }

      const pdfBytes = await unlockedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `unlocked_${file.name}`
      link.click()

      URL.revokeObjectURL(url)
      
      setLockedFileId(null)
      setUnlockPassword('')
    } catch (e) {
      setError('Failed to unlock PDF. Check the password and try again.')
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }, [files])

  const previewPdf = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    const blob = new Blob([file.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
  }, [files])

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }, [previewUrl])

  const clearAll = useCallback(() => {
    setFiles([])
    setPages([])
    setSelectedPages(new Set())
    setError(null)
  }, [])

  const getFileName = useCallback((fileId: string) => {
    return files.find(f => f.id === fileId)?.name || 'Unknown'
  }, [files])

  const closePendingModal = useCallback(() => {
    setPendingFile(null)
    setUnlockPassword('')
    setModalError(null)
  }, [])

  const closeUnlockModal = useCallback(() => {
    setLockedFileId(null)
    setUnlockPassword('')
  }, [])

  return {
    // State
    files,
    pages,
    selectedPages,
    error,
    isProcessing,
    isDragging,
    draggedPage,
    previewUrl,
    unlockPassword,
    lockedFileId,
    pendingFile,
    modalError,
    inputRef,
    
    // Setters
    setUnlockPassword,
    setLockedFileId,
    
    // Actions
    handleFiles,
    handlePasswordSubmit,
    bypassRestrictions,
    bypassPendingFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    rotatePage,
    deletePage,
    deleteSelectedPages,
    togglePageSelection,
    selectAllPages,
    handlePageDragStart,
    handlePageDragOver,
    handlePageDragEnd,
    exportPdf,
    exportSelectedPages,
    unlockPdf,
    previewPdf,
    closePreview,
    clearAll,
    getFileName,
    closePendingModal,
    closeUnlockModal,
  }
}
