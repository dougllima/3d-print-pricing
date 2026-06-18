import { describe, expect, it } from 'vitest'

import type { Material, PrintProfile, PrintQueueItem } from '@/shared/types'

import {
  archivePrintQueueItem,
  canAddPrintRunToQueue,
  cancelPrintQueueItem,
  createPrintQueueItem,
  finishPrintQueueItem,
  getNextQueuePosition,
  getPrintRunMaterialRequirements,
  startPrintQueueItem,
  updatePrintQueueItemDetails,
} from './printQueueService'

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

const trackedMaterials: Material[] = [
  {
    ...materials[0]!,
    remainingWeightGrams: 100,
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

const printProfile: PrintProfile = {
  id: 'profile-1',
  name: 'Porta joias',
  printerId: 'printer-1',
  printRuns: [printRun],
  isActive: true,
  createdAt: now,
  updatedAt: now,
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

  it('updates optional queue item details', () => {
    const item = updatePrintQueueItemDetails({
      item: queueItem,
      now,
      values: {
        clientName: ' Cliente A ',
        deadline: '',
        price: 120,
      },
    })

    expect(item.clientName).toBe('Cliente A')
    expect(item.deadline).toBeUndefined()
    expect(item.price).toBe(120)
    expect(item.updatedAt).toBe(now)
  })

  it('sums material requirements across all plates', () => {
    const requirements = getPrintRunMaterialRequirements({
      ...printRun,
      plates: [
        printRun.plates[0]!,
        {
          ...printRun.plates[0]!,
          id: 'plate-2',
          materials: [
            {
              ...printRun.plates[0]!.materials[0]!,
              id: 'usage-2',
              modelWeightGrams: 25,
            },
          ],
        },
      ],
    })

    expect(requirements).toEqual([
      {
        materialId: 'material-1',
        requiredWeightGrams: 75,
      },
    ])
  })

  it('starts queued items and subtracts controlled material stock once', () => {
    const result = startPrintQueueItem({
      item: queueItem,
      materials: trackedMaterials,
      now,
      printProfiles: [printProfile],
    })

    expect(result.success).toBe(true)

    if (!result.success) {
      return
    }

    expect(result.item.status).toBe('started')
    expect(result.item.stockConsumedAt).toBe(now)
    expect(result.materials[0]?.remainingWeightGrams).toBe(50)

    const idempotentResult = startPrintQueueItem({
      item: { ...result.item, status: 'queued' },
      materials: result.materials,
      now: '2026-06-17T11:00:00.000Z',
      printProfiles: [printProfile],
    })

    expect(idempotentResult.success).toBe(true)

    if (idempotentResult.success) {
      expect(idempotentResult.materials[0]?.remainingWeightGrams).toBe(50)
    }
  })

  it('blocks starting when controlled material stock is insufficient', () => {
    const result = startPrintQueueItem({
      item: queueItem,
      materials: [{ ...trackedMaterials[0]!, remainingWeightGrams: 10 }],
      now,
      printProfiles: [printProfile],
    })

    expect(result).toEqual({
      message: 'Estoque insuficiente para PLA Preto.',
      success: false,
    })
  })

  it('finishes started items without changing stock', () => {
    const result = finishPrintQueueItem({
      item: { ...queueItem, status: 'started', stockConsumedAt: now },
      now,
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.item.status).toBe('finished')
      expect(result.item.finishedAt).toBe(now)
      expect(result.materials).toEqual([])
    }
  })

  it('cancels queued or started items without changing stock', () => {
    const result = cancelPrintQueueItem({
      item: { ...queueItem, status: 'started', stockConsumedAt: now },
      now,
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.item.status).toBe('canceled')
      expect(result.item.stockConsumedAt).toBe(now)
      expect(result.materials).toEqual([])
    }
  })

  it('does not cancel finished items', () => {
    const result = cancelPrintQueueItem({
      item: { ...queueItem, status: 'finished' },
      now,
    })

    expect(result).toEqual({
      message: 'Itens finalizados não podem ser cancelados.',
      success: false,
    })
  })

  it('archives queue items from the active list', () => {
    expect(archivePrintQueueItem({ item: queueItem, now })).toEqual({
      ...queueItem,
      isActive: false,
      updatedAt: now,
    })
  })
})
