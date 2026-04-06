import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { UserMenu } from '../UserMenu'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import { logoutAction } from '@/lib/actions/auth'

jest.mock('@/components/providers/OrganizationProvider', () => ({
  useOrganization: jest.fn(),
}))

jest.mock('@/lib/actions/auth', () => ({
  logoutAction: jest.fn(async () => ({ success: true })),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onSelect,
    asChild,
    ...props
  }: {
    children: React.ReactNode
    onSelect?: () => void
    asChild?: boolean
  }) => {
    if (asChild) return <div role="menuitem">{children}</div>
    return (
      <button type="button" role="menuitem" onClick={onSelect} {...props}>
        {children}
      </button>
    )
  },
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}))

const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>
const mockLogoutAction = logoutAction as jest.MockedFunction<typeof logoutAction>

describe('UserMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOrganization.mockReturnValue({
      currentUser: {
        id: 'user-1',
        email: 'maria@example.com',
        fullName: 'Maria Silva',
        avatarUrl: null,
        profileTypeLabel: 'Investor',
      },
      organization: {
        id: 'org-1',
        name: 'Mary Capital',
        slug: 'mary-capital',
        profileType: 'investor',
        logoUrl: null,
        verificationStatus: 'verified',
        onboardingStep: 'completed',
      },
      membership: null,
      permissions: null,
      readOnlyMode: false,
      onboardingComplete: true,
      isLoading: false,
      error: null,
      organizations: [],
      switchOrganization: jest.fn(),
    })
  })

  it('renders user info in sidebar trigger', () => {
    render(<UserMenu variant="sidebar-expanded" />)

    expect(screen.getAllByText('Maria Silva').length).toBeGreaterThan(0)
  })

  it('shows avatar placeholder icon when no photo is available', () => {
    mockUseOrganization.mockReturnValue({
      currentUser: {
        id: 'user-1',
        email: 'ab@example.com',
        fullName: null,
        avatarUrl: null,
        profileTypeLabel: 'Investor',
      },
      organization: {
        id: 'org-1',
        name: 'Mary Capital',
        slug: 'mary-capital',
        profileType: 'investor',
        logoUrl: null,
        verificationStatus: 'verified',
        onboardingStep: 'completed',
      },
      membership: null,
      permissions: null,
      readOnlyMode: false,
      onboardingComplete: true,
      isLoading: false,
      error: null,
      organizations: [],
      switchOrganization: jest.fn(),
    })

    render(<UserMenu variant="sidebar-expanded" />)

    expect(screen.getByTestId('user-avatar-placeholder')).toBeInTheDocument()
  })

  it('uses advisor routes when profile is advisor', () => {
    mockUseOrganization.mockReturnValue({
      currentUser: {
        id: 'user-2',
        email: 'advisor@example.com',
        fullName: 'Ana Advisor',
        avatarUrl: null,
        profileTypeLabel: 'Advisor',
      },
      organization: {
        id: 'org-2',
        name: 'Advisor Org',
        slug: 'advisor-org',
        profileType: 'advisor',
        logoUrl: null,
        verificationStatus: 'verified',
        onboardingStep: 'completed',
      },
      membership: null,
      permissions: null,
      readOnlyMode: false,
      onboardingComplete: true,
      isLoading: false,
      error: null,
      organizations: [],
      switchOrganization: jest.fn(),
    })

    render(<UserMenu variant="sidebar-expanded" />)

    const profileLink = screen.getByRole('menuitem', { name: /Perfil/i }).querySelector('a')
    const accountLink = screen.getByRole('menuitem', { name: /Minha conta/i }).querySelector('a')

    expect(profileLink).toHaveAttribute('href', '/advisor/profile')
    expect(accountLink).toHaveAttribute('href', '/advisor/settings')
  })

  it('uses org routes for investor/company profiles', () => {
    render(<UserMenu variant="sidebar-expanded" />)

    const profileLink = screen.getByRole('menuitem', { name: /Perfil/i }).querySelector('a')
    const accountLink = screen.getByRole('menuitem', { name: /Minha conta/i }).querySelector('a')

    expect(profileLink).toHaveAttribute('href', '/mary-capital/profile')
    expect(accountLink).toHaveAttribute('href', '/mary-capital/settings')
  })

  it('triggers logout action from menu', async () => {
    render(<UserMenu variant="sidebar-expanded" />)
    fireEvent.click(screen.getByRole('menuitem', { name: /Sair/i }))

    await waitFor(() => {
      expect(mockLogoutAction).toHaveBeenCalledTimes(1)
    })
  })
})
