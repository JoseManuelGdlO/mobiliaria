export type AppRole = 'Administrador' | 'Administrativo' | 'Repartidor'

export type AppPermission =
  | 'workers'
  | 'statistics'
  | 'finance'

const rolePermissions: Record<AppRole, AppPermission[]> = {
  Administrador: ['workers', 'statistics', 'finance'],
  Administrativo: [],
  Repartidor: [],
}

const roleAlias: Record<string, AppRole> = {
  administrador: 'Administrador',
  administrativo: 'Administrativo',
  repartidor: 'Repartidor',
}

export const normalizeRole = (role?: string | null): AppRole | null => {
  if (typeof role !== 'string' || role.trim().length === 0) {
    return null
  }

  return roleAlias[role.trim().toLowerCase()] ?? null
}

export const canAccess = (role: string | undefined | null, permission: AppPermission): boolean => {
  const normalized = normalizeRole(role)
  if (normalized == null) {
    return false
  }

  return rolePermissions[normalized].includes(permission)
}

export const isDeliveryRole = (role: string | undefined | null): boolean => normalizeRole(role) === 'Repartidor'
