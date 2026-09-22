import { api } from '../../lib/api'
import type { Profile, TokenResponse } from './types'

export async function login(email: string, password: string): Promise<TokenResponse> {
  // El backend usa el formato estándar OAuth2 (form-urlencoded): `username` es el email.
  const body = new URLSearchParams({ username: email, password })
  const { data } = await api.post<TokenResponse>('/auth/login', body)
  return data
}

export async function getProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>('/auth/me')
  return data
}
