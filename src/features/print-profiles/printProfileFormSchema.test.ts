import { describe, expect, it } from 'vitest'

import { printProfileFormSchema } from './printProfileFormSchema'

describe('printProfileFormSchema', () => {
  it('accepts standalone print profile data', () => {
    const result = printProfileFormSchema.safeParse({
      productId: '',
      name: 'PLA Preto - 0.2mm',
      printerId: 'printer-1',
      materialId: 'material-1',
      slicerProfileName: '',
      layerHeightMm: 0.2,
      nozzleDiameterMm: 0.4,
      infillPercent: 15,
      wallLoops: 3,
      printTimeHours: 2.5,
      modelWeightGrams: 42,
      supportWeightGrams: 0,
      purgeWeightGrams: 0,
      otherWasteGrams: 0,
      notes: '',
    })

    expect(result.success).toBe(true)
    expect(result.data?.productId).toBeUndefined()
    expect(result.data?.slicerProfileName).toBeUndefined()
  })

  it('requires printer and material links', () => {
    const result = printProfileFormSchema.safeParse({
      name: 'PLA Preto - 0.2mm',
      printerId: '',
      materialId: '',
      printTimeHours: 2.5,
      modelWeightGrams: 42,
      supportWeightGrams: 0,
      purgeWeightGrams: 0,
      otherWasteGrams: 0,
    })

    expect(result.success).toBe(false)
  })
})
