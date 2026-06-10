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

    expect(screen.getByRole('heading', { name: /Vis.o geral do MVP/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Novo c.lculo/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Impress.es/i })).toBeInTheDocument()
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

  it('opens history and settings from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Hist.rico$/i }))
    expect(screen.getByRole('heading', { name: /C.lculos salvos/i })).toBeInTheDocument()
    expect(await screen.findByText(/Nenhum c.lculo salvo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Configura..es/i }))
    expect(screen.getByRole('heading', { name: /Par.metros globais/i })).toBeInTheDocument()
  })
})
