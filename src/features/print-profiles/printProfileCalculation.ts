import type {
  CostCalculation,
  FinishingTask,
  GlobalSettings,
  Material,
  Printer,
  PrintProfile,
} from '@/shared/types'
import { createEntityId, createTimestamp } from '@/shared/utils'

import { createPrintRunSummary } from './printRunSummary'

function sumPrintRunWeight(
  printRun: PrintProfile['printRuns'][number],
  fieldName: 'modelWeightGrams' | 'supportWeightGrams' | 'purgeWeightGrams' | 'otherWasteGrams',
) {
  return printRun.plates
    .flatMap((plate) => plate.materials)
    .reduce((totalWeight, materialUsage) => totalWeight + materialUsage[fieldName], 0)
}

function summarizeMaterialNames(materials: Material[]) {
  const materialNames = [...new Set(materials.map((material) => material.name))]

  return materialNames.length === 0 ? 'Material não encontrado' : materialNames.join(', ')
}

function calculateWeightedMaterialPricePerKg(input: {
  materialUsages: ReturnType<typeof createPrintRunSummary>['materialUsages']
  materialCost: number
}) {
  const totalWeightGrams = input.materialUsages.reduce(
    (totalWeight, materialUsage) => totalWeight + materialUsage.totalWeightGrams,
    0,
  )

  return totalWeightGrams === 0 ? 0 : input.materialCost / (totalWeightGrams / 1000)
}

export function createCostCalculationFromPrintRun(input: {
  createdAt?: string
  failureRatePercent?: number
  finishingTasks?: FinishingTask[]
  id?: string
  materials: Material[]
  printer: Printer | undefined
  printProfile: PrintProfile
  printRun: PrintProfile['printRuns'][number]
  profitMarginPercent?: number
  settings: GlobalSettings
}): CostCalculation | undefined {
  const failureRatePercent =
    input.failureRatePercent ??
    input.printer?.defaultFailureRatePercent ??
    input.settings.defaultFailureRatePercent
  const finishingTasks = input.finishingTasks ?? []
  const profitMarginPercent =
    input.profitMarginPercent ?? input.settings.defaultProfitMarginPercent
  const summary = createPrintRunSummary({
    calculation: {
      failureRatePercent,
      finishingTasks,
      profitMarginPercent,
    },
    materials: input.materials,
    printer: input.printer,
    printRun: input.printRun,
    settings: input.settings,
  })

  if (input.printer === undefined || summary.result === undefined) {
    return undefined
  }

  const usedMaterials = summary.materialUsages.flatMap((materialUsage) =>
    materialUsage.material === undefined ? [] : [materialUsage.material],
  )

  return {
    id: input.id ?? createEntityId(),
    productId: input.printProfile.productId,
    printProfileId: input.printProfile.id,
    name: `${input.printProfile.name} (${input.printRun.quantity} un.)`,
    snapshot: {
      materialName: summarizeMaterialNames(usedMaterials),
      materialPricePerKg: calculateWeightedMaterialPricePerKg({
        materialUsages: summary.materialUsages,
        materialCost: summary.result.materialCost,
      }),
      printerName: input.printer.name,
      printerPowerWatts: input.printer.powerWatts,
      printerPurchasePrice: input.printer.purchasePrice,
      printerEstimatedLifetimeHours: input.printer.estimatedLifetimeHours,
      printerMaintenanceCostPerHour: input.printer.maintenanceCostPerHour,
      electricityCostPerKwh: input.settings.electricityCostPerKwh,
      profitMarginPercent,
      failureRatePercent,
    },
    input: {
      quantity: input.printRun.quantity,
      printTimeHours: summary.totalPrintTimeMinutes / 60,
      modelWeightGrams: sumPrintRunWeight(input.printRun, 'modelWeightGrams'),
      supportWeightGrams: sumPrintRunWeight(input.printRun, 'supportWeightGrams'),
      purgeWeightGrams: sumPrintRunWeight(input.printRun, 'purgeWeightGrams'),
      otherWasteGrams: sumPrintRunWeight(input.printRun, 'otherWasteGrams'),
    },
    finishingTasks,
    result: summary.result,
    createdAt: input.createdAt ?? createTimestamp(),
  }
}
