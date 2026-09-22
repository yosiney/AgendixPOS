// Almacenamiento del token de acceso (JWT) en el navegador.

const TOKEN_KEY = 'agendixpos_access_token'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin acceso a localStorage no hay token que borrar.
  }
}
