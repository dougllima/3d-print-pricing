import { z } from 'zod'

import { optionalTextField } from '@/shared/validation'

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do produto'),
  description: optionalTextField,
  categories: z.array(z.string().trim().min(1)),
  notes: optionalTextField,
})

export type ProductFormInputValues = z.input<typeof productFormSchema>
export type ProductFormValues = z.output<typeof productFormSchema>
