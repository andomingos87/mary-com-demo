import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThesisManager } from '@/components/thesis/ThesisManager'

jest.mock('@/lib/actions/thesis', () => ({
  createThesis: jest.fn(async () => ({ success: true })),
  updateThesis: jest.fn(async () => ({ success: true })),
  activateThesis: jest.fn(async () => ({ success: true })),
  deleteThesis: jest.fn(async () => ({ success: true })),
}))

describe('ThesisManager H0.6', () => {
  it('renderiza CTA de criação sem rótulo de salvar manual', () => {
    render(<ThesisManager organizationId="org-1" readOnlyMode={false} initialTheses={[]} />)

    expect(screen.getByRole('button', { name: 'Nova Tese' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Salvar/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/salvar manualmente/i)).not.toBeInTheDocument()
  })
})
