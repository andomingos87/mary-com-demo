'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AtSign,
  FileText,
  ImageIcon,
  Info,
  Lightbulb,
  Plus,
  Search,
  Send,
  X,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type MaryAiProfile = 'investor' | 'asset' | 'advisor' | null

export interface MaryAiPageBrief {
  title: string
  summary: string
  bullets: string[]
}

const ASSET_ICEBREAKERS = [
  'O que a Mary AI pode fazer?',
  'Pergunte sobre este projeto',
  'Suba Q&As e obtenha respostas',
  'Convide investidores para seu projeto',
]

const INVESTOR_ICEBREAKERS = [
  'O que a Mary AI pode fazer?',
  'Pergunte sobre um projeto',
  'Suba Q&As e obtenha respostas',
  'Convide novos Ativos',
]

const ADVISOR_ICEBREAKERS = [
  'O que a Mary AI pode fazer?',
  'Pergunte sobre um projeto',
  'Suba Q&As e obtenha respostas',
  'Explique o próximo passo da transação',
]

const DEFAULT_MENTION_SUGGESTIONS = [
  'Q&A Projeto Prioritário',
  'Memorando Executivo',
  'Checklist de Due Diligence',
]

const ACCEPTED_FILE_TYPES = [
  'image/*',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
]

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  attachments?: string[]
}

interface IcebreakerContext {
  currentPage?: string
  projectCodename?: string
}

function getRouteSection(pathname?: string): string | null {
  if (!pathname) return null
  const normalized = pathname.split('?')[0].split('#')[0]
  const [, , section] = normalized.split('/')
  return section || null
}

function getRoutePath(pathname?: string): string | null {
  if (!pathname) return null
  const normalized = pathname.split('?')[0].split('#')[0]
  const [, ...rest] = normalized.split('/')
  return rest.length > 0 ? `/${rest.join('/')}` : null
}

function getPageKey(pathname?: string): string | null {
  const routePath = getRoutePath(pathname)
  if (!routePath) return null

  const withoutOrgSlug = routePath.replace(/^\/[^/]+/, '')
  const normalized = withoutOrgSlug || routePath

  if (normalized === '/mary-ai-private') return 'mary-ai-private'
  if (normalized === '/dashboard') return 'dashboard'
  if (normalized === '/settings') return 'settings'
  if (normalized === '/profile') return 'profile'
  if (normalized === '/radar') return 'radar'
  if (normalized === '/feed') return 'feed'
  if (normalized === '/pipeline') return 'pipeline'
  if (normalized === '/mrs') return 'mrs'
  if (normalized === '/projects') return 'projects'
  if (normalized.startsWith('/projects/')) return 'project'
  if (normalized === '/invest') return 'invest'
  if (normalized === '/sell-raise') return 'sell-raise'
  if (normalized === '/advise') return 'advise'
  if (normalized === '/indicar') return 'indicar'
  return normalized.replace(/^\//, '')
}

function getProfileLabel(profile: MaryAiProfile): string {
  if (profile === 'investor') return 'investidor'
  if (profile === 'asset') return 'empresa'
  if (profile === 'advisor') return 'advisor'
  return 'usuário'
}

function getProfileBrief(profile: MaryAiProfile, baseSummary: string, bullets: string[]): MaryAiPageBrief {
  return {
    title: `Resumo para ${getProfileLabel(profile)}`,
    summary: baseSummary,
    bullets,
  }
}

export function getMaryAiPageBrief(profile: MaryAiProfile, context?: IcebreakerContext): MaryAiPageBrief {
  const routeSection = getRouteSection(context?.currentPage)
  const pageKey = getPageKey(context?.currentPage)
  const projectCodename = context?.projectCodename?.trim()

  if (pageKey === 'mary-ai-private') {
    if (profile === 'investor') {
      return {
        title: 'Resumo da página',
        summary: 'Esta página resume o escopo da Mary AI para investidores e mostra como ela ajuda a ler oportunidades, priorizar tese e acelerar decisão.',
        bullets: [
          'Explicar o que a Mary AI faz no fluxo do investidor',
          'Mostrar onde ela atua por página',
          'Preparar o cliente para validar o escopo',
          'Apoiar leitura de oportunidades e próximos passos',
        ],
      }
    }

    if (profile === 'asset') {
      return {
        title: 'Resumo da página',
        summary: 'Esta página resume o escopo da Mary AI para empresas e mostra como ela organiza preparação, processo e comunicação com investidores.',
        bullets: [
          'Explicar o que a Mary AI faz no fluxo da empresa',
          'Mostrar onde ela atua por página',
          'Preparar o cliente para validar o escopo',
          'Apoiar preparação, processo e comunicação',
        ],
      }
    }

    if (profile === 'advisor') {
      return {
        title: 'Resumo da página',
        summary: 'Esta página resume o escopo da Mary AI para advisors e mostra como ela ajuda a organizar mandatos, resposta e priorização.',
        bullets: [
          'Explicar o que a Mary AI faz no fluxo do advisor',
          'Mostrar onde ela atua por página',
          'Preparar o cliente para validar o escopo',
          'Apoiar mandatos, Q&A e follow-ups',
        ],
      }
    }
  }

  if (routeSection === 'settings') {
    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda o advisor a revisar acesso, time, governança e faturamento sem perder o contexto operacional.',
        [
          'Explicar permissões e estrutura da conta',
          'Ajudar com membros da equipe e sessões',
          'Responder dúvidas de cobrança e status',
          'Orientar ajustes de governança da boutique',
        ]
      )
    }

    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda a empresa a revisar acesso, equipe, faturamento e governança antes de seguir no processo.',
        [
          'Explicar permissões e dados da conta',
          'Apoiar mudanças de equipe e acesso',
          'Responder dúvidas sobre billing e compliance',
          'Apontar o que falta para destravar o fluxo',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI ajuda a revisar conta, equipe, faturamento e governança sem tirar você do contexto da organização.',
      [
        'Explicar configurações de conta e permissões',
        'Ajudar com equipe, acesso e sessões',
        'Responder dúvidas sobre faturamento e status da conta',
        'Orientar próximos passos de governança',
      ]
    )
  }

  if (routeSection === 'profile') {
    if (profile === 'investor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI resume o perfil do investidor, a tese e as pendências de verificação antes de liberar o fluxo.',
        [
          'Resumir tese, ticket e geografia',
          'Explicar status de verificação e onboarding',
          'Ajudar a revisar dados cadastrais',
          'Sugerir ajustes antes da validação final',
        ]
      )
    }

    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI resume a identidade consultiva do advisor, o track record e o que precisa ser validado.',
        [
          'Resumir histórico e especialidade',
          'Explicar pendências de onboarding',
          'Ajudar a organizar credenciais',
          'Sugerir ajustes antes da validação com o cliente',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI resume dados da organização ou do perfil e aponta o que revisar antes de avançar no fluxo.',
      [
        'Resumir dados cadastrais e de verificação',
        'Explicar pendências de onboarding ou compliance',
        'Ajudar a organizar informações de perfil',
        'Sugerir ajustes antes da validação com o cliente',
      ]
    )
  }

  if (routeSection === 'dashboard') {
    if (profile === 'investor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI lê o cockpit do investidor e organiza matches, teses e pipeline para acelerar decisão.',
        [
          'Sintetizar métricas e alertas do painel',
          'Priorizar próximos passos por tese',
          'Gerar resumos executivos dos deals',
          'Ajudar a decidir o que analisar primeiro',
        ]
      )
    }

    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI lê o cockpit da empresa e organiza preparo, MRS, projetos e próximos passos do mandato.',
        [
          'Sintetizar métricas e alertas do painel',
          'Priorizar documentos e preparação',
          'Gerar resumos executivos do processo',
          'Ajudar a decidir o que destravar primeiro',
        ]
      )
    }

    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI lê o dashboard do advisor e organiza mandatos, fila de trabalho e próximos movimentos.',
        [
          'Sintetizar métricas e alertas do painel',
          'Priorizar mandatos e follow-ups',
          'Gerar resumos executivos da carteira',
          'Ajudar a decidir o que atacar primeiro',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI lê o cockpit e organiza o que merece atenção agora, sem perder a visão do funil.',
      [
        'Sintetizar métricas e alertas do painel',
        'Priorizar próximos passos por projeto ou tese',
        'Gerar resumos executivos para a equipe',
        'Ajudar a decidir o que fazer primeiro',
      ]
    )
  }

  if (routeSection === 'radar') {
    if (profile === 'investor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda o investidor a interpretar o radar, comparar oportunidades e escolher o melhor match.',
        [
          'Explicar o score de compatibilidade',
          'Comparar empresas e teses',
          'Sugerir o melhor próximo movimento',
          'Resumir oportunidades que merecem follow-up',
        ]
      )
    }

    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda a empresa a entender quem está no radar, como priorizar investidores e o que fazer em seguida.',
        [
          'Explicar o score de interesse',
          'Comparar perfis de investidores',
          'Sugerir o próximo movimento do mandato',
          'Resumir oportunidades que valem contato',
        ]
      )
    }

    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda o advisor a interpretar o radar de mandatos e escolher onde a boutique deve atuar.',
        [
          'Explicar aderência do mandato',
          'Comparar oportunidades de negócio',
          'Sugerir o próximo movimento comercial',
          'Resumir leads que valem prioridade',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI ajuda a interpretar matches, comparar oportunidades e explicar o porquê de cada recomendação.',
      [
        'Explicar o score de compatibilidade',
        'Comparar empresas, mandatos ou teses',
        'Sugerir o melhor próximo movimento',
        'Resumir oportunidades que valem follow-up',
      ]
    )
  }

  if (routeSection === 'feed') {
    if (profile === 'investor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI organiza o feed do investidor e transforma atualizações dos ativos acompanhados em decisão objetiva.',
        [
          'Resumir eventos recentes dos ativos',
          'Destacar mudanças relevantes no deal',
          'Extrair tarefas pendentes do feed',
          'Gerar um update curto para a tese',
        ]
      )
    }

    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI organiza o feed da empresa e transforma movimentações do processo em ação concreta.',
        [
          'Resumir eventos recentes do processo',
          'Destacar mudanças relevantes no deal',
          'Extrair tarefas pendentes do feed',
          'Gerar um update curto para stakeholders',
        ]
      )
    }

    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI organiza o feed do advisor e resume updates, pedidos e pendências sem ruído.',
        [
          'Resumir eventos recentes',
          'Destacar mudanças relevantes no mandato',
          'Extrair tarefas pendentes do feed',
          'Gerar um update curto para a equipe',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI organiza atualizações recentes e transforma o feed em próximos passos acionáveis.',
      [
        'Resumir eventos recentes',
        'Destacar mudanças relevantes no deal',
        'Extrair tarefas pendentes do feed',
        'Gerar um update curto para stakeholders',
      ]
    )
  }

  if (routeSection === 'pipeline') {
    if (profile === 'investor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda o investidor a conduzir o pipeline de decisão, destacando gargalos e follow-ups.',
        [
          'Organizar próximos passos por tese',
          'Apontar deals parados ou em risco',
          'Resumir status por projeto',
          'Sugerir ações de follow-up',
        ]
      )
    }

    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda a empresa a conduzir o pipeline da transação, destacando gargalos e tarefas críticas.',
        [
          'Organizar próximos passos do mandato',
          'Apontar deals parados ou em risco',
          'Resumir status por projeto',
          'Sugerir ações de follow-up',
        ]
      )
    }

    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda o advisor a conduzir o pipeline comercial e operacional com foco no que destrava receita.',
        [
          'Organizar próximos passos da boutique',
          'Apontar mandatos parados ou em risco',
          'Resumir status por projeto',
          'Sugerir ações de follow-up',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI ajuda a conduzir o pipeline, apontando gargalos, tarefas e etapas críticas de cada negociação.',
      [
        'Organizar próximos passos do pipeline',
        'Apontar deals parados ou em risco',
        'Resumir status por projeto',
        'Sugerir ações de follow-up',
      ]
    )
  }

  if (routeSection === 'mrs') {
    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI lê o readiness score da empresa e explica o que falta para deixá-la pronta para o mercado.',
        [
          'Explicar o score atual e o benchmark',
          'Listar lacunas de documentos e materiais',
          'Sugerir prioridades de preparação',
          'Transformar o MRS em plano de ação',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI lê o readiness score e explica o que falta para deixar o ativo pronto para o mercado.',
      [
        'Explicar o score atual e o benchmark',
        'Listar lacunas de documentos e materiais',
        'Sugerir prioridades de preparação',
        'Transformar o MRS em um plano de ação',
      ]
    )
  }

  if (routeSection === 'projects') {
    if (profile === 'investor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda o investidor a comparar oportunidades, priorizar teses e navegar pela carteira sem ruído.',
        [
          'Comparar projetos da carteira',
          'Explicar status e temperatura de cada card',
          'Sugerir qual projeto merece atenção agora',
          'Ajudar a abrir o próximo nível de detalhe',
        ]
      )
    }

    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda a empresa a comparar projetos do mandato e entender qual iniciativa merece mais foco.',
        [
          'Comparar projetos da carteira',
          'Explicar status e temperatura de cada card',
          'Sugerir qual projeto merece atenção agora',
          'Ajudar a abrir o próximo nível de detalhe',
        ]
      )
    }

    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        'Aqui a Mary AI ajuda o advisor a comparar mandatos, priorizar carteira e navegar pelos projetos sem ruído.',
        [
          'Comparar projetos da carteira',
          'Explicar status e temperatura de cada card',
          'Sugerir qual projeto merece atenção agora',
          'Ajudar a abrir o próximo nível de detalhe',
        ]
      )
    }

    return getProfileBrief(
      profile,
      'Aqui a Mary AI ajuda a comparar projetos, priorizar iniciativas e navegar pela carteira sem ruído.',
      [
        'Comparar projetos da carteira',
        'Explicar status e temperatura de cada card',
        'Sugerir qual projeto merece atenção agora',
        'Ajudar a abrir o próximo nível de detalhe',
      ]
    )
  }

  if (routeSection === 'project' && projectCodename) {
    if (profile === 'investor') {
      return getProfileBrief(
        profile,
        `Aqui a Mary AI trabalha no contexto do projeto ${projectCodename}, ajudando o investidor a resumir materiais e validar aderência.`,
        [
          `Resumir o projeto ${projectCodename}`,
          'Organizar Q&A e materiais do data room',
          'Explicar valuation, tese e narrativa',
          'Ajudar a preparar perguntas ao ativo',
        ]
      )
    }

    if (profile === 'asset') {
      return getProfileBrief(
        profile,
        `Aqui a Mary AI trabalha no contexto do projeto ${projectCodename}, ajudando a empresa a resumir materiais e preparar a comunicação.`,
        [
          `Resumir o projeto ${projectCodename}`,
          'Organizar Q&A e materiais do data room',
          'Explicar valuation, tese e narrativa',
          'Ajudar a preparar comunicação com investidores',
        ]
      )
    }

    if (profile === 'advisor') {
      return getProfileBrief(
        profile,
        `Aqui a Mary AI trabalha no contexto do projeto ${projectCodename}, ajudando o advisor a resumir materiais e responder mais rápido.`,
        [
          `Resumir o projeto ${projectCodename}`,
          'Organizar Q&A e materiais do data room',
          'Explicar valuation, tese e narrativa',
          'Ajudar a preparar comunicação com investidores',
        ]
      )
    }

    return {
      title: 'Resumo desta página',
      summary: `Aqui a Mary AI trabalha no contexto do projeto ${projectCodename}, ajudando a resumir materiais, respostas e próximos passos.`,
      bullets: [
        `Resumir o projeto ${projectCodename}`,
        'Organizar Q&A e materiais do data room',
        'Explicar valuation, tese e narrativa',
        'Ajudar a preparar comunicação com investidores',
      ],
    }
  }

  if (profile === 'investor') {
    return getProfileBrief(
      profile,
      'Aqui a Mary AI ajuda o investidor a ler oportunidades, refinar a tese e avançar no deal flow com contexto.',
      [
        'Resumir empresas e teses em linguagem executiva',
        'Explicar aderência ao mandato',
        'Apoiar dúvidas sobre radar, feed e pipeline',
        'Montar próximos passos de análise',
      ]
    )
  }

  if (profile === 'asset') {
    return getProfileBrief(
      profile,
      'Aqui a Mary AI ajuda a empresa a organizar o processo de venda ou captação com mais clareza e menos fricção.',
      [
        'Resumir readiness, materiais e documentos',
        'Explicar o que falta para avançar',
        'Apoiar o time no pipeline e nos projetos',
        'Sugerir ações para preparar investidores',
      ]
    )
  }

  if (profile === 'advisor') {
    return getProfileBrief(
      profile,
      'Aqui a Mary AI ajuda o advisor a organizar mandatos, checar contexto e priorizar o trabalho do dia.',
      [
        'Resumir mandatos e oportunidades',
        'Explicar o contexto dos deals em andamento',
        'Ajudar com documentos, Q&A e follow-ups',
        'Sugerir o próximo passo operacional',
      ]
    )
  }

  return {
    title: 'Resumo desta página',
    summary: 'Aqui a Mary AI ajuda a manter contexto, responder perguntas e organizar o próximo passo sem sair da tela.',
    bullets: [
      'Responder dúvidas da página atual',
      'Resumir contextos e próximos passos',
      'Apoiar decisões com linguagem clara',
      'Manter o trabalho dentro do fluxo',
    ],
  }
}

const SETTINGS_PROFILE_ICEBREAKERS = [
  'O que o Assistente de IA pode fazer?',
  'Como convido ou gerencio membros da equipe?',
  'O que está disponível na área de Faturamento hoje?',
  'Como reviso MFA e sessões da conta?',
]

export function getMaryAiIcebreakers(profile: MaryAiProfile, context?: IcebreakerContext): string[] {
  const routeSection = getRouteSection(context?.currentPage)
  const isProjectPage = Boolean(context?.currentPage?.includes('/projects/'))
  const codename = context?.projectCodename?.trim()

  if (routeSection === 'settings' || routeSection === 'profile') {
    return SETTINGS_PROFILE_ICEBREAKERS
  }

  if (profile === 'asset') {
    if (isProjectPage && codename) {
      return [
        'O que a Mary AI pode fazer?',
        `Pergunte sobre o projeto ${codename}`,
        'Suba Q&As e obtenha respostas',
        'Convide investidores para seu projeto',
      ]
    }
    if (routeSection === 'feed') {
      return [
        'O que a Mary AI pode fazer?',
        'Resuma os eventos do feed',
        'Suba Q&As e obtenha respostas',
        'Convide investidores para seu projeto',
      ]
    }
    if (routeSection === 'pipeline') {
      return [
        'O que a Mary AI pode fazer?',
        'Organize os próximos passos do pipeline',
        'Suba Q&As e obtenha respostas',
        'Convide investidores para seu projeto',
      ]
    }
    return ASSET_ICEBREAKERS
  }

  if (profile === 'investor') {
    if (isProjectPage && codename) {
      return [
        'O que a Mary AI pode fazer?',
        `Pergunte sobre o projeto ${codename}`,
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    if (routeSection === 'feed') {
      return [
        'O que a Mary AI pode fazer?',
        'Resuma os eventos do feed',
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    if (routeSection === 'radar') {
      return [
        'O que a Mary AI pode fazer?',
        'Analise os matches do Radar',
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    if (routeSection === 'tese' || routeSection === 'thesis') {
      return [
        'O que a Mary AI pode fazer?',
        'Revise minha tese de investimento',
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    return INVESTOR_ICEBREAKERS
  }

  if (routeSection === 'feed') {
    return [
      'O que a Mary AI pode fazer?',
      'Resuma os eventos do feed',
      'Suba Q&As e obtenha respostas',
      'Explique o próximo passo da transação',
    ]
  }

  return ADVISOR_ICEBREAKERS
}

export function buildMaryAiDisclaimer(organizationName: string): string {
  return `A Mary AI pode cometer erros. A Mary não usa dados da "${organizationName}" para treinar os modelos. Consulte a governança de IA e revise respostas antes de compartilhar dados sensíveis.`
}

const ICEBREAKER_ICONS = [Info, FileText, Search, Zap, Lightbulb] as const

function IcebreakerRowIcon({ index }: { index: number }) {
  const Icon = ICEBREAKER_ICONS[index % ICEBREAKER_ICONS.length]
  return <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
}

export interface MaryAiChatContentProps {
  assistantWelcomeMessage: string
  icebreakers: string[]
  pageBrief?: MaryAiPageBrief
  initialMessage?: string
  mentionSuggestions?: string[]
  disclaimerText?: string
  storageKey?: string
  isVisible?: boolean
  showFirstGreeting?: boolean
  firstGreetingMessage?: string
  onFirstGreetingConsumed?: () => void
  className?: string
}

function filterTransientMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.id !== 'assistant-first-greeting')
}

function writeChatHistoryToStorage(storageKey: string | undefined, messages: ChatMessage[]) {
  if (!storageKey || typeof window === 'undefined') return
  window.sessionStorage.setItem(storageKey, JSON.stringify(filterTransientMessages(messages)))
}

function buildAssistantReply(userMessage: string): string {
  if (userMessage.toLowerCase().includes('projeto')) {
    return 'Posso ajudar a resumir status, riscos e próximos passos do projeto. Se quiser, mencione uma página com @ para contextualizar.'
  }

  if (userMessage.toLowerCase().includes('q&a')) {
    return 'Perfeito. Envie o material e eu organizo respostas em formato claro, destacando pendências e pontos críticos.'
  }

  if (userMessage.toLowerCase().includes('ativo')) {
    return 'Posso sugerir um texto de convite e uma checklist de onboarding para novos ativos.'
  }

  return 'Recebi sua solicitação. Posso estruturar próximos passos, resumir contexto e sugerir ações práticas para você avançar agora.'
}

export function MaryAiChatContent({
  assistantWelcomeMessage,
  icebreakers,
  pageBrief,
  initialMessage,
  mentionSuggestions,
  disclaimerText,
  storageKey,
  isVisible = true,
  showFirstGreeting = false,
  firstGreetingMessage = 'Prazer, sou a Mary AI. Estarei sempre aqui!',
  onFirstGreetingConsumed,
  className,
}: MaryAiChatContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasHydratedStorageRef = useRef(false)

  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isMentionOpen, setIsMentionOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const buildInitialMessages = () => {
    const initialMessages: ChatMessage[] = []
    if (showFirstGreeting) {
      initialMessages.push({
        id: 'assistant-first-greeting',
        role: 'assistant',
        content: firstGreetingMessage,
      })
    }
    initialMessages.push({
      id: 'assistant-welcome',
      role: 'assistant',
      content: assistantWelcomeMessage,
    })
    return initialMessages
  }

  const [messages, setMessages] = useState<ChatMessage[]>(buildInitialMessages)

  const resolvedMentionSuggestions = useMemo(() => {
    if (mentionSuggestions && mentionSuggestions.length > 0) {
      return mentionSuggestions
    }
    return DEFAULT_MENTION_SUGGESTIONS
  }, [mentionSuggestions])

  useEffect(() => {
    const seededMessage = initialMessage?.trim()
    if (!seededMessage) return
    setMessage(seededMessage)
  }, [initialMessage])

  // useLayoutEffect: aplicar histórico do sessionStorage antes dos useEffects de persistência,
  // evitando um frame onde hasHydratedStorageRef é true mas `messages` ainda é o estado inicial
  // e o persist sobrescreve o storage com [welcome] apenas.
  useLayoutEffect(() => {
    if (!storageKey || typeof window === 'undefined') {
      hasHydratedStorageRef.current = true
      setMessages(buildInitialMessages())
      return
    }

    hasHydratedStorageRef.current = false
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) {
      setMessages(buildInitialMessages())
      hasHydratedStorageRef.current = true
      return
    }

    try {
      const parsed = JSON.parse(raw) as ChatMessage[]
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setMessages(buildInitialMessages())
        hasHydratedStorageRef.current = true
        return
      }
      const sanitized = filterTransientMessages(parsed)
      const withGreeting =
        showFirstGreeting && !sanitized.some((messageItem) => messageItem.id === 'assistant-first-greeting')
          ? [{ id: 'assistant-first-greeting', role: 'assistant' as const, content: firstGreetingMessage }, ...sanitized]
          : sanitized
      setMessages(withGreeting)
      hasHydratedStorageRef.current = true
    } catch {
      setMessages(buildInitialMessages())
      hasHydratedStorageRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantWelcomeMessage, storageKey, showFirstGreeting, firstGreetingMessage])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    if (!hasHydratedStorageRef.current) return
    writeChatHistoryToStorage(storageKey, messages)
  }, [messages, storageKey])

  useEffect(() => {
    if (!showFirstGreeting || !isVisible) return
    onFirstGreetingConsumed?.()
  }, [showFirstGreeting, isVisible, onFirstGreetingConsumed])

  useEffect(() => {
    if (showFirstGreeting) return
    setMessages((currentMessages) => filterTransientMessages(currentMessages))
  }, [showFirstGreeting])

  const handleIcebreakerClick = (text: string) => {
    setMessage(text)
    textareaRef.current?.focus()
  }

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    const selected = Array.from(event.target.files)
    setAttachments((prev) => {
      const next = [...prev]
      selected.forEach((file) => {
        const exists = next.some(
          (current) =>
            current.name === file.name &&
            current.size === file.size &&
            current.lastModified === file.lastModified
        )

        if (!exists) next.push(file)
      })
      return next
    })

    event.target.value = ''
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }

  const handleInsertMention = (target: string) => {
    setMessage((prev) => `${prev}${prev.trim().length > 0 ? ' ' : ''}@${target}`)
    setIsMentionOpen(false)
    textareaRef.current?.focus()
  }

  const handleSend = () => {
    if (isSending) return

    const cleanMessage = message.trim()
    if (!cleanMessage && attachments.length === 0) return

    const userContent = cleanMessage || 'Enviei anexos para análise.'
    const userAttachments = attachments.map((file) => file.name)
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userContent,
      attachments: userAttachments.length > 0 ? userAttachments : undefined,
    }

    setMessages((prev) => {
      const next = [...prev, userMessage]
      if (hasHydratedStorageRef.current) {
        writeChatHistoryToStorage(storageKey, next)
      }
      return next
    })
    setMessage('')
    setAttachments([])
    setIsSending(true)

    window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: buildAssistantReply(userContent),
      }
      setMessages((prev) => {
        const next = [...prev, assistantMessage]
        if (hasHydratedStorageRef.current) {
          writeChatHistoryToStorage(storageKey, next)
        }
        return next
      })
      setIsSending(false)
    }, 350)
  }

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      {pageBrief ? (
        <div className="shrink-0 border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {pageBrief.title}
          </p>
          <h3 className="mt-2 text-sm font-semibold text-foreground">{pageBrief.summary}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {pageBrief.bullets.map((bullet) => (
              <Badge key={bullet} variant="secondary" className="rounded-full px-3 py-1 text-xs leading-none">
                {bullet}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold leading-tight text-foreground">Com o que posso ajudar?</h2>
        <ul className="mt-2 space-y-0.5">
          {icebreakers.map((prompt, index) => (
            <li key={prompt}>
              <button
                type="button"
                onClick={() => handleIcebreakerClick(prompt)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
              >
                <IcebreakerRowIcon index={index} />
                <span className="leading-snug">{prompt}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-4 py-3">
        <div className="space-y-3 pr-2">
          {messages.map((chatMessage) => (
            <div
              key={chatMessage.id}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm',
                chatMessage.role === 'assistant'
                  ? 'border-border bg-muted/60 text-muted-foreground'
                  : 'ml-4 border-primary/40 bg-primary text-primary-foreground'
              )}
            >
              <p className="leading-relaxed">{chatMessage.content}</p>
              {chatMessage.attachments && chatMessage.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {chatMessage.attachments.map((name) => (
                    <Badge key={`${chatMessage.id}-${name}`} variant="secondary" className="max-w-full">
                      <span className="truncate">{name}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="shrink-0 space-y-2 border-t border-border bg-background p-3">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => {
              const isImage = file.type.startsWith('image/')
              return (
                <Badge key={`${file.name}-${file.size}-${file.lastModified}`} variant="secondary" className="gap-1.5 pr-1">
                  {isImage ? <ImageIcon className="h-3 w-3" aria-hidden="true" /> : <FileText className="h-3 w-3" aria-hidden="true" />}
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    aria-label={`Remover ${file.name}`}
                    className="rounded-sm p-0.5 hover:bg-accent"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}

        <div className="rounded-lg border border-border bg-muted/20 p-2 shadow-none">
          <div className="flex items-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Adicionar anexo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Anexar arquivos</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES.join(',')}
              className="hidden"
              onChange={handleSelectFiles}
              data-testid="mary-ai-file-input"
            />

            <Popover open={isMentionOpen} onOpenChange={setIsMentionOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Marcar páginas ou documentos"
                      >
                        <AtSign className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Inserir menções com @</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent align="start" className="p-2">
                <div className="space-y-1">
                  {resolvedMentionSuggestions.map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => handleInsertMention(target)}
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      @{target}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Pergunte qualquer coisa"
              aria-label="Mensagem para Mary AI"
              rows={1}
              className="max-h-28 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full border-border bg-background shadow-none"
                    onClick={handleSend}
                    aria-label="Enviar mensagem"
                    disabled={isSending || (message.trim().length === 0 && attachments.length === 0)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enviar mensagem</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {disclaimerText ? (
          <p className="px-1 text-center text-xs leading-relaxed text-muted-foreground">{disclaimerText}</p>
        ) : null}
      </div>
    </div>
  )
}
