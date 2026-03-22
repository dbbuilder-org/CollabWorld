import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Collab World/i)
})

test('health check returns ok', async ({ page }) => {
  const response = await page.request.get('/api/health')
  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body.status).toBe('ok')
})

test('sign-in page is accessible', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page).not.toHaveTitle(/404/)
})
