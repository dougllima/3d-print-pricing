import type { PrintProfile, PrintQueueItem, Product } from '@/shared/types'

import {
  createPrintQueueDeadlineInfo,
  type PrintQueueDeadlineStatus,
} from '../print-queue/printQueueDeadline'

export type DashboardQueueUrgentItem = {
  deadlineLabel: string
  deadlineStatus: 'overdue' | 'today' | 'tomorrow'
  id: string
  printProfileName: string
  productName: string
  statusLabel: string
}

export type DashboardQueueSummary = {
  overdueCount: number
  pendingPrintTimeMinutes: number
  queuedCount: number
  startedCount: number
  urgentItems: DashboardQueueUrgentItem[]
}

function findById<TEntity extends { id: string }>(items: TEntity[], id?: string) {
  if (id === undefined) {
    return undefined
  }

  return items.find((item) => item.id === id)
}

function getPrintRunTimeMinutes(item: PrintQueueItem, printProfiles: PrintProfile[]) {
  const printProfile = findById(printProfiles, item.printProfileId)
  const printRun = printProfile?.printRuns.find((run) => run.id === item.printRunId)

  return (
    printRun?.plates.reduce((totalMinutes, plate) => totalMinutes + plate.printTimeMinutes, 0) ?? 0
  )
}

function isPendingQueueItem(item: PrintQueueItem) {
  return item.isActive && (item.status === 'queued' || item.status === 'started')
}

function isUrgentDeadlineStatus(
  status: PrintQueueDeadlineStatus,
): status is DashboardQueueUrgentItem['deadlineStatus'] {
  return status === 'overdue' || status === 'today' || status === 'tomorrow'
}

export function createDashboardQueueSummary(input: {
  printProfiles: PrintProfile[]
  products: Product[]
  queueItems: PrintQueueItem[]
  referenceDate?: Date
}): DashboardQueueSummary {
  const pendingItems = input.queueItems.filter(isPendingQueueItem)
  const urgentQueueItems = pendingItems
    .flatMap((item) => {
      const deadline = createPrintQueueDeadlineInfo(item.deadline, input.referenceDate)

      return isUrgentDeadlineStatus(deadline.status)
        ? [
            {
              deadlineLabel: deadline.dateLabel,
              deadlineStatus: deadline.status,
              item,
              statusLabel: deadline.statusLabel,
            },
          ]
        : []
    })
    .toSorted((first, second) => {
      const deadlineComparison = (first.item.deadline ?? '').localeCompare(second.item.deadline ?? '')

      return deadlineComparison === 0
        ? first.item.position - second.item.position
        : deadlineComparison
    })

  return {
    overdueCount: urgentQueueItems.filter(
      ({ deadlineStatus }) => deadlineStatus === 'overdue',
    ).length,
    pendingPrintTimeMinutes: pendingItems.reduce(
      (totalMinutes, item) => totalMinutes + getPrintRunTimeMinutes(item, input.printProfiles),
      0,
    ),
    queuedCount: pendingItems.filter((item) => item.status === 'queued').length,
    startedCount: pendingItems.filter((item) => item.status === 'started').length,
    urgentItems: urgentQueueItems.map(
      ({ deadlineLabel, deadlineStatus, item, statusLabel }) => {
      const printProfile = findById(input.printProfiles, item.printProfileId)
      const product = findById(input.products, printProfile?.productId)

      return {
        deadlineLabel,
        deadlineStatus,
        id: item.id,
        printProfileName: printProfile?.name ?? 'Impressão não encontrada',
        productName: product?.name ?? 'Produto avulso',
        statusLabel,
      }
      },
    ),
  }
}
