import { Route, Routes } from 'react-router'
import { AppLayout } from './layouts/AppLayout'
import { HomeRedirect } from './modules/auth/HomeRedirect'
import { LoginPage } from './modules/auth/LoginPage'
import { ProfilePage } from './modules/auth/ProfilePage'
import { ProtectedRoute } from './modules/auth/ProtectedRoute'
import { TenantsPage } from './modules/tenants/TenantsPage'
import { UsersPage } from './modules/users/UsersPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas que requieren sesión iniciada */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<ProtectedRoute permission="tenants:manage" />}>
            <Route path="tenants" element={<TenantsPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="users:read" />}>
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
