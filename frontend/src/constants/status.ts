export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

export const STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
}

// Helper function to get status label
export const getStatusLabel = (isActive: boolean): string => {
  return isActive ? STATUS_LABELS.active : STATUS_LABELS.inactive
}

// Helper function to get status color classes
export const getStatusColorClasses = (isActive: boolean): string => {
  return isActive
    ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400'
}
