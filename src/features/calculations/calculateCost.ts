import { CALCULATION_ERROR_MESSAGES } from '@/shared/constants'
import type { CostCalculation, FinishingTask } from '@/shared/types'

type MaterialUsageInput = {
  materialPricePerKg: number
  modelWeightGrams: number
  supportWeightGrams?: number
  purgeWeightGrams?: number
  otherWasteGrams?: number
}

type MaterialTotals = {
  materialCost: number
  totalWeightGrams: number
  wasteWeightGrams: number
}

export type CalculateCostInput = {
  materialPricePerKg?: number
  materialUsages?: MaterialUsageInput[]
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

function getWasteWeight(input: {
  otherWasteGrams?: number
  purgeWeightGrams?: number
  supportWeightGrams?: number
}) {
  return (input.supportWeightGrams ?? 0) + (input.purgeWeightGrams ?? 0) + (input.otherWasteGrams ?? 0)
}

function getTotalWeight(input: {
  modelWeightGrams: number
  otherWasteGrams?: number
  purgeWeightGrams?: number
  supportWeightGrams?: number
}) {
  return input.modelWeightGrams + getWasteWeight(input)
}

function calculateMaterialTotals(materialUsages: MaterialUsageInput[] | undefined): MaterialTotals | undefined {
  if (materialUsages === undefined) {
    return undefined
  }

  return materialUsages.reduce<MaterialTotals>(
    (totals, materialUsage) => {
      const materialTotalWeightGrams = getTotalWeight(materialUsage)
      const materialWasteWeightGrams = getWasteWeight(materialUsage)

      return {
        materialCost:
          totals.materialCost +
          (materialTotalWeightGrams / 1000) * materialUsage.materialPricePerKg,
        totalWeightGrams: totals.totalWeightGrams + materialTotalWeightGrams,
        wasteWeightGrams: totals.wasteWeightGrams + materialWasteWeightGrams,
      }
    },
    { materialCost: 0, totalWeightGrams: 0, wasteWeightGrams: 0 },
  )
}

function getPrintTimeHours(input: Pick<CalculateCostInput, 'printTimeHours' | 'printTimeMinutes'>) {
  return input.printTimeMinutes === undefined ? input.printTimeHours ?? 0 : input.printTimeMinutes / 60
}

function usesSlicerTotalInput(input: CalculateCostInput) {
  return input.materialUsages !== undefined || input.printTimeMinutes !== undefined
}

function calculateEnergyCost(input: {
  electricityCostPerKwh?: number
  printerPowerWatts?: number
  printTimeHours: number
  timeMultiplier: number
}) {
  if (input.printerPowerWatts === undefined || input.electricityCostPerKwh === undefined) {
    return 0
  }

  return (
    input.printTimeHours *
    input.timeMultiplier *
    (input.printerPowerWatts / 1000) *
    input.electricityCostPerKwh
  )
}

function calculateMachineCost(input: {
  printTimeHours: number
  printerEstimatedLifetimeHours?: number
  printerPurchasePrice?: number
  timeMultiplier: number
}) {
  if (
    input.printerPurchasePrice === undefined ||
    input.printerEstimatedLifetimeHours === undefined ||
    input.printerEstimatedLifetimeHours === 0
  ) {
    return 0
  }

  return (
    input.printTimeHours *
    input.timeMultiplier *
    (input.printerPurchasePrice / input.printerEstimatedLifetimeHours)
  )
}

function calculateMaintenanceCost(input: {
  printTimeHours: number
  printerMaintenanceCostPerHour?: number
  timeMultiplier: number
}) {
  if (input.printerMaintenanceCostPerHour === undefined) {
    return 0
  }

  return input.printTimeHours * input.timeMultiplier * input.printerMaintenanceCostPerHour
}

function calculateFinishingCost(finishingTasks: FinishingTask[]) {
  return finishingTasks.reduce(
    (total, task) => total + task.hours * task.hourlyRate + task.materialCost,
    0,
  )
}

export function calculateCost(input: CalculateCostInput): CostCalculationResult {
  if (input.profitMarginPercent >= 100) {
    throw new RangeError(CALCULATION_ERROR_MESSAGES.profitMarginMustBeLowerThan100)
  }

  const materialTotals = calculateMaterialTotals(input.materialUsages)
  const perUnitTotalWeightGrams = getTotalWeight(input)
  const perUnitWasteWeightGrams = getWasteWeight(input)
  const totalWeightGrams = materialTotals?.totalWeightGrams ?? perUnitTotalWeightGrams * input.quantity
  const wasteWeightGrams = materialTotals?.wasteWeightGrams ?? perUnitWasteWeightGrams * input.quantity
  const wastePercent = totalWeightGrams === 0 ? 0 : (wasteWeightGrams / totalWeightGrams) * 100
  const materialCost =
    materialTotals?.materialCost ?? (totalWeightGrams / 1000) * (input.materialPricePerKg ?? 0)
  const printTimeHours = getPrintTimeHours(input)
  const timeMultiplier = usesSlicerTotalInput(input) ? 1 : input.quantity

  const energyCost = calculateEnergyCost({
    electricityCostPerKwh: input.electricityCostPerKwh,
    printerPowerWatts: input.printerPowerWatts,
    printTimeHours,
    timeMultiplier,
  })
  const machineCost = calculateMachineCost({
    printerPurchasePrice: input.printerPurchasePrice,
    printerEstimatedLifetimeHours: input.printerEstimatedLifetimeHours,
    printTimeHours,
    timeMultiplier,
  })
  const maintenanceCost = calculateMaintenanceCost({
    printerMaintenanceCostPerHour: input.printerMaintenanceCostPerHour,
    printTimeHours,
    timeMultiplier,
  })
  const finishingCost = calculateFinishingCost(input.finishingTasks ?? [])
  const printingCost = materialCost + energyCost + machineCost + maintenanceCost
  const failureReserveCost = (printingCost + finishingCost) * (input.failureRatePercent / 100)
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
