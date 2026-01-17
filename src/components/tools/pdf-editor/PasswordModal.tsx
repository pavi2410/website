import IconLockOpen from '~icons/tabler/lock-open'
import IconShieldLock from '~icons/tabler/shield-lock'
import IconKey from '~icons/tabler/key'

interface UnlockModalProps {
  isOpen: boolean
  isProcessing: boolean
  password: string
  onPasswordChange: (password: string) => void
  onUnlock: () => void
  onClose: () => void
}

export function UnlockModal({
  isOpen,
  isProcessing,
  password,
  onPasswordChange,
  onUnlock,
  onClose,
}: UnlockModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <IconLockOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Unlock PDF
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the password to remove protection
            </p>
          </div>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Enter password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onUnlock()
          }}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onUnlock}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            {isProcessing ? 'Unlocking...' : 'Unlock & Download'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface PendingFileModalProps {
  isOpen: boolean
  isProcessing: boolean
  password: string
  error: string | null
  onPasswordChange: (password: string) => void
  onSubmit: () => void
  onBypass: () => void
  onClose: () => void
}

export function PendingFileModal({
  isOpen,
  isProcessing,
  password,
  error,
  onPasswordChange,
  onSubmit,
  onBypass,
  onClose,
}: PendingFileModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <IconShieldLock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Password Required
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This PDF is encrypted. Enter the password to open it.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Enter password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit()
          }}
        />

        <div className="flex items-center justify-between">
          <button
            onClick={onBypass}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <IconKey className="w-4 h-4" />
            Try Bypass
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
            >
              {isProcessing ? 'Opening...' : 'Open PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
