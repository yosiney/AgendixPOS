import { Building2, LogOut, Menu, UserRound, Users, X, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import type { Permission } from '../lib/permissions'
import { ROLE_LABELS } from '../lib/roles'
import { useAuth } from '../modules/auth/authContext'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Permiso necesario para ver la opción. Sin permiso, la ve cualquier usuario. */
  permission?: Permission
}

// Menú lateral. Cada módulo nuevo agrega aquí su entrada.
const NAV_ITEMS: NavItem[] = [
  { to: '/tenants', label: 'Empresas', icon: Building2, permission: 'tenants:manage' },
  { to: '/users', label: 'Usuarios', icon: Users, permission: 'users:read' },
  { to: '/profile', label: 'Mi perfil', icon: UserRound },
]

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export function AppLayout() {
  const { profile, hasPermission, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!profile) return null

  const navItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <div className="min-h-screen">
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setIsMenuOpen(false)} aria-hidden />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 transition-transform lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo tone="light" />
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-md p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {getInitials(profile.user.full_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{profile.user.full_name}</p>
            <p className="truncate text-xs text-slate-400">{ROLE_LABELS[profile.user.role]}</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="rounded-md p-1 text-slate-500 hover:text-slate-900 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">{profile.tenant ? 'Empresa' : 'Plataforma'}</p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {profile.tenant?.name ?? 'Administración de la plataforma'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
