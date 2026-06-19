import { describe, expect, it } from 'vitest'

import { createPrintQueueDeadlineInfo, formatDeadlineDate } from './printQueueDeadline'

const referenceDate = new Date(2026, 5, 18)

describe('print queue deadline', () => {
  it('formats date input values as pt-BR dates', () => {
    expect(formatDeadlineDate('2026-06-18')).toBe('18/06/2026')
  })

  it('returns an empty deadline status when deadline is missing', () => {
    expect(createPrintQueueDeadlineInfo(undefined, referenceDate)).toEqual({
      dateLabel: '-',
      status: 'none',
      statusLabel: 'Sem prazo',
    })
  })

  it('classifies overdue, today, tomorrow and upcoming deadlines', () => {
    expect(createPrintQueueDeadlineInfo('2026-06-17', referenceDate).statusLabel).toBe('Atrasado')
    expect(createPrintQueueDeadlineInfo('2026-06-18', referenceDate).statusLabel).toBe('Hoje')
    expect(createPrintQueueDeadlineInfo('2026-06-19', referenceDate).statusLabel).toBe('Amanhã')
    expect(createPrintQueueDeadlineInfo('2026-06-23', referenceDate).statusLabel).toBe('Em 5 dias')
  })

  it('keeps invalid deadline values visible', () => {
    expect(createPrintQueueDeadlineInfo('invalid-date', referenceDate)).toEqual({
      dateLabel: 'invalid-date',
      status: 'none',
      statusLabel: 'Prazo inválido',
    })
  })
})
