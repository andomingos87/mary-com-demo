import { render, screen } from '@testing-library/react'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

describe('Breadcrumb', () => {
  it('renderiza separador literal ">"', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Início', href: '/acme/dashboard' },
          { label: 'Radar' },
        ]}
      />
    )

    expect(screen.getByText('>')).toBeInTheDocument()
  })

  it('renderiza página atual sem link e com aria-current', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Início', href: '/acme/dashboard' },
          { label: 'Pipeline', href: '/acme/pipeline' },
          { label: 'Projeto Tiger' },
        ]}
      />
    )

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/acme/dashboard')
    expect(screen.getByRole('link', { name: 'Pipeline' })).toHaveAttribute('href', '/acme/pipeline')
    expect(screen.queryByRole('link', { name: 'Projeto Tiger' })).not.toBeInTheDocument()
    expect(screen.getByText('Projeto Tiger')).toHaveAttribute('aria-current', 'page')
  })

  it('mostra ellipsis no mobile quando há mais de 3 itens', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Início', href: '/acme/dashboard' },
          { label: 'Pipeline', href: '/acme/pipeline' },
          { label: 'Projeto Tiger', href: '/acme/projects/tiger' },
          { label: 'Membros' },
        ]}
      />
    )

    expect(screen.getByText('…')).toBeInTheDocument()
  })
})
