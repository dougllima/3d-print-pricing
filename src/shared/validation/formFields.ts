import { z } from 'zod'

function emptyNumberToUndefined(value: unknown) {
  if (value === '' || value === null || Number.isNaN(value)) {
    return undefined
  }

  return value
}

export const optionalTextField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
)

export const requiredTextField = z.string().trim().min(1, 'Selecione uma opção')

export const optionalNonNegativeNumberField = z.preprocess(
  emptyNumberToUndefined,
  z.number().nonnegative('Informe um valor maior ou igual a zero').optional(),
)

export const optionalPositiveNumberField = z.preprocess(
  emptyNumberToUndefined,
  z.number().positive('Informe um valor maior que zero').optional(),
)

export const optionalNonNegativeIntegerField = z.preprocess(
  emptyNumberToUndefined,
  z.number().int().nonnegative('Informe um valor maior ou igual a zero').optional(),
)

export const optionalPercentField = z.preprocess(
  emptyNumberToUndefined,
  z.number().min(0, 'Informe no mínimo 0%').max(100, 'Informe no máximo 100%').optional(),
)
