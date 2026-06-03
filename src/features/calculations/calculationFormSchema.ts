import { z } from 'zod'

const optionalTextField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
)

const requiredTextField = z.string().trim().min(1, 'Selecione uma opção')

export const calculationFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do cálculo'),
  productId: optionalTextField,
  printProfileId: optionalTextField,
  printerId: requiredTextField,
  materialId: requiredTextField,
  quantity: z.number().int().positive('Informe uma quantidade maior que zero'),
  printTimeHours: z.number().nonnegative('Informe um tempo maior ou igual a zero'),
  modelWeightGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
  supportWeightGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
  purgeWeightGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
  otherWasteGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
  profitMarginPercent: z.number().min(0, 'Informe no mínimo 0%').max(99.99, 'Informe menos de 100%'),
  failureRatePercent: z.number().min(0, 'Informe no mínimo 0%').max(100, 'Informe no máximo 100%'),
})

export const finishingTaskFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do acabamento'),
  hours: z.number().nonnegative('Informe um tempo maior ou igual a zero'),
  hourlyRate: z.number().nonnegative('Informe um valor maior ou igual a zero'),
  materialCost: z.number().nonnegative('Informe um valor maior ou igual a zero'),
})

export type CalculationFormInputValues = z.input<typeof calculationFormSchema>
export type CalculationFormValues = z.output<typeof calculationFormSchema>
export type FinishingTaskFormInputValues = z.input<typeof finishingTaskFormSchema>
export type FinishingTaskFormValues = z.output<typeof finishingTaskFormSchema>
