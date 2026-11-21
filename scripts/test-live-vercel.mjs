import { chromium } from 'playwright';

async function testLiveVercel() {
  console.log('Testing live Vercel UI at https://air-plan-tawny.vercel.app...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // 1. Home
  await page.goto('https://air-plan-tawny.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  const h1 = await page.textContent('h1');
  console.log('✓ Home Page Title:', h1?.trim());

  // 2. Click Sharma Family demo
  console.log('  Testing Demo Profile Click...');
  await page.click('text=Sharma Family');
  await page.waitForURL('**/plan?id=demo-a', { timeout: 15000 });
  console.log('✓ Successfully loaded Plan Page for Sharma Family');

  // 3. Check Top Actions and Math
  await page.waitForSelector('text=Top Recommended Actions', { timeout: 20000 });
  const showMathBtn = page.getByRole('button', { name: /show the math/i }).first();
  await showMathBtn.click();
  await page.waitForSelector('table', { timeout: 5000 });
  console.log('✓ Impact Card "Show the math" disclosure drawer works');

  // 4. Toggle Language to Hindi
  console.log('  Testing Bilingual Toggle...');
  const langBtn = page.locator('#main-content').getByRole('button', { name: /toggle language/i });
  await langBtn.click();
  await page.waitForSelector('text=वायु गुणवत्ता कार्य योजना', { timeout: 15000 });
  console.log('✓ Hindi translation renders on production');

  // 5. Navigate to Audit Page
  console.log('  Checking Audit Page...');
  await page.goto('https://air-plan-tawny.vercel.app/audit', { waitUntil: 'networkidle', timeout: 20000 });
  const auditHeading = await page.textContent('h1');
  console.log('✓ Audit Page Heading:', auditHeading?.trim());

  await browser.close();
  console.log('\n🎉 ALL LIVE VERCEL PRODUCTION TESTS PASSED!');
}

testLiveVercel().catch((err) => {
  console.error('Vercel live test error:', err);
  process.exit(1);
});
