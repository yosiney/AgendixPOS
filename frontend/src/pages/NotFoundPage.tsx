import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">La dirección que buscas no existe.</p>
      <Link to="/" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
        Volver al inicio
      </Link>
    </div>
  )
}
