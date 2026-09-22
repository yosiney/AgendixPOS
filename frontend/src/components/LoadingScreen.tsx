import { LoaderCircle } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderCircle className="size-8 animate-spin text-brand-600" aria-hidden />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
