import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingScreen } from '../../components/LoadingScreen'
import type { Permission } from '../../lib/permissions'
import { useAuth } from './authContext'

type ProtectedRouteProps = {
  /** Permiso necesario para ver las rutas hijas. Sin permiso, solo exige sesión iniciada. */
  permission?: Permission
}

export function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { status, hasPermission } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <LoadingScreen />
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
