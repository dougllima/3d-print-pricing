import { describe, expect, it } from 'vitest'

import {
  optionalNonNegativeNumberField,
  optionalPercentField,
  optionalTextField,
} from './formFields'

describe('form field schemas', () => {
  it('normalizes empty optional values', () => {
    expect(optionalTextField.parse('')).toBeUndefined()
    expect(optionalNonNegativeNumberField.parse(Number.NaN)).toBeUndefined()
  })

  it('validates numeric constraints', () => {
    expect(optionalNonNegativeNumberField.safeParse(-1).success).toBe(false)
    expect(optionalPercentField.safeParse(101).success).toBe(false)
    expect(optionalPercentField.safeParse(40).success).toBe(true)
  })
})
