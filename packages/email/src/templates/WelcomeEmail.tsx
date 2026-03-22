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

export interface WelcomeEmailProps {
  firstName: string
  role: string
  dashboardUrl: string
}

export function WelcomeEmail({ firstName, role, dashboardUrl }: WelcomeEmailProps) {
  const roleMessages: Record<string, string> = {
    creator: 'Submit your work to contests and compete for prizes.',
    influencer: 'Promote contests and earn commissions on every conversion.',
    brand: 'Sponsor contests and discover emerging creative talent.',
    fan: 'Discover amazing content, vote for your favorites, and follow your favorite creators.',
    admin: 'Manage the Collab World platform.',
  }

  const roleMessage = roleMessages[role] ?? roleMessages['fan']

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a2e', fontSize: '28px', marginBottom: '16px' }}>
            Welcome to Collab World, {firstName}!
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            We&apos;re thrilled to have you join us as a{' '}
            <strong style={{ textTransform: 'capitalize' }}>{role}</strong>.
          </Text>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            {roleMessage}
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
          <Button
            href={dashboardUrl}
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
            Go to Dashboard
          </Button>
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            © 2026 Collab World. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail
