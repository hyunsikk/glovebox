import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/test/node_modules/playwright/index.mjs';
import { mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const RAW = join(import.meta.dirname, 'screenshots', 'appstore-v2');
const OUT = join(import.meta.dirname, 'screenshots', 'store-ready');
const FONT = '/Users/hsik/Desktop/TeamAM/Website/public/fonts/fraunces-normal-300-700.woff2';

// setContent pages are about:blank origin — Chromium blocks file:// subresources
// there, so the font and screenshot must be inlined as data URIs.
const fontData = `data:font/woff2;base64,${readFileSync(FONT).toString('base64')}`;
const imgData = (path) => `data:image/png;base64,${readFileSync(path).toString('base64')}`;

const CAPTIONS = {
  '01-garage-dark': 'Every car you own,\nin one private garage',
  '02-detail-dark': 'Factory maintenance\nschedules, built in',
  '03-timeline-dark': 'Complete service history —\nyours forever',
  '04-settings-dark': 'Backed up to your iCloud.\nNo account. No servers.',
  '01-garage-light': 'No subscription.\nNo ads. Yours.',
};

const DEVICES = [
  { dir: 'iphone-6.9', w: 1320, h: 2868, capH: 430, fs: 86, radius: 56, pb: 110 },
  { dir: 'ipad-13', w: 2064, h: 2752, capH: 420, fs: 96, radius: 44, pb: 100 },
];

const page_html = (d, imgSrc, caption) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'Fraunces'; src:url('${fontData}') format('woff2'); font-weight:300 700; }
* { margin:0; box-sizing:border-box; }
body { width:${d.w}px; height:${d.h}px; background:#181c2e; display:flex; flex-direction:column; align-items:center; overflow:hidden; }
.cap { height:${d.capH}px; display:flex; align-items:center; justify-content:center; text-align:center;
  font-family:'Fraunces',serif; font-weight:480; font-size:${d.fs}px; line-height:1.18; color:#f2efdb;
  white-space:pre-line; letter-spacing:-0.01em; padding:0 60px; }
.cap .dot { display:inline-block; width:${Math.round(d.fs*0.16)}px; height:${Math.round(d.fs*0.16)}px; background:#d4663c; transform:rotate(45deg); margin-left:${Math.round(d.fs*0.18)}px; }
.shot { flex:1; display:flex; justify-content:center; min-height:0; padding-bottom:${d.pb}px; }
.shot img { height:100%; width:auto; border-radius:${d.radius}px; border:3px solid rgba(242,239,219,0.22); display:block; }
</style></head><body>
<div class="cap"><span>${caption}<span class="dot"></span></span></div>
<div class="shot"><img src="${imgSrc}"></div>
</body></html>`;

const browser = await chromium.launch({ headless: true });
for (const d of DEVICES) {
  mkdirSync(join(OUT, d.dir), { recursive: true });
  let idx = 0;
  for (const [shot, caption] of Object.entries(CAPTIONS)) {
    idx++;
    const img = join(RAW, d.dir, `${shot}.png`);
    const page = await browser.newPage({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 1 });
    await page.setContent(page_html(d, imgData(img), caption), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const probe = await page.evaluate(() => {
      const el = document.querySelector('.shot img');
      return {
        decoded: el.complete && el.naturalWidth > 0,
        renderedW: el.getBoundingClientRect().width,
        fraunces: document.fonts.check('480 20px Fraunces'),
      };
    });
    if (!probe.decoded || probe.renderedW < 200) {
      throw new Error(`screenshot failed to render: ${d.dir}/${shot} (decoded=${probe.decoded}, w=${probe.renderedW})`);
    }
    if (!probe.fraunces) {
      throw new Error(`Fraunces did not load for ${d.dir}/${shot}`);
    }
    await page.waitForTimeout(400);
    const out = join(OUT, d.dir, `${String(idx).padStart(2, '0')}-${shot.replace(/^\d+-/, '').replace(/-dark|-light/, '')}.png`);
    await page.screenshot({ path: out });
    await page.close();
    console.log('framed', d.dir, out.split('/').pop(), `imgW=${Math.round(probe.renderedW)}`);
  }
}
await browser.close();
