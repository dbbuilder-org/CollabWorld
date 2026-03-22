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

export interface InfluencerInviteEmailProps {
  influencerName: string
  contestTitle: string
  commissionRate: number
  assignmentUrl: string
}

export function InfluencerInviteEmail({
  influencerName,
  contestTitle,
  commissionRate,
  assignmentUrl,
}: InfluencerInviteEmailProps) {
  const commissionPercent = Math.round(commissionRate * 100)

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a2e', fontSize: '28px', marginBottom: '16px' }}>
            You&apos;ve Been Invited to Collaborate!
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Hi {influencerName},
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            You have been invited to promote <strong>{contestTitle}</strong> on Collab World.
          </Text>
          <Text
            style={{
              color: '#444',
              fontSize: '16px',
              lineHeight: '1.6',
              backgroundColor: '#e8f0fe',
              padding: '12px 16px',
              borderRadius: '6px',
              borderLeft: '4px solid #6c47ff',
            }}
          >
            <strong>Your Commission Rate:</strong> {commissionPercent}% per conversion
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            View your assignment details to get your unique tracking link and start promoting today.
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
          <Button
            href={assignmentUrl}
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
            View Assignment
          </Button>
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            © 2026 Collab World. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default InfluencerInviteEmail
