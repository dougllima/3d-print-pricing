import { z } from 'zod'

import { materialTypes } from './domain'
import type { PrintProfile, Product } from './domain'

const hexColorRegex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const requiredTextSchema = z.string().trim().min(1)
const optionalTextSchema = z.string().trim().min(1).optional()
const dateTimeSchema = z.iso.datetime()
const nonNegativeNumberSchema = z.number().nonnegative()
const positiveNumberSchema = z.number().positive()
const percentSchema = z.number().min(0).max(100)

export const materialTypeSchema = z.enum(materialTypes)

export const materialSchema = z.object({
  id: requiredTextSchema,
  name: requiredTextSchema,
  type: materialTypeSchema,
  brand: optionalTextSchema,
  colorName: optionalTextSchema,
  colorHex: z.string().trim().regex(hexColorRegex).optional(),
  supplierColorCode: optionalTextSchema,
  pricePerKg: positiveNumberSchema,
  spoolWeightGrams: positiveNumberSchema.optional(),
  remainingWeightGrams: nonNegativeNumberSchema.optional(),
  lowStockThresholdGrams: nonNegativeNumberSchema.optional(),
  notes: optionalTextSchema,
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
}).strict()

export const printerSchema = z.object({
  id: requiredTextSchema,
  name: requiredTextSchema,
  model: optionalTextSchema,
  powerWatts: nonNegativeNumberSchema.optional(),
  purchasePrice: nonNegativeNumberSchema.optional(),
  estimatedLifetimeHours: positiveNumberSchema.optional(),
  maintenanceCostPerHour: nonNegativeNumberSchema.optional(),
  defaultFailureRatePercent: percentSchema.optional(),
  notes: optionalTextSchema,
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
}).strict()

const legacyProductSchema = z.object({
  id: requiredTextSchema,
  name: requiredTextSchema,
  description: optionalTextSchema,
  category: optionalTextSchema,
  categories: z.array(requiredTextSchema).optional(),
  notes: optionalTextSchema,
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
}).strict()

export const productSchema = legacyProductSchema.transform((product): Product => {
  const legacyCategory = product.category === undefined ? [] : [product.category]

  const normalizedProduct: Product = {
    id: product.id,
    name: product.name,
    categories: product.categories ?? legacyCategory,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }

  if (product.description !== undefined) {
    normalizedProduct.description = product.description
  }

  if (product.notes !== undefined) {
    normalizedProduct.notes = product.notes
  }

  return normalizedProduct
})

export const printProfileMaterialUsageSchema = z.object({
  id: requiredTextSchema,
  materialId: requiredTextSchema,
  modelWeightGrams: nonNegativeNumberSchema,
  supportWeightGrams: nonNegativeNumberSchema.default(0),
  purgeWeightGrams: nonNegativeNumberSchema.default(0),
  otherWasteGrams: nonNegativeNumberSchema.default(0),
}).strict()

export const printProfileRunSchema = z.object({
  id: requiredTextSchema,
  quantity: z.number().int().positive(),
  printTimeMinutes: z.number().int().nonnegative(),
  materials: z.array(printProfileMaterialUsageSchema).min(1),
}).strict()

const legacyPrintProfileSchema = z.object({
  id: requiredTextSchema,
  productId: optionalTextSchema,
  name: requiredTextSchema,
  printerId: requiredTextSchema,
  materialId: optionalTextSchema,
  slicerProfileName: optionalTextSchema,
  layerHeightMm: positiveNumberSchema.optional(),
  nozzleDiameterMm: positiveNumberSchema.optional(),
  infillPercent: percentSchema.optional(),
  wallLoops: z.number().int().nonnegative().optional(),
  printTimeHours: nonNegativeNumberSchema.optional(),
  modelWeightGrams: nonNegativeNumberSchema.optional(),
  supportWeightGrams: nonNegativeNumberSchema.optional(),
  purgeWeightGrams: nonNegativeNumberSchema.optional(),
  otherWasteGrams: nonNegativeNumberSchema.optional(),
  printRuns: z.array(printProfileRunSchema).optional(),
  notes: optionalTextSchema,
  isFavorite: z.boolean().optional(),
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
}).strict()

export const printProfileSchema = legacyPrintProfileSchema.transform((printProfile): PrintProfile => {
  const normalizedPrintProfile: PrintProfile = {
    id: printProfile.id,
    name: printProfile.name,
    printerId: printProfile.printerId,
    printRuns: printProfile.printRuns ?? [],
    isActive: printProfile.isActive,
    createdAt: printProfile.createdAt,
    updatedAt: printProfile.updatedAt,
  }

  if (printProfile.productId !== undefined) {
    normalizedPrintProfile.productId = printProfile.productId
  }

  if (printProfile.materialId !== undefined) {
    normalizedPrintProfile.materialId = printProfile.materialId
  }

  if (printProfile.slicerProfileName !== undefined) {
    normalizedPrintProfile.slicerProfileName = printProfile.slicerProfileName
  }

  if (printProfile.printTimeHours !== undefined) {
    normalizedPrintProfile.printTimeHours = printProfile.printTimeHours
  }

  if (printProfile.modelWeightGrams !== undefined) {
    normalizedPrintProfile.modelWeightGrams = printProfile.modelWeightGrams
  }

  if (printProfile.supportWeightGrams !== undefined) {
    normalizedPrintProfile.supportWeightGrams = printProfile.supportWeightGrams
  }

  if (printProfile.purgeWeightGrams !== undefined) {
    normalizedPrintProfile.purgeWeightGrams = printProfile.purgeWeightGrams
  }

  if (printProfile.otherWasteGrams !== undefined) {
    normalizedPrintProfile.otherWasteGrams = printProfile.otherWasteGrams
  }

  if (printProfile.notes !== undefined) {
    normalizedPrintProfile.notes = printProfile.notes
  }

  if (printProfile.isFavorite !== undefined) {
    normalizedPrintProfile.isFavorite = printProfile.isFavorite
  }

  if (printProfile.printRuns !== undefined) {
    return normalizedPrintProfile
  }

  if (printProfile.materialId === undefined) {
    return normalizedPrintProfile
  }

  normalizedPrintProfile.printRuns = [
    {
      id: `${printProfile.id}-run-1`,
      quantity: 1,
      printTimeMinutes: Math.round((printProfile.printTimeHours ?? 0) * 60),
      materials: [
        {
          id: `${printProfile.id}-material-1`,
          materialId: printProfile.materialId,
          modelWeightGrams: printProfile.modelWeightGrams ?? 0,
          supportWeightGrams: printProfile.supportWeightGrams ?? 0,
          purgeWeightGrams: printProfile.purgeWeightGrams ?? 0,
          otherWasteGrams: printProfile.otherWasteGrams ?? 0,
        },
      ],
    },
  ]

  return normalizedPrintProfile
})

export const finishingTaskSchema = z.object({
  id: requiredTextSchema,
  name: requiredTextSchema,
  hours: nonNegativeNumberSchema,
  hourlyRate: nonNegativeNumberSchema,
  materialCost: nonNegativeNumberSchema,
}).strict()

export const globalSettingsSchema = z.object({
  currency: z.literal('BRL'),
  electricityCostPerKwh: nonNegativeNumberSchema,
  defaultProfitMarginPercent: percentSchema,
  defaultFailureRatePercent: percentSchema,
  defaultLaborHourlyRate: nonNegativeNumberSchema,
  defaultMinimumPrice: nonNegativeNumberSchema.optional(),
}).strict()

export const costCalculationSnapshotSchema = z.object({
  materialName: requiredTextSchema,
  materialPricePerKg: positiveNumberSchema,
  printerName: requiredTextSchema,
  printerPowerWatts: nonNegativeNumberSchema.optional(),
  printerPurchasePrice: nonNegativeNumberSchema.optional(),
  printerEstimatedLifetimeHours: positiveNumberSchema.optional(),
  printerMaintenanceCostPerHour: nonNegativeNumberSchema.optional(),
  electricityCostPerKwh: nonNegativeNumberSchema,
  profitMarginPercent: percentSchema,
  failureRatePercent: percentSchema,
}).strict()

export const costCalculationInputSchema = z.object({
  quantity: z.number().int().positive(),
  printTimeHours: nonNegativeNumberSchema,
  modelWeightGrams: nonNegativeNumberSchema,
  supportWeightGrams: nonNegativeNumberSchema,
  purgeWeightGrams: nonNegativeNumberSchema,
  otherWasteGrams: nonNegativeNumberSchema,
}).strict()

export const costCalculationResultSchema = z.object({
  materialCost: nonNegativeNumberSchema,
  energyCost: nonNegativeNumberSchema,
  machineCost: nonNegativeNumberSchema,
  maintenanceCost: nonNegativeNumberSchema,
  failureReserveCost: nonNegativeNumberSchema,
  printingCost: nonNegativeNumberSchema,
  finishingCost: nonNegativeNumberSchema,
  totalCost: nonNegativeNumberSchema,
  suggestedPrice: nonNegativeNumberSchema,
  estimatedProfit: z.number().finite(),
  realMarginPercent: percentSchema,
  totalWeightGrams: nonNegativeNumberSchema,
  wasteWeightGrams: nonNegativeNumberSchema,
  wastePercent: percentSchema,
}).strict()

export const costCalculationSchema = z.object({
  id: requiredTextSchema,
  productId: optionalTextSchema,
  printProfileId: optionalTextSchema,
  name: requiredTextSchema,
  snapshot: costCalculationSnapshotSchema,
  input: costCalculationInputSchema,
  finishingTasks: z.array(finishingTaskSchema),
  result: costCalculationResultSchema,
  createdAt: dateTimeSchema,
}).strict()
