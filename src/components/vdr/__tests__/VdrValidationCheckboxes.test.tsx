/**
 * Tests for VdrValidationCheckboxes component
 * N1/N2/N3 governance: N1=asset, N2=advisor, N3=owner/admin (G1)
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { VdrValidationCheckboxes } from '../VdrValidationCheckboxes'

const mockDocument = {
  id: 'doc-1',
  validation_n1: false,
  validation_n1_at: null,
  validation_n1_by_name: null,
  validation_n2: false,
  validation_n2_at: null,
  validation_n2_by_name: null,
  validation_n3: false,
  validation_n3_at: null,
  validation_n3_by_name: null,
}

function renderWithTooltip(ui: React.ReactElement) {
  return render(
    <TooltipProvider>
      {ui}
    </TooltipProvider>
  )
}

function getCheckboxes(container: HTMLElement) {
  const checkboxes = container.querySelectorAll('[role="checkbox"]')
  return {
    n1: checkboxes[0] as HTMLButtonElement,
    n2: checkboxes[1] as HTMLButtonElement,
    n3: checkboxes[2] as HTMLButtonElement,
  }
}

describe('VdrValidationCheckboxes', () => {
  describe('N1/N2/N3 governance by profile and role', () => {
    it('Asset + owner: N1 enabled, N2 disabled, N3 enabled', () => {
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="asset"
          userRole="owner"
        />
      )
      const { n1, n2, n3 } = getCheckboxes(container)

      expect(n1).not.toHaveAttribute('data-disabled')
      expect(n2).toHaveAttribute('data-disabled')
      expect(n3).not.toHaveAttribute('data-disabled')
    })

    it('Asset + admin: N1 enabled, N2 disabled, N3 enabled', () => {
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="asset"
          userRole="admin"
        />
      )
      const { n1, n2, n3 } = getCheckboxes(container)

      expect(n1).not.toHaveAttribute('data-disabled')
      expect(n2).toHaveAttribute('data-disabled')
      expect(n3).not.toHaveAttribute('data-disabled')
    })

    it('Asset + member: N1 enabled, N2 disabled, N3 disabled', () => {
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="asset"
          userRole="member"
        />
      )
      const { n1, n2, n3 } = getCheckboxes(container)

      expect(n1).not.toHaveAttribute('data-disabled')
      expect(n2).toHaveAttribute('data-disabled')
      expect(n3).toHaveAttribute('data-disabled')
    })

    it('Asset + viewer: N1 enabled, N2 disabled, N3 disabled', () => {
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="asset"
          userRole="viewer"
        />
      )
      const { n1, n2, n3 } = getCheckboxes(container)

      expect(n1).not.toHaveAttribute('data-disabled')
      expect(n2).toHaveAttribute('data-disabled')
      expect(n3).toHaveAttribute('data-disabled')
    })

    it('Advisor (userRole null - not in project org): N1 disabled, N2 enabled, N3 disabled', () => {
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="advisor"
          userRole={null}
        />
      )
      const { n1, n2, n3 } = getCheckboxes(container)

      expect(n1).toHaveAttribute('data-disabled')
      expect(n2).not.toHaveAttribute('data-disabled')
      expect(n3).toHaveAttribute('data-disabled')
    })

    it('Investor (userRole null): N1 disabled, N2 disabled, N3 disabled', () => {
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="investor"
          userRole={null}
        />
      )
      const { n1, n2, n3 } = getCheckboxes(container)

      expect(n1).toHaveAttribute('data-disabled')
      expect(n2).toHaveAttribute('data-disabled')
      expect(n3).toHaveAttribute('data-disabled')
    })

    it('Investor (userRole undefined): N3 disabled', () => {
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="investor"
        />
      )
      const { n3 } = getCheckboxes(container)

      expect(n3).toHaveAttribute('data-disabled')
    })
  })

  describe('labels', () => {
    it('renders N1, N2, N3 labels', () => {
      renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="asset"
          userRole="admin"
        />
      )

      expect(screen.getByText('N1')).toBeInTheDocument()
      expect(screen.getByText('N2')).toBeInTheDocument()
      expect(screen.getByText('N3')).toBeInTheDocument()
    })
  })

  describe('onValidate callback', () => {
    it('calls onValidate when checkbox is toggled', async () => {
      const onValidate = jest.fn().mockResolvedValue(undefined)
      const { container } = renderWithTooltip(
        <VdrValidationCheckboxes
          document={mockDocument}
          userProfile="asset"
          userRole="admin"
          onValidate={onValidate}
        />
      )

      const { n1 } = getCheckboxes(container)

      await act(async () => {
        n1.click()
      })

      expect(onValidate).toHaveBeenCalledWith('doc-1', 'n1', true)
    })
  })
})
