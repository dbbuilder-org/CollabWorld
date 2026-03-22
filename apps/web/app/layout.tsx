import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Collab World', template: '%s | Collab World' },
  description: 'The viral contest platform connecting creators, fans, and brands.',
  openGraph: {
    type: 'website',
    siteName: 'Collab World',
    title: 'Collab World',
    description: 'The viral contest platform connecting creators, fans, and brands.',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
