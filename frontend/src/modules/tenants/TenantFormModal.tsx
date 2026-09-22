import { useState, type FormEvent } from 'react'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { SelectField } from '../../components/SelectField'
import { TextField } from '../../components/TextField'
import { getErrorMessage } from '../../lib/api'
import { createTenant, updateTenant } from './api'
import { BUSINESS_TYPE_LABELS, type BusinessType, type Tenant, type TenantAdminCreate } from './types'

type TenantFormModalProps = {
  /** Empresa a editar. `null` para crear una nueva. */
  tenant: Tenant | null
  onClose: () => void
  onSaved: (message: string) => void
}

type CompanyForm = {
  name: string
  business_type: BusinessType
  tax_id: string
  email: string
  phone: string
}

const BUSINESS_TYPE_OPTIONS = (Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((value) => ({
  value,
  label: BUSINESS_TYPE_LABELS[value],
}))

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function TenantFormModal({ tenant, onClose, onSaved }: TenantFormModalProps) {
  const isEditing = tenant !== null

  const [company, setCompany] = useState<CompanyForm>({
    name: tenant?.name ?? '',
    business_type: tenant?.business_type ?? 'other',
    tax_id: tenant?.tax_id ?? '',
    email: tenant?.email ?? '',
    phone: tenant?.phone ?? '',
  })
  const [admin, setAdmin] = useState<TenantAdminCreate>({ full_name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function updateCompany<K extends keyof CompanyForm>(field: K, value: CompanyForm[K]) {
    setCompany((current) => ({ ...current, [field]: value }))
  }

  function updateAdmin(field: keyof TenantAdminCreate, value: string) {
    setAdmin((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    const companyData = {
      name: company.name.trim(),
      business_type: company.business_type,
      tax_id: emptyToNull(company.tax_id),
      email: emptyToNull(company.email),
      phone: emptyToNull(company.phone),
    }

    try {
      if (tenant) {
        const updated = await updateTenant(tenant.id, companyData)
        onSaved(`Empresa "${updated.name}" actualizada.`)
      } else {
        const created = await createTenant({ ...companyData, admin })
        onSaved(
          `Empresa "${created.tenant.name}" creada. Su administrador ya puede iniciar sesión con ${created.admin.email}.`,
        )
      }
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      setIsSaving(false)
    }
  }

  return (
    <Modal
      title={isEditing ? 'Editar empresa' : 'Nueva empresa'}
      description={isEditing ? undefined : 'Registra la empresa y su primer usuario administrador.'}
      size="lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Datos de la empresa</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nombre"
              required
              minLength={2}
              maxLength={120}
              value={company.name}
              onChange={(event) => updateCompany('name', event.target.value)}
              className="sm:col-span-2"
            />
            <SelectField
              label="Tipo de negocio"
              options={BUSINESS_TYPE_OPTIONS}
              value={company.business_type}
              onChange={(event) => updateCompany('business_type', event.target.value as BusinessType)}
            />
            <TextField
              label="Identificación fiscal"
              hint="RUC, NIT, RFC u otro."
              maxLength={30}
              value={company.tax_id}
              onChange={(event) => updateCompany('tax_id', event.target.value)}
            />
            <TextField
              label="Email de contacto"
              type="email"
              value={company.email}
              onChange={(event) => updateCompany('email', event.target.value)}
            />
            <TextField
              label="Teléfono"
              type="tel"
              maxLength={30}
              value={company.phone}
              onChange={(event) => updateCompany('phone', event.target.value)}
            />
          </div>
        </section>

        {!isEditing && (
          <section className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Administrador de la empresa</h3>
              <p className="mt-1 text-sm text-slate-500">Podrá iniciar sesión y crear al resto de usuarios de su empresa.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Nombre completo"
                required
                minLength={2}
                maxLength={120}
                value={admin.full_name}
                onChange={(event) => updateAdmin('full_name', event.target.value)}
                className="sm:col-span-2"
              />
              <TextField
                label="Email"
                type="email"
                required
                autoComplete="off"
                value={admin.email}
                onChange={(event) => updateAdmin('email', event.target.value)}
              />
              <TextField
                label="Contraseña"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                hint="Mínimo 8 caracteres."
                value={admin.password}
                onChange={(event) => updateAdmin('password', event.target.value)}
              />
            </div>
          </section>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isEditing ? 'Guardar cambios' : 'Crear empresa'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
