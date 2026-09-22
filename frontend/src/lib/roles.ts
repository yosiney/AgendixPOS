// Roles de usuario (mismos valores que backend/app/core/roles.py).

export type Role = 'super_admin' | 'admin' | 'employee'

/** Roles que se pueden asignar a los usuarios de una empresa. */
export type TenantRole = Exclude<Role, 'super_admin'>

export const TENANT_ROLES: TenantRole[] = ['admin', 'employee']

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  employee: 'Empleado',
}
