import { describe, expect, it } from 'vitest'

import { printerFormSchema } from './printerFormSchema'

describe('printerFormSchema', () => {
  it('accepts valid printer form values with optional depreciation fields', () => {
    const result = printerFormSchema.safeParse({
      name: 'Ender 3',
      model: '',
      powerWatts: 200,
      purchasePrice: '',
      estimatedLifetimeHours: '',
      maintenanceCostPerHour: 0.5,
      defaultFailureRatePercent: 5,
      notes: '',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      name: 'Ender 3',
      model: undefined,
      powerWatts: 200,
      purchasePrice: undefined,
      estimatedLifetimeHours: undefined,
      maintenanceCostPerHour: 0.5,
      defaultFailureRatePercent: 5,
      notes: undefined,
    })
  })

  it('rejects invalid numeric values', () => {
    const result = printerFormSchema.safeParse({
      name: 'Ender 3',
      powerWatts: -1,
      estimatedLifetimeHours: 0,
      defaultFailureRatePercent: 101,
    })

    expect(result.success).toBe(false)
  })
})
