// Permisos (mismos valores que backend/app/core/permissions.py).
// En el frontend solo sirven para mostrar u ocultar opciones: la seguridad está en el backend.

export type Permission = 'tenants:manage' | 'users:read' | 'users:manage'

export const PERMISSION_LABELS: Record<Permission, string> = {
  'tenants:manage': 'Administrar empresas',
  'users:read': 'Ver usuarios',
  'users:manage': 'Administrar usuarios',
}
