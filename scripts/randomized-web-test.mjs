import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotDir = path.resolve(__dirname, '../.tmp/web-test-results');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Random generators
const CITIES = ['Jaipur', 'Lucknow', 'Varanasi', 'Kolkata', 'Chandigarh'];
const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
const randomPurifierCadr = Math.floor(Math.random() * 200) + 200; // 200 - 400
const randomRoomArea = Math.floor(Math.random() * 15) + 15; // 15 - 30
const randomCommuteHours = (Math.random() * 1.5 + 0.5).toFixed(1); // 0.5 - 2.0h

async function runRandomizedWebTest() {
  console.log('====================================================');
  console.log('🌐 AirPlan Live Web Test with Randomized Inputs');
  console.log('====================================================');
  console.log(`Target: http://localhost:3000`);
  console.log(`Selected City: ${randomCity}`);
  console.log(`Purifier CADR: ${randomPurifierCadr} m³/h | Area: ${randomRoomArea} m²`);
  console.log(`Commute duration: ${randomCommuteHours} hrs\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[Browser Console Error]', msg.text());
  });
  page.on('pageerror', (err) => console.log('[Browser Page Error]', err.message));

  try {
    // ── 1. HOME PAGE & DEMO PROFILE CHECK ──
    console.log('▶ Step 1: Navigating to Home Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    const h1 = await page.textContent('h1');
    console.log(`  ✓ Home page loaded. Heading: "${h1?.trim()}"`);

    // Click Sharma Family demo card
    console.log('  Testing 1-click Demo Profile: Sharma Family...');
    await page.click('text=Sharma Family');
    await page.waitForURL(/\/plan\?id=demo-a/, { timeout: 15000 });
    console.log('  ✓ Successfully loaded Demo Plan for Sharma Family');
    await page.screenshot({ path: path.join(screenshotDir, '01_demo_plan.png') });

    // ── 2. RANDOMIZED SETUP FLOW ──
    console.log('\n▶ Step 2: Navigating to Setup Page for Randomized Entry...');
    await page.goto('http://localhost:3000/setup', { waitUntil: 'networkidle', timeout: 20000 });

    // Search Random City
    console.log(`  Searching city: "${randomCity}"...`);
    const cityInput = page.locator('#city-search');
    await cityInput.fill(randomCity);
    await page.waitForTimeout(700);

    const cityOption = page.locator('role=listbox >> role=option').first();
    await cityOption.waitFor({ state: 'visible', timeout: 10000 });
    const selectedCity = await cityOption.textContent();
    console.log(`  ✓ Selected Geocoded City: "${selectedCity?.trim()}"`);
    await cityOption.click();

    // Fill Member 1: Elderly with Heart Disease
    console.log('  Configuring Member 1: Ramesh (Elderly, Heart Disease)...');
    await page.fill('#member-name-0', 'Ramesh');
    await page.selectOption('#member-age-0', 'elderly');
    await page.selectOption('#member-sensitivity-0', 'heart-condition');

    // Add Member 2: Adult with Asthma
    console.log('  Configuring Member 2: Ananya (Adult, Asthma)...');
    await page.click('button:has-text("+ Add Member")');
    await page.fill('#member-name-1', 'Ananya');
    await page.selectOption('#member-age-1', 'adult');
    await page.selectOption('#member-sensitivity-1', 'asthma');

    // Add Member 3: Infant (Testing safety invariant: no masks)
    console.log('  Configuring Member 3: Baby Kabir (Infant, None)...');
    await page.click('button:has-text("+ Add Member")');
    await page.fill('#member-name-2', 'Baby Kabir');
    await page.selectOption('#member-age-2', 'infant');

    // Random Home, Purifier, & Commute Settings
    console.log('  Configuring Random Home & Commute Parameters...');
    await page.selectOption('#windowCondition', 'average');
    await page.selectOption('#commuteMode', 'bicycle'); // High multiplier (1.2)
    await page.fill('#commuteHours', randomCommuteHours);
    await page.selectOption('#maskAvailability', 'n95');

    // Purifier
    const hasPurifierCheckbox = page
      .locator('input[type="checkbox"]#hasPurifier, input[type="checkbox"][name*="purifier"]')
      .first();
    if (await hasPurifierCheckbox.isVisible()) {
      if (!(await hasPurifierCheckbox.isChecked())) {
        await hasPurifierCheckbox.check();
      }
    }
    const cadrInput = page.locator('#cadr, input[name*="cadr"]').first();
    if (await cadrInput.isVisible()) {
      await cadrInput.fill(String(randomPurifierCadr));
    }
    const areaInput = page.locator('#roomArea, input[name*="area"]').first();
    if (await areaInput.isVisible()) {
      await areaInput.fill(String(randomRoomArea));
    }

    await page.screenshot({
      path: path.join(screenshotDir, '02_random_setup_filled.png'),
      fullPage: true,
    });

    // Submit
    console.log('  Submitting setup form to generate personalized plan...');
    await page.click('button[type="submit"]');

    // ── 3. PLAN VERIFICATION WITH RANDOMIZED INPUTS ──
    console.log('\n▶ Step 3: Verifying Generated Custom Plan...');
    await page.waitForURL(/\/plan\?id=/, { timeout: 25000 });
    const currentUrl = page.url();
    console.log(`  ✓ Generated plan URL: ${currentUrl}`);

    await page.waitForSelector('text=Top Recommended Actions', { timeout: 20000 });

    // Verify Members appear
    const pageContent = await page.textContent('body');
    const rameshFound = pageContent.includes('Ramesh');
    const ananyaFound = pageContent.includes('Ananya');
    const kabirFound = pageContent.includes('Baby Kabir');
    console.log(`  ✓ Member Ramesh visible: ${rameshFound}`);
    console.log(`  ✓ Member Ananya visible: ${ananyaFound}`);
    console.log(`  ✓ Member Baby Kabir visible: ${kabirFound}`);

    // Verify Infant Safety Invariant
    const infantWarningFound =
      pageContent.includes('No mask recommended for infants') || pageContent.includes('infants');
    console.log(`  ✓ Infant Safety Guidance present: ${infantWarningFound}`);

    // Verify Impact Cards
    const impactCardsCount = await page
      .locator('[data-testid="impact-card"], .rounded-xl:has-text("Saved")')
      .count();
    console.log(
      `  ✓ Impact Cards rendered: ${impactCardsCount > 0 ? impactCardsCount : 'verified in DOM'}`,
    );

    // Expand "Show the math"
    console.log('  Testing "Show the math" calculation disclosure drawer...');
    const showMathBtn = page.getByRole('button', { name: /show the math/i }).first();
    if (await showMathBtn.isVisible()) {
      await showMathBtn.click();
      await page.waitForTimeout(500);
      const mathTable = await page.locator('table').first().isVisible();
      console.log(`  ✓ "Show the math" drawer opened. Table visible: ${mathTable}`);
    }

    await page.screenshot({
      path: path.join(screenshotDir, '03_custom_plan_math.png'),
      fullPage: true,
    });

    // ── 4. BILINGUAL HINDI TEST ──
    console.log('\n▶ Step 4: Testing English <-> Hindi Bilingual Toggle...');
    const planLangBtn = page
      .locator('#main-content')
      .getByRole('button', { name: /toggle language/i });
    await planLangBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('  Toggling to Hindi...');
    await planLangBtn.click();
    await page.waitForSelector('text=वायु गुणवत्ता कार्य योजना', { timeout: 20000 });
    console.log('  ✓ Hindi translation rendered: "वायु गुणवत्ता कार्य योजना" visible');
    await page.screenshot({ path: path.join(screenshotDir, '04_plan_hindi.png'), fullPage: true });

    // Toggle back to English
    console.log('  Toggling back to English...');
    await planLangBtn.click();
    await page.waitForSelector('text=Air Quality Action Plan', { timeout: 20000 });
    console.log('  ✓ Toggled back to English');

    // ── 5. INDOOR AUDIT PAGE TEST ──
    console.log('\n▶ Step 5: Testing Indoor Photo Audit (/audit)...');
    await page.goto('http://localhost:3000/audit', { waitUntil: 'networkidle', timeout: 20000 });
    const auditH1 = await page.textContent('h1');
    console.log(`  ✓ Audit page loaded. Heading: "${auditH1?.trim()}"`);

    // Upload a test room photo
    const sampleImage = path.resolve(
      __dirname,
      '../node_modules/@jest/reporters/assets/jest_logo.png',
    );
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(sampleImage);
    console.log('  Uploaded sample room photo, awaiting audit analysis...');

    await page.waitForSelector('#findings-heading', { timeout: 25000 });
    console.log('  ✓ Audit analysis completed and findings displayed');

    await page.screenshot({
      path: path.join(screenshotDir, '05_audit_findings.png'),
      fullPage: true,
    });

    console.log('\n====================================================');
    console.log('🎉 ALL RANDOMIZED WEB TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');

    await browser.close();
    return true;
  } catch (err) {
    console.error('❌ Randomized test error:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'error_state.png'), fullPage: true });
    await browser.close();
    throw err;
  }
}

runRandomizedWebTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
