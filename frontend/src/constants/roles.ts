export const USER_ROLES = {
  ADMIN: 'admin',
  INSPECTOR: 'inspector',
  TECHNICIAN: 'technician',
  VIEWER: 'viewer',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.INSPECTOR]: 'Kiểm tra viên',
  [USER_ROLES.TECHNICIAN]: 'Kỹ thuật viên',
  [USER_ROLES.VIEWER]: 'Quan sát viên',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'purple',
  [USER_ROLES.INSPECTOR]: 'blue',
  [USER_ROLES.TECHNICIAN]: 'orange',
  [USER_ROLES.VIEWER]: 'gray',
}

export const ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: ROLE_LABELS[USER_ROLES.ADMIN] },
  { value: USER_ROLES.INSPECTOR, label: ROLE_LABELS[USER_ROLES.INSPECTOR] },
  { value: USER_ROLES.TECHNICIAN, label: ROLE_LABELS[USER_ROLES.TECHNICIAN] },
  { value: USER_ROLES.VIEWER, label: ROLE_LABELS[USER_ROLES.VIEWER] },
]

// Helper function to get role label
export const getRoleLabel = (role: UserRole): string => {
  return ROLE_LABELS[role] || role
}

// Helper function to get role color classes
export const getRoleColorClasses = (role: UserRole): string => {
  const color = ROLE_COLORS[role] || 'gray'
  
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400',
  }
  
  return colorMap[color] || colorMap.gray
}
