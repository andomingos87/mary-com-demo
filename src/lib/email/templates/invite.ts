/**
 * Email Templates - Organization Invite
 * 
 * Templates de email para convites de organização.
 * Suporta geração de HTML e texto plano.
 */

import { EMAIL_CONFIG } from '../index';

// ============================================
// Types
// ============================================

export interface InviteEmailParams {
  recipientName?: string;
  recipientEmail: string;
  organizationName: string;
  organizationSlug: string;
  inviterName?: string;
  inviterEmail: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  inviteToken: string;
  expiresAt: Date;
}

// ============================================
// Role Labels
// ============================================

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: 'acesso total à organização, incluindo faturamento e configurações',
  admin: 'gerenciar membros, configurações e todas as funcionalidades',
  member: 'acessar todas as funcionalidades operacionais',
  viewer: 'visualizar informações (somente leitura)',
};

// ============================================
// Generate Invite URL
// ============================================

export function getInviteUrl(token: string): string {
  return `${EMAIL_CONFIG.appUrl}/invite/${token}`;
}

// ============================================
// HTML Template
// ============================================

export function generateInviteHtml(params: InviteEmailParams): string {
  const inviteUrl = getInviteUrl(params.inviteToken);
  const roleLabel = ROLE_LABELS[params.role] || params.role;
  const roleDescription = ROLE_DESCRIPTIONS[params.role] || '';
  const expiresFormatted = params.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const recipientDisplay = params.recipientName || params.recipientEmail.split('@')[0];
  const inviterDisplay = params.inviterName || params.inviterEmail;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para ${params.organizationName}</title>
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
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #4ade80;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1a1a2e;
    }
    .message {
      font-size: 16px;
      color: #4a5568;
      margin-bottom: 30px;
    }
    .highlight-box {
      background-color: #f8fafc;
      border-left: 4px solid #4ade80;
      padding: 20px;
      margin: 30px 0;
      border-radius: 0 8px 8px 0;
    }
    .highlight-box h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #1a1a2e;
    }
    .highlight-box p {
      margin: 0;
      color: #4a5568;
      font-size: 14px;
    }
    .role-badge {
      display: inline-block;
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 30px 0;
      box-shadow: 0 4px 14px rgba(74, 222, 128, 0.4);
    }
    .cta-button:hover {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }
    .cta-container {
      text-align: center;
    }
    .link-fallback {
      font-size: 12px;
      color: #94a3b8;
      word-break: break-all;
      margin-top: 20px;
    }
    .link-fallback a {
      color: #4ade80;
    }
    .expiry-notice {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #92400e;
      margin: 30px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      margin: 5px 0;
    }
    .footer a {
      color: #4ade80;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Mary<span>.</span></div>
    </div>
    
    <div class="content">
      <p class="greeting">Olá, ${recipientDisplay}!</p>
      
      <p class="message">
        <strong>${inviterDisplay}</strong> convidou você para fazer parte da organização 
        <strong>${params.organizationName}</strong> na plataforma Mary.
      </p>
      
      <div class="highlight-box">
        <h3>Detalhes do convite</h3>
        <p>
          <strong>Organização:</strong> ${params.organizationName}<br>
          <strong>Seu papel:</strong> <span class="role-badge">${roleLabel}</span><br>
          <strong>Permissões:</strong> ${roleDescription}
        </p>
      </div>
      
      <div class="cta-container">
        <a href="${inviteUrl}" class="cta-button">Aceitar Convite</a>
      </div>
      
      <div class="expiry-notice">
        ⏰ Este convite expira em <strong>${expiresFormatted}</strong>. 
        Após essa data, será necessário solicitar um novo convite.
      </div>
      
      <p class="link-fallback">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="${inviteUrl}">${inviteUrl}</a>
      </p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático enviado pela plataforma Mary.</p>
      <p>Se você não esperava este convite, pode ignorar este email com segurança.</p>
      <p>&copy; ${new Date().getFullYear()} Mary Platform. Todos os direitos reservados.</p>
      <p><a href="${EMAIL_CONFIG.appUrl}">mary.com.br</a></p>
    </div>
  </div>
</body>
</html>
`.trim();
}

// ============================================
// Plain Text Template
// ============================================

export function generateInviteText(params: InviteEmailParams): string {
  const inviteUrl = getInviteUrl(params.inviteToken);
  const roleLabel = ROLE_LABELS[params.role] || params.role;
  const roleDescription = ROLE_DESCRIPTIONS[params.role] || '';
  const expiresFormatted = params.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const recipientDisplay = params.recipientName || params.recipientEmail.split('@')[0];
  const inviterDisplay = params.inviterName || params.inviterEmail;

  return `
Olá, ${recipientDisplay}!

${inviterDisplay} convidou você para fazer parte da organização "${params.organizationName}" na plataforma Mary.

DETALHES DO CONVITE
-------------------
Organização: ${params.organizationName}
Seu papel: ${roleLabel}
Permissões: ${roleDescription}

ACEITAR CONVITE
---------------
Clique no link abaixo para aceitar o convite:
${inviteUrl}

⏰ ATENÇÃO: Este convite expira em ${expiresFormatted}.
Após essa data, será necessário solicitar um novo convite.

---
Este é um email automático enviado pela plataforma Mary.
Se você não esperava este convite, pode ignorar este email com segurança.

© ${new Date().getFullYear()} Mary Platform. Todos os direitos reservados.
${EMAIL_CONFIG.appUrl}
`.trim();
}

// ============================================
// Email Subject
// ============================================

export function generateInviteSubject(params: InviteEmailParams): string {
  const inviterDisplay = params.inviterName || params.inviterEmail.split('@')[0];
  return `${inviterDisplay} convidou você para ${params.organizationName} na Mary`;
}

