import { describe, expect, it } from 'vitest'

import { defaultSettings } from './domain'
import { globalSettingsSchema, materialSchema, printProfileSchema, productSchema } from './schemas'

const now = '2026-06-03T17:00:00.000Z'

describe('domain schemas', () => {
  it('accepts materials without color and validates HEX when present', () => {
    const baseMaterial = {
      id: 'material-1',
      name: 'PLA Preto',
      type: 'PLA',
      pricePerKg: 90,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    expect(materialSchema.safeParse(baseMaterial).success).toBe(true)
    expect(materialSchema.safeParse({ ...baseMaterial, colorHex: '#111827' }).success).toBe(true)
    expect(materialSchema.safeParse({ ...baseMaterial, colorHex: '111827' }).success).toBe(false)
  })

  it('validates optional material stock fields', () => {
    const baseMaterial = {
      id: 'material-1',
      name: 'PLA Preto',
      type: 'PLA',
      pricePerKg: 90,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    expect(
      materialSchema.safeParse({
        ...baseMaterial,
        spoolWeightGrams: 1000,
        remainingWeightGrams: 400,
        lowStockThresholdGrams: 150,
      }).success,
    ).toBe(true)

    expect(
      materialSchema.safeParse({
        ...baseMaterial,
        spoolWeightGrams: 1000,
        remainingWeightGrams: 1500,
      }).success,
    ).toBe(true)
  })

  it('keeps product data separate from print profile manufacturing data', () => {
    const product = {
      id: 'product-1',
      name: 'Suporte de controle',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    expect(productSchema.safeParse(product).success).toBe(true)
    expect(productSchema.safeParse({ ...product, materialId: 'material-1' }).success).toBe(false)
  })

  it('normalizes legacy product category into categories', () => {
    const product = productSchema.parse({
      id: 'product-1',
      name: 'Suporte de controle',
      category: 'Organização',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    expect(product.categories).toEqual(['Organização'])
  })

  it('normalizes legacy print profile data into one print run', () => {
    const profile = printProfileSchema.parse({
      id: 'profile-1',
      name: 'PLA Preto - 0.2mm',
      printerId: 'printer-1',
      materialId: 'material-1',
      printTimeHours: 2.5,
      modelWeightGrams: 42,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    expect(profile.printRuns).toHaveLength(1)
    expect(profile.printRuns[0]?.quantity).toBe(1)
    expect(profile.printRuns[0]?.printTimeMinutes).toBe(150)
    expect(profile.printRuns[0]?.materials[0]?.supportWeightGrams).toBe(0)
    expect(profile.printRuns[0]?.materials[0]?.purgeWeightGrams).toBe(0)
    expect(profile.printRuns[0]?.materials[0]?.otherWasteGrams).toBe(0)
  })

  it('accepts print profiles with multiple materials and quantities', () => {
    const profile = printProfileSchema.parse({
      id: 'profile-1',
      name: 'Porta joias',
      printerId: 'printer-1',
      printRuns: [
        {
          id: 'run-1',
          quantity: 1,
          printTimeMinutes: 180,
          materials: [
            {
              id: 'usage-1',
              materialId: 'material-1',
              modelWeightGrams: 40,
              supportWeightGrams: 0,
              purgeWeightGrams: 2,
              otherWasteGrams: 0,
            },
            {
              id: 'usage-2',
              materialId: 'material-2',
              modelWeightGrams: 20,
              supportWeightGrams: 0,
              purgeWeightGrams: 1,
              otherWasteGrams: 0,
            },
          ],
        },
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    expect(profile.printRuns[0]?.materials).toHaveLength(2)
  })

  it('validates the default global settings', () => {
    expect(globalSettingsSchema.safeParse(defaultSettings).success).toBe(true)
  })
})
