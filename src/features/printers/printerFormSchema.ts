import { z } from 'zod'

import {
  optionalNonNegativeNumberField,
  optionalPercentField,
  optionalPositiveNumberField,
  optionalTextField,
} from '@/shared/validation'

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
