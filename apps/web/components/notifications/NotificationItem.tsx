'use client'

import React from 'react'

interface NotificationItemProps {
  id: string
  title: string
  body: string | null
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationItem({
  title,
  body,
  actionUrl,
  readAt,
  createdAt,
}: NotificationItemProps) {
  const isUnread = !readAt

  const content = (
    <div
      style={{
        padding: '10px 14px',
        backgroundColor: isUnread ? '#f0edff' : '#fff',
        borderBottom: '1px solid #e5e7eb',
        cursor: actionUrl ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: isUnread ? '600' : '400',
            color: '#1a1a2e',
            flexGrow: 1,
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px', whiteSpace: 'nowrap' }}>
          {timeAgo(createdAt)}
        </span>
      </div>
      {body && (
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{body}</p>
      )}
    </div>
  )

  if (actionUrl) {
    return (
      <a href={actionUrl} style={{ textDecoration: 'none', display: 'block' }}>
        {content}
      </a>
    )
  }

  return content
}

export default NotificationItem
