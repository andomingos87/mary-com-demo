'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type {
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  OrganizationProfile,
  MemberRole,
  UserOrganization,
  Json,
  Database,
} from '@/types/database'

// ============================================
// Types
// ============================================

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateOrganizationInput {
  name: string
  slug: string
  profileType: OrganizationProfile
  description?: string
  website?: string
  logoUrl?: string
}

export interface UpdateOrganizationInput {
  name?: string
  description?: string
  website?: string
  logoUrl?: string
  settings?: Record<string, unknown>
}

// ============================================
// Helper: Log audit event
// ============================================

async function logOrgAuditEvent(
  action: string,
  userId: string,
  orgId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createAdminClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  await supabase.from('audit_logs').insert({
    action: action as Database["public"]["Enums"]["audit_action"],
    user_id: userId,
    organization_id: orgId,
    metadata: metadata as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// ============================================
// Helper: Generate slug
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
}

// ============================================
// 2.2.1 - Criar organização
// POST /organizations equivalent
// ============================================

export async function createOrganization(
  input: CreateOrganizationInput
): Promise<ActionResult<Organization>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
    if (!slugRegex.test(input.slug)) {
      return { 
        success: false, 
        error: 'Slug inválido. Use apenas letras minúsculas, números e hífens.' 
      }
    }

    // Check if slug is unique
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', input.slug)
      .single()

    if (existing) {
      return { success: false, error: 'Este slug já está em uso' }
    }

    // Create organization
    const orgData: OrganizationInsert = {
      name: input.name,
      slug: input.slug,
      profile_type: input.profileType,
      description: input.description,
      website: input.website,
      logo_url: input.logoUrl,
      created_by: user.id,
    }
    // Type assertion needed due to Supabase client type inference issues
    type InsertFn = (data: typeof orgData) => ReturnType<ReturnType<typeof supabase.from>['insert']>
    const { data: org, error: orgError } = await (supabase
      .from('organizations')
      .insert as unknown as InsertFn)(orgData)
      .select()
      .single() as { data: Organization | null; error: Error | null }

    if (orgError || !org) {
      console.error('Error creating organization:', orgError)
      return { success: false, error: 'Erro ao criar organização' }
    }

    // Add creator as owner (using admin client to bypass RLS timing issue)
    const adminSupabase = await createAdminClient()
    const memberData = {
      organization_id: org.id,
      user_id: user.id,
      role: 'owner' as const,
      verification_status: 'completed' as const,
    }
    type MemberInsertFn = (data: typeof memberData) => ReturnType<ReturnType<typeof adminSupabase.from>['insert']>
    const { error: memberError } = await (adminSupabase
      .from('organization_members')
      .insert as unknown as MemberInsertFn)(memberData)

    if (memberError) {
      console.error('Error adding owner:', memberError)
      // Rollback organization creation
      await adminSupabase.from('organizations').delete().eq('id', org.id)
      return { success: false, error: 'Erro ao configurar proprietário' }
    }

    // Log audit event
    await logOrgAuditEvent('org.created', user.id, org.id, {
      org_name: org.name,
      org_slug: org.slug,
      profile_type: org.profile_type,
    })

    return { success: true, data: org }
  } catch (error) {
    console.error('Unexpected error in createOrganization:', error)
    return { success: false, error: 'Erro inesperado ao criar organização' }
  }
}

// ============================================
// 2.2.2 - Listar organizações do usuário
// GET /organizations equivalent
// ============================================

export async function getUserOrganizations(): Promise<ActionResult<UserOrganization[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Use the database function for better performance
    // Type assertion needed due to Supabase client type inference issues
    type RpcFn = (args: { p_user_id: string }) => Promise<{ data: UserOrganization[] | null; error: Error | null }>
    const { data, error } = await (supabase.rpc as unknown as (name: string, args: { p_user_id: string }) => ReturnType<RpcFn>)('get_user_organizations', { p_user_id: user.id })

    if (error) {
      console.error('Error fetching organizations:', error)
      return { success: false, error: 'Erro ao buscar organizações' }
    }

    return { success: true, data: (data as UserOrganization[]) || [] }
  } catch (error) {
    console.error('Unexpected error in getUserOrganizations:', error)
    return { success: false, error: 'Erro inesperado ao buscar organizações' }
  }
}

// ============================================
// 2.2.3 - Obter organização por ID ou slug
// GET /organizations/:id equivalent
// ============================================

export async function getOrganization(
  idOrSlug: string
): Promise<ActionResult<Organization>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Try by ID first, then by slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    let query = supabase
      .from('organizations')
      .select('*')
      .is('deleted_at', null)

    if (isUuid) {
      query = query.eq('id', idOrSlug)
    } else {
      query = query.eq('slug', idOrSlug)
    }

    const { data: org, error: orgError } = await query.single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    // RLS already ensures user is a member
    return { success: true, data: org }
  } catch (error) {
    console.error('Unexpected error in getOrganization:', error)
    return { success: false, error: 'Erro inesperado ao buscar organização' }
  }
}

// ============================================
// 2.2.4 - Atualizar organização
// PATCH /organizations/:id equivalent
// ============================================

export async function updateOrganization(
  orgId: string,
  input: UpdateOrganizationInput
): Promise<ActionResult<Organization>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Prepare update data
    const updateData: OrganizationUpdate = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.website !== undefined) updateData.website = input.website
    if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl
    if (input.settings !== undefined) updateData.settings = input.settings as Json

    // Update organization (RLS enforces owner/admin permission)
    // Type assertion needed due to Supabase client type inference issues
    type UpdateFn = (data: typeof updateData) => ReturnType<ReturnType<typeof supabase.from>['update']>
    const { data: org, error: updateError } = await (supabase
      .from('organizations')
      .update as unknown as UpdateFn)(updateData)
      .eq('id', orgId)
      .is('deleted_at', null)
      .select()
      .single() as { data: Organization | null; error: Error | null }

    if (updateError) {
      console.error('Error updating organization:', updateError)
      if ((updateError as { code?: string }).code === 'PGRST116') {
        return { success: false, error: 'Organização não encontrada ou sem permissão' }
      }
      return { success: false, error: 'Erro ao atualizar organização' }
    }

    // Log audit event
    await logOrgAuditEvent('org.updated', user.id, orgId, {
      changes: input,
    })

    return { success: true, data: org ?? undefined }
  } catch (error) {
    console.error('Unexpected error in updateOrganization:', error)
    return { success: false, error: 'Erro inesperado ao atualizar organização' }
  }
}

// ============================================
// 2.2.5 - Excluir organização (soft delete)
// DELETE /organizations/:id equivalent
// ============================================

export async function deleteOrganization(
  orgId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get org name for audit before soft delete
    const { data: org } = await supabase
      .from('organizations')
      .select('name, slug')
      .eq('id', orgId)
      .single() as { data: { name: string; slug: string } | null; error: unknown }

    // Soft delete (RLS enforces owner-only permission via DELETE policy)
    // We use UPDATE to set deleted_at because soft delete is preferred
    const softDeleteData = { deleted_at: new Date().toISOString() }
    type SoftDeleteFn = (data: typeof softDeleteData) => ReturnType<ReturnType<typeof supabase.from>['update']>
    const { error: deleteError } = await (supabase
      .from('organizations')
      .update as unknown as SoftDeleteFn)(softDeleteData)
      .eq('id', orgId)
      .is('deleted_at', null)

    if (deleteError) {
      console.error('Error deleting organization:', deleteError)
      if ((deleteError as { code?: string }).code === 'PGRST116') {
        return { success: false, error: 'Organização não encontrada ou sem permissão' }
      }
      return { success: false, error: 'Erro ao excluir organização' }
    }

    // Log audit event
    await logOrgAuditEvent('org.deleted', user.id, orgId, {
      org_name: org?.name,
      org_slug: org?.slug,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteOrganization:', error)
    return { success: false, error: 'Erro inesperado ao excluir organização' }
  }
}

// ============================================
// Helper: Check slug availability
// ============================================

export async function checkSlugAvailability(
  slug: string
): Promise<ActionResult<{ available: boolean; suggestion?: string }>> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Use admin client to check without RLS restrictions
    const adminSupabase = await createAdminClient()
    const { data: existing } = await adminSupabase
      .from('organizations')
      .select('slug')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return { success: true, data: { available: true } }
    }

    // Generate suggestion
    const timestamp = Date.now().toString(36).slice(-4)
    return { 
      success: true, 
      data: { 
        available: false, 
        suggestion: `${slug}-${timestamp}` 
      } 
    }
  } catch (error) {
    console.error('Unexpected error in checkSlugAvailability:', error)
    return { success: false, error: 'Erro ao verificar disponibilidade' }
  }
}

// ============================================
// Helper: Generate slug from name
// ============================================

export async function generateUniqueSlug(
  name: string
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    let baseSlug = generateSlug(name)
    if (!baseSlug) {
      baseSlug = 'org'
    }

    // Check if available
    const adminSupabase = await createAdminClient()
    const { data: existing } = await adminSupabase
      .from('organizations')
      .select('slug')
      .like('slug', `${baseSlug}%`)
      .is('deleted_at', null)

    if (!existing || existing.length === 0) {
      return { success: true, data: baseSlug }
    }

    // Find next available number
    const existingSlugs = new Set(existing.map(e => e.slug))
    if (!existingSlugs.has(baseSlug)) {
      return { success: true, data: baseSlug }
    }

    let counter = 1
    while (existingSlugs.has(`${baseSlug}-${counter}`)) {
      counter++
    }

    return { success: true, data: `${baseSlug}-${counter}` }
  } catch (error) {
    console.error('Unexpected error in generateUniqueSlug:', error)
    return { success: false, error: 'Erro ao gerar slug' }
  }
}

