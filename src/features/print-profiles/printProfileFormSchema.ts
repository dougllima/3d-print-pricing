import { z } from 'zod'

const optionalTextField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
)

const requiredTextField = z.string().trim().min(1, 'Selecione uma opção')

const optionalPositiveNumberField = z.preprocess(
  (value) => {
    if (value === '' || value === null || Number.isNaN(value)) {
      return undefined
    }

    return value
  },
  z.number().positive('Informe um valor maior que zero').optional(),
)

const optionalNonNegativeIntegerField = z.preprocess(
  (value) => {
    if (value === '' || value === null || Number.isNaN(value)) {
      return undefined
    }

    return value
  },
  z.number().int().nonnegative('Informe um valor maior ou igual a zero').optional(),
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
