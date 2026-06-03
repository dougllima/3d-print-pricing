import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the materials workspace with Portuguese navigation', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Catálogo de filamentos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Novo cálculo/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Impressões/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Configurações/i })).toBeInTheDocument()
    expect(await screen.findByText('Nenhum material cadastrado.')).toBeInTheDocument()
  })
})
