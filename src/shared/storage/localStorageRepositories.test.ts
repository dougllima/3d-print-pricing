import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS } from '@/shared/constants'
import type { CostCalculation, Material } from '@/shared/types'
import { defaultSettings } from '@/shared/types'

import { createLocalStorageRepositories } from './localStorageRepositories'

const now = '2026-06-03T17:00:00.000Z'

const material: Material = {
  id: 'material-1',
  name: 'PLA Preto',
  type: 'PLA',
  pricePerKg: 90,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

const costCalculation: CostCalculation = {
  id: 'calculation-1',
  productId: 'product-1',
  printProfileId: 'profile-1',
  name: 'Suporte de controle - PLA Preto',
  snapshot: {
    materialName: 'PLA Preto',
    materialPricePerKg: 90,
    printerName: 'Ender 3',
    printerPowerWatts: 200,
    printerPurchasePrice: 1500,
    printerEstimatedLifetimeHours: 1000,
    printerMaintenanceCostPerHour: 0.5,
    electricityCostPerKwh: 1,
    profitMarginPercent: 40,
    failureRatePercent: 5,
  },
  input: {
    quantity: 1,
    printTimeHours: 2,
    modelWeightGrams: 50,
    supportWeightGrams: 5,
    purgeWeightGrams: 0,
    otherWasteGrams: 0,
  },
  finishingTasks: [],
  result: {
    materialCost: 4.95,
    energyCost: 0.4,
    machineCost: 3,
    maintenanceCost: 1,
    failureReserveCost: 0.4175,
    printingCost: 8.35,
    finishingCost: 0,
    totalCost: 8.7675,
    suggestedPrice: 14.6125,
    estimatedProfit: 5.845,
    realMarginPercent: 40,
    totalWeightGrams: 55,
    wasteWeightGrams: 5,
    wastePercent: 9.0909090909,
  },
  createdAt: now,
}

describe('localStorage repositories', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('seeds default settings when no settings were saved yet', async () => {
    const repositories = createLocalStorageRepositories(localStorage)

    await expect(repositories.settings.get()).resolves.toEqual(defaultSettings)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) ?? '{}')).toEqual({
      currency: 'BRL',
      electricityCostPerKwh: 0,
      defaultProfitMarginPercent: 40,
      defaultFailureRatePercent: 5,
      defaultLaborHourlyRate: 0,
    })
  })

  it('persists and updates entities by id', async () => {
    const repositories = createLocalStorageRepositories(localStorage)

    await repositories.materials.save(material)
    await repositories.materials.save({ ...material, name: 'PLA Preto Fosco' })

    await expect(repositories.materials.list()).resolves.toEqual([
      { ...material, name: 'PLA Preto Fosco' },
    ])
    await expect(repositories.materials.getById(material.id)).resolves.toEqual({
      ...material,
      name: 'PLA Preto Fosco',
    })
  })

  it('validates entities before persisting them', async () => {
    const repositories = createLocalStorageRepositories(localStorage)

    await expect(
      repositories.materials.save({ ...material, colorHex: '111827' }),
    ).rejects.toThrow()
    expect(localStorage.getItem(STORAGE_KEYS.materials)).toBeNull()
  })

  it('supports cost calculation history snapshots', async () => {
    const repositories = createLocalStorageRepositories(localStorage)

    await repositories.costCalculations.save(costCalculation)

    await expect(repositories.costCalculations.list()).resolves.toEqual([costCalculation])
    expect(localStorage.getItem(STORAGE_KEYS.costCalculations)).toContain(
      costCalculation.snapshot.materialName,
    )
  })

  it('removes and clears persisted entities', async () => {
    const repositories = createLocalStorageRepositories(localStorage)

    await repositories.materials.saveMany([
      material,
      { ...material, id: 'material-2', name: 'PETG Transparente', type: 'PETG' },
    ])
    await repositories.materials.remove(material.id)

    await expect(repositories.materials.list()).resolves.toHaveLength(1)

    await repositories.materials.clear()

    await expect(repositories.materials.list()).resolves.toEqual([])
  })
})
