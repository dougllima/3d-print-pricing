import { describe, expect, it } from 'vitest'

import { calculationFormSchema, finishingTaskFormSchema } from './calculationFormSchema'

describe('calculationFormSchema', () => {
  it('accepts standalone calculation inputs', () => {
    const result = calculationFormSchema.safeParse({
      name: 'Cálculo avulso',
      productId: '',
      printProfileId: '',
      printerId: 'printer-1',
      materialId: 'material-1',
      quantity: 1,
      printTimeHours: 2,
      modelWeightGrams: 40,
      supportWeightGrams: 0,
      purgeWeightGrams: 0,
      otherWasteGrams: 0,
      profitMarginPercent: 40,
      failureRatePercent: 5,
    })

    expect(result.success).toBe(true)
    expect(result.data?.productId).toBeUndefined()
    expect(result.data?.printProfileId).toBeUndefined()
  })

  it('validates finishing task inputs', () => {
    expect(
      finishingTaskFormSchema.safeParse({
        name: 'Pintura',
        hours: 1,
        hourlyRate: 30,
        materialCost: 10,
      }).success,
    ).toBe(true)
  })
})
