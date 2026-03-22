import { test, expect } from '@playwright/test'

test.describe('Onboarding flow', () => {
  test.skip('fan can sign up and see dashboard', async ({ page }) => {
    // Requires real Clerk test environment — skip in CI without Clerk test keys
    await page.goto('/sign-up')
    await expect(page).toHaveTitle(/Collab World/)

    // Sign up with test credentials
    // await page.fill('[name="emailAddress"]', 'testfan@example.com')
    // await page.fill('[name="password"]', 'Test1234!')
    // await page.click('[type="submit"]')

    // Should redirect to /onboarding
    // await expect(page).toHaveURL('/onboarding')

    // Select fan role
    // await page.click('[data-testid="role-card-fan"]')

    // Should redirect to /onboarding/profile
    // await expect(page).toHaveURL('/onboarding/profile')

    // Fill in display name
    // await page.fill('[name="displayName"]', 'Test Fan')
    // await page.click('[type="submit"]')

    // Should redirect to /dashboard/fan
    // await expect(page).toHaveURL('/dashboard/fan')
    // await expect(page.locator('h1')).toContainText('Welcome')
  })

  test.skip('creator can sign up and see creator dashboard', async ({ page }) => {
    // Requires real Clerk test environment
    await page.goto('/sign-up')
    await expect(page).toHaveTitle(/Collab World/)
  })

  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Collaboration Economy')
  })

  test('sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in')
    // Clerk renders the sign-in form
    await expect(page).toHaveTitle(/Collab World/)
  })
})
