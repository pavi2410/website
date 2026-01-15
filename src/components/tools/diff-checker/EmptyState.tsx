interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-3">{icon}</div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  )
}
