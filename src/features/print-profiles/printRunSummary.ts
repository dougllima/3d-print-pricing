import { calculateCost, type CostCalculationResult } from '@/features/calculations'
import type {
  GlobalSettings,
  Material,
  Printer,
  PrintProfile,
  PrintProfileMaterialUsage,
  PrintProfilePlate,
} from '@/shared/types'
import { hasEnoughMaterialStock } from '@/shared/utils'

export type MaterialUsageSummary = PrintProfileMaterialUsage & {
  material?: Material
  plate: PrintProfilePlate
  totalWeightGrams: number
}

export type PrintRunSummary = {
  materialUsages: MaterialUsageSummary[]
  missingMaterialUsages: MaterialUsageSummary[]
  result?: CostCalculationResult
  stockWarnings: MaterialUsageSummary[]
  totalPrintTimeMinutes: number
  totalWeightGrams: number
}

function findById<TEntity extends { id: string }>(items: TEntity[], id?: string) {
  if (id === undefined) {
    return undefined
  }

  return items.find((item) => item.id === id)
}

export function findEntityName<TEntity extends { id: string; name: string }>(
  items: TEntity[],
  id: string | undefined,
  fallback = 'Avulsa',
) {
  if (id === undefined) {
    return fallback
  }

  return findById(items, id)?.name ?? 'Não encontrado'
}

function getMaterialUsageTotalWeight(materialUsage: PrintProfileMaterialUsage) {
  return (
    materialUsage.modelWeightGrams +
    materialUsage.supportWeightGrams +
    materialUsage.purgeWeightGrams +
    materialUsage.otherWasteGrams
  )
}

function createMaterialUsageSummaries(
  materials: Material[],
  printRun: PrintProfile['printRuns'][number],
) {
  return printRun.plates.flatMap((plate) =>
    plate.materials.map((materialUsage) => ({
      ...materialUsage,
      material: findById(materials, materialUsage.materialId),
      plate,
      totalWeightGrams: getMaterialUsageTotalWeight(materialUsage),
    })),
  )
}

export function createPrintRunSummary(input: {
  materials: Material[]
  printRun: PrintProfile['printRuns'][number]
  printer?: Printer
  settings: GlobalSettings
}): PrintRunSummary {
  const materialUsages = createMaterialUsageSummaries(input.materials, input.printRun)
  const missingMaterialUsages = materialUsages.filter(
    (materialUsage) => materialUsage.material === undefined,
  )
  const hasMissingMaterial = materialUsages.some(
    (materialUsage) => materialUsage.material === undefined,
  )
  const totalPrintTimeMinutes = input.printRun.plates.reduce(
    (totalMinutes, plate) => totalMinutes + plate.printTimeMinutes,
    0,
  )
  const totalWeightGrams = materialUsages.reduce(
    (totalWeight, materialUsage) => totalWeight + materialUsage.totalWeightGrams,
    0,
  )
  const result =
    input.printer === undefined || hasMissingMaterial
      ? undefined
      : calculateCost({
          materialUsages: materialUsages.map((materialUsage) => ({
            materialPricePerKg: materialUsage.material?.pricePerKg ?? 0,
            modelWeightGrams: materialUsage.modelWeightGrams,
            supportWeightGrams: materialUsage.supportWeightGrams,
            purgeWeightGrams: materialUsage.purgeWeightGrams,
            otherWasteGrams: materialUsage.otherWasteGrams,
          })),
          printerPowerWatts: input.printer.powerWatts,
          electricityCostPerKwh: input.settings.electricityCostPerKwh,
          printerPurchasePrice: input.printer.purchasePrice,
          printerEstimatedLifetimeHours: input.printer.estimatedLifetimeHours,
          printerMaintenanceCostPerHour: input.printer.maintenanceCostPerHour,
          printTimeMinutes: totalPrintTimeMinutes,
          modelWeightGrams: 0,
          quantity: input.printRun.quantity,
          finishingTasks: [],
          failureRatePercent:
            input.printer.defaultFailureRatePercent ?? input.settings.defaultFailureRatePercent,
          profitMarginPercent: input.settings.defaultProfitMarginPercent,
        })
  const stockWarnings = materialUsages.filter(
    (materialUsage) =>
      materialUsage.material !== undefined &&
      !hasEnoughMaterialStock(materialUsage.material, materialUsage.totalWeightGrams),
  )

  return {
    materialUsages,
    missingMaterialUsages,
    result,
    stockWarnings,
    totalPrintTimeMinutes,
    totalWeightGrams,
  }
}
