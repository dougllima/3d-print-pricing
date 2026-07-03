import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GlobalSettings, Material, Printer, PrintProfile } from '@/shared/types'

import { PrintRunCalculationDialog } from './PrintRunCalculationDialog'

const now = '2026-07-03T10:00:00.000Z'

const settings: GlobalSettings = {
  currency: 'BRL',
  electricityCostPerKwh: 1,
  defaultProfitMarginPercent: 40,
  defaultFailureRatePercent: 5,
  defaultLaborHourlyRate: 25,
}

const printer: Printer = {
  id: 'printer-1',
  name: 'A1',
  powerWatts: 100,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

const materials: Material[] = [
  {
    id: 'material-1',
    name: 'PLA Preto',
    type: 'PLA',
    pricePerKg: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

const printRun: PrintProfile['printRuns'][number] = {
  id: 'run-1',
  quantity: 2,
  plates: [
    {
      id: 'plate-1',
      name: 'Base',
      printTimeMinutes: 90,
      materials: [
        {
          id: 'usage-1',
          materialId: 'material-1',
          modelWeightGrams: 50,
          supportWeightGrams: 5,
          purgeWeightGrams: 5,
          otherWasteGrams: 0,
        },
      ],
    },
  ],
}

const printProfile: PrintProfile = {
  id: 'profile-1',
  name: 'Porta joias',
  printerId: 'printer-1',
  printRuns: [printRun],
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

describe('PrintRunCalculationDialog', () => {
  it('shows slicer totals and saves a configured calculation', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(
      <PrintRunCalculationDialog
        materials={materials}
        onClose={vi.fn()}
        onSave={onSave}
        printer={printer}
        printProfile={printProfile}
        printRun={printRun}
        settings={settings}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('1h 30min')).toBeInTheDocument()
    expect(screen.getByText('60 g')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Adicionar/i }))
    await user.type(screen.getByLabelText('Nome'), 'Montagem')
    await user.click(screen.getByRole('button', { name: /^Salvar$/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      finishingTasks: [{ name: 'Montagem', hourlyRate: 25 }],
      snapshot: {
        failureRatePercent: 5,
        profitMarginPercent: 40,
      },
    })
  })
})
