export type PrintQueueDeadlineStatus = 'none' | 'overdue' | 'today' | 'tomorrow' | 'upcoming'

export type PrintQueueDeadlineInfo = {
  dateLabel: string
  status: PrintQueueDeadlineStatus
  statusLabel: string
}

const millisecondsPerDay = 24 * 60 * 60 * 1000

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined) {
    return undefined
  }

  const date = new Date(year, month - 1, day)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatDeadlineDate(deadline: string) {
  const date = parseDateInputValue(deadline)

  if (date === undefined) {
    return deadline
  }

  return date.toLocaleDateString('pt-BR')
}

export function createPrintQueueDeadlineInfo(
  deadline: string | undefined,
  referenceDate = new Date(),
): PrintQueueDeadlineInfo {
  if (deadline === undefined || deadline.trim() === '') {
    return {
      dateLabel: '-',
      status: 'none',
      statusLabel: 'Sem prazo',
    }
  }

  const deadlineDate = parseDateInputValue(deadline)

  if (deadlineDate === undefined) {
    return {
      dateLabel: deadline,
      status: 'none',
      statusLabel: 'Prazo inválido',
    }
  }

  const differenceInDays = Math.round(
    (startOfDay(deadlineDate).getTime() - startOfDay(referenceDate).getTime()) /
      millisecondsPerDay,
  )

  if (differenceInDays < 0) {
    return {
      dateLabel: formatDeadlineDate(deadline),
      status: 'overdue',
      statusLabel: 'Atrasado',
    }
  }

  if (differenceInDays === 0) {
    return {
      dateLabel: formatDeadlineDate(deadline),
      status: 'today',
      statusLabel: 'Hoje',
    }
  }

  if (differenceInDays === 1) {
    return {
      dateLabel: formatDeadlineDate(deadline),
      status: 'tomorrow',
      statusLabel: 'Amanhã',
    }
  }

  return {
    dateLabel: formatDeadlineDate(deadline),
    status: 'upcoming',
    statusLabel: `Em ${differenceInDays} dias`,
  }
}
