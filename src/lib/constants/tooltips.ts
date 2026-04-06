export const TOOLTIPS = {
  onboarding: {
    asset: {
      responsibleName: 'Nome da pessoa responsável por conduzir o processo dentro da empresa.',
      companyName: 'Nome público da empresa usado para identificação no ecossistema.',
      companyDescription:
        'Descreva a empresa, momento atual e contexto do projeto para melhorar o matching com investidores.',
      projectObjective: 'Objetivo principal da transação: captação, venda parcial, venda total ou outra operação.',
      specificReason: 'Motivo específico que justifica o objetivo escolhido para esta rodada.',
      businessModel: 'Selecione os modelos de negócio que representam como sua empresa captura valor.',
      sectors: 'Você pode selecionar múltiplos setores. Quanto mais específico, melhor a aderência de match.',
      geographies: 'Selecione regiões ou países de atuação prioritária para distribuição do deal.',
      idealInvestor:
        'Descreva o perfil de investidor desejado (estágio, experiência setorial, tamanho de cheque e governança).',
      ticket: 'Faixa de investimento estimada para a rodada atual.',
      readinessHighlights: 'Principais diferenciais, tração e sinais de prontidão para due diligence.',
      advisors: 'Adicione advisors-chave envolvidos na operação e seu papel no processo.',
      codename:
        'Codinome confidencial para o projeto. Evite nome real da empresa para preservar sigilo em materiais externos.',
    },
    investor: {
      thesisName: 'Nome curto para identificar sua tese de investimento.',
      thesisDescription:
        'Descreva critérios de tese para orientar matching e recomendação contextual da plataforma.',
      sectors: 'Selecione os setores prioritários para seu mandato de investimento.',
      stages: 'Estágios de maturidade das empresas-alvo (seed, growth, late stage etc.).',
      geographies: 'Regiões geográficas com interesse ativo para alocação de capital.',
      ticketMin: 'Valor mínimo típico de aporte.',
      ticketMax: 'Valor máximo típico de aporte.',
      ebitdaRange: 'Faixa de EBITDA alvo para triagem inicial de oportunidades.',
      robRange: 'Faixa de Receita Operacional Bruta (ROB) para qualificação.',
      operationType: 'Tipo de operação preferido (equity, controle, minoritário, M&A estratégico).',
      exclusionCriteria: 'Critérios eliminatórios que não se encaixam na sua tese.',
      termsAcceptance: 'Confirme leitura e aceite dos termos para concluir onboarding.',
    },
  },
  thesis: {
    name: 'Ex: "Edtechs", "Fintechs Series A".',
    summary:
      'Descreva sua tese de modo que os Ativos possam entender seus critérios macro para melhorar o match.',
    sectors: 'Você pode selecionar múltiplos setores. Quanto mais específico, melhor o matching.',
    targetAudience: 'Tipo de cliente que a empresa-alvo deve ter.',
    geo: 'Selecione continentes e países-alvo para a tese.',
    robMin: 'Receita Operacional Bruta mínima da empresa-alvo nos últimos 12 meses.',
    robMax: 'Receita Operacional Bruta máxima da empresa-alvo nos últimos 12 meses.',
    ebitdaPercentMin: 'Percentual mínimo de EBITDA da empresa-alvo.',
    ticketMin: 'Valor mínimo que você está disposto a aportar.',
    ticketMax: 'Valor máximo que você está disposto a aportar.',
    stage: 'Estágio de maturidade da empresa-alvo.',
    operationType: 'Tipo de operação que você prefere.',
    exclusionCriteria: 'Setores, perfis ou características que você não quer na sua tese.',
    additionalInfo: 'Informações complementares para orientar matching e análise humana.',
  },
  mrs: {
    metadata: 'Metadados usados para calcular prontidão e priorizar ações no score.',
    evidence: 'Documentos e evidências que sustentam o progresso de readiness.',
  },
  projects: {
    summary: 'Resumo executivo do projeto para comunicação com stakeholders.',
    stage: 'Fase atual da operação no pipeline de execução.',
    visibility: 'Define quem pode visualizar detalhes e documentos do projeto.',
  },
} as const

export type TooltipsCatalog = typeof TOOLTIPS
