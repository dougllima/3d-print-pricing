import { useState } from 'react'

import { formatOptionalCurrency } from '@/shared/utils'

type CurrencyInputProps = {
  className?: string
  disabled?: boolean
  id?: string
  onChange: (value: number | undefined) => void
  placeholder?: string
  value: number | undefined
}

function parseCurrency(value: string) {
  // Keep the form state numeric while allowing users to type the familiar BRL shape:
  // "R$ 1.234,56" becomes 1234.56.
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
  // While the user is editing, preserve exactly what they typed. Outside editing,
  // always display the canonical formatted currency value from form state.
  const displayValue = isEditing ? draftValue : formatOptionalCurrency(value)

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
        setDraftValue(formatOptionalCurrency(value))
        setIsEditing(true)
      }}
      placeholder={placeholder}
      type="text"
      value={displayValue}
    />
  )
}
