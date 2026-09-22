import type { ReactNode } from 'react'
import { Badge } from '../../components/Badge'
import { PageHeader } from '../../components/PageHeader'
import { formatDate } from '../../lib/format'
import { PERMISSION_LABELS } from '../../lib/permissions'
import { BUSINESS_TYPE_LABELS, TENANT_STATUS_LABELS } from '../tenants/types'
import { RoleBadge } from '../users/RoleBadge'
import { useAuth } from './authContext'

export function ProfilePage() {
  const { profile } = useAuth()
  if (!profile) return null

  const { user, tenant, permissions } = profile

  return (
    <>
      <PageHeader title="Mi perfil" description="Tu cuenta y la empresa a la que perteneces." />

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Usuario">
          <InfoRow label="Nombre" value={user.full_name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Rol" value={<RoleBadge role={user.role} />} />
          <InfoRow label="Miembro desde" value={formatDate(user.created_at)} />
        </InfoCard>

        <InfoCard title="Empresa">
          {tenant ? (
            <>
              <InfoRow label="Nombre" value={tenant.name} />
              <InfoRow label="Tipo de negocio" value={BUSINESS_TYPE_LABELS[tenant.business_type]} />
              <InfoRow label="Identificación fiscal" value={tenant.tax_id} />
              <InfoRow label="Email" value={tenant.email} />
              <InfoRow label="Teléfono" value={tenant.phone} />
              <InfoRow
                label="Estado"
                value={<Badge tone={tenant.status === 'active' ? 'green' : 'red'}>{TENANT_STATUS_LABELS[tenant.status]}</Badge>}
              />
            </>
          ) : (
            <p className="py-3 text-sm text-slate-500">
              Como Super Admin administras la plataforma completa y no perteneces a ninguna empresa.
            </p>
          )}
        </InfoCard>

        <InfoCard title="Permisos" className="lg:col-span-2">
          {permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2 py-3">
              {permissions.map((permission) => (
                <Badge key={permission} tone="brand">
                  {PERMISSION_LABELS[permission] ?? permission}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="py-3 text-sm text-slate-500">
              Tu rol todavía no tiene permisos adicionales. Se habilitarán a medida que se agreguen los módulos del POS.
            </p>
          )}
        </InfoCard>
      </div>
    </>
  )
}

function InfoCard({ title, className = '', children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xs ${className}`}>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 divide-y divide-slate-100">{children}</div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  )
}
