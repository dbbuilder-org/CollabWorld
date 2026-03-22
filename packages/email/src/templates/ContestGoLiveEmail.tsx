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

export interface ContestGoLiveEmailProps {
  contestTitle: string
  contestUrl: string
  endsAt: string
}

export function ContestGoLiveEmail({ contestTitle, contestUrl, endsAt }: ContestGoLiveEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a2e', fontSize: '28px', marginBottom: '16px' }}>
            Your Contest Is Now Live!
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Great news — <strong>{contestTitle}</strong> is now live and accepting entries.
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            The contest ends on <strong>{endsAt}</strong>. Share the link to drive more entries!
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
          <Button
            href={contestUrl}
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
            View Contest
          </Button>
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            © 2026 Collab World. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ContestGoLiveEmail
