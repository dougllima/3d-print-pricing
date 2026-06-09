import { describe, expect, it } from 'vitest'

import { printProfileFormSchema } from './printProfileFormSchema'

describe('printProfileFormSchema', () => {
  it('accepts print profile data with plates and optional material links', () => {
    const result = printProfileFormSchema.safeParse({
      productId: '',
      name: 'Porta joias',
      printerId: 'printer-1',
      slicerProfileName: '',
      printRuns: [
        {
          id: 'run-1',
          quantity: 1,
          plates: [
            {
              id: 'plate-1',
              name: 'Base',
              printTimeHours: 2,
              printTimeMinutesPart: 30,
              materials: [
                {
                  id: 'usage-1',
                  materialId: '',
                  label: 'Cor principal',
                  modelWeightGrams: 42,
                  supportWeightGrams: 0,
                  purgeWeightGrams: 0,
                  otherWasteGrams: 0,
                },
              ],
            },
          ],
        },
      ],
      notes: '',
    })

    expect(result.success).toBe(true)
    expect(result.data?.productId).toBeUndefined()
    expect(result.data?.printRuns[0]?.plates[0]?.materials[0]?.materialId).toBeUndefined()
  })

  it('requires printer and at least one plate', () => {
    const result = printProfileFormSchema.safeParse({
      name: 'Porta joias',
      printerId: '',
      printRuns: [
        {
          id: 'run-1',
          quantity: 1,
          plates: [],
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})
