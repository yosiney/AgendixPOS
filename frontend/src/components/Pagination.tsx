import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  if (total === 0) return null

  const firstItem = page * pageSize + 1
  const lastItem = Math.min((page + 1) * pageSize, total)
  const lastPage = Math.max(Math.ceil(total / pageSize) - 1, 0)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <p>
        Mostrando <span className="font-medium text-slate-900">{firstItem}</span>–
        <span className="font-medium text-slate-900">{lastItem}</span> de{' '}
        <span className="font-medium text-slate-900">{total}</span>
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden />
          Anterior
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          Siguiente
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
