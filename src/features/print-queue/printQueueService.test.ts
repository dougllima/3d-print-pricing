import { describe, expect, it } from 'vitest'

import type { Material, PrintProfile, PrintQueueItem } from '@/shared/types'

import { canAddPrintRunToQueue, createPrintQueueItem, getNextQueuePosition } from './printQueueService'

const now = '2026-06-17T10:00:00.000Z'

const materials: Material[] = [
  {
    id: 'material-1',
    name: 'PLA Preto',
    type: 'PLA',
    pricePerKg: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

const printRun: PrintProfile['printRuns'][number] = {
  id: 'run-1',
  quantity: 1,
  plates: [
    {
      id: 'plate-1',
      name: 'Base',
      printTimeMinutes: 60,
      materials: [
        {
          id: 'usage-1',
          materialId: 'material-1',
          modelWeightGrams: 50,
          supportWeightGrams: 0,
          purgeWeightGrams: 0,
          otherWasteGrams: 0,
        },
      ],
    },
  ],
}

const queueItem: PrintQueueItem = {
  id: 'queue-1',
  printProfileId: 'profile-1',
  printRunId: 'run-1',
  position: 2,
  status: 'queued',
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

describe('printQueueService', () => {
  it('allows queueing only when every material slot is filled and known', () => {
    expect(canAddPrintRunToQueue({ materials, printRun })).toBe(true)
    expect(
      canAddPrintRunToQueue({
        materials,
        printRun: {
          ...printRun,
          plates: [
            {
              ...printRun.plates[0]!,
              materials: [{ ...printRun.plates[0]!.materials[0]!, materialId: undefined }],
            },
          ],
        },
      }),
    ).toBe(false)
  })

  it('calculates the next queue position', () => {
    expect(getNextQueuePosition([])).toBe(0)
    expect(getNextQueuePosition([queueItem])).toBe(3)
  })

  it('creates queued items for a print profile run', () => {
    const item = createPrintQueueItem({
      existingItems: [queueItem],
      printProfileId: 'profile-1',
      printRunId: 'run-2',
    })

    expect(item.printProfileId).toBe('profile-1')
    expect(item.printRunId).toBe('run-2')
    expect(item.position).toBe(3)
    expect(item.status).toBe('queued')
    expect(item.isActive).toBe(true)
  })
})
