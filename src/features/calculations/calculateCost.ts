import { CALCULATION_ERROR_MESSAGES } from '@/shared/constants'
import type { CostCalculation, FinishingTask } from '@/shared/types'

export type CalculateCostInput = {
  materialPricePerKg?: number
  materialUsages?: Array<{
    materialPricePerKg: number
    modelWeightGrams: number
    supportWeightGrams?: number
    purgeWeightGrams?: number
    otherWasteGrams?: number
  }>
  printerPowerWatts?: number
  electricityCostPerKwh?: number
  printerPurchasePrice?: number
  printerEstimatedLifetimeHours?: number
  printerMaintenanceCostPerHour?: number
  printTimeHours?: number
  printTimeMinutes?: number
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
    throw new RangeError(CALCULATION_ERROR_MESSAGES.profitMarginMustBeLowerThan100)
  }

  const supportWeightGrams = input.supportWeightGrams ?? 0
  const purgeWeightGrams = input.purgeWeightGrams ?? 0
  const otherWasteGrams = input.otherWasteGrams ?? 0
  const finishingTasks = input.finishingTasks ?? []
  const usesTotalRunInput = input.materialUsages !== undefined || input.printTimeMinutes !== undefined
  const printTimeHours = input.printTimeMinutes === undefined
    ? input.printTimeHours ?? 0
    : input.printTimeMinutes / 60

  const materialTotals = input.materialUsages?.reduce(
    (totals, materialUsage) => {
      const materialSupportWeightGrams = materialUsage.supportWeightGrams ?? 0
      const materialPurgeWeightGrams = materialUsage.purgeWeightGrams ?? 0
      const materialOtherWasteGrams = materialUsage.otherWasteGrams ?? 0
      const materialTotalWeightGrams =
        materialUsage.modelWeightGrams +
        materialSupportWeightGrams +
        materialPurgeWeightGrams +
        materialOtherWasteGrams

      return {
        materialCost:
          totals.materialCost +
          (materialTotalWeightGrams / 1000) * materialUsage.materialPricePerKg,
        totalWeightGrams: totals.totalWeightGrams + materialTotalWeightGrams,
        wasteWeightGrams:
          totals.wasteWeightGrams +
          materialSupportWeightGrams +
          materialPurgeWeightGrams +
          materialOtherWasteGrams,
      }
    },
    { materialCost: 0, totalWeightGrams: 0, wasteWeightGrams: 0 },
  )

  const totalWeightPerUnitGrams =
    input.modelWeightGrams + supportWeightGrams + purgeWeightGrams + otherWasteGrams
  const wasteWeightPerUnitGrams = supportWeightGrams + purgeWeightGrams + otherWasteGrams
  const totalWeightGrams =
    materialTotals?.totalWeightGrams ??
    totalWeightPerUnitGrams * input.quantity
  const wasteWeightGrams =
    materialTotals?.wasteWeightGrams ??
    wasteWeightPerUnitGrams * input.quantity
  const wastePercent = totalWeightGrams === 0 ? 0 : (wasteWeightGrams / totalWeightGrams) * 100

  const materialCost =
    materialTotals?.materialCost ??
    (totalWeightGrams / 1000) * (input.materialPricePerKg ?? 0)
  const timeMultiplier = usesTotalRunInput ? 1 : input.quantity
  const energyCost =
    input.printerPowerWatts === undefined || input.electricityCostPerKwh === undefined
      ? 0
      : printTimeHours *
        timeMultiplier *
        (input.printerPowerWatts / 1000) *
        input.electricityCostPerKwh

  const machineCost =
    input.printerPurchasePrice === undefined ||
    input.printerEstimatedLifetimeHours === undefined ||
    input.printerEstimatedLifetimeHours === 0
      ? 0
      : printTimeHours *
        timeMultiplier *
        (input.printerPurchasePrice / input.printerEstimatedLifetimeHours)

  const maintenanceCost =
    input.printerMaintenanceCostPerHour === undefined
      ? 0
      : printTimeHours * timeMultiplier * input.printerMaintenanceCostPerHour

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
