import {
  AlertCircle,
  Award,
  BadgeDollarSign,
  BarChart3,
  CircleOff,
  Clock3,
  Database,
  FileBarChart2,
  FileText,
  Globe2,
  LayoutDashboard,
  Network,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Workflow,
  XCircle,
  Zap,
  Users,
} from 'lucide-react'
import { ProfileLandingPageData } from '@/components/landing/ProfileLandingSections'

export const investLandingData: ProfileLandingPageData = {
  currentPath: '/invest',
  breadcrumbLabel: 'Investir',
  hero: {
    eyebrow: 'Para investidores',
    title: 'Encontre empresas estratégicas para investir ou adquirir, com clareza e eficiência',
    subtitle:
      'A Mary conecta você a empresas qualificadas e prontas para transações, reduzindo ruídos no dealflow e garantindo acesso rápido a oportunidades alinhadas à sua tese de investimento ou estratégia corporativa.',
    ctaLabel: 'Cadastre sua tese agora e descubra ativos estratégicos',
    ctaHref: '/signup?profile=investor',
    secondaryCtaLabel: 'Voltar para home',
    secondaryCtaHref: '/',
  },
  sections: [
    {
      kind: 'cards',
      title: 'O mercado privado é cheio de ruído.',
      subtitle:
        'Encontrar empresas aderentes ao seu perfil de investimento não deveria ser um trabalho de garimpo. No modelo tradicional de M&A, investidores enfrentam:',
      tone: 'danger',
      columns: 2,
      items: [
        {
          title: 'Pitches desalinhados e superficiais',
          description: 'Você perde tempo analisando oportunidades que não fazem sentido para sua tese de investimento.',
          icon: XCircle,
        },
        {
          title: 'Falta de dados confiáveis e padronizados',
          description: 'Informações inconsistentes dificultam a comparação e a avaliação objetiva dos ativos.',
          icon: Database,
        },
        {
          title: 'Processos caros, lentos e pouco transparentes',
          description: 'O ciclo tradicional consome recursos e gera incertezas desnecessárias para o investidor.',
          icon: Clock3,
        },
        {
          title: 'Tempo gasto com empresas sem readiness',
          description: 'Muitas empresas ainda não estão prontas para transações, gerando frustração e retrabalho.',
          icon: CircleOff,
        },
      ],
    },
    {
      kind: 'stats',
      title: 'A Mary organiza o mercado privado para você.',
      subtitle:
        'Sabemos como é desgastante gastar tempo com empresas que não fazem sentido para sua tese. Por isso, criamos uma infraestrutura que conecta você a ativos qualificados, com dados estruturados e processos seguros.',
      stats: [
        { value: '+500', label: 'empresas cadastradas', hint: 'em diferentes setores' },
        { value: '+120', label: 'deals analisados', hint: 'em 2024' },
        { value: '+80', label: 'advisors conectados', hint: 'para suporte estratégico' },
        { value: '100%', label: 'compliance', hint: 'com LGPD e padrões internacionais de M&A' },
      ],
    },
    {
      kind: 'steps',
      title: 'Um pipeline inteligente, em 3 passos simples',
      subtitle:
        'Com a Mary, o dealflow se torna eficiente, seguro e transparente desde a formulação da tese até o acesso aos materiais do deal.',
      steps: [
        {
          title: 'Cadastre sua tese de investimento',
          description: 'Defina setor, porte, geografia, ticket e estágio para filtrar o mercado com precisão.',
        },
        {
          title: 'Receba recomendações automáticas',
          description: 'Nossa curadoria cruza dados, readiness e aderência para priorizar os ativos certos.',
        },
        {
          title: 'Acesse teaser, CIM e VDR',
          description: 'Avance com suporte de advisors e visibilidade clara sobre o andamento de cada oportunidade.',
        },
      ],
      ctaLabel: 'Solicite uma demonstração gratuita',
      ctaHref: '/signup?profile=investor',
    },
    {
      kind: 'cards',
      title: 'O que acontece se você continuar no modelo tradicional?',
      tone: 'warning',
      columns: 2,
      items: [
        {
          title: 'Continuar perdendo tempo com ativos desalinhados',
          description: 'Seu pipeline segue cheio de ruído e sem foco estratégico.',
          icon: Clock3,
        },
        {
          title: 'Ficar atrás da concorrência no acesso a deals',
          description: 'Outros investidores já estão usando ferramentas mais inteligentes para ganhar vantagem.',
          icon: TrendingUp,
        },
        {
          title: 'Avaliar empresas com dados frágeis ou inconsistentes',
          description: 'Decisões sem base sólida aumentam o risco de alocação equivocada de capital.',
          icon: FileBarChart2,
        },
        {
          title: 'Perder liquidez e oportunidades de alto valor',
          description: 'O mercado privado se move rápido; quem demora normalmente perde as melhores teses.',
          icon: Target,
        },
      ],
    },
    {
      kind: 'cards',
      title: 'O que acontece quando você escolhe a Mary',
      tone: 'success',
      columns: 4,
      items: [
        {
          title: 'Matching entre tese e empresas qualificadas',
          description: 'Receba apenas oportunidades que fazem sentido para sua estratégia.',
          icon: Target,
        },
        {
          title: 'Valuation transparente e readiness confiável',
          description: 'Avalie ativos com dados padronizados e métricas objetivas.',
          icon: BarChart3,
        },
        {
          title: 'Due diligence acelerada com a Mary AI',
          description: 'Análise inteligente de documentos e extração automática de insights relevantes.',
          icon: Sparkles,
        },
        {
          title: 'Pipeline organizado em dashboard único e seguro',
          description: 'Controle integral sobre suas oportunidades em uma interface clara e governada.',
          icon: LayoutDashboard,
        },
      ],
      callout: {
        description:
          'Imagine dedicar seu tempo apenas às negociações que realmente importam. Mais do que acelerar o dealflow, a Mary garante confiança, clareza e protagonismo na sua estratégia de investimento.',
      },
    },
    {
      kind: 'pricing',
      id: 'planos',
      title: 'Planos para Investidores',
      subtitle: 'Escolha o modelo ideal para sua estratégia de investimento',
      plans: [
        {
          eyebrow: 'Free',
          price: 'Gratuito',
          title: 'Acesso inicial',
          features: [
            'Acesso ao marketplace de empresas',
            'Visualização de teasers públicos',
            'Alertas de novas oportunidades',
            'Suporte por email',
          ],
          ctaLabel: 'Começar grátis',
          ctaHref: '/signup?profile=investor',
          ctaVariant: 'outline',
        },
        {
          eyebrow: 'Premium',
          price: 'R$ 499',
          priceSuffix: '/mês',
          title: 'Operação completa',
          badge: 'Mais popular',
          featured: true,
          features: [
            'Tudo do plano gratuito',
            'Acesso completo a CIM e VDR',
            'Matching baseado na sua tese',
            'Mary AI para análise das empresas',
            'Dashboard personalizado de pipeline',
            'Suporte dedicado',
          ],
          ctaLabel: 'Assinar premium',
          ctaHref: '/signup?profile=investor',
        },
        {
          eyebrow: 'Enterprise',
          price: 'Personalizado',
          title: 'Equipe e integração',
          features: [
            'Tudo do Premium',
            'API dedicada para integração interna',
            'Advisor exclusivo para sourcing estratégico',
            'Relatórios customizados e analytics avançado',
            'Acesso antecipado a deals exclusivos',
            'SLA garantido e suporte 24/7',
          ],
          ctaLabel: 'Falar com especialista',
          ctaHref: '/login',
          ctaVariant: 'outline',
        },
      ],
    },
    {
      kind: 'faq',
      title: 'Perguntas Frequentes',
      subtitle: 'Tudo o que você precisa saber sobre investir na Mary',
      items: [
        {
          question: 'Como funciona o matching de oportunidades com minha tese?',
          answer:
            'Você define critérios como setor, ticket, geografia e estágio. A Mary combina esses filtros com dados estruturados, readiness e sinais de aderência para priorizar oportunidades.',
        },
        {
          question: 'Posso confiar na qualidade das empresas listadas?',
          answer:
            'A plataforma combina curadoria, dados padronizados e análise assistida por IA para reduzir ruído e destacar ativos mais consistentes.',
        },
        {
          question: 'Como a confidencialidade é garantida?',
          answer:
            'O acesso a materiais sensíveis é controlado por etapas, permissões e trilhas de auditoria, seguindo práticas de governança e compliance.',
        },
        {
          question: 'Posso cancelar minha assinatura a qualquer momento?',
          answer:
            'Sim. Os planos recorrentes podem ser revistos conforme a necessidade da sua operação e o estágio da sua estratégia.',
        },
        {
          question: 'A Mary substitui meu advisor de M&A?',
          answer:
            'Não. A Mary organiza o fluxo, amplia a visibilidade e acelera a análise; advisors continuam sendo relevantes na execução.',
        },
        {
          question: 'Quais métodos de pagamento são aceitos?',
          answer:
            'Os detalhes comerciais são definidos no onboarding e no fluxo de contratação, conforme o plano e o tipo de operação escolhidos.',
        },
      ],
    },
    {
      kind: 'cta',
      title: 'Invista com inteligência, clareza e velocidade',
      subtitle:
        'Conquiste acesso às melhores oportunidades do mercado privado, sem ruído nem fricção operacional.',
      ctaLabel: 'Cadastrar minha tese agora',
      ctaHref: '/signup?profile=investor',
    },
  ],
}

export const sellRaiseLandingData: ProfileLandingPageData = {
  currentPath: '/sell-raise',
  breadcrumbLabel: 'Vender ou Captar',
  hero: {
    eyebrow: 'Para empresas',
    title: 'Venda sua empresa ou capte recursos de forma inteligente, segura e transparente',
    subtitle:
      'Você dedicou anos para construir sua empresa. Agora chegou a hora de dar o próximo passo. A Mary conecta você a investidores estratégicos, organiza o processo e garante uma jornada mais rápida, justa e sem fricções.',
    ctaLabel: 'Cadastre sua empresa e descubra investidores alinhados',
    ctaHref: '/signup?profile=asset',
    secondaryCtaLabel: 'Voltar para home',
    secondaryCtaHref: '/',
  },
  sections: [
    {
      kind: 'comparison',
      title: 'O jogo tradicional de M&A não foi feito para sócios e fundadores.',
      subtitle:
        'Negociações demoradas, falta de transparência, investidores desalinhados e processos caros sempre deixaram fundadores fora do centro da mesa.',
      columns: ['Recurso', 'Modelo antigo', 'Com a Mary'],
      rows: [
        {
          label: 'Velocidade e custo',
          before: 'Processos lentos e custosos',
          after: 'Jornada mais rápida e transparente',
        },
        {
          label: 'Valuation',
          before: 'Pouca clareza e benchmark limitado',
          after: 'Valuation mais claro e justo',
        },
        {
          label: 'Acesso a investidores',
          before: 'Baixo acesso aos perfis certos',
          after: 'Matching inteligente com investidores estratégicos',
        },
        {
          label: 'Experiência do sócio',
          before: 'Negociação desgastante e opaca',
          after: 'Suporte estruturado em cada etapa',
        },
      ],
    },
    {
      kind: 'stats',
      title: 'A Mary é a sua parceira na jornada de liquidez.',
      subtitle:
        'Criamos uma plataforma que guia sócios e fundadores em cada etapa, combinando tecnologia, curadoria e apoio humano para transformar liquidez em processo organizado.',
      stats: [
        { value: '+500', label: 'investidores qualificados', hint: 'conectados' },
        { value: '+120', label: 'deals analisados', hint: 'em 2025' },
        { value: '+80', label: 'advisors disponíveis', hint: 'para suporte estratégico' },
        { value: '100%', label: 'compliance', hint: 'LGPD e padrões internacionais' },
      ],
    },
    {
      kind: 'steps',
      title: 'Um caminho claro para você realizar seu deal com segurança',
      subtitle:
        'Com a Mary, o processo deixa de ser um labirinto e se transforma em um passo a passo com contexto, documentos e acompanhamento.',
      steps: [
        {
          title: 'Organize e cadastre',
          description: 'Cadastre sua empresa e organize documentos estratégicos em um VDR seguro e guiado.',
        },
        {
          title: 'Conecte-se',
          description: 'Receba recomendações automáticas de investidores aderentes ao perfil do seu negócio.',
        },
        {
          title: 'Conclua o deal',
          description: 'Negocie com suporte de advisors parceiros e leve o processo até a liquidez com mais tranquilidade.',
        },
      ],
      ctaLabel: 'Solicite uma demonstração gratuita',
      ctaHref: '/signup?profile=asset',
    },
    {
      kind: 'cards',
      title: 'O que acontece se você não agir agora?',
      tone: 'warning',
      columns: 2,
      items: [
        {
          title: 'Continuar preso em processos demorados e opacos',
          description: 'Meses ou anos negociando sem clareza, perdendo oportunidades no mercado.',
          icon: Clock3,
        },
        {
          title: 'Perder oportunidades de investidores estratégicos',
          description: 'Investidores qualificados não esperam empresas desorganizadas e sem materiais consistentes.',
          icon: XCircle,
        },
        {
          title: 'Arriscar um valuation abaixo do que sua empresa merece',
          description: 'Sem dados estruturados e benchmark, você pode sair perdendo no valor capturado.',
          icon: BadgeDollarSign,
        },
        {
          title: 'Sentir frustração ao não ver o retorno justo do seu esforço',
          description: 'Anos de dedicação merecem uma jornada de liquidez mais digna e reconhecida pelo mercado.',
          icon: AlertCircle,
        },
      ],
    },
    {
      kind: 'cards',
      title: 'O que acontece quando você escolhe a Mary?',
      tone: 'success',
      columns: 4,
      items: [
        {
          title: 'Matching inteligente',
          description: 'Com investidores certos para o momento e o posicionamento da sua empresa.',
          icon: Network,
        },
        {
          title: 'Valuation transparente',
          description: 'E readiness score como referência objetiva para evoluir sua preparação.',
          icon: BarChart3,
        },
        {
          title: 'Due diligence + Q&As acelerados',
          description: 'Pela Mary AI, com mais agilidade na organização e no acesso aos materiais.',
          icon: Sparkles,
        },
        {
          title: 'Dashboard completo',
          description: 'Com visibilidade total do processo, documentos, contatos e próximas ações.',
          icon: LayoutDashboard,
        },
      ],
      callout: {
        title: 'Imagine ver sua empresa reconhecida pelo mercado',
        description:
          'Fechar o deal certo e conquistar a liquidez que você merece. Mais do que dinheiro, trata-se do reconhecimento de uma jornada inteira de dedicação.',
      },
    },
    {
      kind: 'pricing',
      id: 'planos',
      title: 'Planos para Empresas',
      subtitle: 'Escolha o modelo ideal para sua jornada de M&A',
      plans: [
        {
          eyebrow: 'Basic',
          price: 'Gratuito',
          title: 'Entrada',
          features: [
            'Cadastro da empresa na plataforma',
            'Teaser público sem dados sensíveis',
            'Acesso a templates básicos',
            'Suporte por email',
          ],
          ctaLabel: 'Começar grátis',
          ctaHref: '/signup?profile=asset',
          ctaVariant: 'outline',
        },
        {
          eyebrow: 'Growth',
          price: 'R$ 999',
          priceSuffix: '/mês',
          title: 'Operação guiada',
          badge: 'Mais popular',
          featured: true,
          features: [
            'Tudo do Basic',
            'CIM completo e VDR organizado',
            'MRS Score para preparação do ativo',
            'Matching inteligente com investidores',
            'Suporte dedicado via chat',
          ],
          ctaLabel: 'Assinar Growth',
          ctaHref: '/signup?profile=asset',
        },
        {
          eyebrow: 'Enterprise',
          price: 'Success Fee',
          title: 'Acompanhamento premium',
          features: [
            'Tudo do Growth',
            'Advisor parceiro dedicado ao seu deal',
            'Due diligence assistida',
            'Negociação e estruturação guiada',
            'Cobrança atrelada ao fechamento do deal',
          ],
          ctaLabel: 'Falar com especialista',
          ctaHref: '/login',
          ctaVariant: 'outline',
        },
      ],
    },
    {
      kind: 'faq',
      title: 'Perguntas Frequentes',
      subtitle: 'Tudo o que você precisa saber sobre vender ou captar com a Mary',
      items: [
        {
          question: 'Quanto custa para listar minha empresa na Mary?',
          answer:
            'Existe uma camada de entrada gratuita para iniciar o cadastro. Recursos mais avançados dependem do plano escolhido e do nível de suporte necessário.',
        },
        {
          question: 'Como funciona o Readiness Score?',
          answer:
            'O score organiza a preparação da empresa para M&A, apontando lacunas, documentos relevantes e prioridades para aumentar a qualidade do processo.',
        },
        {
          question: 'Minha empresa precisa estar pronta para venda?',
          answer:
            'Não totalmente. A Mary ajuda justamente a estruturar a jornada, mostrar o nível de readiness e orientar o que precisa evoluir antes do deal.',
        },
        {
          question: 'Quem terá acesso aos meus dados sensíveis?',
          answer:
            'O acesso é controlado por permissões e fases do processo. Informações confidenciais ficam protegidas até que as condições de compartilhamento sejam cumpridas.',
        },
        {
          question: 'Posso usar a Mary e meu advisor ao mesmo tempo?',
          answer:
            'Sim. A plataforma foi pensada para complementar o trabalho de advisors, centralizando documentos, workflow e visibilidade do deal.',
        },
        {
          question: 'Quanto tempo leva para fechar um deal na Mary?',
          answer:
            'O tempo varia conforme preparo do ativo, alinhamento com investidores e complexidade da transação, mas a plataforma reduz ruído e acelera etapas operacionais.',
        },
      ],
    },
    {
      kind: 'cta',
      title: 'Está pronto para dar o próximo passo?',
      subtitle:
        'Transforme a complexidade do M&A em uma jornada mais simples, transparente e vencedora. A Mary está pronta para ser sua parceira nessa conquista.',
      ctaLabel: 'Cadastrar minha empresa agora',
      ctaHref: '/signup?profile=asset',
    },
  ],
}

export const adviseLandingData: ProfileLandingPageData = {
  currentPath: '/advise',
  breadcrumbLabel: 'Assessorar',
  hero: {
    eyebrow: 'Para advisors',
    title: 'Advisor, seja protagonista do novo mercado de M&A',
    subtitle:
      'A Mary não compete com você: é sua parceira. Aqui, você ganha tecnologia, inteligência e uma rede global para potencializar mandatos, expandir negócios e reduzir atrito operacional.',
    ctaLabel: 'Cadastre-se como advisor e expanda sua atuação',
    ctaHref: '/signup?profile=advisor',
    secondaryCtaLabel: 'Voltar para home',
    secondaryCtaHref: '/',
  },
  sections: [
    {
      kind: 'cards',
      title: 'Por que tantos assessores perdem mandatos e oportunidades?',
      subtitle:
        'O modelo tradicional é ingrato com boutiques e advisors independentes. Veja alguns dos desafios que travam sua expansão:',
      tone: 'danger',
      columns: 2,
      items: [
        {
          title: 'Dependência excessiva de networking limitado',
          description: 'Seu pipeline depende demais de contatos pessoais, limitando escala e acesso a novos mercados.',
          icon: Users,
        },
        {
          title: 'Falta de dados estruturados sobre empresas e investidores',
          description: 'Você perde tempo coletando informações fragmentadas e pouco comparáveis.',
          icon: Database,
        },
        {
          title: 'Processos lentos, caros e manuais',
          description: 'Due diligence, VDR, Q&A e documentação consomem recursos que poderiam estar focados em negociação.',
          icon: Clock3,
        },
        {
          title: 'Dificuldade em gerar pipeline constante',
          description: 'Períodos de seca entre mandatos são comuns, gerando instabilidade financeira e perda de ritmo.',
          icon: TrendingUp,
        },
      ],
    },
    {
      kind: 'steps',
      title: 'Com a Mary, seu trabalho ganha escala e visibilidade',
      subtitle:
        'Nosso modelo foi pensado para advisors que querem ampliar resultados e entregar mais valor para clientes, sem aumentar complexidade.',
      steps: [
        {
          title: 'Cadastre-se como advisor',
          description: 'Mostre sua especialidade, deals, setores e portfólio em um perfil verificável e confiável.',
        },
        {
          title: 'Conecte-se a empresas e investidores',
          description: 'Receba oportunidades qualificadas alinhadas ao seu perfil e à sua tese de atuação.',
        },
        {
          title: 'Conduza o deal com suporte da Mary',
          description: 'Use tecnologia e dados organizados para acelerar análise, governança e negociação.',
        },
      ],
      ctaLabel: 'Agende uma demonstração gratuita',
      ctaHref: '/signup?profile=advisor',
    },
    {
      kind: 'cards',
      title: 'Ganhe tempo, credibilidade e novos mandatos',
      columns: 3,
      items: [
        {
          title: 'Pipeline contínuo',
          description: 'Acesso mais constante a deals prontos para avançar.',
          icon: Zap,
        },
        {
          title: 'Dados padronizados',
          description: 'Dossiês claros, comparáveis e melhor organizados para apresentação.',
          icon: FileText,
        },
        {
          title: 'Valuation e readiness score',
          description: 'Referência confiável para discussões mais objetivas com clientes e investidores.',
          icon: BarChart3,
        },
        {
          title: 'Due diligence digital',
          description: 'Q&A e VDR integrados em um fluxo menos manual.',
          icon: Shield,
        },
        {
          title: 'Dashboard de mandatos',
          description: 'Visibilidade total dos processos, prioridades e próximos movimentos.',
          icon: LayoutDashboard,
        },
        {
          title: 'Suporte global',
          description: 'Conexões com investidores e empresas em múltiplos mercados.',
          icon: Globe2,
        },
      ],
    },
    {
      kind: 'stats',
      title: 'Mais eficiência, menos improviso',
      stats: [
        { value: '+80', label: 'advisors conectados', hint: 'na plataforma' },
        { value: '+120', label: 'deals estruturados', hint: 'em 2024' },
        { value: '100%', label: 'compliance', hint: 'LGPD e padrões internacionais' },
        { value: '24/7', label: 'governança digital', hint: 'na operação dos mandatos' },
      ],
    },
    {
      kind: 'pricing',
      id: 'planos',
      title: 'Planos para Advisors',
      subtitle: 'Escolha o modelo ideal para o seu negócio de M&A',
      plans: [
        {
          eyebrow: 'Free',
          price: 'Gratuito',
          title: 'Entrada',
          features: [
            'Cadastro como advisor na plataforma',
            'Perfil público básico',
            'Acesso a oportunidades abertas',
            'Suporte por email',
          ],
          ctaLabel: 'Começar grátis',
          ctaHref: '/signup?profile=advisor',
          ctaVariant: 'outline',
        },
        {
          eyebrow: 'Professional',
          price: 'R$ 399',
          priceSuffix: '/mês',
          title: 'Operação profissional',
          badge: 'Mais popular',
          featured: true,
          features: [
            'Tudo do Free',
            'Perfil destacado e verificado',
            'Acesso prioritário a mandatos exclusivos',
            'Dashboard completo de pipeline',
            'Ferramentas de due diligence e VDR',
            'Suporte dedicado via chat',
          ],
          ctaLabel: 'Assinar Professional',
          ctaHref: '/signup?profile=advisor',
        },
        {
          eyebrow: 'Enterprise',
          price: 'Success Fee',
          title: 'Modelo avançado',
          features: [
            'Tudo do Professional',
            'Remuneração por sucesso quando aplicável',
            'Co-branding em deals estratégicos',
            'Acesso antecipado a oportunidades globais',
            'Integração com sistemas próprios',
          ],
          ctaLabel: 'Falar com especialista',
          ctaHref: '/login',
          ctaVariant: 'outline',
        },
      ],
    },
    {
      kind: 'faq',
      title: 'Perguntas Frequentes',
      subtitle: 'Tudo o que você precisa saber sobre atuar como advisor na Mary',
      items: [
        {
          question: 'Como funciona a remuneração para advisors na Mary?',
          answer:
            'A estrutura depende do modelo de atuação, do plano contratado e do tipo de oportunidade. A plataforma acomoda tanto uso recorrente quanto formatos ligados ao sucesso do deal.',
        },
        {
          question: 'A Mary vai competir comigo ou tomar meus clientes?',
          answer:
            'Não. A proposta é ampliar sua capacidade operacional e comercial, não substituir sua relação com os clientes.',
        },
        {
          question: 'Preciso ter certificação para atuar como advisor?',
          answer:
            'A relevância do perfil é avaliada pela qualidade do histórico, experiência e posicionamento. Dependendo do fluxo, verificações adicionais podem ser exigidas.',
        },
        {
          question: 'Como a Mary me ajuda a encontrar novos mandatos?',
          answer:
            'O ecossistema cruza perfis, setores, readiness e necessidades dos participantes para aproximar advisors de oportunidades mais aderentes.',
        },
        {
          question: 'Posso usar a Mary para deals que já tenho?',
          answer:
            'Sim. A plataforma também pode servir como base operacional para organizar materiais, interações e etapas de processos já em andamento.',
        },
        {
          question: 'Qual suporte a Mary oferece durante o processo?',
          answer:
            'Você conta com workflow estruturado, dados organizados, dashboard de mandatos e suporte operacional conforme o plano.',
        },
      ],
    },
    {
      kind: 'cta',
      title: 'Seja protagonista da nova era de M&A',
      subtitle:
        'Pare de depender apenas de networking e processos manuais. Com a Mary, você potencializa sua atuação e conquista novos mandatos.',
      ctaLabel: 'Cadastrar agora como advisor',
      ctaHref: '/signup?profile=advisor',
    },
  ],
}

export const indicateLandingData: ProfileLandingPageData = {
  currentPath: '/indicar',
  breadcrumbLabel: 'Indicar',
  hero: {
    eyebrow: 'Programa de indicações',
    title: 'Indique negócios. Expanda e monetize sua rede.',
    subtitle:
      'Você conhece empresários, investidores ou advisors e quer transformar seu networking em receita e reputação, sem precisar atuar diretamente no deal.',
    ctaLabel: 'Entrar na lista de espera para indicar',
    ctaHref: '#waitlist',
    secondaryCtaLabel: 'Voltar para home',
    secondaryCtaHref: '/',
  },
  sections: [
    {
      kind: 'stats',
      title: 'A Mary organiza e potencializa suas indicações.',
      subtitle:
        'Com a Mary, você passa a indicar oportunidades de forma simples, transparente e segura, acompanhando resultados e sendo reconhecido pelo valor que gera com sua rede.',
      stats: [
        { value: '+500', label: 'empresas cadastradas', hint: 'na base' },
        { value: '+120', label: 'deals em análise', hint: 'em 2024' },
        { value: '+80', label: 'advisors e investidores', hint: 'conectados' },
        { value: '100%', label: 'compliance', hint: 'com LGPD e regras contratuais' },
      ],
    },
    {
      kind: 'steps',
      title: 'Indicar negócios nunca foi tão simples',
      steps: [
        {
          title: 'Cadastre-se e receba seu link exclusivo',
          description: 'Entre na fila do programa e prepare seu canal de indicação.',
        },
        {
          title: 'Indique empresas, investidores ou advisors',
          description: 'Faça isso de forma simples, rastreável e com visibilidade do funil.',
        },
        {
          title: 'Acompanhe o status e receba sua recompensa',
          description: 'Você acompanha a evolução da oportunidade e sua remuneração potencial.',
        },
      ],
      ctaLabel: 'Solicitar acesso antecipado',
      ctaHref: '#waitlist',
    },
    {
      kind: 'cards',
      title: 'Por que indicar pela Mary?',
      columns: 2,
      items: [
        {
          title: 'Monetização transparente',
          description: 'Regras claras, acompanhamento do funil e previsibilidade sobre o valor gerado.',
          icon: Wallet,
        },
        {
          title: 'Reconhecimento de rede',
          description: 'Gere reputação ao conectar oportunidades relevantes ao ecossistema.',
          icon: Award,
        },
        {
          title: 'Zero operação',
          description: 'Você indica; a Mary cuida do processo, da estruturação e da governança.',
          icon: Zap,
        },
        {
          title: 'Dashboard de indicações',
          description: 'Acompanhamento em tempo real sobre pipeline, estágio e retorno esperado.',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      kind: 'cards',
      title: 'O que você perde sem um sistema de indicações?',
      tone: 'warning',
      columns: 2,
      items: [
        {
          title: 'Perda de oportunidades',
          description: 'Conexões passam sem registro, rastreio ou retorno financeiro.',
          icon: CircleOff,
        },
        {
          title: 'Falta de reconhecimento',
          description: 'Sem trilha, você não é lembrado quando a oportunidade avança e gera valor.',
          icon: AlertCircle,
        },
        {
          title: 'Desorganização',
          description: 'Informações dispersas e sem acompanhamento tornam sua rede menos eficiente.',
          icon: Workflow,
        },
        {
          title: 'Zero monetização',
          description: 'Seu networking continua valioso, mas não se transforma em receita real.',
          icon: BadgeDollarSign,
        },
      ],
    },
    {
      kind: 'stats',
      title: 'Resultados e credibilidade',
      stats: [
        { value: '+500', label: 'empresas cadastradas', hint: 'na plataforma' },
        { value: '+120', label: 'deals em análise', hint: 'em 2024' },
        { value: '+80', label: 'advisors e investidores', hint: 'conectados' },
        { value: '100%', label: 'compliance', hint: 'com LGPD e regras contratuais' },
      ],
    },
    {
      kind: 'pricing',
      id: 'planos',
      title: 'Planos para Agentes de Indicação',
      subtitle: 'Escolha o modelo ideal para monetizar sua rede',
      plans: [
        {
          eyebrow: 'Free',
          price: 'Gratuito',
          title: 'Entrada',
          features: [
            'Link exclusivo de indicação',
            'Dashboard básico de acompanhamento',
            'Notificações de status',
            'Suporte por email',
          ],
          ctaLabel: 'Entrar na fila',
          ctaHref: '#waitlist',
          ctaVariant: 'outline',
        },
        {
          eyebrow: 'Partner',
          price: 'R$ 399',
          priceSuffix: '/mês',
          title: 'Programa parceiro',
          badge: 'Mais popular',
          featured: true,
          features: [
            'Tudo do Free',
            'Dashboard avançado com analytics',
            'Comissões prioritárias',
            'Materiais de apoio para indicação',
            'Suporte dedicado via chat',
            'Relatórios mensais de performance',
          ],
          ctaLabel: 'Solicitar acesso Partner',
          ctaHref: '#waitlist',
        },
        {
          eyebrow: 'Premium',
          price: 'Success Fee',
          title: 'Relacionamento premium',
          features: [
            'Tudo do Partner',
            'Modelo de remuneração por sucesso',
            'Acesso antecipado a novas oportunidades',
            'Co-branding em materiais selecionados',
            'Gerente de relacionamento dedicado',
          ],
          ctaLabel: 'Falar com especialista',
          ctaHref: '#waitlist',
          ctaVariant: 'outline',
        },
      ],
    },
    {
      kind: 'faq',
      title: 'Perguntas Frequentes',
      subtitle: 'Tudo o que você precisa saber sobre o programa de indicações',
      items: [
        {
          question: 'Como funciona o programa de indicações da Mary?',
          answer:
            'Você entra no programa, recebe uma estrutura de acompanhamento e passa a registrar oportunidades com rastreabilidade, governança e regras mais claras de reconhecimento.',
        },
        {
          question: 'Como são calculadas as comissões?',
          answer:
            'A remuneração depende do modelo contratado, da etapa alcançada pela oportunidade e dos termos acordados no programa.',
        },
        {
          question: 'Preciso ter experiência em M&A para participar?',
          answer:
            'Não necessariamente. O valor principal está na qualidade e relevância das conexões que você consegue gerar para o ecossistema.',
        },
        {
          question: 'Como acompanho o status das minhas indicações?',
          answer:
            'A proposta do programa é justamente oferecer um dashboard com visibilidade sobre o estágio, a evolução e o reconhecimento das indicações.',
        },
        {
          question: 'Posso indicar empresas que já conheço ou com quem já trabalho?',
          answer:
            'Sim, desde que a oportunidade se enquadre nas regras do programa e possa ser processada com transparência e rastreabilidade.',
        },
        {
          question: 'Quanto tempo leva para receber a recompensa?',
          answer:
            'Isso varia conforme o andamento do deal e o modelo comercial, mas a Mary busca reduzir incerteza com trilha clara do processo.',
        },
      ],
    },
    {
      kind: 'cta',
      title: 'Pronto para transformar sua rede em resultados?',
      subtitle:
        'Comece agora a indicar oportunidades, acompanhe cada etapa e seja recompensado com transparência.',
      ctaLabel: 'Entrar na lista de espera',
      ctaHref: '#waitlist',
    },
    {
      kind: 'waitlist',
      id: 'waitlist',
      title: 'Programa de Indicações em breve',
      subtitle: 'O fluxo de signup para agentes ainda não está aberto. Entre na lista e avisaremos assim que a jornada for liberada.',
    },
  ],
}
