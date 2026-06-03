import { describe, expect, it } from 'vitest'

import { calculateCost, type CalculateCostInput } from './calculateCost'

const baseInput: CalculateCostInput = {
  materialPricePerKg: 100,
  printerPowerWatts: 200,
  electricityCostPerKwh: 1,
  printerPurchasePrice: 2000,
  printerEstimatedLifetimeHours: 1000,
  printerMaintenanceCostPerHour: 0.5,
  printTimeHours: 5,
  modelWeightGrams: 80,
  supportWeightGrams: 10,
  purgeWeightGrams: 5,
  otherWasteGrams: 5,
  quantity: 2,
  finishingTasks: [
    {
      id: 'finish-1',
      name: 'Sanding',
      hours: 1.5,
      hourlyRate: 20,
      materialCost: 5,
    },
  ],
  failureRatePercent: 10,
  profitMarginPercent: 40,
}

describe('calculateCost', () => {
  it('calculates printing, finishing, reserve, price, profit and margin', () => {
    const result = calculateCost(baseInput)

    expect(result.totalWeightGrams).toBe(200)
    expect(result.wasteWeightGrams).toBe(40)
    expect(result.wastePercent).toBeCloseTo(20)
    expect(result.materialCost).toBeCloseTo(20)
    expect(result.energyCost).toBeCloseTo(2)
    expect(result.machineCost).toBeCloseTo(20)
    expect(result.maintenanceCost).toBeCloseTo(5)
    expect(result.printingCost).toBeCloseTo(47)
    expect(result.finishingCost).toBeCloseTo(35)
    expect(result.failureReserveCost).toBeCloseTo(8.2)
    expect(result.totalCost).toBeCloseTo(90.2)
    expect(result.suggestedPrice).toBeCloseTo(150.3333333333)
    expect(result.estimatedProfit).toBeCloseTo(60.1333333333)
    expect(result.realMarginPercent).toBeCloseTo(40)
  })

  it('returns zero for optional energy, machine and maintenance costs when data is missing', () => {
    const result = calculateCost({
      ...baseInput,
      printerPowerWatts: undefined,
      electricityCostPerKwh: undefined,
      printerPurchasePrice: undefined,
      printerEstimatedLifetimeHours: undefined,
      printerMaintenanceCostPerHour: undefined,
      finishingTasks: [],
      failureRatePercent: 0,
      profitMarginPercent: 0,
    })

    expect(result.energyCost).toBe(0)
    expect(result.machineCost).toBe(0)
    expect(result.maintenanceCost).toBe(0)
    expect(result.printingCost).toBeCloseTo(result.materialCost)
    expect(result.totalCost).toBeCloseTo(result.materialCost)
    expect(result.suggestedPrice).toBeCloseTo(result.totalCost)
  })

  it('does not multiply finishing task hours by quantity', () => {
    const singleUnit = calculateCost({ ...baseInput, quantity: 1 })
    const multipleUnits = calculateCost({ ...baseInput, quantity: 3 })

    expect(singleUnit.finishingCost).toBeCloseTo(35)
    expect(multipleUnits.finishingCost).toBeCloseTo(35)
  })

  it('returns zero waste percentage when total weight is zero', () => {
    const result = calculateCost({
      ...baseInput,
      modelWeightGrams: 0,
      supportWeightGrams: 0,
      purgeWeightGrams: 0,
      otherWasteGrams: 0,
    })

    expect(result.totalWeightGrams).toBe(0)
    expect(result.wasteWeightGrams).toBe(0)
    expect(result.wastePercent).toBe(0)
  })

  it('uses real margin over final price instead of markup over cost', () => {
    const result = calculateCost({
      ...baseInput,
      materialPricePerKg: 1000,
      printerPowerWatts: undefined,
      printerPurchasePrice: undefined,
      printerMaintenanceCostPerHour: undefined,
      printTimeHours: 0,
      modelWeightGrams: 60,
      supportWeightGrams: 0,
      purgeWeightGrams: 0,
      otherWasteGrams: 0,
      quantity: 1,
      finishingTasks: [],
      failureRatePercent: 0,
      profitMarginPercent: 40,
    })

    expect(result.totalCost).toBeCloseTo(60)
    expect(result.suggestedPrice).toBeCloseTo(100)
    expect(result.estimatedProfit).toBeCloseTo(40)
    expect(result.realMarginPercent).toBeCloseTo(40)
  })

  it('rejects a profit margin that would make suggested price infinite', () => {
    expect(() => calculateCost({ ...baseInput, profitMarginPercent: 100 })).toThrow(RangeError)
  })
})
