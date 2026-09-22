import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertTone = 'error' | 'success' | 'warning' | 'info'

const TONE_STYLES: Record<AlertTone, { className: string; icon: LucideIcon }> = {
  error: { className: 'border-red-200 bg-red-50 text-red-800', icon: CircleAlert },
  success: { className: 'border-green-200 bg-green-50 text-green-800', icon: CircleCheck },
  warning: { className: 'border-amber-200 bg-amber-50 text-amber-800', icon: TriangleAlert },
  info: { className: 'border-blue-200 bg-blue-50 text-blue-800', icon: Info },
}

type AlertProps = {
  tone?: AlertTone
  children: ReactNode
  onDismiss?: () => void
  className?: string
}

export function Alert({ tone = 'info', children, onDismiss, className = '' }: AlertProps) {
  const { className: toneClassName, icon: Icon } = TONE_STYLES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${toneClassName} ${className}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Cerrar aviso">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
