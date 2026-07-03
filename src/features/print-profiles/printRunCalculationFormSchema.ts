import { z } from 'zod'

const finishingTaskSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Informe o nome do acabamento'),
  hours: z.number().min(0, 'O tempo não pode ser negativo'),
  hourlyRate: z.number().min(0, 'O valor por hora não pode ser negativo'),
  materialCost: z.number().min(0, 'O custo de material não pode ser negativo'),
})

export const printRunCalculationFormSchema = z.object({
  failureRatePercent: z
    .number()
    .min(0, 'A taxa de falha não pode ser negativa')
    .max(100, 'A taxa de falha deve ser de no máximo 100%'),
  finishingTasks: z.array(finishingTaskSchema),
  profitMarginPercent: z
    .number()
    .min(0, 'A margem não pode ser negativa')
    .max(99.99, 'A margem deve ser menor que 100%'),
})

export type PrintRunCalculationFormValues = z.infer<typeof printRunCalculationFormSchema>
