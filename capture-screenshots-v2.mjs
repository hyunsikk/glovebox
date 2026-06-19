import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/test/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:19006';
const OUT_DIR = join(import.meta.dirname, 'screenshots', 'appstore-v2');

// Current App Store required sizes (2026)
const DEVICES = [
  // iPhone 6.9" — 1320×2868 (iPhone 16 Pro Max class)
  { name: 'iphone-6.9', viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, mobile: true },
  // iPad 13" — 2064×2752
  { name: 'ipad-13', viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2, mobile: false },
];

// Compliance: no screens that surface currency (insights excluded;
// cost strings blanked app-wide by the temporary SettingsContext patch)
const SCREENS = [
  { name: '01-garage', route: '/garage', waitFor: 4500 },
  {
    name: '02-detail', route: '/garage', waitFor: 3000,
    actions: async (page) => {
      try {
        await page.getByText('Daily Driver', { exact: false }).first().click({ timeout: 4000 });
        await page.waitForTimeout(2500);
      } catch {}
    },
  },
  { name: '03-timeline', route: '/timeline', waitFor: 3500 },
  {
    name: '04-settings', route: '/settings', waitFor: 3000,
    actions: async (page) => {
      try {
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(1200);
      } catch {}
    },
  },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const device of DEVICES) {
    const deviceDir = join(OUT_DIR, device.name);
    mkdirSync(deviceDir, { recursive: true });

    for (const scheme of ['dark', 'light']) {
      const context = await browser.newContext({
        viewport: device.viewport,
        deviceScaleFactor: device.deviceScaleFactor,
        isMobile: device.mobile,
        hasTouch: true,
        colorScheme: scheme,
      });
      const page = await context.newPage();
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(6000); // let demo data seed on first paint
      // Dismiss onboarding if present
      try {
        await page.getByText('Skip', { exact: false }).first().click({ timeout: 4000 });
        await page.waitForTimeout(2500);
      } catch {}
      // Demo data is seeded now; mark the flag non-'true' so the demo banner
      // never renders, while the seeded vehicles remain.
      await page.evaluate(() => localStorage.setItem('@autolog_demo_loaded', 'captured'));
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(3500);

      for (const screen of SCREENS) {
        try {
          await page.goto(`${BASE_URL}${screen.route}`, { waitUntil: 'networkidle', timeout: 20000 });
          await page.waitForTimeout(screen.waitFor);
          if (screen.actions) await screen.actions(page);
          await page.waitForTimeout(400);
          await page.screenshot({ path: join(deviceDir, `${screen.name}-${scheme}.png`) });
          console.log(`ok ${device.name}/${screen.name}-${scheme}`);
        } catch (e) {
          console.log(`FAIL ${device.name}/${screen.name}-${scheme}: ${e.message.split('\n')[0]}`);
        }
      }
      await context.close();
    }
  }
  await browser.close();
  console.log('done ->', OUT_DIR);
}
main().catch(console.error);
