// Tipos que reflejan backend/app/modules/users/schemas.py

import type { Role, TenantRole } from '../../lib/roles'

export type User = {
  id: string
  tenant_id: string | null
  email: string
  full_name: string
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UserCreate = {
  email: string
  full_name: string
  password: string
  role: TenantRole
}

export type UserUpdate = Partial<UserCreate> & {
  is_active?: boolean
}
