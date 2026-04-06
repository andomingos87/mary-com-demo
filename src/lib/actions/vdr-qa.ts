'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import type { Json } from '@/types/database'
import type {
  VdrQaMessage,
  VdrDocument,
  VdrFolder,
  CreateQaMessageInput,
} from '@/types/vdr'

/**
 * Create a Q&A message
 */
export async function createQaMessage(input: CreateQaMessageInput): Promise<{
  success: boolean
  data?: VdrQaMessage
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get user's org
  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { success: false, error: 'User not in an organization' }
  }

  const { data, error } = await supabase
    .from('vdr_qa_messages')
    .insert({
      project_id: input.projectId,
      document_id: input.documentId,
      content: input.content,
      parent_id: input.parentId,
      is_confidential: input.isConfidential || false,
      author_id: user.id,
      author_org_id: member.organization_id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating Q&A message:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.qa_message_sent', {
    message_id: data.id,
    document_id: input.documentId,
    project_id: input.projectId,
    is_confidential: input.isConfidential,
  }, user.id)

  // Send Q&A notifications (V1-18)
  await notifyQaMessage(supabase, {
    messageId: data.id,
    projectId: input.projectId,
    documentId: input.documentId,
    content: input.content,
    parentId: input.parentId,
    authorId: user.id,
    authorOrgId: member.organization_id,
    isConfidential: input.isConfidential || false,
  })

  return { success: true, data }
}

/**
 * Internal helper to send Q&A notifications (V1-18)
 * - New question (from investor): Notify project owner org members (owner/admin)
 * - Reply (from asset/advisor): Notify the original question author
 */
async function notifyQaMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    messageId: string
    projectId: string
    documentId: string
    content: string
    parentId?: string
    authorId: string
    authorOrgId: string
    isConfidential: boolean
  }
) {
  try {
    const adminSupabase = await createAdminClient()

    // Get project info with owner org
    const { data: project } = await adminSupabase
      .from('projects')
      .select('codename, organization_id, organization:organizations!organization_id(name, slug)')
      .eq('id', params.projectId)
      .single()

    if (!project) return

    // Get document name
    const { data: document } = await adminSupabase
      .from('vdr_documents')
      .select('name')
      .eq('id', params.documentId)
      .single()

    const documentName = document?.name || 'Documento'
    const projectOwnerOrgId = project.organization_id
    const org = project.organization as { name: string; slug: string } | null
    const actionUrl = org ? `/${org.slug}/projects/${project.codename}/vdr` : undefined

    // Truncate content for notification preview
    const contentPreview = params.content.length > 100
      ? params.content.substring(0, 100) + '...'
      : params.content

    if (params.parentId) {
      // This is a REPLY - notify the original question author
      const { data: parentMessage } = await adminSupabase
        .from('vdr_qa_messages')
        .select('author_id, content')
        .eq('id', params.parentId)
        .single()

      if (parentMessage && parentMessage.author_id !== params.authorId) {
        // Don't notify if replying to own question
        await adminSupabase
          .from('notifications' as any)
          .insert({
            user_id: parentMessage.author_id,
            type: 'vdr.qa_answer',
            title: `Sua pergunta foi respondida`,
            body: `Nova resposta no documento "${documentName}": "${contentPreview}"`,
            data: {
              message_id: params.messageId,
              parent_id: params.parentId,
              project_id: params.projectId,
              document_id: params.documentId,
              document_name: documentName,
              project_codename: project.codename,
            },
            action_url: actionUrl,
          })
      }
    } else {
      // This is a NEW QUESTION - notify project owner org members
      // Only notify if the author is NOT from the project owner org (i.e., investor asking)
      if (params.authorOrgId !== projectOwnerOrgId) {
        // Get owner/admin members of the project owner org
        const { data: members } = await adminSupabase
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', projectOwnerOrgId)
          .in('role', ['owner', 'admin'])

        if (members && members.length > 0) {
          const notifications = members.map(m => ({
            user_id: m.user_id,
            type: 'vdr.qa_question',
            title: `Nova pergunta no VDR`,
            body: `Pergunta no documento "${documentName}": "${contentPreview}"`,
            data: {
              message_id: params.messageId,
              project_id: params.projectId,
              document_id: params.documentId,
              document_name: documentName,
              project_codename: project.codename,
              is_confidential: params.isConfidential,
            },
            action_url: actionUrl,
          }))

          await adminSupabase
            .from('notifications' as any)
            .insert(notifications)
        }
      }
    }
  } catch (err) {
    // Don't fail the main operation if notification fails
    console.error('Error sending Q&A notification:', err)
  }
}

/**
 * Get Q&A messages for a document
 */
export async function getQaMessages(documentId: string): Promise<{
  success: boolean
  data?: VdrQaMessage[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_qa_messages')
    .select('*')
    .eq('document_id', documentId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error getting Q&A messages:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Mark a Q&A message as resolved
 */
export async function resolveQaMessage(messageId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('vdr_qa_messages')
    .update({ is_resolved: true })
    .eq('id', messageId)
    .select('project_id, document_id')
    .single()

  if (error) {
    console.error('Error resolving Q&A message:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.qa_resolved', {
    message_id: messageId,
    project_id: data?.project_id,
    document_id: data?.document_id,
  }, user.id)

  return { success: true }
}

/**
 * Promote a resolved Q&A thread to FAQ (V1-19)
 * Creates a document in a "FAQ" folder with the question and answers formatted
 */
export async function promoteQaToFaq(messageId: string): Promise<{
  success: boolean
  data?: VdrDocument
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Get the Q&A message (must be a root question, not a reply)
  const { data: message, error: msgError } = await supabase
    .from('vdr_qa_messages')
    .select(`
      *,
      author_org:organizations!author_org_id(name)
    `)
    .eq('id', messageId)
    .is('parent_id', null)
    .single()

  if (msgError || !message) {
    console.error('Error getting Q&A message:', msgError)
    return { success: false, error: 'Mensagem não encontrada ou não é uma pergunta raiz' }
  }

  if (!message.is_resolved) {
    return { success: false, error: 'Apenas perguntas resolvidas podem ser promovidas a FAQ' }
  }

  // Get all replies to this question
  const { data: replies } = await supabase
    .from('vdr_qa_messages')
    .select(`
      *,
      author_org:organizations!author_org_id(name)
    `)
    .eq('parent_id', messageId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  // Get or create FAQ folder
  let faqFolder = await getOrCreateFaqFolder(supabase, message.project_id, user.id)
  if (!faqFolder) {
    return { success: false, error: 'Erro ao criar pasta FAQ' }
  }

  // Format the FAQ content as markdown-like text
  const authorName = (message.author_org as { name: string } | null)?.name || 'Anônimo'
  const questionDate = new Date(message.created_at).toLocaleDateString('pt-BR')

  let faqContent = `# Pergunta\n\n`
  faqContent += `**${authorName}** (${questionDate}):\n\n`
  faqContent += `${message.content}\n\n`
  faqContent += `---\n\n`
  faqContent += `# Resposta\n\n`

  if (replies && replies.length > 0) {
    for (const reply of replies) {
      const replyAuthor = (reply.author_org as { name: string } | null)?.name || 'Anônimo'
      const replyDate = new Date(reply.created_at).toLocaleDateString('pt-BR')
      faqContent += `**${replyAuthor}** (${replyDate}):\n\n`
      faqContent += `${reply.content}\n\n`
    }
  } else {
    faqContent += `_Sem respostas registradas._\n`
  }

  // Create a document in the FAQ folder
  // Use a data URL to store the content as "external_url" (since VDR uses external URLs)
  const faqTitle = message.content.length > 50
    ? message.content.substring(0, 50) + '...'
    : message.content

  // Create a blob URL or use a placeholder - in production this would be a real file
  // For now, we'll use a data URI with the content
  const contentBase64 = Buffer.from(faqContent).toString('base64')
  const dataUrl = `data:text/markdown;base64,${contentBase64}`

  const { data: document, error: docError } = await supabase
    .from('vdr_documents')
    .insert({
      project_id: message.project_id,
      folder_id: faqFolder.id,
      name: `FAQ: ${faqTitle}`,
      description: `Pergunta frequente promovida do Q&A do documento original.`,
      external_url: dataUrl,
      file_type: 'text/markdown',
      is_confidential: false, // FAQs are always public
      metadata: {
        source: 'qa_promotion',
        original_message_id: messageId,
        original_document_id: message.document_id,
        promoted_at: new Date().toISOString(),
        promoted_by: user.id,
      } as Json,
      created_by: user.id,
    })
    .select()
    .single()

  if (docError) {
    console.error('Error creating FAQ document:', docError)
    return { success: false, error: 'Erro ao criar documento FAQ' }
  }

  await logAuditEvent('vdr.qa_promoted_to_faq', {
    message_id: messageId,
    document_id: document.id,
    project_id: message.project_id,
    faq_folder_id: faqFolder.id,
  }, user.id)

  return { success: true, data: document }
}

/**
 * Internal helper to get or create the FAQ folder for a project
 */
async function getOrCreateFaqFolder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
): Promise<VdrFolder | null> {
  // Check if FAQ folder already exists
  const { data: existingFolder } = await supabase
    .from('vdr_folders')
    .select('*')
    .eq('project_id', projectId)
    .eq('slug', 'faq')
    .single()

  if (existingFolder) {
    return existingFolder
  }

  // Get the highest sort_order to place FAQ at the end
  const { data: folders } = await supabase
    .from('vdr_folders')
    .select('sort_order')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = (folders?.[0]?.sort_order || 0) + 1

  // Create FAQ folder
  const { data: newFolder, error } = await supabase
    .from('vdr_folders')
    .insert({
      project_id: projectId,
      name: 'Perguntas Frequentes',
      slug: 'faq',
      description: 'Perguntas e respostas promovidas do Q&A',
      icon: 'help-circle',
      sort_order: nextSortOrder,
      is_default: false,
      created_by: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating FAQ folder:', error)
    return null
  }

  return newFolder
}

/**
 * Get Q&A messages with author org details (for VdrQaPanel)
 */
export async function getQaMessagesWithAuthors(documentId: string): Promise<{
  success: boolean
  data?: Array<VdrQaMessage & {
    author_org: { id: string; name: string; profile_type: string } | null
  }>
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_qa_messages')
    .select(`
      *,
      author_org:organizations!author_org_id(id, name, profile_type)
    `)
    .eq('document_id', documentId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error getting Q&A messages with authors:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data as any }
}
