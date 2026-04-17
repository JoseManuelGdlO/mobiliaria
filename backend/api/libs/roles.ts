export type AppRole = 'Administrador' | 'Administrativo' | 'Repartidor'

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

export const isAllowedRole = (role?: string | null): boolean => normalizeRole(role) !== null
