import { describe, expect, it } from 'vitest'

import { printRunCalculationFormSchema } from './printRunCalculationFormSchema'

describe('printRunCalculationFormSchema', () => {
  it('accepts valid calculation settings and finishing tasks', () => {
    expect(
      printRunCalculationFormSchema.safeParse({
        failureRatePercent: 5,
        finishingTasks: [
          {
            id: 'task-1',
            name: 'Montagem',
            hours: 1,
            hourlyRate: 25,
            materialCost: 5,
          },
        ],
        profitMarginPercent: 40,
      }).success,
    ).toBe(true)
  })

  it('rejects invalid margins and incomplete finishing tasks', () => {
    const result = printRunCalculationFormSchema.safeParse({
      failureRatePercent: -1,
      finishingTasks: [
        {
          id: 'task-1',
          name: '',
          hours: 1,
          hourlyRate: 25,
          materialCost: 0,
        },
      ],
      profitMarginPercent: 100,
    })

    expect(result.success).toBe(false)
  })
})
