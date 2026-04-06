import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { AssetCodenameStep } from '@/components/onboarding/steps/asset/AssetCodenameStep'

describe('AssetCodenameStep', () => {
  it('mantem botao desabilitado quando codinome esta vazio', () => {
    render(
      <AssetCodenameStep
        onBack={jest.fn()}
        onSave={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Continuar para termos' })).toBeDisabled()
  })

  it('salva codinome manual com source manual', () => {
    const onSave = jest.fn()

    render(
      <AssetCodenameStep
        onBack={jest.fn()}
        onSave={onSave}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Ex.: Projeto Tiger'), {
      target: { value: 'Projeto Jaguar' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para termos' }))

    expect(onSave).toHaveBeenCalledWith({
      codename: 'Projeto Jaguar',
      codenameSource: 'manual',
    })
  })

  it('salva codinome sugerido com source ai', () => {
    const onSave = jest.fn()
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0)

    render(
      <AssetCodenameStep
        onBack={jest.fn()}
        onSave={onSave}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sugerir com Mary AI' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para termos' }))

    expect(onSave).toHaveBeenCalledWith({
      codename: 'Projeto Tiger',
      codenameSource: 'ai',
    })

    randomSpy.mockRestore()
  })
})
