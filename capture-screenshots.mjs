import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/test/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:19006';
const OUT_DIR = join(import.meta.dirname, 'screenshots', 'appstore');

// App Store screenshot sizes (CSS pixels at device pixel ratio)
const DEVICES = [
  {
    name: 'iPhone-6.7',
    viewport: { width: 430, height: 932 },  // iPhone 15 Pro Max logical
    deviceScaleFactor: 3,                      // → 1290 × 2796 actual
  },
  {
    name: 'iPhone-6.5',
    viewport: { width: 428, height: 926 },  // iPhone 14 Plus logical
    deviceScaleFactor: 3,                      // → 1284 × 2778 actual
  },
  {
    name: 'iPad-12.9',
    viewport: { width: 1024, height: 1366 }, // iPad Pro 12.9 logical
    deviceScaleFactor: 2,                       // → 2048 × 2732 actual
  },
];

// Screenshots to capture with navigation actions
const SCREENS = [
  {
    name: '01-garage',
    caption: 'Track Unlimited Vehicles',
    route: '/garage',
    waitFor: 3000,
    actions: async (page) => {
      // Wait for app to fully load with sample data
      await page.waitForTimeout(2000);
    },
  },
  {
    name: '02-vehicle-detail',
    caption: 'Instant Factory Maintenance Schedules',
    route: '/garage',
    waitFor: 2000,
    actions: async (page) => {
      // Try to tap on first vehicle card to open detail modal
      try {
        const cards = page.locator('[accessibilityRole="button"]').first();
        await cards.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(1500);
      } catch (e) {
        console.log('  Could not open vehicle detail, capturing garage view');
      }
    },
  },
  {
    name: '03-history',
    caption: 'Complete Service History',
    route: '/timeline',
    waitFor: 2000,
    actions: async (page) => {
      await page.waitForTimeout(1500);
    },
  },
  {
    name: '04-insights',
    caption: 'Track Costs & Fuel Analytics',
    route: '/insights',
    waitFor: 2000,
    actions: async (page) => {
      await page.waitForTimeout(2000);
    },
  },
  {
    name: '05-insights-scroll',
    caption: 'Compare Against National Averages',
    route: '/insights',
    waitFor: 2000,
    actions: async (page) => {
      // Scroll down to see benchmarks
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(1000);
    },
  },
  {
    name: '06-settings',
    caption: 'Your Data, Your Control',
    route: '/settings',
    waitFor: 2000,
    actions: async (page) => {
      await page.waitForTimeout(1500);
    },
  },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  
  for (const device of DEVICES) {
    console.log(`\n📱 Capturing ${device.name} (${device.viewport.width}×${device.viewport.height} @${device.deviceScaleFactor}x)...`);
    const deviceDir = join(OUT_DIR, device.name);
    mkdirSync(deviceDir, { recursive: true });
    
    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: !device.name.includes('iPad'),
      hasTouch: true,
      colorScheme: 'dark',
      userAgent: device.name.includes('iPad')
        ? 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15'
        : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    
    const page = await context.newPage();
    
    // Load the app first
    console.log('  Loading app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Capture initial load (welcome/onboarding screen)
    await page.screenshot({
      path: join(deviceDir, '00-welcome.png'),
      fullPage: false,
    });
    console.log('  ✅ 00-welcome.png');
    
    for (const screen of SCREENS) {
      try {
        // Navigate to route
        await page.goto(`${BASE_URL}${screen.route}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(screen.waitFor);
        
        // Run any custom actions
        if (screen.actions) {
          await screen.actions(page);
        }
        
        // Capture screenshot
        const filename = `${screen.name}.png`;
        await page.screenshot({
          path: join(deviceDir, filename),
          fullPage: false,
        });
        console.log(`  ✅ ${filename} — "${screen.caption}"`);
      } catch (e) {
        console.log(`  ❌ ${screen.name} failed: ${e.message}`);
      }
    }
    
    // Also try light mode variants for variety
    try {
      await context.close();
      const lightContext = await browser.newContext({
        viewport: device.viewport,
        deviceScaleFactor: device.deviceScaleFactor,
        isMobile: !device.name.includes('iPad'),
        hasTouch: true,
        colorScheme: 'light',
      });
      const lightPage = await lightContext.newPage();
      await lightPage.goto(`${BASE_URL}/garage`, { waitUntil: 'networkidle', timeout: 15000 });
      await lightPage.waitForTimeout(3000);
      await lightPage.screenshot({
        path: join(deviceDir, '07-light-mode.png'),
        fullPage: false,
      });
      console.log(`  ✅ 07-light-mode.png — "Beautiful Light & Dark Modes"`);
      await lightContext.close();
    } catch (e) {
      console.log(`  ⚠️  Light mode capture failed: ${e.message}`);
    }
  }
  
  await browser.close();
  console.log(`\n✅ All screenshots saved to: ${OUT_DIR}`);
  console.log('📁 Directory listing:');
}

main().catch(console.error);
