'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationDropdown } from './NotificationDropdown'
import { getUnreadCount, getNotifications, markAllAsRead } from '@/lib/actions/notifications'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/notifications'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const result = await getUnreadCount()
    if (result.success && result.data !== undefined) {
      setUnreadCount(result.data)
    }
  }, [])

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    const result = await getNotifications(20, 0)
    if (result.success) {
      setNotifications(result.data || [])
    }
    setLoading(false)
  }, [])

  // Initial load
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // Subscribe to Realtime
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchUnreadCount()
          if (open) fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchUnreadCount, fetchNotifications, open])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      fetchNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
  }

  const handleNotificationRead = () => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative"
          aria-label="Notificacoes"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onMarkAllRead={handleMarkAllRead}
          onNotificationRead={handleNotificationRead}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
