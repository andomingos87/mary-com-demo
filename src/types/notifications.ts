/**
 * Notification types for the platform notification system
 */

export type NotificationType =
  | 'project.invite_received'
  | 'project.invite_accepted'
  | 'project.member_added'
  | 'project.member_removed'
  | 'project.visibility_changed'
  | 'org.invite_received'
  | 'org.member_added'
  | 'system.info'
  // VDR notifications
  | 'vdr.qa_question'      // Nova pergunta no Q&A
  | 'vdr.qa_answer'        // Resposta no Q&A
  | 'vdr.access_granted'   // Acesso concedido ao VDR
  | 'vdr.link_accessed'    // Alguém acessou link compartilhável

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown>
  read_at: string | null
  action_url: string | null
  created_at: string
}

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  body?: string
  data?: Record<string, unknown>
  actionUrl?: string
}
