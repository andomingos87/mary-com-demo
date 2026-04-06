'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'
import type { ActionResult } from '@/types/projects'
import type { Notification, CreateNotificationInput } from '@/types/notifications'

// ============================================
// Create Notification (admin client)
// ============================================

export async function createNotification(
  input: CreateNotificationInput
): Promise<ActionResult<Notification>> {
  try {
    const adminSupabase = await createAdminClient()

    const { data, error } = await adminSupabase
      .from('notifications' as any)
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body || null,
        data: (input.data || {}),
        action_url: input.actionUrl || null,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating notification:', error)
      return { success: false, error: 'Erro ao criar notificação' }
    }

    return { success: true, data: data as unknown as Notification }
  } catch (error) {
    console.error('Unexpected error in createNotification:', error)
    return { success: false, error: 'Erro inesperado ao criar notificação' }
  }
}

// ============================================
// Get Notifications (paginated)
// ============================================

export async function getNotifications(
  limit = 20,
  offset = 0
): Promise<ActionResult<Notification[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data, error } = await supabase
      .from('notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notifications:', error)
      return { success: false, error: 'Erro ao buscar notificações' }
    }

    return { success: true, data: (data || []) as unknown as Notification[] }
  } catch (error) {
    console.error('Unexpected error in getNotifications:', error)
    return { success: false, error: 'Erro inesperado ao buscar notificações' }
  }
}

// ============================================
// Mark Notification as Read
// ============================================

export async function markAsRead(
  notificationId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { error } = await supabase
      .from('notifications' as any)
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: 'Erro ao marcar notificação' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in markAsRead:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// ============================================
// Mark All as Read
// ============================================

export async function markAllAsRead(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { error } = await supabase
      .from('notifications' as any)
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: 'Erro ao marcar notificações' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in markAllAsRead:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// ============================================
// Get Unread Count
// ============================================

export async function getUnreadCount(): Promise<ActionResult<number>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { count, error } = await supabase
      .from('notifications' as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)

    if (error) {
      console.error('Error getting unread count:', error)
      return { success: false, error: 'Erro ao contar notificações' }
    }

    return { success: true, data: count || 0 }
  } catch (error) {
    console.error('Unexpected error in getUnreadCount:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}
