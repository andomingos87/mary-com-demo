'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { triggerReadinessRecalc } from './vdr-utils'
import type {
  VdrDocument,
  VdrDocumentWithFolder,
  VdrDocumentWithCounts,
  VdrDocumentFile,
  VdrDocumentLink,
  CreateDocumentInput,
  UpdateDocumentInput,
  AddDocumentFileInput,
  AddDocumentLinkInput,
  VdrDocumentFilters,
  VdrDocumentSort,
} from '@/types/vdr'
import type { Database, Json } from '@/types/database'

/**
 * List documents in a folder or project (basic version)
 */
export async function listDocuments(
  projectId: string,
  folderId?: string
): Promise<{ success: boolean; data?: VdrDocumentWithFolder[]; error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('vdr_documents')
    .select(`
      *,
      folder:vdr_folders(id, name, slug, icon, code)
    `)
    .eq('project_id', projectId)
    .neq('status', 'deleted')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (folderId) {
    query = query.eq('folder_id', folderId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error listing documents:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data as VdrDocumentWithFolder[] }
}

/**
 * List documents with counts and filtering support (for accordion table)
 */
export async function listDocumentsWithCounts(
  projectId: string,
  filters?: VdrDocumentFilters,
  sort?: VdrDocumentSort
): Promise<{ success: boolean; data?: VdrDocumentWithCounts[]; error?: string }> {
  const supabase = await createClient()

  // Build base query
  let query = supabase
    .from('vdr_documents')
    .select(`
      *,
      folder:vdr_folders(id, name, slug, icon, code)
    `)
    .eq('project_id', projectId)
    .neq('status', 'deleted')
    .is('deleted_at', null)

  // Apply filters
  if (filters) {
    if (filters.folderIds && filters.folderIds.length > 0) {
      query = query.in('folder_id', filters.folderIds)
    }
    if (filters.priorities && filters.priorities.length > 0) {
      query = query.in('priority', filters.priorities)
    }
    if (filters.statuses && filters.statuses.length > 0) {
      query = query.in('status', filters.statuses)
    }
    if (filters.responsibleIds && filters.responsibleIds.length > 0) {
      query = query.in('responsible_id', filters.responsibleIds)
    }
    if (filters.risks && filters.risks.length > 0) {
      query = query.in('risk', filters.risks)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters.businessUnits && filters.businessUnits.length > 0) {
      query = query.in('business_unit', filters.businessUnits)
    }
    if (filters.dueDateFrom) {
      query = query.gte('due_date', filters.dueDateFrom)
    }
    if (filters.dueDateTo) {
      query = query.lte('due_date', filters.dueDateTo)
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }
    if (filters.isConfidential !== undefined) {
      query = query.eq('is_confidential', filters.isConfidential)
    }
    // Validation level filters
    if (filters.validationLevels && filters.validationLevels.length > 0) {
      const validationConditions = filters.validationLevels.map(level =>
        `validation_${level}.eq.true`
      ).join(',')
      query = query.or(validationConditions)
    }
  }

  // Apply sorting
  if (sort) {
    const ascending = sort.direction === 'asc'
    switch (sort.column) {
      case 'code':
        query = query.order('code', { ascending, nullsFirst: false })
        break
      case 'name':
        query = query.order('name', { ascending })
        break
      case 'priority':
        // Custom priority order: critical > high > medium > low
        query = query.order('priority', { ascending })
        break
      case 'status':
        query = query.order('status', { ascending })
        break
      case 'due_date':
        query = query.order('due_date', { ascending, nullsFirst: false })
        break
      case 'updated_at':
        query = query.order('updated_at', { ascending })
        break
      case 'risk':
        query = query.order('risk', { ascending, nullsFirst: false })
        break
      case 'sort_order':
        query = query.order('sort_order', { ascending })
        break
      default:
        query = query.order('sort_order', { ascending: true })
    }
  } else {
    // Default sort: by folder sort_order, then document sort_order
    query = query.order('sort_order', { ascending: true })
  }

  const { data: documents, error } = await query

  if (error) {
    console.error('Error listing documents with counts:', error)
    return { success: false, error: error.message }
  }

  if (!documents || documents.length === 0) {
    return { success: true, data: [] }
  }

  // Get counts for files, links, and comments
  const documentIds = documents.map(d => d.id)

  // Fetch counts in parallel
  const [filesResult, linksResult, commentsResult] = await Promise.all([
    // Files count
    supabase
      .from('vdr_document_files')
      .select('document_id')
      .in('document_id', documentIds),
    // Links count
    supabase
      .from('vdr_document_links')
      .select('document_id')
      .in('document_id', documentIds),
    // Comments count
    supabase
      .from('vdr_qa_messages')
      .select('document_id')
      .in('document_id', documentIds)
      .is('deleted_at', null),
  ])

  // Build count maps
  const filesCounts: Record<string, number> = {}
  const linksCounts: Record<string, number> = {}
  const commentsCounts: Record<string, number> = {}

  filesResult.data?.forEach(f => {
    filesCounts[f.document_id] = (filesCounts[f.document_id] || 0) + 1
  })
  linksResult.data?.forEach(l => {
    linksCounts[l.document_id] = (linksCounts[l.document_id] || 0) + 1
  })
  commentsResult.data?.forEach(c => {
    commentsCounts[c.document_id] = (commentsCounts[c.document_id] || 0) + 1
  })

  // Combine documents with counts
  // Note: responsible_name requires a join with auth.users which is not directly accessible
  // For now, we leave it as null and can implement a separate lookup if needed
  const documentsWithCounts: VdrDocumentWithCounts[] = documents.map(doc => ({
    ...doc,
    folder: doc.folder as VdrDocumentWithCounts['folder'],
    files_count: filesCounts[doc.id] || 0,
    links_count: linksCounts[doc.id] || 0,
    comments_count: commentsCounts[doc.id] || 0,
    responsible_name: null, // TODO: implement user lookup if needed
  }))

  return { success: true, data: documentsWithCounts }
}

/**
 * Get a single document
 */
export async function getDocument(documentId: string): Promise<{
  success: boolean
  data?: VdrDocumentWithFolder
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_documents')
    .select(`
      *,
      folder:vdr_folders(id, name, slug, icon)
    `)
    .eq('id', documentId)
    .single()

  if (error) {
    console.error('Error getting document:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data as VdrDocumentWithFolder }
}

/**
 * Create a new document
 */
export async function createDocument(input: CreateDocumentInput): Promise<{
  success: boolean
  data?: VdrDocument
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Generate code if not provided
  let code = input.code
  if (!code) {
    // Use database function to generate code
    const { data: generatedCode } = await supabase.rpc('generate_vdr_document_code', {
      p_folder_id: input.folderId
    })
    code = generatedCode || undefined
  }

  const { data, error } = await supabase
    .from('vdr_documents')
    .insert({
      project_id: input.projectId,
      folder_id: input.folderId,
      name: input.name,
      external_url: input.externalUrl,
      description: input.description,
      file_type: input.fileType,
      file_size_bytes: input.fileSizeBytes,
      is_confidential: input.isConfidential || false,
      metadata: (input.metadata || {}) as Json,
      created_by: user.id,
      // New fields
      code,
      priority: input.priority || 'medium',
      business_unit: input.businessUnit,
      responsible_id: input.responsibleId,
      start_date: input.startDate,
      due_date: input.dueDate,
      risk: input.risk,
      tags: input.tags || [],
      flags: input.flags || [],
      sort_order: input.sortOrder || 0,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.document_created', {
    document_id: data.id,
    document_name: data.name,
    document_code: data.code,
    folder_id: input.folderId,
    project_id: input.projectId,
  }, user.id)

  await triggerReadinessRecalc(input.projectId)

  return { success: true, data }
}

/**
 * Update a document
 */
export async function updateDocument(
  documentId: string,
  input: UpdateDocumentInput
): Promise<{ success: boolean; data?: VdrDocument; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.externalUrl !== undefined) updateData.external_url = input.externalUrl
  if (input.fileType !== undefined) updateData.file_type = input.fileType
  if (input.fileSizeBytes !== undefined) updateData.file_size_bytes = input.fileSizeBytes
  if (input.isConfidential !== undefined) updateData.is_confidential = input.isConfidential
  if (input.folderId !== undefined) updateData.folder_id = input.folderId
  if (input.metadata !== undefined) updateData.metadata = input.metadata
  // New fields
  if (input.code !== undefined) updateData.code = input.code
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.status !== undefined) updateData.status = input.status
  if (input.businessUnit !== undefined) updateData.business_unit = input.businessUnit
  if (input.responsibleId !== undefined) updateData.responsible_id = input.responsibleId
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.dueDate !== undefined) updateData.due_date = input.dueDate
  if (input.risk !== undefined) updateData.risk = input.risk
  if (input.tags !== undefined) updateData.tags = input.tags
  if (input.flags !== undefined) updateData.flags = input.flags
  if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder

  const { data, error } = await supabase
    .from('vdr_documents')
    .update(updateData as Database['public']['Tables']['vdr_documents']['Update'])
    .eq('id', documentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating document:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.document_updated', {
    document_id: documentId,
    changes: input,
  }, user.id)

  await triggerReadinessRecalc(data.project_id)

  return { success: true, data }
}

/**
 * Delete a document (soft delete)
 */
export async function deleteDocument(documentId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user has permission to manage VDR before using admin client
  const { data: doc } = await supabase
    .from('vdr_documents')
    .select('project_id')
    .eq('id', documentId)
    .single()

  if (!doc) {
    return { success: false, error: 'Documento não encontrado' }
  }

  // Use admin client for soft delete to bypass RLS issues
  const adminClient = await createAdminClient()
  const { error } = await adminClient
    .from('vdr_documents')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
    })
    .eq('id', documentId)

  if (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.document_deleted', {
    document_id: documentId,
    project_id: doc.project_id,
  }, user.id)

  await triggerReadinessRecalc(doc.project_id)

  return { success: true }
}

/**
 * Duplicate a document (metadata only, without files/links)
 */
export async function duplicateDocument(documentId: string): Promise<{
  success: boolean
  data?: VdrDocument
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Get original document
  const { data: original, error: fetchError } = await supabase
    .from('vdr_documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (fetchError || !original) {
    console.error('Error fetching document:', fetchError)
    return { success: false, error: 'Documento não encontrado' }
  }

  // Generate new code
  const { data: maxCode } = await supabase
    .from('vdr_documents')
    .select('code')
    .eq('folder_id', original.folder_id)
    .order('code', { ascending: false })
    .limit(1)
    .single()

  let newCode = original.code
  if (maxCode?.code) {
    const parts = maxCode.code.split('-')
    if (parts.length === 2) {
      const prefix = parts[0]
      const num = parseInt(parts[1], 10) + 1
      newCode = `${prefix}-${num.toString().padStart(2, '0')}`
    }
  }

  // Create copy
  const { data: copy, error: insertError } = await supabase
    .from('vdr_documents')
    .insert({
      folder_id: original.folder_id,
      project_id: original.project_id,
      code: newCode,
      name: `${original.name} - Cópia`,
      description: original.description,
      external_url: original.external_url || '',
      file_type: original.file_type,
      file_size_bytes: original.file_size_bytes,
      metadata: original.metadata,
      is_confidential: original.is_confidential,
      status: 'pending',
      priority: original.priority,
      business_unit: original.business_unit,
      responsible_id: original.responsible_id,
      start_date: original.start_date,
      due_date: original.due_date,
      risk: original.risk,
      tags: original.tags,
      flags: original.flags,
      sort_order: (original.sort_order || 0) + 1,
      // Reset validations
      validation_n1: false,
      validation_n1_at: null,
      validation_n1_by: null,
      validation_n2: false,
      validation_n2_at: null,
      validation_n2_by: null,
      validation_n3: false,
      validation_n3_at: null,
      validation_n3_by: null,
      created_by: user.id,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error duplicating document:', insertError)
    return { success: false, error: insertError.message }
  }

  await logAuditEvent('vdr.document_duplicated', {
    original_id: documentId,
    copy_id: copy.id,
    project_id: original.project_id,
  }, user.id)

  return { success: true, data: copy as VdrDocument }
}

/**
 * List files attached to a document
 */
export async function listDocumentFiles(
  documentId: string
): Promise<{ success: boolean; data?: VdrDocumentFile[]; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_document_files')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing document files:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: (data || []) as VdrDocumentFile[] }
}

/**
 * List links attached to a document
 */
export async function listDocumentLinks(
  documentId: string
): Promise<{ success: boolean; data?: VdrDocumentLink[]; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_document_links')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing document links:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: (data || []) as VdrDocumentLink[] }
}

/**
 * Add a file to a document
 */
export async function addDocumentFile(
  input: AddDocumentFileInput
): Promise<{ success: boolean; data?: VdrDocumentFile; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data, error } = await supabase
    .from('vdr_document_files')
    .insert({
      document_id: input.documentId,
      file_name: input.fileName,
      file_url: input.fileUrl,
      file_type: input.fileType,
      file_size_bytes: input.fileSizeBytes,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding document file:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.file_added', {
    file_id: data.id,
    document_id: input.documentId,
    file_name: input.fileName,
  }, user.id)

  return { success: true, data: data as VdrDocumentFile }
}

/**
 * Remove a file from a document
 */
export async function removeDocumentFile(
  fileId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data, error } = await supabase
    .from('vdr_document_files')
    .delete()
    .eq('id', fileId)
    .select('document_id, file_name')
    .single()

  if (error) {
    console.error('Error removing document file:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.file_removed', {
    file_id: fileId,
    document_id: data?.document_id,
    file_name: data?.file_name,
  }, user.id)

  return { success: true }
}

/**
 * Add a link to a document
 */
export async function addDocumentLink(
  input: AddDocumentLinkInput
): Promise<{ success: boolean; data?: VdrDocumentLink; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data, error } = await supabase
    .from('vdr_document_links')
    .insert({
      document_id: input.documentId,
      url: input.url,
      label: input.label,
      link_type: input.linkType || 'generic',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding document link:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.external_link_added', {
    link_id: data.id,
    document_id: input.documentId,
    url: input.url,
  }, user.id)

  return { success: true, data: data as VdrDocumentLink }
}

/**
 * Remove a link from a document
 */
export async function removeDocumentLink(
  linkId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data, error } = await supabase
    .from('vdr_document_links')
    .delete()
    .eq('id', linkId)
    .select('document_id, url')
    .single()

  if (error) {
    console.error('Error removing document link:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.external_link_removed', {
    link_id: linkId,
    document_id: data?.document_id,
    url: data?.url,
  }, user.id)

  return { success: true }
}
