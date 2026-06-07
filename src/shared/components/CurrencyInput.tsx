import { useState } from 'react'

type CurrencyInputProps = {
  className?: string
  disabled?: boolean
  id?: string
  onChange: (value: number | undefined) => void
  placeholder?: string
  value: number | undefined
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

function formatCurrency(value: number | undefined) {
  return value === undefined || Number.isNaN(value) ? '' : currencyFormatter.format(value)
}

function parseCurrency(value: string) {
  const normalizedValue = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')

  if (normalizedValue.trim() === '') {
    return undefined
  }

  const parsedValue = Number(normalizedValue)

  return Number.isNaN(parsedValue) ? undefined : parsedValue
}

export function CurrencyInput({
  className,
  disabled,
  id,
  onChange,
  placeholder = 'R$ 100,00',
  value,
}: CurrencyInputProps) {
  const [draftValue, setDraftValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const displayValue = isEditing ? draftValue : formatCurrency(value)

  return (
    <input
      className={className}
      disabled={disabled}
      id={id}
      inputMode="decimal"
      onBlur={() => setIsEditing(false)}
      onChange={(event) => {
        setDraftValue(event.target.value)
        onChange(parseCurrency(event.target.value))
      }}
      onFocus={() => {
        setDraftValue(formatCurrency(value))
        setIsEditing(true)
      }}
      placeholder={placeholder}
      type="text"
      value={displayValue}
    />
  )
}
