import { z } from 'zod'

const optionalTextField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
)

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do produto'),
  description: optionalTextField,
  category: optionalTextField,
  notes: optionalTextField,
})

export type ProductFormInputValues = z.input<typeof productFormSchema>
export type ProductFormValues = z.output<typeof productFormSchema>
