import { useState, type ReactNode } from 'react'
import { getErrorMessage } from '../lib/api'
import { Alert } from './Alert'
import { Button } from './Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  title: string
  message: ReactNode
  confirmLabel: string
  variant?: 'primary' | 'danger'
  onConfirm: () => Promise<void>
  onClose: () => void
}

/** Pide confirmación antes de una acción. Si la acción falla, muestra el error sin cerrarse. */
export function ConfirmDialog({ title, message, confirmLabel, variant = 'primary', onConfirm, onClose }: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    setIsConfirming(true)
    try {
      await onConfirm()
    } catch (confirmError) {
      setError(getErrorMessage(confirmError))
      setIsConfirming(false)
    }
  }

  return (
    <Modal title={title} size="sm" onClose={isConfirming ? () => undefined : onClose}>
      <div className="text-sm text-slate-600">{message}</div>
      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
          Cancelar
        </Button>
        <Button variant={variant} onClick={handleConfirm} isLoading={isConfirming}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
