// Tipos que reflejan backend/app/modules/auth/schemas.py

import type { Permission } from '../../lib/permissions'
import type { Tenant } from '../tenants/types'
import type { User } from '../users/types'

export type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

/** Respuesta de GET /auth/me */
export type Profile = {
  user: User
  tenant: Tenant | null // null para el Super Admin
  permissions: Permission[]
}
