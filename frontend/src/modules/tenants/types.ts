// Tipos que reflejan backend/app/modules/tenants/schemas.py

import type { User } from '../users/types'

export type BusinessType = 'motorcycle_parts' | 'bicycle_parts' | 'supermarket' | 'retail_store' | 'other'

export type TenantStatus = 'active' | 'suspended'

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  motorcycle_parts: 'Repuestos de motos',
  bicycle_parts: 'Repuestos de bicicletas',
  supermarket: 'Supermercado',
  retail_store: 'Tienda',
  other: 'Otro',
}

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  active: 'Activa',
  suspended: 'Suspendida',
}

export type Tenant = {
  id: string
  name: string
  business_type: BusinessType
  tax_id: string | null
  email: string | null
  phone: string | null
  status: TenantStatus
  created_at: string
  updated_at: string
}

export type TenantAdminCreate = {
  email: string
  full_name: string
  password: string
}

export type TenantCreate = {
  name: string
  business_type: BusinessType
  tax_id: string | null
  email: string | null
  phone: string | null
  admin: TenantAdminCreate
}

export type TenantUpdate = Partial<Omit<TenantCreate, 'admin'>> & {
  status?: TenantStatus
}

export type TenantCreated = {
  tenant: Tenant
  admin: User
}
