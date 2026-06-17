import { describe, expect, it } from 'vitest'

import type {
  GlobalSettings,
  Material,
  Printer,
  PrintProfile,
  PrintQueueItem,
  Product,
} from '@/shared/types'

import { createPrintQueueItemSummary } from './printQueueSummary'

const now = '2026-06-17T10:00:00.000Z'

const settings: GlobalSettings = {
  currency: 'BRL',
  electricityCostPerKwh: 1,
  defaultProfitMarginPercent: 40,
  defaultFailureRatePercent: 0,
  defaultLaborHourlyRate: 0,
}

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

const printers: Printer[] = [
  {
    id: 'printer-1',
    name: 'A1',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

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
    name: 'Porta joias preto',
    printerId: 'printer-1',
    printRuns: [
      {
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
          {
            id: 'plate-2',
            name: 'Tampa',
            printTimeMinutes: 45,
            materials: [
              {
                id: 'usage-2',
                materialId: 'material-1',
                modelWeightGrams: 30,
                supportWeightGrams: 0,
                purgeWeightGrams: 0,
                otherWasteGrams: 0,
              },
            ],
          },
        ],
      },
    ],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

const item: PrintQueueItem = {
  id: 'queue-1',
  printProfileId: 'profile-1',
  printRunId: 'run-1',
  position: 0,
  status: 'queued',
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

describe('printQueueSummary', () => {
  it('creates table-ready queue summaries from referenced print profiles', () => {
    const summary = createPrintQueueItemSummary({
      item,
      materials,
      printers,
      printProfiles,
      products,
      settings,
    })

    expect(summary.productName).toBe('Porta joias')
    expect(summary.filamentNames).toEqual(['PLA Preto'])
    expect(summary.plateCount).toBe(2)
    expect(summary.totalPrintTimeMinutes).toBe(105)
  })
})
