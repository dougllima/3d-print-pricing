import { z } from 'zod'

import { materialTypes } from './domain'

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
}).strict().refine(
  (material) =>
    material.spoolWeightGrams === undefined ||
    material.remainingWeightGrams === undefined ||
    material.remainingWeightGrams <= material.spoolWeightGrams,
  {
    message: 'remainingWeightGrams must not be greater than spoolWeightGrams',
    path: ['remainingWeightGrams'],
  },
)

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

export const productSchema = z.object({
  id: requiredTextSchema,
  name: requiredTextSchema,
  description: optionalTextSchema,
  category: optionalTextSchema,
  notes: optionalTextSchema,
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
}).strict()

export const printProfileSchema = z.object({
  id: requiredTextSchema,
  productId: optionalTextSchema,
  name: requiredTextSchema,
  printerId: requiredTextSchema,
  materialId: requiredTextSchema,
  slicerProfileName: optionalTextSchema,
  layerHeightMm: positiveNumberSchema.optional(),
  nozzleDiameterMm: positiveNumberSchema.optional(),
  infillPercent: percentSchema.optional(),
  wallLoops: z.number().int().nonnegative().optional(),
  printTimeHours: nonNegativeNumberSchema,
  modelWeightGrams: nonNegativeNumberSchema,
  supportWeightGrams: nonNegativeNumberSchema.default(0),
  purgeWeightGrams: nonNegativeNumberSchema.default(0),
  otherWasteGrams: nonNegativeNumberSchema.default(0),
  notes: optionalTextSchema,
  isFavorite: z.boolean().optional(),
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
}).strict()

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
