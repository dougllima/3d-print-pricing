import type { PrintQueueItem } from '@/shared/types'

export type PrintQueueFilter = 'active' | 'queued' | 'started' | 'finished' | 'canceled' | 'all'

export type PrintQueueFilterOption = {
  label: string
  value: PrintQueueFilter
}

export const printQueueFilterOptions: PrintQueueFilterOption[] = [
  { label: 'Ativas', value: 'active' },
  { label: 'Na fila', value: 'queued' },
  { label: 'Iniciadas', value: 'started' },
  { label: 'Finalizadas', value: 'finished' },
  { label: 'Canceladas', value: 'canceled' },
  { label: 'Todas', value: 'all' },
]

export function sortPrintQueueItems(items: PrintQueueItem[]) {
  return items.toSorted((first, second) => first.position - second.position)
}

export function canReorderPrintQueueItem(item: PrintQueueItem) {
  return item.status === 'queued' || item.status === 'started'
}

export function filterPrintQueueItems(items: PrintQueueItem[], filter: PrintQueueFilter) {
  const archivedItemsHidden = sortPrintQueueItems(items.filter((item) => item.isActive))

  if (filter === 'all') {
    return archivedItemsHidden
  }

  if (filter === 'active') {
    return archivedItemsHidden.filter(canReorderPrintQueueItem)
  }

  return archivedItemsHidden.filter((item) => item.status === filter)
}

export function countPrintQueueItemsByFilter(items: PrintQueueItem[]) {
  return printQueueFilterOptions.reduce(
    (counts, option) => ({
      ...counts,
      [option.value]: filterPrintQueueItems(items, option.value).length,
    }),
    {} as Record<PrintQueueFilter, number>,
  )
}
