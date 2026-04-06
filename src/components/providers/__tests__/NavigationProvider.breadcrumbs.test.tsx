import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import {
  NavigationProvider,
  useBreadcrumbLoading,
  useBreadcrumbs,
} from '@/components/providers/NavigationProvider'

const mockUsePathname = jest.fn()
const mockGetProjectBreadcrumbLabel = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

jest.mock('@/components/providers/OrganizationProvider', () => ({
  useOrganization: () => ({ organization: null }),
}))

jest.mock('@/lib/actions/projects', () => ({
  getProjectBreadcrumbLabel: (...args: unknown[]) => mockGetProjectBreadcrumbLabel(...args),
}))

function BreadcrumbProbe() {
  const breadcrumbs = useBreadcrumbs()
  const loading = useBreadcrumbLoading()

  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="labels">{breadcrumbs.map((item) => item.label).join(' > ')}</span>
    </div>
  )
}

describe('NavigationProvider breadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('usa Início literal para rota comum', () => {
    mockUsePathname.mockReturnValue('/acme/radar')

    render(
      <NavigationProvider profileType="investor" orgSlug="acme">
        <BreadcrumbProbe />
      </NavigationProvider>
    )

    expect(screen.getByTestId('labels')).toHaveTextContent('Início > Radar')
    expect(mockGetProjectBreadcrumbLabel).not.toHaveBeenCalled()
  })

  it('resolve label do projeto para breadcrumb em rota de detalhe', async () => {
    mockUsePathname.mockReturnValue('/acme/projects/tiger/members')
    mockGetProjectBreadcrumbLabel.mockResolvedValue({
      success: true,
      data: { label: 'Projeto Tiger' },
    })

    render(
      <NavigationProvider profileType="investor" orgSlug="acme">
        <BreadcrumbProbe />
      </NavigationProvider>
    )

    await waitFor(() => {
      expect(mockGetProjectBreadcrumbLabel).toHaveBeenCalledWith('acme', 'tiger')
      expect(screen.getByTestId('labels')).toHaveTextContent(
        'Início > Pipeline > Projeto Tiger > Membros'
      )
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })
  })
})
