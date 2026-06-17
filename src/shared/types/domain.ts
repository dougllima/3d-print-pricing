export const materialTypes = ['PLA', 'PETG', 'ABS', 'TPU', 'OTHER'] as const
export const printQueueStatuses = ['queued', 'started', 'finished', 'canceled'] as const

export type MaterialType = (typeof materialTypes)[number]
export type PrintQueueStatus = (typeof printQueueStatuses)[number]

export type Material = {
  id: string
  name: string
  type: MaterialType
  brand?: string
  colorName?: string
  colorHex?: string
  supplierColorCode?: string
  pricePerKg: number
  spoolWeightGrams?: number
  remainingWeightGrams?: number
  lowStockThresholdGrams?: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Printer = {
  id: string
  name: string
  model?: string
  powerWatts?: number
  purchasePrice?: number
  estimatedLifetimeHours?: number
  maintenanceCostPerHour?: number
  defaultFailureRatePercent?: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Product = {
  id: string
  name: string
  description?: string
  categories: string[]
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type PrintProfileMaterialUsage = {
  id: string
  materialId?: string
  label?: string
  modelWeightGrams: number
  supportWeightGrams: number
  purgeWeightGrams: number
  otherWasteGrams: number
}

export type PrintProfilePlate = {
  id: string
  name: string
  printTimeMinutes: number
  materials: PrintProfileMaterialUsage[]
}

export type PrintProfileRun = {
  id: string
  quantity: number
  plates: PrintProfilePlate[]
}

export type PrintProfile = {
  id: string
  productId?: string
  name: string
  printerId: string
  printRuns: PrintProfileRun[]
  materialId?: string
  slicerProfileName?: string
  printTimeHours?: number
  modelWeightGrams?: number
  supportWeightGrams?: number
  purgeWeightGrams?: number
  otherWasteGrams?: number
  notes?: string
  isFavorite?: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type FinishingTask = {
  id: string
  name: string
  hours: number
  hourlyRate: number
  materialCost: number
}

export type GlobalSettings = {
  currency: 'BRL'
  electricityCostPerKwh: number
  defaultProfitMarginPercent: number
  defaultFailureRatePercent: number
  defaultLaborHourlyRate: number
  defaultMinimumPrice?: number
}

export const defaultSettings: GlobalSettings = {
  currency: 'BRL',
  electricityCostPerKwh: 0,
  defaultProfitMarginPercent: 40,
  defaultFailureRatePercent: 5,
  defaultLaborHourlyRate: 0,
  defaultMinimumPrice: undefined,
}

export type CostCalculation = {
  id: string
  productId?: string
  printProfileId?: string
  name: string
  snapshot: {
    materialName: string
    materialPricePerKg: number
    printerName: string
    printerPowerWatts?: number
    printerPurchasePrice?: number
    printerEstimatedLifetimeHours?: number
    printerMaintenanceCostPerHour?: number
    electricityCostPerKwh: number
    profitMarginPercent: number
    failureRatePercent: number
  }
  input: {
    quantity: number
    printTimeHours: number
    modelWeightGrams: number
    supportWeightGrams: number
    purgeWeightGrams: number
    otherWasteGrams: number
  }
  finishingTasks: FinishingTask[]
  result: {
    materialCost: number
    energyCost: number
    machineCost: number
    maintenanceCost: number
    failureReserveCost: number
    printingCost: number
    finishingCost: number
    totalCost: number
    suggestedPrice: number
    estimatedProfit: number
    realMarginPercent: number
    totalWeightGrams: number
    wasteWeightGrams: number
    wastePercent: number
  }
  createdAt: string
}

export type PrintQueueItem = {
  id: string
  printProfileId: string
  printRunId: string
  clientName?: string
  price?: number
  deadline?: string
  position: number
  status: PrintQueueStatus
  stockConsumedAt?: string
  startedAt?: string
  finishedAt?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
