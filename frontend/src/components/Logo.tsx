import { Store } from 'lucide-react'

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Store className="size-5" aria-hidden />
      </span>
      <span className={`text-lg font-semibold tracking-tight ${tone === 'light' ? 'text-white' : 'text-slate-900'}`}>
        Agendix<span className="text-brand-500">POS</span>
      </span>
    </div>
  )
}
