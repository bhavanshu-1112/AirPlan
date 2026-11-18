import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ── Home Page ──

test.describe('Home page', () => {
  test('renders heading and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('AirPlan');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('has accessible navigation links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav.getByText('Setup')).toBeVisible();
    await expect(nav.getByText('Plan')).toBeVisible();
    await expect(nav.getByText('Audit')).toBeVisible();
  });

  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast']) // skip color-contrast in dark/light mode tests
      .analyze();
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });

  test('displays myth buster section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Common Air Quality Myths')).toBeVisible();
  });
});

// ── Setup Page ──

test.describe('Setup page', () => {
  test('renders household form', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByText('Household Setup')).toBeVisible();
  });

  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/setup');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });
});

// ── Plan Page ──

test.describe('Plan page', () => {
  test('loads demo plan with default id', async ({ page }) => {
    await page.goto('/plan');
    // Should load with demo-a household
    await expect(page.getByText('Air Quality Action Plan')).toBeVisible({ timeout: 15000 });
  });

  test('displays AQI badge and action cards', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Air Quality Action Plan')).toBeVisible({ timeout: 15000 });
    // Should show top actions section
    await expect(page.getByText('Top Recommended Actions')).toBeVisible();
  });

  test('has language toggle', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Air Quality Action Plan')).toBeVisible({ timeout: 15000 });
    const toggle = page.getByRole('button', { name: /हिंदी|Hindi/i });
    await expect(toggle).toBeVisible();
  });

  test('toggles to Hindi', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Air Quality Action Plan')).toBeVisible({ timeout: 15000 });
    // Click Hindi toggle
    const toggle = page.getByRole('button', { name: /हिंदी|Hindi/i });
    await toggle.click();
    // Should show Hindi heading
    await expect(page.getByText('वायु गुणवत्ता कार्य योजना')).toBeVisible({ timeout: 15000 });
  });

  test('shows impact card math detail on expand', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Air Quality Action Plan')).toBeVisible({ timeout: 15000 });
    // Click "Show the math" button
    const showMath = page.getByRole('button', { name: 'Show the math' }).first();
    await showMath.click();
    // Should show formula and inputs table
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Air Quality Action Plan')).toBeVisible({ timeout: 15000 });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });
});

// ── Audit Page ──

test.describe('Audit page', () => {
  test('renders audit form', async ({ page }) => {
    await page.goto('/audit');
    await expect(page.getByText('Indoor Air Quality Audit')).toBeVisible();
  });

  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/audit');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });
});

// ── Navigation Flow ──

test.describe('Navigation', () => {
  test('navigates between pages via navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('AirPlan');

    // Navigate to Setup
    await page.getByRole('link', { name: 'Setup' }).first().click();
    await expect(page.getByText('Household Setup')).toBeVisible();

    // Navigate to Plan
    await page.getByRole('link', { name: 'Plan' }).first().click();
    await expect(page.getByText('Air Quality Action Plan')).toBeVisible({ timeout: 15000 });

    // Navigate to Audit
    await page.getByRole('link', { name: 'Audit' }).first().click();
    await expect(page.getByText('Indoor Air Quality Audit')).toBeVisible();
  });
});
