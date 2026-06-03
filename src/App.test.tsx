import { render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  it('renders the initial Portuguese navigation', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Fundação do aplicativo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Novo cálculo/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Impressões/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Configurações/i })).toBeInTheDocument()
  })
})
