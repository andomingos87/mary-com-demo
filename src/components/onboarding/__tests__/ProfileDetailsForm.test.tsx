import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProfileDetailsForm } from '@/components/onboarding/ProfileDetailsForm'

jest.mock('@/lib/actions/onboarding', () => ({
  saveProfileDetails: jest.fn(async () => ({ success: true })),
  autoSaveOnboardingFields: jest.fn(async () => ({ success: true })),
}))

const registerFieldMock = jest.fn(() => ({ onChange: jest.fn(), saveStatus: 'idle' }))

jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    registerField: registerFieldMock,
    getFieldStatus: jest.fn(() => 'idle'),
    getFieldError: jest.fn(() => null),
    getFieldValue: jest.fn(() => undefined),
    isSaving: true,
    lastSaved: null,
    resetField: jest.fn(),
    resetAll: jest.fn(),
  }),
}))

describe('ProfileDetailsForm H0.6', () => {
  beforeEach(() => {
    registerFieldMock.mockClear()
  })

  it('renderiza indicador de auto-save durante salvamento', () => {
    render(
      <ProfileDetailsForm
        organizationId="org-1"
        profileType="investor"
        onBack={jest.fn()}
        onSave={jest.fn()}
      />
    )

    expect(screen.getByText('Salvando...')).toBeInTheDocument()
  })

  it('registra campos esperados no contrato de auto-save por campo', () => {
    render(
      <ProfileDetailsForm
        organizationId="org-1"
        profileType="investor"
        onBack={jest.fn()}
        onSave={jest.fn()}
      />
    )

    expect(registerFieldMock).toHaveBeenCalledWith('sectorsOfInterest')
    expect(registerFieldMock).toHaveBeenCalledWith('investmentStage')
    expect(registerFieldMock).toHaveBeenCalledWith('geographyFocus')
  })
})
