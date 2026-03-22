import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components'

export interface EntryRejectedEmailProps {
  creatorName: string
  contestTitle: string
  reason?: string
}

export function EntryRejectedEmail({ creatorName, contestTitle, reason }: EntryRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a2e', fontSize: '28px', marginBottom: '16px' }}>
            Entry Not Approved
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Hi {creatorName},
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Unfortunately, your entry for <strong>{contestTitle}</strong> was not approved at this
            time.
          </Text>
          {reason && (
            <Text
              style={{
                color: '#444',
                fontSize: '16px',
                lineHeight: '1.6',
                backgroundColor: '#fff3cd',
                padding: '12px 16px',
                borderRadius: '6px',
                borderLeft: '4px solid #ffc107',
              }}
            >
              <strong>Reason:</strong> {reason}
            </Text>
          )}
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            You&apos;re welcome to revise your submission and resubmit. We encourage you to keep
            creating!
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            © 2026 Collab World. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EntryRejectedEmail
