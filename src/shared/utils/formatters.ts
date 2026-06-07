const brlCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

const weightFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

export function formatCurrency(value: number) {
  return brlCurrencyFormatter.format(value)
}

export function formatOptionalCurrency(value: number | undefined) {
  return value === undefined || Number.isNaN(value) ? '' : formatCurrency(value)
}

export function formatWeightGrams(value: number) {
  return `${weightFormatter.format(value)} g`
}

export function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}h ${minutes.toString().padStart(2, '0')}min`
}
