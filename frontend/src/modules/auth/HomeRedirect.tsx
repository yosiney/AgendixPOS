import { Navigate } from 'react-router'
import { useAuth } from './authContext'

/** Envía a cada usuario a la primera sección que puede usar según sus permisos. */
export function HomeRedirect() {
  const { hasPermission } = useAuth()

  if (hasPermission('tenants:manage')) return <Navigate to="/tenants" replace />
  if (hasPermission('users:read')) return <Navigate to="/users" replace />
  return <Navigate to="/profile" replace />
}
