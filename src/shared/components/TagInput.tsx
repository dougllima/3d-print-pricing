import { Plus, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'

import { inputClassName, secondaryButtonClassName } from '@/shared/styles'

type TagInputProps = {
  addLabel?: string
  onChange: (values: string[]) => void
  placeholder?: string
  suggestions: string[]
  value: string[]
}

function normalizeTag(value: string) {
  return value.trim()
}

export function TagInput({
  addLabel = 'Adicionar',
  onChange,
  placeholder,
  suggestions,
  value,
}: TagInputProps) {
  const datalistId = useId()
  const [draftValue, setDraftValue] = useState('')
  const availableSuggestions = useMemo(
    () =>
      suggestions
        .filter((suggestion) => !value.some((tag) => tag.toLowerCase() === suggestion.toLowerCase()))
        .toSorted((first, second) => first.localeCompare(second)),
    [suggestions, value],
  )

  function addTag() {
    const tag = normalizeTag(draftValue)

    if (tag === '' || value.some((currentTag) => currentTag.toLowerCase() === tag.toLowerCase())) {
      return
    }

    onChange([...value, tag])
    setDraftValue('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className={inputClassName}
          list={datalistId}
          onChange={(event) => setDraftValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
          value={draftValue}
        />
        <button className={secondaryButtonClassName} onClick={addTag} type="button">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </button>
      </div>
      <datalist id={datalistId}>
        {availableSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-[#e8eef0] px-2 py-1 text-xs font-medium text-[#52616b]"
              key={tag}
            >
              {tag}
              <button
                aria-label={`Remover ${tag}`}
                className="text-[#34434d]"
                onClick={() => onChange(value.filter((currentTag) => currentTag !== tag))}
                type="button"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
