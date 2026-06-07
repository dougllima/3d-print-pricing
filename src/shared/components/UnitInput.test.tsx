import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { UnitInput } from './UnitInput'

describe('UnitInput', () => {
  it('shows a fixed unit and parses comma decimals', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    function TestUnitInput() {
      const [value, setValue] = useState<number | undefined>()

      return (
        <UnitInput
          onChange={(nextValue) => {
            setValue(nextValue)
            onChange(nextValue)
          }}
          unit="g"
          value={value}
        />
      )
    }

    render(<TestUnitInput />)

    await user.type(screen.getByRole('textbox'), '12,5')

    expect(screen.getByText('g')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(12.5)
  })
})
