'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { DEFAULT_VDR_FOLDERS, DEFAULT_VDR_DOCUMENTS } from '@/types/vdr'
import type {
  VdrFolder,
  VdrFolderWithCounts,
  VdrDocument,
  CreateFolderInput,
  UpdateFolderInput,
} from '@/types/vdr'

/**
 * Initialize default VDR folders for a project
 */
export async function initializeDefaultFolders(projectId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Use the updated DEFAULT_VDR_FOLDERS with codes
  const foldersToInsert = DEFAULT_VDR_FOLDERS.map(f => ({
    project_id: projectId,
    name: f.name,
    slug: f.slug,
    code: f.code,
    icon: f.icon,
    sort_order: f.sortOrder,
    is_default: true,
    created_by: user.id,
  }))

  const { data, error } = await supabase
    .from('vdr_folders')
    .insert(foldersToInsert)
    .select()

  if (error) {
    console.error('Error initializing VDR folders:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Initialize default VDR documents (32 items template) for a project
 */
export async function initializeDefaultDocuments(projectId: string): Promise<{
  success: boolean
  data?: VdrDocument[]
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get folders for this project to map codes to folder IDs
  const { data: folders, error: foldersError } = await supabase
    .from('vdr_folders')
    .select('id, code')
    .eq('project_id', projectId)

  if (foldersError || !folders) {
    console.error('Error getting folders:', foldersError)
    return { success: false, error: 'Erro ao buscar pastas' }
  }

  // Create a map of folder codes to folder IDs
  const folderCodeToId = Object.fromEntries(
    folders.map(f => [f.code, f.id])
  )

  // Check if documents already exist for this project
  const { count } = await supabase
    .from('vdr_documents')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)

  if (count && count > 0) {
    // Documents already exist, don't create duplicates
    return { success: true, data: [] }
  }

  // Create documents from template
  const documentsToInsert = DEFAULT_VDR_DOCUMENTS
    .filter(doc => folderCodeToId[doc.folderCode]) // Only create if folder exists
    .map(doc => ({
      project_id: projectId,
      folder_id: folderCodeToId[doc.folderCode],
      code: doc.code,
      name: doc.title,
      description: doc.description,
      external_url: '', // Placeholder - to be filled by user
      priority: doc.priority,
      status: 'pending',
      is_confidential: false,
      created_by: user.id,
      sort_order: parseInt(doc.code.split('-')[1]) || 0,
    }))

  if (documentsToInsert.length === 0) {
    return { success: true, data: [] }
  }

  const { data, error } = await supabase
    .from('vdr_documents')
    .insert(documentsToInsert)
    .select()

  if (error) {
    console.error('Error initializing VDR documents:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.documents_initialized', {
    project_id: projectId,
    document_count: data.length,
  }, user.id)

  return { success: true, data }
}

/**
 * List all folders for a project
 */
export async function listFolders(projectId: string): Promise<{
  success: boolean
  data?: VdrFolderWithCounts[]
  error?: string
}> {
  const supabase = await createClient()

  // Get folders with document counts
  const { data: folders, error } = await supabase
    .from('vdr_folders')
    .select(`
      *,
      vdr_documents(count)
    `)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error listing folders:', error)
    return { success: false, error: error.message }
  }

  const foldersWithCounts = folders.map(f => ({
    ...f,
    documentCount: f.vdr_documents?.[0]?.count || 0,
  }))

  return { success: true, data: foldersWithCounts }
}

/**
 * Create a new folder
 */
export async function createFolder(input: CreateFolderInput): Promise<{
  success: boolean
  data?: VdrFolder
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('vdr_folders')
    .insert({
      project_id: input.projectId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      icon: input.icon || 'folder',
      sort_order: input.sortOrder || 0,
      is_default: false,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating folder:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.folder_created', {
    folder_id: data.id,
    folder_name: data.name,
    project_id: input.projectId,
  }, user.id)

  return { success: true, data }
}

/**
 * Update a folder
 */
export async function updateFolder(
  folderId: string,
  input: UpdateFolderInput
): Promise<{ success: boolean; data?: VdrFolder; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder

  const { data, error } = await supabase
    .from('vdr_folders')
    .update(updateData)
    .eq('id', folderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating folder:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.folder_updated', {
    folder_id: folderId,
    changes: input,
  }, user.id)

  return { success: true, data }
}

/**
 * Reorder folders (update sort_order for multiple folders)
 */
export async function reorderFolders(
  projectId: string,
  folderOrders: Array<{ id: string; sortOrder: number }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Update each folder's sort_order
  const updates = folderOrders.map(({ id, sortOrder }) =>
    supabase
      .from('vdr_folders')
      .update({ sort_order: sortOrder })
      .eq('id', id)
      .eq('project_id', projectId)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  if (errors.length > 0) {
    console.error('Error reordering folders:', errors[0].error)
    return { success: false, error: 'Erro ao reordenar pastas' }
  }

  await logAuditEvent('vdr.folders_reordered', {
    project_id: projectId,
    folder_count: folderOrders.length,
  }, user.id)

  return { success: true }
}

/**
 * Delete a folder (only non-default folders)
 */
export async function deleteFolder(folderId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if folder is default
  const { data: folder } = await supabase
    .from('vdr_folders')
    .select('is_default, project_id')
    .eq('id', folderId)
    .single()

  if (folder?.is_default) {
    return { success: false, error: 'Cannot delete default folders' }
  }

  const { error } = await supabase
    .from('vdr_folders')
    .delete()
    .eq('id', folderId)

  if (error) {
    console.error('Error deleting folder:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.folder_deleted', {
    folder_id: folderId,
    project_id: folder?.project_id,
  }, user.id)

  return { success: true }
}
