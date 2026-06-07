import { describe, expect, it } from 'vitest'

import { formatCurrency, formatMinutes, formatWeightGrams } from './formatters'

describe('formatters', () => {
  it('formats values using Brazilian display conventions', () => {
    expect(formatCurrency(1234.5)).toBe('R$ 1.234,50')
    expect(formatWeightGrams(1500.25)).toBe('1.500,3 g')
    expect(formatMinutes(165)).toBe('2h 45min')
  })
})
