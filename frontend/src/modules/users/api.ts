import { api, type Paginated, type PaginationParams } from '../../lib/api'
import type { User, UserCreate, UserUpdate } from './types'

export async function listUsers(params: PaginationParams): Promise<Paginated<User>> {
  const { data } = await api.get<Paginated<User>>('/users', { params })
  return data
}

export async function createUser(user: UserCreate): Promise<User> {
  const { data } = await api.post<User>('/users', user)
  return data
}

export async function updateUser(userId: string, changes: UserUpdate): Promise<User> {
  const { data } = await api.patch<User>(`/users/${userId}`, changes)
  return data
}
