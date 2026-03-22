const REQUIRED_PROD_ENV = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
]

const OPTIONAL_ENV = [
  'MUX_TOKEN_ID',
  'MUX_TOKEN_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
]

export function checkRequiredEnv(): { missing: string[]; warnings: string[] } {
  const missing = REQUIRED_PROD_ENV.filter(key => !process.env[key])
  const warnings = OPTIONAL_ENV
    .filter(key => !process.env[key])
    .map(key => `${key} not set — feature will be degraded`)
  return { missing, warnings }
}
