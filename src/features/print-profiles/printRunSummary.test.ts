import { describe, expect, it } from 'vitest'

import type { GlobalSettings, Material, Printer, PrintProfile } from '@/shared/types'

import { createPrintRunSummary, findEntityName } from './printRunSummary'

const settings: GlobalSettings = {
  currency: 'BRL',
  electricityCostPerKwh: 1,
  defaultProfitMarginPercent: 50,
  defaultFailureRatePercent: 0,
  defaultLaborHourlyRate: 0,
}

const printer: Printer = {
  id: 'printer-1',
  name: 'A1',
  powerWatts: 100,
  isActive: true,
  createdAt: '2026-06-07T10:00:00.000Z',
  updatedAt: '2026-06-07T10:00:00.000Z',
}

const materials: Material[] = [
  {
    id: 'material-1',
    name: 'PLA Preto',
    type: 'PLA',
    pricePerKg: 100,
    remainingWeightGrams: 30,
    isActive: true,
    createdAt: '2026-06-07T10:00:00.000Z',
    updatedAt: '2026-06-07T10:00:00.000Z',
  },
]

const printRun: PrintProfile['printRuns'][number] = {
  id: 'run-1',
  quantity: 1,
  printTimeMinutes: 60,
  materials: [
    {
      id: 'usage-1',
      materialId: 'material-1',
      modelWeightGrams: 40,
      supportWeightGrams: 5,
      purgeWeightGrams: 0,
      otherWasteGrams: 0,
    },
  ],
}

describe('printRunSummary', () => {
  it('creates render-ready run summaries with cost and stock warnings', () => {
    const summary = createPrintRunSummary({ materials, printRun, printer, settings })

    expect(summary.totalWeightGrams).toBe(45)
    expect(summary.materialUsages[0]?.totalWeightGrams).toBe(45)
    expect(summary.result?.materialCost).toBeCloseTo(4.5)
    expect(summary.result?.energyCost).toBeCloseTo(0.1)
    expect(summary.stockWarnings).toHaveLength(1)
  })

  it('keeps missing entities explicit', () => {
    expect(findEntityName([], undefined)).toBe('Avulsa')
    expect(findEntityName([], 'missing')).toBe('Não encontrado')
  })
})
