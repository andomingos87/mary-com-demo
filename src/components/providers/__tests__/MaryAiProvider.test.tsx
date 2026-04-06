import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { MaryAiProvider, useMaryAi } from '@/components/providers/MaryAiProvider'
import { useOrganization } from '@/components/providers/OrganizationProvider'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/components/providers/OrganizationProvider', () => ({
  useOrganization: jest.fn(),
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>

function TestConsumer() {
  const { isOpen, toggle, currentPage, currentProfile, projectCodename } = useMaryAi()

  return (
    <div>
      <p data-testid="is-open">{String(isOpen)}</p>
      <p data-testid="current-page">{currentPage}</p>
      <p data-testid="current-profile">{currentProfile ?? 'null'}</p>
      <p data-testid="project-codename">{projectCodename ?? 'null'}</p>
      <button type="button" onClick={toggle}>
        Toggle
      </button>
    </div>
  )
}

describe('MaryAiProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/acme/projects/tiger')
    mockUseOrganization.mockReturnValue({
      organization: {
        profileType: 'investor',
      },
    } as never)
  })

  it('exposes expected fields from context', () => {
    render(
      <MaryAiProvider>
        <TestConsumer />
      </MaryAiProvider>
    )

    expect(screen.getByTestId('is-open')).toHaveTextContent('false')
    expect(screen.getByTestId('current-page')).toHaveTextContent('/acme/projects/tiger')
    expect(screen.getByTestId('current-profile')).toHaveTextContent('investor')
    expect(screen.getByTestId('project-codename')).toHaveTextContent('tiger')
  })

  it('toggles open state', () => {
    render(
      <MaryAiProvider>
        <TestConsumer />
      </MaryAiProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.getByTestId('is-open')).toHaveTextContent('true')
  })

  it('updates current page and project codename when pathname changes', () => {
    const { rerender } = render(
      <MaryAiProvider>
        <TestConsumer />
      </MaryAiProvider>
    )

    expect(screen.getByTestId('project-codename')).toHaveTextContent('tiger')

    mockUsePathname.mockReturnValue('/acme/radar')

    rerender(
      <MaryAiProvider>
        <TestConsumer />
      </MaryAiProvider>
    )

    expect(screen.getByTestId('current-page')).toHaveTextContent('/acme/radar')
    expect(screen.getByTestId('project-codename')).toHaveTextContent('null')
  })
})
