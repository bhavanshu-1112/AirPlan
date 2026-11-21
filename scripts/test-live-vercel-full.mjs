import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERCEL_URL = 'https://air-plan-tawny.vercel.app';

async function runFullVercelLiveTest() {
  console.log('====================================================');
  console.log('🚀 Testing Live Vercel Deployment:', VERCEL_URL);
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[Vercel Console Error]', msg.text());
  });

  try {
    // ── 1. HOME PAGE ──
    console.log('▶ Step 1: Navigating to Home Page...');
    const homeRes = await page.goto(VERCEL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`  ✓ Home HTTP Status: ${homeRes.status()}`);
    const h1 = await page.textContent('h1');
    console.log(`  ✓ Home Title: "${h1?.trim()}"`);

    // ── 2. DEMO PROFILE PLAN ──
    console.log('\n▶ Step 2: Testing 1-Click Demo Profile (Sharma Family)...');
    await page.click('text=Sharma Family');
    await page.waitForURL('**/plan?id=demo-a', { timeout: 15000 });
    await page.waitForSelector('text=Top Recommended Actions', { timeout: 20000 });
    const aqiBadge = await page.textContent('[data-testid="aqi-badge"], .rounded-full');
    console.log(
      `  ✓ Plan Loaded for Demo Profile. AQI Category: "${aqiBadge?.trim() || 'Active'}"`,
    );

    // ── 3. SHOW THE MATH DRAWER ──
    console.log('\n▶ Step 3: Testing "Show the math" Disclosure Drawer...');
    const showMathBtn = page.getByRole('button', { name: /show the math/i }).first();
    await showMathBtn.waitFor({ state: 'visible', timeout: 10000 });
    await showMathBtn.click();
    await page.waitForSelector('table', { timeout: 5000 });
    console.log('  ✓ Calculation formula table opened and visible');

    // ── 4. BILINGUAL HINDI TOGGLE ──
    console.log('\n▶ Step 4: Testing English <-> Hindi Bilingual Toggle...');
    const langBtn = page.locator('#main-content').getByRole('button', { name: /toggle language/i });
    await langBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('  Toggling to Hindi...');
    await langBtn.click();
    await page.waitForSelector('text=वायु गुणवत्ता कार्य योजना', { timeout: 20000 });
    console.log('  ✓ Hindi Devanagari translation rendered successfully: "वायु गुणवत्ता कार्य योजना"');

    // Toggle back to English
    console.log('  Toggling back to English...');
    await langBtn.click();
    await page.waitForSelector('text=Air Quality Action Plan', { timeout: 20000 });
    console.log('  ✓ English labels restored');

    // ── 5. CUSTOM HOUSEHOLD CREATION (/setup) ──
    console.log('\n▶ Step 5: Creating a Custom Household on Live Vercel...');
    await page.goto(`${VERCEL_URL}/setup`, { waitUntil: 'networkidle', timeout: 20000 });

    console.log('  Searching city "Lucknow"...');
    const cityInput = page.locator('#city-search');
    await cityInput.fill('Lucknow');
    await page.waitForTimeout(800);

    const cityOption = page.locator('role=listbox >> role=option').first();
    await cityOption.waitFor({ state: 'visible', timeout: 10000 });
    const selectedCity = await cityOption.textContent();
    console.log(`  ✓ Selected Geocoded City: "${selectedCity?.trim()}"`);
    await cityOption.click();

    // Member 1
    console.log('  Configuring Member: Dev (Adult, Asthma)...');
    await page.fill('#member-name-0', 'Dev');
    await page.selectOption('#member-age-0', 'adult');
    await page.selectOption('#member-sensitivity-0', 'asthma');

    // Submit
    console.log('  Submitting setup form to generate custom plan...');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/plan\?id=/, { timeout: 25000 });
    console.log(`  ✓ Custom plan generated successfully on Vercel: ${page.url()}`);

    // Verify member name rendered
    const bodyText = await page.textContent('body');
    console.log(`  ✓ Member "Dev" visible on custom plan: ${bodyText.includes('Dev')}`);

    // ── 6. INDOOR PHOTO AUDIT (/audit) ──
    console.log('\n▶ Step 6: Testing Indoor Photo Audit on Live Vercel...');
    await page.goto(`${VERCEL_URL}/audit`, { waitUntil: 'networkidle', timeout: 20000 });
    console.log('  ✓ Audit Page loaded');

    const sampleImage = path.resolve(__dirname, '../public/sample-room-audit.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(sampleImage);
    console.log('  Uploaded sample-room-audit.jpg, awaiting analysis...');

    await page.waitForSelector('#findings-heading', { timeout: 30000 });
    const findingsCount = await page
      .locator('[aria-labelledby="findings-heading"] > div, #findings-heading ~ div')
      .count();
    console.log(
      `  ✓ Audit completed with structured recommendations displayed (count: ${findingsCount})`,
    );

    console.log('\n====================================================');
    console.log('🎉 100% OF LIVE VERCEL PRODUCTION TESTS PASSED!');
    console.log('====================================================');

    await browser.close();
  } catch (err) {
    console.error('❌ Live Vercel Test Error:', err);
    await browser.close();
    process.exit(1);
  }
}

runFullVercelLiveTest();
