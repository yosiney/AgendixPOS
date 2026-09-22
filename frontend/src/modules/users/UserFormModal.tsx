import { useState, type FormEvent } from 'react'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { SelectField } from '../../components/SelectField'
import { TextField } from '../../components/TextField'
import { getErrorMessage } from '../../lib/api'
import { ROLE_LABELS, TENANT_ROLES, type TenantRole } from '../../lib/roles'
import { createUser, updateUser } from './api'
import type { User, UserCreate, UserUpdate } from './types'

type UserFormModalProps = {
  /** Usuario a editar. `null` para crear uno nuevo. */
  user: User | null
  /** El backend no permite cambiar el propio rol. */
  isOwnAccount: boolean
  onClose: () => void
  onSaved: (user: User, message: string) => void
}

const ROLE_OPTIONS = TENANT_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))

export function UserFormModal({ user, isOwnAccount, onClose, onSaved }: UserFormModalProps) {
  const isEditing = user !== null

  const [form, setForm] = useState<UserCreate>({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role === 'admin' ? 'admin' : 'employee',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function updateField<K extends keyof UserCreate>(field: K, value: UserCreate[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      if (user) {
        const changes: UserUpdate = { full_name: form.full_name.trim(), email: form.email }
        if (!isOwnAccount) changes.role = form.role
        if (form.password) changes.password = form.password

        const updated = await updateUser(user.id, changes)
        onSaved(updated, `Usuario "${updated.full_name}" actualizado.`)
      } else {
        const created = await createUser({ ...form, full_name: form.full_name.trim() })
        onSaved(created, `Usuario "${created.full_name}" creado. Ya puede iniciar sesión con ${created.email}.`)
      }
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      setIsSaving(false)
    }
  }

  return (
    <Modal title={isEditing ? 'Editar usuario' : 'Nuevo usuario'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Nombre completo"
          required
          minLength={2}
          maxLength={120}
          value={form.full_name}
          onChange={(event) => updateField('full_name', event.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="off"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
        />
        <SelectField
          label="Rol"
          options={ROLE_OPTIONS}
          value={form.role}
          disabled={isOwnAccount}
          hint={isOwnAccount ? 'No puedes cambiar tu propio rol.' : undefined}
          onChange={(event) => updateField('role', event.target.value as TenantRole)}
        />
        <TextField
          label={isEditing ? 'Nueva contraseña' : 'Contraseña'}
          type="password"
          required={!isEditing}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          hint={isEditing ? 'Déjala vacía para mantener la contraseña actual.' : 'Mínimo 8 caracteres.'}
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
        />

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
