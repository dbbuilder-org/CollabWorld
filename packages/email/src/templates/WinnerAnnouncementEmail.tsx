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

export interface WinnerAnnouncementEmailProps {
  winnerName: string
  contestTitle: string
  prizeDescription: string
  claimUrl: string
}

export function WinnerAnnouncementEmail({
  winnerName,
  contestTitle,
  prizeDescription,
  claimUrl,
}: WinnerAnnouncementEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a2e', fontSize: '28px', marginBottom: '16px' }}>
            Congratulations, {winnerName}! You Won!
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            We are thrilled to announce that you have won the <strong>{contestTitle}</strong>{' '}
            contest!
          </Text>
          <Text
            style={{
              color: '#444',
              fontSize: '16px',
              lineHeight: '1.6',
              backgroundColor: '#e8f5e9',
              padding: '12px 16px',
              borderRadius: '6px',
              borderLeft: '4px solid #4caf50',
            }}
          >
            <strong>Your Prize:</strong> {prizeDescription}
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Click the button below to claim your prize. Please note that prizes must be claimed
            within 30 days.
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
          <Button
            href={claimUrl}
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
            Claim Your Prize
          </Button>
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            © 2026 Collab World. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WinnerAnnouncementEmail
