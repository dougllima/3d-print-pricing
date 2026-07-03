import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS } from '@/shared/constants'
import type { CostCalculation } from '@/shared/types'

import App from './App'

const savedCalculation: CostCalculation = {
  id: 'calculation-1',
  name: 'Porta joias (2 un.)',
  snapshot: {
    materialName: 'PLA Preto, PLA Branco',
    materialPricePerKg: 125,
    printerName: 'A1',
    printerPowerWatts: 100,
    electricityCostPerKwh: 1,
    profitMarginPercent: 40,
    failureRatePercent: 5,
  },
  input: {
    quantity: 2,
    printTimeHours: 1.5,
    modelWeightGrams: 50,
    supportWeightGrams: 5,
    purgeWeightGrams: 5,
    otherWasteGrams: 0,
  },
  finishingTasks: [],
  result: {
    materialCost: 7.5,
    energyCost: 0.15,
    machineCost: 0,
    maintenanceCost: 0,
    failureReserveCost: 0.38,
    printingCost: 7.65,
    finishingCost: 0,
    totalCost: 8.03,
    suggestedPrice: 13.38,
    estimatedProfit: 5.35,
    realMarginPercent: 40,
    totalWeightGrams: 60,
    wasteWeightGrams: 10,
    wastePercent: 16.67,
  },
  createdAt: '2026-07-03T10:00:00.000Z',
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the dashboard as the initial workspace', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { name: /Vis.o geral/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Novo c.lculo/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Impress.es/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fila/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Configura..es/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhum c.lculo salvo ainda/i)).toBeInTheDocument()
  })

  it('opens materials and printers from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /Materiais/i }))
    expect(screen.getByRole('heading', { name: /Cat.logo de filamentos/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhum material ativo cadastrado/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Impressoras/i }))
    expect(screen.getByRole('heading', { name: /Cadastro de impressoras FDM/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhuma impressora ativa cadastrada/i)).toBeInTheDocument()
  })

  it('opens products and print profiles from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /Produtos/i }))
    expect(screen.getByRole('heading', { name: /Cat.logo de produtos/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhum produto ativo cadastrado/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Impress.es/i }))
    expect(screen.getByRole('heading', { name: /Perfis de fabrica..o/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhuma impress.o ativa cadastrada/i)).toBeInTheDocument()
  })

  it('opens print queue from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /Fila/i }))
    expect(screen.getByRole('heading', { name: /Fila de impress.o/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhuma impress.o na fila/i)).toBeInTheDocument()
  })

  it('opens history and settings from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Hist.rico$/i }))
    expect(screen.getByRole('heading', { name: /C.lculos salvos/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhum c.lculo salvo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Configura..es/i }))
    expect(screen.getByRole('heading', { name: /Par.metros globais/i })).toBeInTheDocument()
  })

  it('shows the complete snapshot of a saved calculation', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEYS.costCalculations, JSON.stringify([savedCalculation]))

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Hist.rico$/i }))
    const calculationHeading = await screen.findByRole('heading', {
      name: /Porta joias \(2 un\.\)/i,
    })

    await user.click(calculationHeading)

    expect(screen.getByRole('heading', { name: /Dados da impress.o/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Snapshot utilizado/i })).toBeInTheDocument()
    expect(screen.getByText('PLA Preto, PLA Branco')).toBeInTheDocument()
    expect(screen.getByText('1h 30min')).toBeInTheDocument()
  })
})
