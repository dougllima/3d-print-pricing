import { z } from 'zod'

const optionalTextField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
)

const optionalNonNegativeNumberField = z.preprocess(
  (value) => {
    if (value === '' || value === null || Number.isNaN(value)) {
      return undefined
    }

    return value
  },
  z.number().nonnegative('Informe um valor maior ou igual a zero').optional(),
)

const optionalPositiveNumberField = z.preprocess(
  (value) => {
    if (value === '' || value === null || Number.isNaN(value)) {
      return undefined
    }

    return value
  },
  z.number().positive('Informe um valor maior que zero').optional(),
)

const optionalPercentField = z.preprocess(
  (value) => {
    if (value === '' || value === null || Number.isNaN(value)) {
      return undefined
    }

    return value
  },
  z.number().min(0, 'Informe no mínimo 0%').max(100, 'Informe no máximo 100%').optional(),
)

export const printerFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da impressora'),
  model: optionalTextField,
  powerWatts: optionalNonNegativeNumberField,
  purchasePrice: optionalNonNegativeNumberField,
  estimatedLifetimeHours: optionalPositiveNumberField,
  maintenanceCostPerHour: optionalNonNegativeNumberField,
  defaultFailureRatePercent: optionalPercentField,
  notes: optionalTextField,
})

export type PrinterFormInputValues = z.input<typeof printerFormSchema>
export type PrinterFormValues = z.output<typeof printerFormSchema>
