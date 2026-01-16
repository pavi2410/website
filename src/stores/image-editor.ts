import { atom, computed, map } from 'nanostores'

// Use sessionStorage with unique tab ID for multi-tab support
const TAB_ID = typeof window !== 'undefined' 
  ? sessionStorage.getItem('image-editor-tab-id') || crypto.randomUUID()
  : 'ssr'
if (typeof window !== 'undefined') {
  sessionStorage.setItem('image-editor-tab-id', TAB_ID)
}
const STORAGE_KEY = `image-editor-state-${TAB_ID}`

// === Types ===
export type ImageFormat = 'png' | 'jpeg' | 'webp'
export type RotationDegree = 0 | 90 | 180 | 270

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface Transforms {
  resize: { width: number; height: number } | null
  crop: CropRect | null
  rotation: RotationDegree
  flipH: boolean
  flipV: boolean
  brightness: number
  contrast: number
  saturation: number
}

export interface ImageMeta {
  name: string
  type: string
  size: number
  width: number
  height: number
}

const DEFAULT_TRANSFORMS: Transforms = {
  resize: null,
  crop: null,
  rotation: 0,
  flipH: false,
  flipV: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
}

// === Atoms ===

export const $originalImage = atom<ImageBitmap | null>(null)
export const $originalDataUrl = atom<string | null>(null)
export const $originalMeta = atom<ImageMeta | null>(null)

export const $transforms = map<Transforms>({ ...DEFAULT_TRANSFORMS })

export const $past = atom<Transforms[]>([])
export const $future = atom<Transforms[]>([])

export const $format = atom<ImageFormat>('png')
export const $estimatedFileSize = atom<number | null>(null)
export const $quality = atom(1)
export const $targetFileSize = atom<number | null>(null)

export const $activePanel = atom<'resize' | 'crop' | 'adjust' | 'format'>('resize')
export const $isComparing = atom(false)
export const $zoom = atom(1)
export const $isCropping = atom(false)

// Temporary crop selection (not committed to history until Apply)
export const $cropSelection = atom<CropRect>({ x: 0, y: 0, width: 1, height: 1 })

// === Computed ===

export const $canUndo = computed($past, past => past.length > 0)
export const $canRedo = computed($future, future => future.length > 0)
export const $hasChanges = computed($transforms, t =>
  JSON.stringify(t) !== JSON.stringify(DEFAULT_TRANSFORMS)
)

// Dimensions after crop (before resize) - used for resize panel
export const $croppedDimensions = computed(
  [$originalMeta, $transforms],
  (meta, transforms) => {
    if (!meta) return null
    let { width, height } = meta

    if (transforms.crop) {
      width = Math.round(width * transforms.crop.width)
      height = Math.round(height * transforms.crop.height)
    }

    return { width, height }
  }
)

export const $outputDimensions = computed(
  [$originalMeta, $transforms],
  (meta, transforms) => {
    if (!meta) return null
    let { width, height } = meta

    if (transforms.crop) {
      width = Math.round(width * transforms.crop.width)
      height = Math.round(height * transforms.crop.height)
    }

    if (transforms.resize) {
      width = transforms.resize.width
      height = transforms.resize.height
    }

    if (transforms.rotation === 90 || transforms.rotation === 270) {
      [width, height] = [height, width]
    }

    return { width, height }
  }
)

// === Actions ===

function snapshot(): Transforms {
  return { ...$transforms.get() }
}

function pushHistory() {
  $past.set([...$past.get(), snapshot()])
  $future.set([])
}

export const actions = {
  async loadImage(file: File) {
    const image = await createImageBitmap(file)
    const meta: ImageMeta = {
      name: file.name,
      type: file.type,
      size: file.size,
      width: image.width,
      height: image.height,
    }

    // Convert to data URL for persistence
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    const dataUrl = canvas.toDataURL(file.type || 'image/png')

    // Set default format based on source
    const sourceFormat = file.type.split('/')[1] as ImageFormat
    const validFormat = ['png', 'jpeg', 'webp'].includes(sourceFormat) ? sourceFormat : 'png'

    $originalImage.get()?.close()
    $originalImage.set(image)
    $originalDataUrl.set(dataUrl)
    $originalMeta.set(meta)
    $transforms.set({ ...DEFAULT_TRANSFORMS })
    $format.set(validFormat)
    $past.set([])
    $future.set([])
    
    persistState()
  },

  clearImage() {
    $originalImage.get()?.close()
    $originalImage.set(null)
    $originalDataUrl.set(null)
    $originalMeta.set(null)
    $transforms.set({ ...DEFAULT_TRANSFORMS })
    $past.set([])
    $future.set([])
    clearPersistedState()
  },

  undo() {
    const past = $past.get()
    if (past.length === 0) return

    $future.set([snapshot(), ...$future.get()])
    $transforms.set({ ...past.at(-1)! })
    $past.set(past.slice(0, -1))
  },

  redo() {
    const future = $future.get()
    if (future.length === 0) return

    $past.set([...$past.get(), snapshot()])
    $transforms.set({ ...future[0] })
    $future.set(future.slice(1))
  },

  reset() {
    if (JSON.stringify($transforms.get()) === JSON.stringify(DEFAULT_TRANSFORMS)) return
    pushHistory()
    $transforms.set({ ...DEFAULT_TRANSFORMS })
  },

  setResize(width: number, height: number) {
    pushHistory()
    $transforms.setKey('resize', { width, height })
  },

  clearResize() {
    if ($transforms.get().resize === null) return
    pushHistory()
    $transforms.setKey('resize', null)
  },

  setCrop(crop: CropRect) {
    pushHistory()
    $transforms.setKey('crop', crop)
  },

  clearCrop() {
    if ($transforms.get().crop === null) return
    pushHistory()
    $transforms.setKey('crop', null)
  },

  rotate(direction: 'cw' | 'ccw') {
    pushHistory()
    const current = $transforms.get().rotation
    const delta = direction === 'cw' ? 90 : -90
    const next = ((current + delta + 360) % 360) as RotationDegree
    $transforms.setKey('rotation', next)
  },

  flip(axis: 'h' | 'v') {
    pushHistory()
    const key = axis === 'h' ? 'flipH' : 'flipV'
    $transforms.setKey(key, !$transforms.get()[key])
  },

  setAdjustment(key: 'brightness' | 'contrast' | 'saturation', value: number) {
    pushHistory()
    $transforms.setKey(key, value)
  },

  resetAdjustments() {
    const t = $transforms.get()
    if (t.brightness === 0 && t.contrast === 0 && t.saturation === 0) return
    pushHistory()
    $transforms.setKey('brightness', 0)
    $transforms.setKey('contrast', 0)
    $transforms.setKey('saturation', 0)
  },

  setFormat: (f: ImageFormat) => $format.set(f),
  setQuality: (q: number) => $quality.set(q),
  setTargetSize: (s: number | null) => $targetFileSize.set(s),

  setPanel: (p: 'resize' | 'crop' | 'adjust' | 'format') => $activePanel.set(p),
  toggleCompare: () => $isComparing.set(!$isComparing.get()),
  setZoom: (z: number) => $zoom.set(z),
  setIsCropping: (v: boolean) => $isCropping.set(v),
  
  async restoreFromStorage(): Promise<boolean> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return false
      
      const { dataUrl, meta, transforms, format, quality } = JSON.parse(saved)
      if (!dataUrl || !meta) return false
      
      // Restore image from data URL
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const image = await createImageBitmap(blob)
      
      $originalImage.get()?.close()
      $originalImage.set(image)
      $originalDataUrl.set(dataUrl)
      $originalMeta.set(meta)
      $transforms.set(transforms || { ...DEFAULT_TRANSFORMS })
      $format.set(format || 'png')
      $quality.set(quality || 1)
      $past.set([])
      $future.set([])
      
      return true
    } catch (e) {
      console.warn('Failed to restore image editor state:', e)
      return false
    }
  },
}

function persistState() {
  try {
    const dataUrl = $originalDataUrl.get()
    const meta = $originalMeta.get()
    if (!dataUrl || !meta) return
    
    const state = {
      dataUrl,
      meta,
      transforms: $transforms.get(),
      format: $format.get(),
      quality: $quality.get(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to persist image editor state:', e)
  }
}

function clearPersistedState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // Ignore
  }
}

// Subscribe to transform changes for auto-save
$transforms.subscribe(() => {
  if ($originalImage.get()) {
    persistState()
  }
})

$format.subscribe(() => {
  if ($originalImage.get()) {
    persistState()
  }
})

$quality.subscribe(() => {
  if ($originalImage.get()) {
    persistState()
  }
})
