const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium' })

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value))
}
