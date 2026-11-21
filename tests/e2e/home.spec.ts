import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ── Home Page ──

test.describe('Home page', () => {
  test('renders heading and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText("Tomorrow's Smog");
    await expect(page.locator('nav')).toBeVisible();
  });

  test('has accessible navigation links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Setup', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Plan', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Audit', exact: true })).toBeVisible();
  });

  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });

  test('displays myth buster section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Air Quality Myth Buster')).toBeVisible();
  });
});

// ── Setup Page ──

test.describe('Setup page', () => {
  test('renders household form', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByText('Set Up Your Household')).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Air Quality Action Plan' })).toBeVisible({
      timeout: 20000,
    });
  });

  test('displays AQI badge and action cards', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Top Recommended Actions')).toBeVisible({ timeout: 25000 });
    await expect(page.getByRole('heading', { name: 'Air Quality Action Plan' })).toBeVisible();
  });

  test('has language toggle', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    const toggle = page.locator('#main-content').getByRole('button', { name: /toggle language/i });
    await expect(toggle).toBeVisible();
  });

  test('toggles to Hindi', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Top Recommended Actions')).toBeVisible({ timeout: 25000 });
    const toggle = page.locator('#main-content').getByRole('button', { name: /toggle language/i });
    await toggle.click();
    await expect(page.getByText('वायु गुणवत्ता कार्य योजना')).toBeVisible({ timeout: 15000 });
  });

  test('shows impact card math detail on expand', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Top Recommended Actions')).toBeVisible({ timeout: 25000 });
    const showMath = page.getByRole('button', { name: 'Show the math' }).first();
    await showMath.click();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/plan?id=demo-a');
    await expect(page.getByText('Top Recommended Actions')).toBeVisible({ timeout: 25000 });
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
    await expect(page.getByRole('heading', { name: 'Indoor Air Quality Audit' })).toBeVisible();
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
    await expect(page.locator('h1')).toContainText("Tomorrow's Smog");

    // Navigate to Setup
    await page.getByRole('link', { name: 'Setup', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Set Up Your Household' })).toBeVisible();

    // Navigate to Plan
    await page.getByRole('link', { name: 'Plan', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Air Quality Action Plan' })).toBeVisible({
      timeout: 20000,
    });

    // Navigate to Audit
    await page.getByRole('link', { name: 'Audit', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Indoor Air Quality Audit' })).toBeVisible();
  });
});
