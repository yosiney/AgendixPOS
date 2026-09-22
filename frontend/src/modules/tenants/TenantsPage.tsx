import { Ban, CircleCheck, LoaderCircle, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '../../components/Alert'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { Pagination } from '../../components/Pagination'
import { Table, TableCell, TableMessage, type TableColumn } from '../../components/Table'
import { usePaginatedList } from '../../hooks/usePaginatedList'
import { formatDate } from '../../lib/format'
import { listTenants, updateTenant } from './api'
import { TenantFormModal } from './TenantFormModal'
import { BUSINESS_TYPE_LABELS, TENANT_STATUS_LABELS, type Tenant } from './types'

const COLUMNS: TableColumn[] = [
  { label: 'Empresa' },
  { label: 'Tipo de negocio' },
  { label: 'Contacto' },
  { label: 'Estado' },
  { label: 'Creada' },
  { label: 'Acciones', align: 'right' },
]

export function TenantsPage() {
  const { items: tenants, total, page, pageSize, setPage, isLoading, error, reload } = usePaginatedList(listTenants)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [statusTarget, setStatusTarget] = useState<Tenant | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function openCreateForm() {
    setSelectedTenant(null)
    setIsFormOpen(true)
  }

  function openEditForm(tenant: Tenant) {
    setSelectedTenant(tenant)
    setIsFormOpen(true)
  }

  function handleSaved(message: string) {
    setIsFormOpen(false)
    setNotice(message)
    reload()
  }

  async function toggleStatus(tenant: Tenant) {
    const updated = await updateTenant(tenant.id, { status: tenant.status === 'active' ? 'suspended' : 'active' })
    setStatusTarget(null)
    setNotice(
      updated.status === 'active'
        ? `Empresa "${updated.name}" activada.`
        : `Empresa "${updated.name}" suspendida. Sus usuarios ya no pueden acceder.`,
    )
    reload()
  }

  return (
    <>
      <PageHeader
        title="Empresas"
        description="Empresas registradas en la plataforma."
        actions={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" aria-hidden />
            Nueva empresa
          </Button>
        }
      />

      <div className="space-y-4">
        {notice && (
          <Alert tone="success" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}

        <Table
          columns={COLUMNS}
          footer={<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}
        >
          {isLoading && tenants.length === 0 ? (
            <TableMessage colSpan={COLUMNS.length}>
              <LoaderCircle className="mx-auto size-5 animate-spin text-slate-400" aria-label="Cargando" />
            </TableMessage>
          ) : tenants.length === 0 ? (
            <TableMessage colSpan={COLUMNS.length}>Todavía no hay empresas registradas.</TableMessage>
          ) : (
            tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50">
                <TableCell>
                  <p className="font-medium text-slate-900">{tenant.name}</p>
                  {tenant.tax_id && <p className="text-xs text-slate-500">ID fiscal: {tenant.tax_id}</p>}
                </TableCell>
                <TableCell>{BUSINESS_TYPE_LABELS[tenant.business_type]}</TableCell>
                <TableCell>
                  {tenant.email || tenant.phone ? (
                    <>
                      {tenant.email && <p>{tenant.email}</p>}
                      {tenant.phone && <p className="text-xs text-slate-500">{tenant.phone}</p>}
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge tone={tenant.status === 'active' ? 'green' : 'red'}>{TENANT_STATUS_LABELS[tenant.status]}</Badge>
                </TableCell>
                <TableCell>{formatDate(tenant.created_at)}</TableCell>
                <TableCell align="right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(tenant)}>
                      <Pencil className="size-4" aria-hidden />
                      Editar
                    </Button>
                    {tenant.status === 'active' ? (
                      <Button variant="ghost-danger" size="sm" onClick={() => setStatusTarget(tenant)}>
                        <Ban className="size-4" aria-hidden />
                        Suspender
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setStatusTarget(tenant)}>
                        <CircleCheck className="size-4" aria-hidden />
                        Activar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </tr>
            ))
          )}
        </Table>
      </div>

      {isFormOpen && (
        <TenantFormModal tenant={selectedTenant} onClose={() => setIsFormOpen(false)} onSaved={handleSaved} />
      )}

      {statusTarget && (
        <ConfirmDialog
          title={statusTarget.status === 'active' ? 'Suspender empresa' : 'Activar empresa'}
          message={
            statusTarget.status === 'active' ? (
              <>
                ¿Suspender <strong>{statusTarget.name}</strong>? Todos sus usuarios perderán el acceso de inmediato
                hasta que la vuelvas a activar.
              </>
            ) : (
              <>
                ¿Activar <strong>{statusTarget.name}</strong>? Sus usuarios activos podrán volver a iniciar sesión.
              </>
            )
          }
          confirmLabel={statusTarget.status === 'active' ? 'Suspender' : 'Activar'}
          variant={statusTarget.status === 'active' ? 'danger' : 'primary'}
          onConfirm={() => toggleStatus(statusTarget)}
          onClose={() => setStatusTarget(null)}
        />
      )}
    </>
  )
}
