import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the dashboard as the initial workspace', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Visão geral do MVP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Novo cálculo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Impressões/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Configurações/i })).toBeInTheDocument()
    expect(await screen.findByText('Nenhum cálculo salvo ainda.')).toBeInTheDocument()
  })

  it('opens materials and printers from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /Materiais/i }))
    expect(screen.getByRole('heading', { name: 'Catálogo de filamentos' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhum material cadastrado.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Impressoras/i }))
    expect(screen.getByRole('heading', { name: 'Cadastro de impressoras FDM' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhuma impressora cadastrada.')).toBeInTheDocument()
  })

  it('opens products and print profiles from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /Produtos/i }))
    expect(screen.getByRole('heading', { name: 'Catálogo de produtos' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhum produto cadastrado.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Impressões/i }))
    expect(screen.getByRole('heading', { name: 'Perfis de fabricação' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhuma impressão cadastrada.')).toBeInTheDocument()
  })

  it('opens calculation, history and settings from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /Novo cálculo/i }))
    expect(screen.getByRole('heading', { name: 'Calcular custo e preço' })).toBeInTheDocument()
    expect(screen.getByText('Preencha os dados e calcule para ver o detalhamento.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Histórico$/i }))
    expect(screen.getByRole('heading', { name: 'Cálculos salvos' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhum cálculo salvo.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Configurações/i }))
    expect(screen.getByRole('heading', { name: 'Parâmetros globais' })).toBeInTheDocument()
  })
})
