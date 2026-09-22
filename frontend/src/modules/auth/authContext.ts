import { createContext, useContext } from 'react'
import type { Permission } from '../../lib/permissions'
import type { Profile } from './types'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  status: AuthStatus
  profile: Profile | null
  /** Motivo del último cierre de sesión automático (por ejemplo, sesión expirada). */
  sessionMessage: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }
  return context
}
