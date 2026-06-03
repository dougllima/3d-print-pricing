import { describe, expect, it } from 'vitest'

import { materialFormSchema } from './materialFormSchema'

describe('materialFormSchema', () => {
  it('accepts valid material form values with optional HEX color', () => {
    const result = materialFormSchema.safeParse({
      name: 'PLA Preto',
      type: 'PLA',
      brand: '',
      colorName: 'Preto',
      colorHex: '#111827',
      supplierColorCode: '',
      pricePerKg: 90,
      notes: '',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      name: 'PLA Preto',
      type: 'PLA',
      brand: undefined,
      colorName: 'Preto',
      colorHex: '#111827',
      supplierColorCode: undefined,
      pricePerKg: 90,
      notes: undefined,
    })
  })

  it('rejects invalid HEX color and non-positive price', () => {
    const result = materialFormSchema.safeParse({
      name: 'PLA Preto',
      type: 'PLA',
      colorHex: '111827',
      pricePerKg: 0,
    })

    expect(result.success).toBe(false)
  })
})
