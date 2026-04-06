import type { OnboardingData } from '@/types/database'
import type {
  AssetCodenameData,
  AssetCompanyData,
  AssetMatchingData,
  AssetTeamData,
} from '@/types/onboarding'

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  return undefined
}

function mapLegacyShareholders(
  rawShareholders: Array<Record<string, unknown>> | null | undefined
): AssetTeamData['shareholders'] {
  if (!rawShareholders?.length) {
    return []
  }

  return rawShareholders
    .map((item) => ({
      name: toStringOrEmpty(item.name || item.nome),
      email: toStringOrEmpty(item.email),
      role: toStringOrEmpty(item.role || item.qualificacao),
      ownershipPercent:
        toNumberOrUndefined(item.ownershipPercent) ??
        toNumberOrUndefined(item.percentualParticipacao) ??
        toNumberOrUndefined(item.percentual_participacao),
    }))
    .filter((item) => item.name.trim().length > 0)
}

export function hydrateAssetStepFormData(
  onboardingData: OnboardingData | null,
  base: Record<string, unknown> = {},
  fallback?: {
    companyName?: string | null
    responsibleName?: string | null
    shareholders?: Array<Record<string, unknown>> | null
  }
): Record<string, unknown> {
  const assetCompanyData = (onboardingData?.assetCompanyData || {}) as Partial<AssetCompanyData>
  const assetMatchingData = (onboardingData?.assetMatchingData || {}) as Partial<AssetMatchingData>
  const assetTeamData = (onboardingData?.assetTeamData || {}) as Partial<AssetTeamData>
  const assetCodenameData = (onboardingData?.assetCodenameData || {}) as Partial<AssetCodenameData>
  const fallbackCompanyName = fallback?.companyName?.trim()
  const fallbackResponsibleName = fallback?.responsibleName?.trim()
  const fallbackShareholders = mapLegacyShareholders(fallback?.shareholders)
  const hasPersistedShareholders = !!assetTeamData.shareholders?.length

  const hydratedAssetCompanyData: Partial<AssetCompanyData> = {
    ...assetCompanyData,
    companyName:
      typeof assetCompanyData.companyName === 'string' && assetCompanyData.companyName.trim().length > 0
        ? assetCompanyData.companyName
        : fallbackCompanyName || assetCompanyData.companyName,
    responsibleName:
      typeof assetCompanyData.responsibleName === 'string' && assetCompanyData.responsibleName.trim().length > 0
        ? assetCompanyData.responsibleName
        : fallbackResponsibleName || assetCompanyData.responsibleName,
  }

  return {
    ...base,
    ...hydratedAssetCompanyData,
    ...assetMatchingData,
    ...assetTeamData,
    shareholders: hasPersistedShareholders ? assetTeamData.shareholders : fallbackShareholders,
    ...assetCodenameData,
  }
}
