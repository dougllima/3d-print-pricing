import { describe, expect, it } from 'vitest'

import { settingsFormSchema } from './settingsFormSchema'

describe('settingsFormSchema', () => {
  it('accepts valid settings values with optional minimum price', () => {
    const result = settingsFormSchema.safeParse({
      electricityCostPerKwh: 1,
      defaultProfitMarginPercent: 40,
      defaultFailureRatePercent: 5,
      defaultLaborHourlyRate: 20,
      defaultMinimumPrice: '',
    })

    expect(result.success).toBe(true)
    expect(result.data?.defaultMinimumPrice).toBeUndefined()
  })

  it('rejects profit margin greater than or equal to 100', () => {
    expect(
      settingsFormSchema.safeParse({
        electricityCostPerKwh: 1,
        defaultProfitMarginPercent: 100,
        defaultFailureRatePercent: 5,
        defaultLaborHourlyRate: 20,
      }).success,
    ).toBe(false)
  })
})
