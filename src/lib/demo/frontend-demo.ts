/**
 * Modo demonstração para validação ponta a ponta do frontend sem depender de dados reais no banco.
 *
 * Ative em `.env.local`: `NEXT_PUBLIC_FRONTEND_DEMO=true`
 */
export function isFrontendDemo(): boolean {
  return process.env.NEXT_PUBLIC_FRONTEND_DEMO === 'true'
}
