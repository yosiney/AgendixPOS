import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

type ModalProps = {
  title: string
  description?: string
  size?: ModalSize
  onClose: () => void
  children: ReactNode
}

/** Ventana modal. Se muestra mientras está montada: el padre decide cuándo renderizarla. */
export function Modal({ title, description, size = 'md', onClose, children }: ModalProps) {
  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/50 transition-opacity duration-200 data-closed:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={`w-full ${SIZE_CLASSES[size]} rounded-xl bg-white p-6 shadow-xl transition duration-200 data-closed:scale-95 data-closed:opacity-0`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">{title}</DialogTitle>
                {description && <Description className="mt-1 text-sm text-slate-500">{description}</Description>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
