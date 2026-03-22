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

export interface VotingOpenEmailProps {
  contestTitle: string
  votingUrl: string
  endsAt: string
}

export function VotingOpenEmail({ contestTitle, votingUrl, endsAt }: VotingOpenEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a2e', fontSize: '28px', marginBottom: '16px' }}>
            Voting Is Now Open!
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            The voting period for <strong>{contestTitle}</strong> has officially begun. Browse the
            entries and cast your votes for your favorites.
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Voting closes on <strong>{endsAt}</strong>. Don&apos;t miss your chance to influence the
            outcome!
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
          <Button
            href={votingUrl}
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
            Vote Now
          </Button>
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            © 2026 Collab World. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default VotingOpenEmail
