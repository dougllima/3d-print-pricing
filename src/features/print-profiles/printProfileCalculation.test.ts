import { describe, expect, it } from 'vitest'

import type { GlobalSettings, Material, Printer, PrintProfile } from '@/shared/types'

import { createCostCalculationFromPrintRun } from './printProfileCalculation'

const now = '2026-06-19T10:00:00.000Z'

const settings: GlobalSettings = {
  currency: 'BRL',
  electricityCostPerKwh: 1,
  defaultProfitMarginPercent: 50,
  defaultFailureRatePercent: 5,
  defaultLaborHourlyRate: 0,
}

const printer: Printer = {
  id: 'printer-1',
  name: 'A1',
  powerWatts: 100,
  isActive: true,
  createdAt: now,
  updatedAt: now,
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
  {
    id: 'material-2',
    name: 'PLA Branco',
    type: 'PLA',
    pricePerKg: 200,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

const printRun: PrintProfile['printRuns'][number] = {
  id: 'run-1',
  quantity: 2,
  plates: [
    {
      id: 'plate-1',
      name: 'Base',
      printTimeMinutes: 90,
      materials: [
        {
          id: 'usage-1',
          materialId: 'material-1',
          modelWeightGrams: 40,
          supportWeightGrams: 5,
          purgeWeightGrams: 0,
          otherWasteGrams: 0,
        },
        {
          id: 'usage-2',
          materialId: 'material-2',
          modelWeightGrams: 10,
          supportWeightGrams: 0,
          purgeWeightGrams: 5,
          otherWasteGrams: 0,
        },
      ],
    },
  ],
}

const printProfile: PrintProfile = {
  id: 'profile-1',
  productId: 'product-1',
  name: 'Porta joias',
  printerId: 'printer-1',
  printRuns: [printRun],
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

describe('printProfileCalculation', () => {
  it('creates a historical calculation snapshot from a print run', () => {
    const calculation = createCostCalculationFromPrintRun({
      createdAt: now,
      id: 'calculation-1',
      materials,
      printer,
      printProfile,
      printRun,
      settings,
    })

    expect(calculation).toMatchObject({
      id: 'calculation-1',
      productId: 'product-1',
      printProfileId: 'profile-1',
      name: 'Porta joias (2 un.)',
      snapshot: {
        materialName: 'PLA Preto, PLA Branco',
        printerName: 'A1',
        profitMarginPercent: 50,
        failureRatePercent: 5,
      },
      input: {
        quantity: 2,
        printTimeHours: 1.5,
        modelWeightGrams: 50,
        supportWeightGrams: 5,
        purgeWeightGrams: 5,
        otherWasteGrams: 0,
      },
      createdAt: now,
    })
    expect(calculation?.result.materialCost).toBeCloseTo(7.5)
    expect(calculation?.snapshot.materialPricePerKg).toBeCloseTo(125)
  })

  it('does not create a calculation when the print run cannot be priced', () => {
    expect(
      createCostCalculationFromPrintRun({
        materials,
        printer: undefined,
        printProfile,
        printRun,
        settings,
      }),
    ).toBeUndefined()
  })

  it('applies calculation overrides and finishing tasks to the snapshot', () => {
    const calculation = createCostCalculationFromPrintRun({
      createdAt: now,
      failureRatePercent: 10,
      finishingTasks: [
        {
          id: 'finishing-1',
          name: 'Montagem',
          hours: 1,
          hourlyRate: 20,
          materialCost: 5,
        },
      ],
      id: 'calculation-2',
      materials,
      printer,
      printProfile,
      printRun,
      profitMarginPercent: 25,
      settings,
    })

    expect(calculation?.snapshot).toMatchObject({
      failureRatePercent: 10,
      profitMarginPercent: 25,
    })
    expect(calculation?.finishingTasks).toHaveLength(1)
    expect(calculation?.result.finishingCost).toBe(25)
    expect(calculation?.result.suggestedPrice).toBeCloseTo(
      (calculation?.result.totalCost ?? 0) / 0.75,
    )
  })
})
