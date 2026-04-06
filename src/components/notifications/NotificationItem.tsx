'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserPlus, UserCheck, Bell, Eye, UserMinus, MessageSquare, Link as LinkIcon, FileBox } from 'lucide-react'
import { markAsRead } from '@/lib/actions/notifications'
import type { Notification, NotificationType } from '@/types/notifications'

interface NotificationItemProps {
  notification: Notification
  onRead: () => void
}

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  'project.invite_received': UserPlus,
  'project.invite_accepted': UserCheck,
  'project.member_added': UserPlus,
  'project.member_removed': UserMinus,
  'project.visibility_changed': Eye,
  'org.invite_received': UserPlus,
  'org.member_added': UserPlus,
  'system.info': Bell,
  // VDR notifications
  'vdr.qa_question': MessageSquare,
  'vdr.qa_answer': MessageSquare,
  'vdr.access_granted': FileBox,
  'vdr.link_accessed': LinkIcon,
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}m`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter()
  const isUnread = !notification.read_at
  const Icon = TYPE_ICONS[notification.type] || Bell

  const handleClick = async () => {
    if (isUnread) {
      await markAsRead(notification.id)
      onRead()
    }
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors',
        isUnread && 'bg-primary/5'
      )}
    >
      <div className={cn(
        'mt-0.5 rounded-full p-1.5',
        isUnread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', isUnread && 'font-medium')}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      {isUnread && (
        <div className="mt-2 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
      )}
    </button>
  )
}
