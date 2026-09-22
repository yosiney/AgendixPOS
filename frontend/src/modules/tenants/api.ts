import { api, type Paginated, type PaginationParams } from '../../lib/api'
import type { Tenant, TenantCreate, TenantCreated, TenantUpdate } from './types'

export async function listTenants(params: PaginationParams): Promise<Paginated<Tenant>> {
  const { data } = await api.get<Paginated<Tenant>>('/tenants', { params })
  return data
}

export async function createTenant(tenant: TenantCreate): Promise<TenantCreated> {
  const { data } = await api.post<TenantCreated>('/tenants', tenant)
  return data
}

export async function updateTenant(tenantId: string, changes: TenantUpdate): Promise<Tenant> {
  const { data } = await api.patch<Tenant>(`/tenants/${tenantId}`, changes)
  return data
}
