import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getErrorMessage, setUnauthorizedHandler } from '../../lib/api'
import type { Permission } from '../../lib/permissions'
import { clearAccessToken, getAccessToken, saveAccessToken } from '../../lib/token'
import * as authApi from './api'
import { AuthContext, type AuthStatus } from './authContext'
import type { Profile } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (getAccessToken() ? 'loading' : 'anonymous'))
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)

  const endSession = useCallback((message: string | null) => {
    clearAccessToken()
    setProfile(null)
    setStatus('anonymous')
    setSessionMessage(message)
  }, [])

  // Al abrir la app con un token guardado, se valida contra el backend.
  useEffect(() => {
    if (!getAccessToken()) return
    let ignore = false

    authApi
      .getProfile()
      .then((data) => {
        if (!ignore) {
          setProfile(data)
          setStatus('authenticated')
        }
      })
      .catch((error: unknown) => {
        if (!ignore) endSession(getErrorMessage(error))
      })

    return () => {
      ignore = true
    }
  }, [endSession])

  // Si el backend responde 401 en cualquier petición, se cierra la sesión.
  useEffect(() => {
    setUnauthorizedHandler(() => endSession('Tu sesión expiró. Inicia sesión nuevamente.'))
    return () => setUnauthorizedHandler(null)
  }, [endSession])

  const login = useCallback(async (email: string, password: string) => {
    const token = await authApi.login(email, password)
    saveAccessToken(token.access_token)
    try {
      const data = await authApi.getProfile()
      setProfile(data)
      setStatus('authenticated')
      setSessionMessage(null)
    } catch (error) {
      clearAccessToken()
      throw error
    }
  }, [])

  const logout = useCallback(() => endSession(null), [endSession])

  const refreshProfile = useCallback(async () => {
    setProfile(await authApi.getProfile())
  }, [])

  const value = useMemo(
    () => ({
      status,
      profile,
      sessionMessage,
      login,
      logout,
      refreshProfile,
      hasPermission: (permission: Permission) => profile?.permissions.includes(permission) ?? false,
    }),
    [status, profile, sessionMessage, login, logout, refreshProfile],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
