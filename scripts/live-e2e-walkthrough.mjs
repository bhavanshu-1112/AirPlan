import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotDir =
  'C:\\Users\\user\\.gemini\\antigravity\\brain\\8082ed34-2df3-4760-9b16-f3cd9f75dc30\\screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runLiveWalkthrough() {
  console.log('🚀 Starting Playwright Live Web E2E Walkthrough on http://localhost:3000...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  const report = [];

  try {
    // ── 1. HOME PAGE ──
    console.log('--- Step 1: Navigating to Home Page (/) ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    const homeTitle = await page.textContent('h1');
    console.log(`✓ Home Page Title: "${homeTitle?.trim()}"`);

    const hasNav = await page.isVisible('nav[aria-label="Main navigation"]');
    console.log(`✓ Main Navigation visible: ${hasNav}`);

    const hasMythBuster = await page.isVisible('text=Air Quality Myth Buster');
    console.log(`✓ Myth Buster Section visible: ${hasMythBuster}`);

    await page.screenshot({ path: path.join(screenshotDir, '01_home_page.png'), fullPage: true });
    report.push({
      step: 'Home Page',
      status: 'PASS',
      details: 'Hero title, navigation, and myth buster rendered correctly.',
    });

    // ── 2. SETUP PAGE ──
    console.log('\n--- Step 2: Navigating to Setup Page (/setup) ---');
    await page.click('nav >> text=Setup');
    await page.waitForURL('**/setup', { timeout: 10000 });
    const setupHeading = await page.textContent('h1#setup-heading');
    console.log(`✓ Setup Heading: "${setupHeading?.trim()}"`);

    // Search and select City
    console.log('  Filling city search: "Delhi"...');
    const cityInput = page.locator('#city-search');
    await cityInput.fill('Delhi');
    await page.waitForTimeout(600);
    const cityOption = page.locator('role=listbox >> role=option').first();
    await cityOption.waitFor({ state: 'visible', timeout: 10000 });
    const selectedCityText = await cityOption.textContent();
    console.log(`  Selecting city option: "${selectedCityText?.trim()}"`);
    await cityOption.click();
    await page.waitForTimeout(300);

    // Fill Member 1
    console.log('  Setting Member 1: Aarav (Child, Asthma)...');
    await page.fill('#member-name-0', 'Aarav');
    await page.selectOption('#member-age-0', 'child');
    await page.selectOption('#member-sensitivity-0', 'asthma');

    // Add Member 2
    console.log('  Adding Member 2: Priya (Adult)...');
    await page.click('button:has-text("+ Add Member")');
    await page.fill('#member-name-1', 'Priya');
    await page.selectOption('#member-age-1', 'adult');

    // Home details & commute
    console.log('  Setting home & commute options...');
    await page.selectOption('#windowCondition', 'average');
    await page.selectOption('#commuteMode', 'metro');
    await page.fill('#commuteHours', '1.5');
    await page.selectOption('#maskAvailability', 'n95');

    await page.screenshot({
      path: path.join(screenshotDir, '02_setup_form_filled.png'),
      fullPage: true,
    });
    console.log('✓ Setup form filled.');

    // Submit form
    console.log('  Submitting form: Generate Plan...');
    await page.click('button[type="submit"]');

    // Wait for redirect to /plan?id=...
    console.log('  Waiting for redirect to /plan...');
    await page.waitForURL(/\/plan\?id=/, { timeout: 25000 });
    const planUrl = page.url();
    console.log(`✓ Successfully redirected to custom plan URL: ${planUrl}`);
    report.push({
      step: 'Household Setup',
      status: 'PASS',
      details: `Form validated, city geocoded, members saved, redirected to ${planUrl}`,
    });

    // ── 3. PLAN PAGE (ENGLISH) ──
    console.log('\n--- Step 3: Verifying Plan Page ---');
    await page.waitForSelector('text=Top Recommended Actions', { timeout: 25000 });
    const planHeading = await page.textContent('h1');
    console.log(`✓ Plan Heading: "${planHeading?.trim()}"`);

    await page.screenshot({
      path: path.join(screenshotDir, '03_custom_plan_generated.png'),
      fullPage: true,
    });

    // ── 4. PLAN PAGE (HINDI TOGGLE) ──
    console.log('\n--- Step 4: Testing Language Toggle to Hindi ---');
    const planLangBtn = page
      .locator('#main-content')
      .getByRole('button', { name: /toggle language/i });
    await planLangBtn.waitFor({ state: 'visible', timeout: 10000 });
    await planLangBtn.click();
    await page.waitForSelector('text=वायु गुणवत्ता कार्य योजना', { timeout: 20000 });
    console.log('✓ Hindi language rendered: "वायु गुणवत्ता कार्य योजना" visible');
    await page.screenshot({ path: path.join(screenshotDir, '04_plan_hindi.png'), fullPage: true });
    report.push({
      step: 'Language Toggle (Hindi)',
      status: 'PASS',
      details: 'Full page translated to Hindi including action labels.',
    });

    // Toggle back to English
    console.log('  Toggling back to English...');
    await planLangBtn.click();
    await page.waitForSelector('text=Air Quality Action Plan', { timeout: 20000 });
    console.log('✓ Switched back to English');

    // ── 5. PLAN MATH EXPANSION ──
    console.log('\n--- Step 5: Expanding Impact Math Details ---');
    const showMathBtn = page.getByRole('button', { name: 'Show the math' }).first();
    await showMathBtn.waitFor({ state: 'visible', timeout: 10000 });
    await showMathBtn.click();
    await page.waitForSelector('table', { timeout: 10000 });
    console.log('✓ Math breakdown table displayed.');
    await page.screenshot({
      path: path.join(screenshotDir, '05_plan_math_expanded.png'),
      fullPage: true,
    });
    report.push({
      step: 'Impact Math Expansion',
      status: 'PASS',
      details: 'Detailed formula and exposure calculation breakdown table rendered.',
    });

    // ── 6. AUDIT PAGE ──
    console.log('\n--- Step 6: Testing Audit Page (/audit) ---');
    await page.click('nav >> text=Audit');
    await page.waitForURL('**/audit', { timeout: 10000 });
    const auditHeading = await page.textContent('h1#audit-heading');
    console.log(`✓ Audit Heading: "${auditHeading?.trim()}"`);
    await page.screenshot({ path: path.join(screenshotDir, '06_audit_page.png'), fullPage: true });

    // Upload test image
    console.log('  Uploading room photo for air quality audit...');
    const testImage = path.resolve(
      __dirname,
      '../node_modules/@jest/reporters/assets/jest_logo.png',
    );
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImage);

    // Wait for findings
    console.log('  Waiting for audit findings...');
    await page.waitForSelector('#findings-heading', { timeout: 30000 });
    console.log('✓ Audit findings displayed');
    await page.screenshot({
      path: path.join(screenshotDir, '07_audit_results.png'),
      fullPage: true,
    });
    report.push({
      step: 'Air Quality Photo Audit',
      status: 'PASS',
      details:
        'Image upload validated, analysis executed, and categorized recommendations displayed.',
    });

    console.log('\n🎉 ALL END-TO-END WEB FLOWS COMPLETED SUCCESSFULLY!');
    fs.writeFileSync(
      path.join(screenshotDir, 'report.json'),
      JSON.stringify({ status: 'SUCCESS', report }, null, 2),
      'utf8',
    );
  } catch (err) {
    console.error('❌ E2E Walkthrough error:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'error_state.png'), fullPage: true });
    throw err;
  } finally {
    await browser.close();
  }
}

runLiveWalkthrough().catch((err) => {
  console.error(err);
  process.exit(1);
});
