// Cliente HTTP para comunicarse con el backend (FastAPI).

import axios, { isAxiosError } from 'axios'
import { clearAccessToken, getAccessToken } from './token'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Falta la variable VITE_API_URL en frontend/.env (ver .env.example).')
}

export const api = axios.create({ baseURL: API_URL })

// Agrega el token a cada petición.
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Función que se ejecuta cuando el backend responde 401 (sesión expirada o usuario
// desactivado). La registra AuthProvider para cerrar la sesión.
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && getAccessToken()) {
      clearAccessToken()
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)

// --- Tipos comunes de la API ---

export type PaginationParams = {
  skip: number
  limit: number
}

export type Paginated<T> = {
  items: T[]
  total: number
  skip: number
  limit: number
}

// --- Errores ---

type ValidationIssue = {
  loc?: (string | number)[]
  msg?: string
}

/** Convierte cualquier error de una petición en un mensaje legible para el usuario. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
    }

    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail

    // Errores de la aplicación: {"detail": "mensaje"}
    if (typeof detail === 'string') {
      return detail
    }

    // Errores de validación (422): {"detail": [{"loc": [...], "msg": "..."}]}
    if (Array.isArray(detail) && detail.length > 0) {
      return (detail as ValidationIssue[])
        .map((issue) => {
          const field = issue.loc?.filter((part) => part !== 'body').join('.')
          return field ? `${field}: ${issue.msg}` : issue.msg
        })
        .join(' · ')
    }
  }
  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}
