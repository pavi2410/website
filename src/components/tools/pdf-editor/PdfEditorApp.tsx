import { usePdfEditor } from './usePdfEditor'
import { DropZone } from './DropZone'
import { Toolbar } from './Toolbar'
import { FileList } from './FileList'
import { PageGrid } from './PageGrid'
import { UnlockModal, PendingFileModal } from './PasswordModal'
import { PreviewModal } from './PreviewModal'

export default function PdfEditorApp() {
  const {
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
    setUnlockPassword,
    setLockedFileId,
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
    bypassRestrictions,
    bypassPendingFile,
    handlePasswordSubmit,
    closePendingModal,
    closeUnlockModal,
  } = usePdfEditor()

  // Empty state (but still show password modal if pending)
  if (files.length === 0 && !pendingFile) {
    return (
      <DropZone
        isDragging={isDragging}
        error={error}
        inputRef={inputRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onInputChange={handleInputChange}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <Toolbar
        pagesCount={pages.length}
        selectedCount={selectedPages.size}
        isProcessing={isProcessing}
        inputRef={inputRef}
        onInputChange={handleInputChange}
        onSelectAll={selectAllPages}
        onDeleteSelected={deleteSelectedPages}
        onExtractSelected={exportSelectedPages}
        onClearAll={clearAll}
        onExport={exportPdf}
      />

      {/* Error banner */}
      {error && (
        <div className="shrink-0 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <FileList
          files={files}
          onUnlock={setLockedFileId}
          onBypass={bypassRestrictions}
          onPreview={previewPdf}
        />

        <PageGrid
          pages={pages}
          selectedPages={selectedPages}
          draggedPage={draggedPage}
          filesCount={files.length}
          getFileName={getFileName}
          onToggleSelection={togglePageSelection}
          onRotate={rotatePage}
          onDelete={deletePage}
          onDragStart={handlePageDragStart}
          onDragOver={handlePageDragOver}
          onDragEnd={handlePageDragEnd}
        />
      </div>

      {/* Modals */}
      <UnlockModal
        isOpen={!!lockedFileId}
        isProcessing={isProcessing}
        password={unlockPassword}
        onPasswordChange={setUnlockPassword}
        onUnlock={() => lockedFileId && unlockPdf(lockedFileId, unlockPassword)}
        onClose={closeUnlockModal}
      />

      <PendingFileModal
        isOpen={!!pendingFile}
        isProcessing={isProcessing}
        password={unlockPassword}
        error={modalError}
        onPasswordChange={setUnlockPassword}
        onSubmit={handlePasswordSubmit}
        onBypass={bypassPendingFile}
        onClose={closePendingModal}
      />

      <PreviewModal
        url={previewUrl}
        onClose={closePreview}
      />
    </div>
  )
}
