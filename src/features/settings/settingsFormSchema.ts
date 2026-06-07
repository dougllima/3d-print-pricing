import { z } from 'zod'

import { optionalNonNegativeNumberField } from '@/shared/validation'

export const settingsFormSchema = z.object({
  electricityCostPerKwh: z.number().nonnegative('Informe um valor maior ou igual a zero'),
  defaultProfitMarginPercent: z
    .number()
    .min(0, 'Informe no mínimo 0%')
    .max(99.99, 'Informe menos de 100%'),
  defaultFailureRatePercent: z
    .number()
    .min(0, 'Informe no mínimo 0%')
    .max(100, 'Informe no máximo 100%'),
  defaultLaborHourlyRate: z.number().nonnegative('Informe um valor maior ou igual a zero'),
  defaultMinimumPrice: optionalNonNegativeNumberField,
})

export type SettingsFormInputValues = z.input<typeof settingsFormSchema>
export type SettingsFormValues = z.output<typeof settingsFormSchema>
