'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { triggerReadinessRecalc } from './vdr-utils'
import type { VdrBulkUpdateInput } from '@/types/vdr'

/**
 * Bulk update multiple documents
 */
export async function bulkUpdateDocuments(
  input: VdrBulkUpdateInput
): Promise<{ success: boolean; updated: number; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, updated: 0, error: 'Não autenticado' }
  }

  if (input.documentIds.length === 0) {
    return { success: true, updated: 0 }
  }

  // Build update object
  const updateData: Record<string, unknown> = {}

  if (input.updates.status !== undefined) {
    updateData.status = input.updates.status
  }
  if (input.updates.priority !== undefined) {
    updateData.priority = input.updates.priority
  }
  if (input.updates.responsibleId !== undefined) {
    updateData.responsible_id = input.updates.responsibleId
  }
  if (input.updates.risk !== undefined) {
    updateData.risk = input.updates.risk
  }
  if (input.updates.businessUnit !== undefined) {
    updateData.business_unit = input.updates.businessUnit
  }

  // For tag operations, we need to handle each document individually
  if (input.updates.tagsToAdd || input.updates.tagsToRemove) {
    // Get current tags for all documents
    const { data: docs, error: fetchError } = await supabase
      .from('vdr_documents')
      .select('id, tags')
      .in('id', input.documentIds)

    if (fetchError) {
      console.error('Error fetching documents for bulk tag update:', fetchError)
      return { success: false, updated: 0, error: fetchError.message }
    }

    // Update each document's tags
    let updatedCount = 0
    for (const doc of docs || []) {
      let currentTags = (doc.tags || []) as string[]

      // Add new tags
      if (input.updates.tagsToAdd && input.updates.tagsToAdd.length > 0) {
        currentTags = Array.from(new Set([...currentTags, ...input.updates.tagsToAdd]))
      }

      // Remove tags
      if (input.updates.tagsToRemove && input.updates.tagsToRemove.length > 0) {
        currentTags = currentTags.filter(t => !input.updates.tagsToRemove!.includes(t))
      }

      const { error: updateError } = await supabase
        .from('vdr_documents')
        .update({ ...updateData, tags: currentTags })
        .eq('id', doc.id)

      if (!updateError) {
        updatedCount++
      }
    }

    await logAuditEvent('vdr.document_bulk_updated', {
      document_ids: input.documentIds,
      changes: input.updates,
      updated_count: updatedCount,
    }, user.id)

    return { success: true, updated: updatedCount }
  }

  // Simple bulk update without tag operations
  if (Object.keys(updateData).length === 0) {
    return { success: true, updated: 0 }
  }

  const { error, count } = await supabase
    .from('vdr_documents')
    .update(updateData)
    .in('id', input.documentIds)

  if (error) {
    console.error('Error bulk updating documents:', error)
    return { success: false, updated: 0, error: error.message }
  }

  await logAuditEvent('vdr.document_bulk_updated', {
    document_ids: input.documentIds,
    changes: input.updates,
    updated_count: count,
  }, user.id)

  return { success: true, updated: count || input.documentIds.length }
}

/**
 * Reorder documents within a folder
 */
export async function reorderDocuments(
  folderId: string,
  documentOrders: Array<{ id: string; sortOrder: number }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Update each document's sort_order
  const updates = documentOrders.map(({ id, sortOrder }) =>
    supabase
      .from('vdr_documents')
      .update({ sort_order: sortOrder })
      .eq('id', id)
      .eq('folder_id', folderId)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  if (errors.length > 0) {
    console.error('Error reordering documents:', errors[0].error)
    return { success: false, error: 'Erro ao reordenar documentos' }
  }

  await logAuditEvent('vdr.documents_reordered', {
    folder_id: folderId,
    document_count: documentOrders.length,
  }, user.id)

  return { success: true }
}
