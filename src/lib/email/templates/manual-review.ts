/**
 * Email Templates - Manual Review Request
 * TASK-014: Email Notification for Manual Review Requests
 *
 * Templates for notifying the Mary team about eligibility manual review requests.
 */

import { EMAIL_CONFIG } from '../index'

// ============================================
// Types
// ============================================

export interface ManualReviewEmailParams {
  organizationId: string
  organizationName: string
  profileType: 'investor' | 'advisor' | 'asset'
  submittedBy: {
    email: string
    name?: string
  }
  eligibilityData: {
    dealsLast3Years: number
    totalDealValueUsd: number
    yearsExperience: number
  }
  justification?: string
  submittedAt: Date
  reviewUrl?: string
}

// ============================================
// Profile Type Labels
// ============================================

const PROFILE_LABELS: Record<string, string> = {
  investor: 'Investidor',
  advisor: 'Advisor',
  asset: 'Empresa',
}

// ============================================
// Format Currency
// ============================================

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// ============================================
// HTML Template
// ============================================

export function generateManualReviewHtml(params: ManualReviewEmailParams): string {
  const profileLabel = PROFILE_LABELS[params.profileType] || params.profileType
  const submitterDisplay = params.submittedBy.name || params.submittedBy.email
  const submittedAtFormatted = params.submittedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const adminUrl = params.reviewUrl || `${EMAIL_CONFIG.appUrl}/admin/reviews`

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitação de Revisão Manual - ${params.organizationName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      margin: 0;
      padding: 0;
      background-color: #f5f5f7;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .header-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .header-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 5px;
    }
    .content {
      padding: 30px;
    }
    .summary-box {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .summary-title {
      font-weight: 600;
      font-size: 16px;
      color: #92400e;
      margin: 0 0 15px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(245, 158, 11, 0.3);
    }
    .summary-row:last-child {
      border-bottom: none;
    }
    .summary-label {
      color: #92400e;
      font-size: 14px;
    }
    .summary-value {
      font-weight: 600;
      color: #78350f;
      font-size: 14px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .data-item {
      background-color: #f9fafb;
      padding: 12px;
      border-radius: 6px;
    }
    .data-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .data-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .data-value.highlight {
      color: #dc2626;
    }
    .justification-box {
      background-color: #f0f9ff;
      border-left: 4px solid #0ea5e9;
      padding: 15px;
      border-radius: 0 8px 8px 0;
    }
    .justification-label {
      font-size: 12px;
      color: #0369a1;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .justification-text {
      color: #1e40af;
      font-size: 14px;
      font-style: italic;
      white-space: pre-wrap;
    }
    .no-justification {
      color: #9ca3af;
      font-style: italic;
      font-size: 14px;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      margin: 5px 0;
    }
    .badge {
      display: inline-block;
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    @media (max-width: 480px) {
      .data-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">⏳</div>
      <h1 class="header-title">Solicitação de Revisão Manual</h1>
      <p class="header-subtitle">Um usuário solicitou análise de elegibilidade</p>
    </div>

    <div class="content">
      <div class="summary-box">
        <h2 class="summary-title">Resumo da Solicitação</h2>
        <div class="summary-row">
          <span class="summary-label">Organização</span>
          <span class="summary-value">${params.organizationName}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Tipo de Perfil</span>
          <span class="summary-value"><span class="badge">${profileLabel}</span></span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Solicitante</span>
          <span class="summary-value">${submitterDisplay}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Data/Hora</span>
          <span class="summary-value">${submittedAtFormatted}</span>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Dados de Elegibilidade</h3>
        <div class="data-grid">
          <div class="data-item">
            <div class="data-label">Deals (últimos 3 anos)</div>
            <div class="data-value ${params.eligibilityData.dealsLast3Years < 1 ? 'highlight' : ''}">${params.eligibilityData.dealsLast3Years}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Valor Total de Deals</div>
            <div class="data-value ${params.eligibilityData.totalDealValueUsd < 100000 ? 'highlight' : ''}">${formatUsd(params.eligibilityData.totalDealValueUsd)}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Anos de Experiência</div>
            <div class="data-value ${params.eligibilityData.yearsExperience < 2 ? 'highlight' : ''}">${params.eligibilityData.yearsExperience} anos</div>
          </div>
          <div class="data-item">
            <div class="data-label">ID da Organização</div>
            <div class="data-value" style="font-size: 11px; font-family: monospace;">${params.organizationId}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Justificativa do Usuário</h3>
        ${params.justification ? `
        <div class="justification-box">
          <div class="justification-label">MENSAGEM DO SOLICITANTE</div>
          <div class="justification-text">${params.justification}</div>
        </div>
        ` : `
        <p class="no-justification">Nenhuma justificativa foi fornecida pelo usuário.</p>
        `}
      </div>

      <div class="cta-container">
        <a href="${adminUrl}" class="cta-button">Revisar Solicitação</a>
      </div>
    </div>

    <div class="footer">
      <p>Este é um email automático do sistema Mary Platform.</p>
      <p>Enviado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
      <p>&copy; ${new Date().getFullYear()} Mary Digital Ecosystem.</p>
    </div>
  </div>
</body>
</html>
`.trim()
}

// ============================================
// Plain Text Template
// ============================================

export function generateManualReviewText(params: ManualReviewEmailParams): string {
  const profileLabel = PROFILE_LABELS[params.profileType] || params.profileType
  const submitterDisplay = params.submittedBy.name || params.submittedBy.email
  const submittedAtFormatted = params.submittedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const adminUrl = params.reviewUrl || `${EMAIL_CONFIG.appUrl}/admin/reviews`

  return `
SOLICITAÇÃO DE REVISÃO MANUAL - ELEGIBILIDADE
=============================================

Um usuário solicitou análise manual de elegibilidade na plataforma Mary.

RESUMO DA SOLICITAÇÃO
---------------------
Organização: ${params.organizationName}
Tipo de Perfil: ${profileLabel}
Solicitante: ${submitterDisplay}
Email: ${params.submittedBy.email}
Data/Hora: ${submittedAtFormatted}
ID da Organização: ${params.organizationId}

DADOS DE ELEGIBILIDADE
----------------------
Deals (últimos 3 anos): ${params.eligibilityData.dealsLast3Years}
Valor Total de Deals: ${formatUsd(params.eligibilityData.totalDealValueUsd)}
Anos de Experiência: ${params.eligibilityData.yearsExperience} anos

JUSTIFICATIVA DO USUÁRIO
------------------------
${params.justification || 'Nenhuma justificativa foi fornecida pelo usuário.'}

AÇÕES
-----
Acesse o painel administrativo para revisar esta solicitação:
${adminUrl}

---
Este é um email automático do sistema Mary Platform.
© ${new Date().getFullYear()} Mary Digital Ecosystem.
`.trim()
}

// ============================================
// Email Subject
// ============================================

export function generateManualReviewSubject(params: ManualReviewEmailParams): string {
  const profileLabel = PROFILE_LABELS[params.profileType] || params.profileType
  return `[Revisão Manual] ${params.organizationName} - ${profileLabel}`
}
