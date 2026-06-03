import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the materials workspace with Portuguese navigation', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Catálogo de filamentos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Novo cálculo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Impressões/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Configurações/i })).toBeInTheDocument()
    expect(await screen.findByText('Nenhum material cadastrado.')).toBeInTheDocument()
  })

  it('opens the printers workspace from navigation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /Impressoras/i }))

    expect(screen.getByRole('heading', { name: 'Cadastro de impressoras FDM' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhuma impressora cadastrada.')).toBeInTheDocument()
  })
})
