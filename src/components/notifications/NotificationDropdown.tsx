'use client'

import * as React from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './NotificationItem'
import type { Notification } from '@/types/notifications'

interface NotificationDropdownProps {
  notifications: Notification[]
  loading: boolean
  onMarkAllRead: () => void
  onNotificationRead: () => void
}

export function NotificationDropdown({
  notifications,
  loading,
  onMarkAllRead,
  onNotificationRead,
}: NotificationDropdownProps) {
  const hasUnread = notifications.some(n => !n.read_at)

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 pb-2 border-b">
        <h4 className="text-sm font-semibold">Notificacoes</h4>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onMarkAllRead}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notificacao</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={onNotificationRead}
            />
          ))
        )}
      </div>
    </div>
  )
}
