import { LoaderCircle, Pencil, Plus, UserCheck, UserX } from 'lucide-react'
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
import { useAuth } from '../auth/authContext'
import { listUsers, updateUser } from './api'
import { RoleBadge } from './RoleBadge'
import type { User } from './types'
import { UserFormModal } from './UserFormModal'

export function UsersPage() {
  const { profile, hasPermission, refreshProfile } = useAuth()
  const canManageUsers = hasPermission('users:manage')
  const currentUserId = profile?.user.id

  const { items: users, total, page, pageSize, setPage, isLoading, error, reload } = usePaginatedList(listUsers)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [statusTarget, setStatusTarget] = useState<User | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const columns: TableColumn[] = [
    { label: 'Usuario' },
    { label: 'Rol' },
    { label: 'Estado' },
    { label: 'Creado' },
    ...(canManageUsers ? [{ label: 'Acciones', align: 'right' as const }] : []),
  ]

  function openCreateForm() {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  function openEditForm(user: User) {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  function handleSaved(user: User, message: string) {
    setIsFormOpen(false)
    setNotice(message)
    reload()
    // Si el usuario editó su propia cuenta, se actualizan los datos de la sesión.
    if (user.id === currentUserId) {
      refreshProfile().catch(() => undefined)
    }
  }

  async function toggleActive(user: User) {
    const updated = await updateUser(user.id, { is_active: !user.is_active })
    setStatusTarget(null)
    setNotice(
      updated.is_active
        ? `Usuario "${updated.full_name}" activado.`
        : `Usuario "${updated.full_name}" desactivado. Ya no podrá iniciar sesión.`,
    )
    reload()
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        description={`Usuarios de ${profile?.tenant?.name ?? 'tu empresa'}.`}
        actions={
          canManageUsers && (
            <Button onClick={openCreateForm}>
              <Plus className="size-4" aria-hidden />
              Nuevo usuario
            </Button>
          )
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
          columns={columns}
          footer={<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}
        >
          {isLoading && users.length === 0 ? (
            <TableMessage colSpan={columns.length}>
              <LoaderCircle className="mx-auto size-5 animate-spin text-slate-400" aria-label="Cargando" />
            </TableMessage>
          ) : users.length === 0 ? (
            <TableMessage colSpan={columns.length}>Todavía no hay usuarios.</TableMessage>
          ) : (
            users.map((user) => {
              const isOwnAccount = user.id === currentUserId
              return (
                <tr key={user.id} className="hover:bg-slate-50">
                  <TableCell>
                    <p className="font-medium text-slate-900">
                      {user.full_name}
                      {isOwnAccount && <span className="ml-2 text-xs font-normal text-slate-500">(tú)</span>}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <Badge tone={user.is_active ? 'green' : 'gray'}>{user.is_active ? 'Activo' : 'Inactivo'}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  {canManageUsers && (
                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditForm(user)}>
                          <Pencil className="size-4" aria-hidden />
                          Editar
                        </Button>
                        {!isOwnAccount &&
                          (user.is_active ? (
                            <Button variant="ghost-danger" size="sm" onClick={() => setStatusTarget(user)}>
                              <UserX className="size-4" aria-hidden />
                              Desactivar
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => setStatusTarget(user)}>
                              <UserCheck className="size-4" aria-hidden />
                              Activar
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  )}
                </tr>
              )
            })
          )}
        </Table>
      </div>

      {isFormOpen && (
        <UserFormModal
          user={selectedUser}
          isOwnAccount={selectedUser !== null && selectedUser.id === currentUserId}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {statusTarget && (
        <ConfirmDialog
          title={statusTarget.is_active ? 'Desactivar usuario' : 'Activar usuario'}
          message={
            statusTarget.is_active ? (
              <>
                ¿Desactivar a <strong>{statusTarget.full_name}</strong>? Perderá el acceso de inmediato. Sus datos se
                conservan y podrás activarlo de nuevo.
              </>
            ) : (
              <>
                ¿Activar a <strong>{statusTarget.full_name}</strong>? Podrá volver a iniciar sesión.
              </>
            )
          }
          confirmLabel={statusTarget.is_active ? 'Desactivar' : 'Activar'}
          variant={statusTarget.is_active ? 'danger' : 'primary'}
          onConfirm={() => toggleActive(statusTarget)}
          onClose={() => setStatusTarget(null)}
        />
      )}
    </>
  )
}
