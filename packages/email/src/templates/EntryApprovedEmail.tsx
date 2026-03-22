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

export interface EntryApprovedEmailProps {
  creatorName: string
  contestTitle: string
  entryUrl: string
}

export function EntryApprovedEmail({ creatorName, contestTitle, entryUrl }: EntryApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a2e', fontSize: '28px', marginBottom: '16px' }}>
            Your Entry Has Been Approved!
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Hi {creatorName},
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Great news! Your entry for <strong>{contestTitle}</strong> has been approved and is now
            visible to voters. Share it with your audience to get more votes!
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
          <Button
            href={entryUrl}
            style={{
              backgroundColor: '#6c47ff',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            View & Share Entry
          </Button>
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            © 2026 Collab World. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EntryApprovedEmail
