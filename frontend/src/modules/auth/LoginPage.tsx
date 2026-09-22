import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { LoadingScreen } from '../../components/LoadingScreen'
import { Logo } from '../../components/Logo'
import { TextField } from '../../components/TextField'
import { getErrorMessage } from '../../lib/api'
import { useAuth } from './authContext'

export function LoginPage() {
  const { status, login, sessionMessage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === 'loading') return <LoadingScreen />
  if (status === 'authenticated') return <Navigate to={redirectTo} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (loginError) {
      setError(getErrorMessage(loginError))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-slate-900 p-12 lg:flex">
        <Logo tone="light" />
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Tu punto de venta, en un solo lugar.</h1>
          <p className="mt-4 max-w-md text-lg text-slate-400">
            Sistema POS multiempresa: cada negocio con sus propios usuarios y su información separada.
          </p>
        </div>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} AgendixPOS</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h2 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900 lg:mt-0">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-500">Ingresa con tu email y contraseña.</p>

          {sessionMessage && !error && (
            <Alert tone="warning" className="mt-6">
              {sessionMessage}
            </Alert>
          )}
          {error && (
            <Alert tone="error" className="mt-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Ingresar
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
