import { z } from 'zod'

import {
  optionalNonNegativeIntegerField,
  optionalPercentField,
  optionalPositiveNumberField,
  optionalTextField,
  requiredTextField,
} from '@/shared/validation'

export const printProfileMaterialUsageFormSchema = z.object({
  id: z.string().trim().min(1),
  materialId: requiredTextField,
  modelWeightGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
  supportWeightGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
  purgeWeightGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
  otherWasteGrams: z.number().nonnegative('Informe um peso maior ou igual a zero'),
})

export const printProfileRunFormSchema = z.object({
  id: z.string().trim().min(1),
  quantity: z.number().int().positive('Informe uma quantidade maior que zero'),
  printTimeHours: z.number().int().nonnegative('Informe horas maior ou igual a zero'),
  printTimeMinutesPart: z
    .number()
    .int()
    .min(0, 'Informe minutos entre 0 e 59')
    .max(59, 'Informe minutos entre 0 e 59'),
  materials: z.array(printProfileMaterialUsageFormSchema).min(1, 'Adicione ao menos um material'),
})

export const printProfileFormSchema = z.object({
  productId: optionalTextField,
  name: z.string().trim().min(1, 'Informe o nome da impressão'),
  printerId: requiredTextField,
  slicerProfileName: optionalTextField,
  layerHeightMm: optionalPositiveNumberField,
  nozzleDiameterMm: optionalPositiveNumberField,
  infillPercent: optionalPercentField,
  wallLoops: optionalNonNegativeIntegerField,
  printRuns: z.array(printProfileRunFormSchema).min(1, 'Adicione ao menos uma quantidade'),
  notes: optionalTextField,
})

export type PrintProfileFormInputValues = z.input<typeof printProfileFormSchema>
export type PrintProfileFormValues = z.output<typeof printProfileFormSchema>
