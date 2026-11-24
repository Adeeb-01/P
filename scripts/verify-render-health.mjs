/* Hardware-GPU measurements supplement the portable SwiftShader responsive suite.
 * Uses the same PLAYWRIGHT_MODULE, CHROME_PATH, AUDIT_URL and AUDIT_OUTPUT variables.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.AUDIT_OUTPUT || path.join(os.tmpdir(), 'adeeb-render-health');
const base = process.env.AUDIT_URL || 'http://127.0.0.1:3000';
fs.mkdirSync(output, { recursive: true });
const report = { started: new Date().toISOString(), browser: '', performance: [], recovery: [], desktop: [], failures: [] };
const check = (condition, name) => { if (!condition) report.failures.push(name); };

async function measure(page, selector) {
  return page.evaluate(async (selector) => {
    const canvas = document.querySelector(selector);
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const extension = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable';
    const samples = await new Promise((resolve) => {
      const frames = []; let start = 0; let previous = 0;
      const tick = (now) => {
        if (!start) start = now;
        if (previous) frames.push(now - previous);
        previous = now;
        if (now - start < 2000) requestAnimationFrame(tick); else resolve(frames);
      };
      requestAnimationFrame(tick);
    });
    const sorted = [...samples].sort((a, b) => a - b);
    return { renderer, rendered: canvas.dataset.rendered, dpr: +(canvas.width / canvas.clientWidth).toFixed(2), fps: +(1000 * samples.length / samples.reduce((a, b) => a + b, 0)).toFixed(1), p95: +sorted[Math.floor(sorted.length * .95)].toFixed(1), glError: gl?.getError() };
  }, selector);
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--use-angle=d3d11'] });
  report.browser = browser.version();
  try {
    for (const [width, height] of [[375, 812], [390, 844], [768, 1024], [1024, 1366]]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: theme });
      const page = await context.newPage();
      page.on('pageerror', (e) => report.failures.push(e.message));
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForTimeout(4000);
      const hero = await measure(page, '[data-hero-core]');
      await page.screenshot({ path: path.join(output, `${width}-${theme}-hero.png`), scale: 'css' });
      await page.locator('[data-closing-shader]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
      const closing = await measure(page, '[data-closing-shader]');
      await page.screenshot({ path: path.join(output, `${width}-${theme}-closing.png`), scale: 'css' });
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(2200);
      await page.screenshot({ path: path.join(output, `${width}-${theme}-footer.png`), scale: 'css' });
      report.performance.push({ width, height, theme, hero, closing });
      check(hero.rendered === 'true' && !hero.glError, `Hero health ${width} ${theme}`);
      check(closing.rendered === 'true' && !closing.glError, `Closing health ${width} ${theme}`);

      if (width === 390 && theme === 'light') {
        for (const selector of ['[data-hero-core]', '[data-closing-shader]']) {
          await page.locator(selector).scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          await page.locator(selector).evaluate((canvas) => {
            canvas.dataset.originalContext = 'true';
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            const extension = gl.getExtension('WEBGL_lose_context');
            extension.loseContext();
            setTimeout(() => extension.restoreContext(), 200);
          });
          await page.waitForFunction((selector) => {
            const canvas = document.querySelector(selector);
            return !canvas.dataset.originalContext && canvas.dataset.rendered === 'true';
          }, selector, { timeout: 10000 });
          report.recovery.push({ selector, restored: true });
        }
      }
      await context.close();
      console.log(`GPU ${width} ${theme}: hero ${hero.fps}, closing ${closing.fps}`);
    }
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForTimeout(4000);
      check(await page.locator('[data-hero-core]').getAttribute('data-raymarch-steps') === '64', `Desktop shader quality ${theme}`);
      check(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `Desktop hero bounds ${theme}`);
      await page.screenshot({ path: path.join(output, `1440-${theme}-hero.png`), scale: 'css' });
      await page.goto(base + '/works', { waitUntil: 'networkidle' });
      check(await page.getByRole('radio', { name: 'Spatial track', exact: true }).getAttribute('aria-checked') === 'true', `Desktop spatial track ${theme}`);
      check(await page.locator('[data-touch-deck]').count() === 0, `Desktop uses original track ${theme}`);
      await page.screenshot({ path: path.join(output, `1440-${theme}-works.png`), scale: 'css' });
      report.desktop.push({ width: 1440, height: 900, theme, complete: true });
      await context.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  }
  if (report.failures.length) process.exitCode = 1;
  console.log(JSON.stringify({ cases: report.performance.length, recovery: report.recovery.length, desktop: report.desktop.length, failures: report.failures, output }));
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
