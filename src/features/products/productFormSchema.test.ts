import { describe, expect, it } from 'vitest'

import { productFormSchema } from './productFormSchema'

describe('productFormSchema', () => {
  it('accepts catalog-only product data with multiple categories', () => {
    const result = productFormSchema.safeParse({
      name: 'Suporte de controle',
      description: '',
      categories: ['Organizacao', 'Casa'],
      notes: '',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      name: 'Suporte de controle',
      description: undefined,
      categories: ['Organizacao', 'Casa'],
      notes: undefined,
    })
  })

  it('does not allow manufacturing fields in product form data', () => {
    const result = productFormSchema.strict().safeParse({
      name: 'Suporte de controle',
      materialId: 'material-1',
      printTimeHours: 2,
    })

    expect(result.success).toBe(false)
  })
})
