import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage, type Paginated, type PaginationParams } from '../lib/api'

const DEFAULT_PAGE_SIZE = 20

/**
 * Carga una lista paginada desde la API.
 * `fetchPage` debe ser una función estable (por ejemplo, una función de `api.ts`).
 */
export function usePaginatedList<T>(
  fetchPage: (params: PaginationParams) => Promise<Paginated<T>>,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Paginated<T> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let ignore = false
    setIsLoading(true)

    fetchPage({ skip: page * pageSize, limit: pageSize })
      .then((result) => {
        if (!ignore) {
          setData(result)
          setError(null)
        }
      })
      .catch((requestError: unknown) => {
        if (!ignore) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [fetchPage, page, pageSize, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    pageSize,
    setPage,
    isLoading,
    error,
    reload,
  }
}
