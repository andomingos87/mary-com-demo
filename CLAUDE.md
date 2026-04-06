# CLAUDE.md

Instruções específicas para Claude Code no projeto Mary AI Platform.

> **Arquitetura, comandos, estrutura de pastas e JIT Index:** consulte `AGENTS.md` (fonte de verdade).
> **Governança de IA, precedência de contexto e skills:** consulte `.context/AI_GOVERNANCE.md`.

---

## Communication Style

- Responda sempre em Português Brasileiro.
- Seja conciso e direto.
- Todo blocker deve ter solução proposta com justificativa.
- Toda preocupação deve ter estratégia de mitigação.
- Ao apresentar opções, sempre dê uma recomendação clara com raciocínio.

---

## Code Conventions

- Sempre use o alias `@/` para imports de `src/`.
- **Design tokens:** nunca hardcode cores, sombras ou fontes. Use tokens semânticos do Tailwind definidos em `src/app/globals.css` (ex: `bg-primary`, `text-foreground`, `shadow-card`). Sempre pareie background/texto corretamente (ex: `bg-primary` com `text-primary-foreground`).
- Sombras customizadas: `shadow-card`, `shadow-elegant`, `shadow-glow` (evite `shadow-lg/xl/2xl` genéricos).
- Transições customizadas: `transition-smooth` (300ms), `transition-bounce` (400ms), `transition-elegant` (500ms).
- Fonte: DM Sans (global) — nunca sobrescreva `font-family`.
- Border radius: prefira `rounded-lg` (8px), nunca use valores arbitrários.

---

## Security & Secrets

- `SHOW_MFA_CODE=true` é permitido **apenas em dev/homologação** para exibir OTP em `/verify-mfa`.
- Exibição de OTP é bloqueada em produção por `shouldExposeOtpInUi` (`NODE_ENV !== 'production'`).
- Em modo de teste OTP, MFA pode usar telefone mock fallback (`+5511999999999`) para usuários sem `phone_number`.
- **Nunca** commitar `.env*`, chaves de serviço ou tokens.
- Revisar RLS policies em migrations antes de merge.
