import { describe, expect, it } from 'vitest'

import type { PrintProfile, PrintQueueItem, Product } from '@/shared/types'

import { createDashboardQueueSummary } from './dashboardQueueSummary'

const now = '2026-07-03T10:00:00.000Z'

const products: Product[] = [
  {
    id: 'product-1',
    name: 'Porta joias',
    categories: [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

const printProfiles: PrintProfile[] = [
  {
    id: 'profile-1',
    productId: 'product-1',
    name: 'Porta joias grande',
    printerId: 'printer-1',
    printRuns: [
      {
        id: 'run-1',
        quantity: 1,
        plates: [
          { id: 'plate-1', name: 'Base', printTimeMinutes: 60, materials: [] },
          { id: 'plate-2', name: 'Tampa', printTimeMinutes: 30, materials: [] },
        ],
      },
    ],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

function createQueueItem(input: Partial<PrintQueueItem> & Pick<PrintQueueItem, 'id' | 'status'>) {
  return {
    printProfileId: 'profile-1',
    printRunId: 'run-1',
    position: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...input,
  } satisfies PrintQueueItem
}

describe('dashboardQueueSummary', () => {
  it('summarizes pending queue workload and urgent deadlines', () => {
    const summary = createDashboardQueueSummary({
      printProfiles,
      products,
      queueItems: [
        createQueueItem({ id: 'overdue', status: 'queued', deadline: '2026-07-02', position: 2 }),
        createQueueItem({ id: 'today', status: 'started', deadline: '2026-07-03', position: 1 }),
        createQueueItem({ id: 'later', status: 'queued', deadline: '2026-07-10', position: 3 }),
        createQueueItem({ id: 'finished', status: 'finished', deadline: '2026-07-01' }),
        createQueueItem({ id: 'archived', status: 'queued', isActive: false }),
      ],
      referenceDate: new Date(2026, 6, 3),
    })

    expect(summary).toMatchObject({
      overdueCount: 1,
      pendingPrintTimeMinutes: 270,
      queuedCount: 2,
      startedCount: 1,
    })
    expect(summary.urgentItems).toEqual([
      {
        deadlineLabel: '02/07/2026',
        deadlineStatus: 'overdue',
        id: 'overdue',
        printProfileName: 'Porta joias grande',
        productName: 'Porta joias',
        statusLabel: 'Atrasado',
      },
      {
        deadlineLabel: '03/07/2026',
        deadlineStatus: 'today',
        id: 'today',
        printProfileName: 'Porta joias grande',
        productName: 'Porta joias',
        statusLabel: 'Hoje',
      },
    ])
  })
})
