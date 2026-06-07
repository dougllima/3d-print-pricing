import { z } from 'zod'

import { materialTypeSchema } from '@/shared/types'
import {
  optionalNonNegativeNumberField,
  optionalPositiveNumberField,
  optionalTextField,
} from '@/shared/validation'

const optionalHexColorField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .string()
    .trim()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Informe uma cor HEX válida')
    .optional(),
)

export const materialFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do material'),
  type: materialTypeSchema,
  brand: optionalTextField,
  colorName: optionalTextField,
  colorHex: optionalHexColorField,
  supplierColorCode: optionalTextField,
  pricePerKg: z.number().positive('Informe um preço maior que zero'),
  spoolWeightGrams: optionalPositiveNumberField,
  remainingWeightGrams: optionalNonNegativeNumberField,
  lowStockThresholdGrams: optionalNonNegativeNumberField,
  notes: optionalTextField,
})

export type MaterialFormInputValues = z.input<typeof materialFormSchema>
export type MaterialFormValues = z.output<typeof materialFormSchema>
