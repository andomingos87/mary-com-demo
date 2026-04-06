import { resolveBreadcrumbs } from '@/lib/breadcrumbs/resolveBreadcrumbs'

describe('resolveBreadcrumbs', () => {
  it('retorna apenas Início na dashboard', () => {
    expect(
      resolveBreadcrumbs({
        pathname: '/acme/dashboard',
        orgSlug: 'acme',
        profileType: 'investor',
      })
    ).toEqual([{ label: 'Início' }])
  })

  it('gera trilha simples para rota protegida', () => {
    expect(
      resolveBreadcrumbs({
        pathname: '/acme/radar',
        orgSlug: 'acme',
        profileType: 'investor',
      })
    ).toEqual([
      { label: 'Início', href: '/acme/dashboard' },
      { label: 'Radar' },
    ])
  })

  it('gera trilha de projeto com label resolvido', () => {
    expect(
      resolveBreadcrumbs({
        pathname: '/acme/projects/tiger',
        orgSlug: 'acme',
        profileType: 'investor',
        projectLabel: 'Projeto Tiger',
      })
    ).toEqual([
      { label: 'Início', href: '/acme/dashboard' },
      { label: 'Pipeline', href: '/acme/pipeline' },
      { label: 'Projeto Tiger' },
    ])
  })

  it('mantém codename como fallback quando label não existe', () => {
    expect(
      resolveBreadcrumbs({
        pathname: '/acme/projects/tiger/members',
        orgSlug: 'acme',
        profileType: 'investor',
      })
    ).toEqual([
      { label: 'Início', href: '/acme/dashboard' },
      { label: 'Pipeline', href: '/acme/pipeline' },
      { label: 'tiger', href: '/acme/projects/tiger' },
      { label: 'Membros' },
    ])
  })
})
