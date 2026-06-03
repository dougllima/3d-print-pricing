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

  it('defaults print profile waste weights to zero', () => {
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

    expect(profile.supportWeightGrams).toBe(0)
    expect(profile.purgeWeightGrams).toBe(0)
    expect(profile.otherWasteGrams).toBe(0)
  })

  it('validates the default global settings', () => {
    expect(globalSettingsSchema.safeParse(defaultSettings).success).toBe(true)
  })
})
