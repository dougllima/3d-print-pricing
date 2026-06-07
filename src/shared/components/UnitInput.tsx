import { useState } from 'react'

type UnitInputProps = {
  className?: string
  containerClassName?: string
  disabled?: boolean
  id?: string
  max?: number
  min?: number
  onChange: (value: number | undefined) => void
  placeholder?: string
  step?: number
  unit: string
  value: number | undefined
}

function parseUnitValue(value: string) {
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

function formatUnitValue(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return ''
  }

  return String(value).replace('.', ',')
}

export function UnitInput({
  className,
  containerClassName,
  disabled,
  id,
  max,
  min,
  onChange,
  placeholder,
  step,
  unit,
  value,
}: UnitInputProps) {
  const [draftValue, setDraftValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const displayValue = isEditing ? draftValue : formatUnitValue(value)

  return (
    <span
      className={`${containerClassName ?? 'mt-1'} flex w-full rounded-md border border-[#cfd7dc] bg-white focus-within:border-[#1f7a78]`}
    >
      <input
        className={`w-full rounded-l-md bg-white px-3 py-2 text-sm outline-none ${className ?? ''}`}
        disabled={disabled}
        id={id}
        inputMode="decimal"
        max={max}
        min={min}
        onBlur={() => setIsEditing(false)}
        onChange={(event) => {
          setDraftValue(event.target.value)
          onChange(parseUnitValue(event.target.value))
        }}
        onFocus={() => {
          setDraftValue(formatUnitValue(value))
          setIsEditing(true)
        }}
        placeholder={placeholder}
        step={step}
        type="text"
        value={displayValue}
      />
      <span className="flex min-w-12 items-center justify-center border-l border-[#cfd7dc] px-3 text-sm text-[#697782]">
        {unit}
      </span>
    </span>
  )
}
