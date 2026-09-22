import type { ReactNode } from 'react'

type Align = 'left' | 'right'

export type TableColumn = {
  label: string
  align?: Align
}

type TableProps = {
  columns: TableColumn[]
  children: ReactNode
  footer?: ReactNode
}

export function Table({ columns, children, footer }: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}

type TableCellProps = {
  children?: ReactNode
  align?: Align
  className?: string
}

export function TableCell({ children, align = 'left', className = '' }: TableCellProps) {
  return (
    <td className={`whitespace-nowrap px-4 py-3 text-slate-700 ${align === 'right' ? 'text-right' : ''} ${className}`}>
      {children}
    </td>
  )
}

/** Fila que ocupa toda la tabla para mensajes como "Cargando…" o "Sin resultados". */
export function TableMessage({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">
        {children}
      </td>
    </tr>
  )
}
