import IconX from '~icons/tabler/x'

interface PreviewModalProps {
  url: string | null
  onClose: () => void
}

export function PreviewModal({ url, onClose }: PreviewModalProps) {
  if (!url) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <IconX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <iframe
          src={url}
          className="w-full h-full rounded-lg bg-white"
          title="PDF Preview"
        />
      </div>
    </div>
  )
}
