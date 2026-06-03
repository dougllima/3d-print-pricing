import type { CostCalculation, FinishingTask } from '@/shared/types'

export type CalculateCostInput = {
  materialPricePerKg: number
  printerPowerWatts?: number
  electricityCostPerKwh?: number
  printerPurchasePrice?: number
  printerEstimatedLifetimeHours?: number
  printerMaintenanceCostPerHour?: number
  printTimeHours: number
  modelWeightGrams: number
  supportWeightGrams?: number
  purgeWeightGrams?: number
  otherWasteGrams?: number
  quantity: number
  finishingTasks?: FinishingTask[]
  failureRatePercent: number
  profitMarginPercent: number
}

export type CostCalculationResult = CostCalculation['result']

export function calculateCost(input: CalculateCostInput): CostCalculationResult {
  if (input.profitMarginPercent >= 100) {
    throw new RangeError('profitMarginPercent must be lower than 100')
  }

  const supportWeightGrams = input.supportWeightGrams ?? 0
  const purgeWeightGrams = input.purgeWeightGrams ?? 0
  const otherWasteGrams = input.otherWasteGrams ?? 0
  const finishingTasks = input.finishingTasks ?? []

  const totalWeightPerUnitGrams =
    input.modelWeightGrams + supportWeightGrams + purgeWeightGrams + otherWasteGrams
  const wasteWeightPerUnitGrams = supportWeightGrams + purgeWeightGrams + otherWasteGrams
  const totalWeightGrams = totalWeightPerUnitGrams * input.quantity
  const wasteWeightGrams = wasteWeightPerUnitGrams * input.quantity
  const wastePercent =
    totalWeightPerUnitGrams === 0 ? 0 : (wasteWeightPerUnitGrams / totalWeightPerUnitGrams) * 100

  const materialCost = (totalWeightGrams / 1000) * input.materialPricePerKg
  const energyCost =
    input.printerPowerWatts === undefined || input.electricityCostPerKwh === undefined
      ? 0
      : input.printTimeHours *
        input.quantity *
        (input.printerPowerWatts / 1000) *
        input.electricityCostPerKwh

  const machineCost =
    input.printerPurchasePrice === undefined ||
    input.printerEstimatedLifetimeHours === undefined ||
    input.printerEstimatedLifetimeHours === 0
      ? 0
      : input.printTimeHours *
        input.quantity *
        (input.printerPurchasePrice / input.printerEstimatedLifetimeHours)

  const maintenanceCost =
    input.printerMaintenanceCostPerHour === undefined
      ? 0
      : input.printTimeHours * input.quantity * input.printerMaintenanceCostPerHour

  const printingCost = materialCost + energyCost + machineCost + maintenanceCost
  const finishingCost = finishingTasks.reduce(
    (total, task) => total + task.hours * task.hourlyRate + task.materialCost,
    0,
  )
  const failureReserveCost =
    (printingCost + finishingCost) * (input.failureRatePercent / 100)
  const totalCost = printingCost + finishingCost + failureReserveCost
  const suggestedPrice = totalCost / (1 - input.profitMarginPercent / 100)
  const estimatedProfit = suggestedPrice - totalCost
  const realMarginPercent = suggestedPrice === 0 ? 0 : (estimatedProfit / suggestedPrice) * 100

  return {
    materialCost,
    energyCost,
    machineCost,
    maintenanceCost,
    failureReserveCost,
    printingCost,
    finishingCost,
    totalCost,
    suggestedPrice,
    estimatedProfit,
    realMarginPercent,
    totalWeightGrams,
    wasteWeightGrams,
    wastePercent,
  }
}
