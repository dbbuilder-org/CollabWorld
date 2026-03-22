'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { NotificationItem } from './NotificationItem'

interface Notification {
  id: string
  title: string
  body: string | null
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}

export function NotificationBell() {
  const { isSignedIn } = useUser()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications?unreadOnly=true')
      if (!res.ok) return
      const json = await res.json()
      setUnreadCount((json.data as Notification[]).length)
    } catch {
      // ignore
    }
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications')
      if (!res.ok) return
      const json = await res.json()
      setNotifications((json.data as Notification[]).slice(0, 10))
    } catch {
      // ignore
    }
  }, [])

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!isSignedIn) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [isSignedIn, fetchUnreadCount])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setOpen((prev) => !prev)
    if (!open) {
      fetchAll()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/mark-all-read', { method: 'POST' })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })))
    } catch {
      // ignore
    }
  }

  if (!isSignedIn) return null

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Bell icon SVG */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: '700',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '8px',
            width: '340px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <span style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a2e' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#6c47ff',
                  fontWeight: '500',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '14px',
                  padding: '24px',
                }}
              >
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  id={n.id}
                  title={n.title}
                  body={n.body}
                  actionUrl={n.actionUrl}
                  readAt={n.readAt}
                  createdAt={n.createdAt}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
