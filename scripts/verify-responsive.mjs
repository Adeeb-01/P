/* Run against `npm run start`. Uses Playwright from PLAYWRIGHT_MODULE or a local installation.
 * CHROME_PATH selects Chrome; AUDIT_OUTPUT keeps screenshots/reports outside application sources.
 * No contact submission or external navigation is performed.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_URL || 'http://127.0.0.1:3000';
const output = process.env.AUDIT_OUTPUT || path.join(os.tmpdir(), 'adeeb-mobile-verification');
const viewports = [[375, 812], [390, 844], [768, 1024], [1024, 1366]];
const routes = ['/', '/works', '/works/easy-learning', '/works/tawsela-vendor', '/works/sarafy', '/works/zad-souq', '/contact'];
const hardware = process.env.AUDIT_GPU === 'hardware';
const report = { started: new Date().toISOString(), renderer: hardware ? 'Chrome / D3D11 (hardware requested)' : 'Chrome / SwiftShader (software GPU)', layouts: [], interactions: [], reducedMotion: [], performance: [], failures: [] };
fs.mkdirSync(output, { recursive: true });
const save = () => fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
const check = (condition, name, details) => { if (!condition) report.failures.push({ name, details }); };

function instrument() {
  window.__audit = { gl: [], shaderErrors: [], audio: [], transitions: 0 };
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const gl = original.apply(this, args);
    if (gl && String(args[0]).startsWith('webgl') && !window.__audit.gl.some((x) => x.gl === gl)) {
      const entry = { gl, canvas: this, draws: 0, uniforms: {} };
      window.__audit.gl.push(entry);
      const names = new Map();
      const location = gl.getUniformLocation.bind(gl);
      gl.getUniformLocation = (program, name) => { const value = location(program, name); if (value) names.set(value, name); return value; };
      const uniform = gl.uniform1f.bind(gl);
      gl.uniform1f = (location, value) => { uniform(location, value); entry.uniforms[names.get(location)] = value; };
      const draw = gl.drawArrays.bind(gl);
      gl.drawArrays = (...values) => { draw(...values); entry.draws++; };
      const compile = gl.compileShader.bind(gl);
      gl.compileShader = (shader) => {
        compile(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) window.__audit.shaderErrors.push(gl.getShaderInfoLog(shader));
      };
    }
    return gl;
  };
  const Audio = window.AudioContext;
  if (Audio) window.AudioContext = class extends Audio { constructor(...args) { super(...args); window.__audit.audio.push(this); } };
  if (document.startViewTransition) {
    const transition = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => { window.__audit.transitions++; return transition(...args); };
  }
}

async function geometry(page) {
  return page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width && r.height && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && !el.closest('[inert]'); };
    const overlap = (a, b) => Math.min(a.right, b.right, innerWidth) - Math.max(a.left, b.left, 0) > 2 && Math.min(a.bottom, b.bottom, innerHeight) - Math.max(a.top, b.top, 0) > 2;
    const floating = [...document.querySelectorAll('[data-mobile-bar],[aria-label="Quick navigation"],body > a[aria-label^="Available"]')].filter(visible);
    const actions = [...document.querySelectorAll('[data-route-content] button,[data-route-content] input,[data-route-content] textarea,[data-route-content] [role="slider"],footer a')].filter(visible);
    const collisions = [];
    floating.forEach((f) => actions.forEach((a) => { if (overlap(f.getBoundingClientRect(), a.getBoundingClientRect())) collisions.push([f.getAttribute('aria-label'), a.getAttribute('aria-label') || a.textContent.trim().slice(0, 50)]); }));
    // Carousels deliberately contain clipped neighbouring slides. Check readable content outside those tracks.
    const textBounds = [...document.querySelectorAll('h1,h2,h3,p,input,textarea')].filter((e) => visible(e) && !e.closest('.touch-deck,[aria-roledescription="carousel"]')).filter((e) => { const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map((e) => e.textContent.slice(0, 70));
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, collisions, textBounds };
  });
}

async function sampleFrames(page, label, size, theme) {
  const frames = await page.evaluate(() => new Promise((resolve) => {
    const deltas = []; let last = 0; let start = 0;
    function tick(now) { if (!start) start = now; if (last) deltas.push(now - last); last = now; if (now - start < 1400) requestAnimationFrame(tick); else resolve(deltas); }
    requestAnimationFrame(tick);
  }));
  const sorted = [...frames].sort((a, b) => a - b);
  report.performance.push({ size, theme, label, fps: +(1000 * frames.length / frames.reduce((a, b) => a + b, 0)).toFixed(1), p50: +sorted[Math.floor(sorted.length * .5)].toFixed(1), p95: +sorted[Math.floor(sorted.length * .95)].toFixed(1), over33ms: frames.filter((x) => x > 33.4).length });
}

async function swipe(page, context, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  const session = await context.newCDPSession(page);
  const start = Math.min(page.viewportSize().width - 40, box.x + box.width * .8);
  const y = Math.max(100, Math.min(page.viewportSize().height - 120, box.y + box.height * .4));
  const distance = Math.min(start - 30, box.width * .7);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y }] });
  for (let i = 1; i <= 12; i++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start - i * distance / 12, y }] });
    await page.waitForTimeout(20);
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
  await page.waitForTimeout(700);
}

async function interactions(page, context, width, height, theme) {
  const label = `${width} ${theme}`;
  await page.goto(base + '/works', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Next project', exact: true }).tap();
  await page.waitForTimeout(700);
  check((await page.locator('[data-deck-counter]').innerText()).startsWith('02'), 'Deck next ' + label);
  await page.getByRole('button', { name: 'Previous project', exact: true }).tap();
  await page.waitForTimeout(700);
  await swipe(page, context, page.locator('.touch-deck'));
  check(page.url().endsWith('/works'), 'Swipe must not navigate ' + label);
  check(!(await page.locator('[data-deck-counter]').innerText()).startsWith('01'), 'Native swipe moves deck ' + label);
  await page.getByRole('radio', { name: 'Grid', exact: true }).tap();
  check(await page.locator('[data-touch-deck]').count() === 0, 'Grid switch ' + label);
  await page.getByRole('radio', { name: '3D Deck', exact: true }).tap();
  await page.waitForTimeout(300);
  const first = page.locator('.touch-deck-slot a').first();
  await first.tap();
  await page.waitForURL('**/works/easy-learning');
  await page.waitForTimeout(900);
  check(await page.locator('[data-route-curtain]').getAttribute('data-route-curtain') === 'idle', 'Route wipe settles ' + label);
  await swipe(page, context, page.locator('[aria-roledescription="carousel"]'));
  check((await page.locator('[aria-label="Gallery position"]').getAttribute('aria-valuenow')) !== '0', 'Gallery swipe ' + label);
  await page.getByRole('button', { name: 'Inspect', exact: false }).tap();
  check(await page.getByRole('button', { name: 'Inspecting', exact: false }).getAttribute('aria-pressed') === 'true', 'Gallery inspection ' + label);

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.locator('.hero-stage').tap();
  await page.waitForTimeout(100);
  check(await page.evaluate(() => window.__audit.gl.some((g) => g.canvas.isConnected && g.canvas.hasAttribute('data-hero-core') && g.uniforms.uPulse > .1)), 'Hero touch impulse ' + label);
  // Use the reserved footer clearance; the bar deliberately hides over links in the page.
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1000);
  const bar = page.locator('[data-mobile-bar]');
  const controls = width < 810 ? bar : page.locator('nav[aria-label="Primary navigation"]');
  if (width < 810) {
    check(await bar.getAttribute('aria-hidden') === 'false', 'Quick-bar visible ' + label);
    const targets = await bar.locator('button,a').evaluateAll((es) => es.map((e) => { const r = e.getBoundingClientRect(); return [r.width, r.height]; }));
    check(targets.every(([w, h]) => w >= 44 && h >= 44), '44px quick-bar targets ' + label, targets);
  }
  await controls.getByRole('button', { name: /Switch to .* theme/ }).filter({ visible: true }).tap();
  await page.waitForTimeout(850);
  check(await page.evaluate(() => window.__audit.transitions) > 0, 'Circular theme transition ' + label);
  await controls.getByRole('button', { name: 'Turn interface sound on', exact: true }).filter({ visible: true }).tap();
  await page.waitForTimeout(100);
  check(await page.evaluate(() => window.__audit.audio.some((a) => a.state === 'running')), 'Touch audio unlock ' + label);
  await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
  await page.waitForTimeout(500);
  if (width < 810) check(await bar.getAttribute('aria-hidden') === 'true', 'Hide controls for menu ' + label);
  await page.getByRole('button', { name: 'Close menu', exact: true }).tap();
  await page.waitForTimeout(500);
  if (width < 810) await bar.getByRole('button', { name: 'Open quick jump', exact: true }).tap();
  else await page.keyboard.press('Control+k');
  await page.waitForTimeout(500);
  check(await page.getByRole('dialog').isVisible(), 'Search open ' + label);
  if (width < 810) check(await bar.getAttribute('aria-hidden') === 'true', 'Hide controls for search ' + label);
  await page.getByRole('combobox').fill('sarafy');
  check(await page.getByRole('listbox').getByRole('link').count() === 1, 'Search filtering ' + label);
  await page.getByRole('button', { name: 'Close search', exact: true }).tap();
  const service = page.getByRole('button', { name: /Open Full-Stack.* details/ });
  await service.tap();
  await page.waitForTimeout(700);
  if (width < 810) check(await bar.getAttribute('aria-hidden') === 'true', 'Hide controls for service dialog ' + label);
  await page.getByRole('button', { name: 'Close', exact: true }).tap();
  const stats = page.locator('[aria-label="Engineering statistics"]');
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  check(await stats.getByText('spec-driven delivery', { exact: false }).isVisible(), 'Touch statistics visible ' + label);
  check(await stats.getByText('core technologies', { exact: false }).isVisible(), 'Touch technology statistic visible ' + label);
  const angle = await stats.evaluate((e) => e.style.getPropertyValue('--rim-angle'));
  await stats.tap();
  await page.waitForTimeout(250);
  check(await stats.evaluate((e) => e.style.getPropertyValue('--rim-angle')) !== angle, 'Touch rim lighting ' + label);
  const card = page.locator('.project-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const rect = await card.boundingBox();
  await card.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 3 });
  await page.waitForTimeout(250);
  const plane = card.locator('[data-image-fx]');
  check(await plane.evaluate((e) => e.style.opacity === '1'), 'Tap ripple renders ' + label);
  await page.waitForTimeout(3000);
  check(await plane.evaluate((e) => e.style.opacity === '0'), 'Tap ripple decays to idle ' + label);
  const shader = page.locator('[data-closing-shader]');
  await shader.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.locator('[role="slider"][aria-label="Distortion"]').tap({ position: { x: 85, y: 22 } });
  check(await page.getByRole('button', { name: 'Reset shader' }).isEnabled(), 'Touch shader controls ' + label);
  await page.getByRole('button', { name: 'Reset shader' }).tap();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1000);
  const back = width < 810 ? bar.getByRole('button', { name: 'Back to top' }) : page.locator('[aria-label="Quick navigation"]').getByRole('button', { name: 'Back to top' });
  await back.tap();
  await page.waitForTimeout(1600);
  check(await page.evaluate(() => scrollY < 2), 'Back to top ' + label);

  await page.goto(base + '/contact', { waitUntil: 'networkidle' });
  await page.getByLabel('Name', { exact: true }).fill('Responsive verification');
  if (width < 810) { await page.waitForTimeout(300); check(await bar.getAttribute('aria-hidden') === 'true', 'Hide controls while editing ' + label); }
  check(await page.getByRole('button', { name: 'Submit', exact: true }).isEnabled(), 'Submit remains reachable ' + label);
  report.interactions.push({ width, height, theme, complete: true });
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: hardware ? ['--use-angle=d3d11'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const [width, height] of viewports) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: theme });
      await context.addInitScript(instrument);
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      for (const route of routes) {
        const start = errors.length;
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(route === '/' ? 2000 : 500);
        const snapshots = [];
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += Math.round(height * .65)) {
          await page.evaluate((y) => scrollTo(0, y), y);
          await page.waitForTimeout(380);
          snapshots.push(await geometry(page));
          // Capture real viewport tiles: very tall full-page WebGL captures can repeat stale GPU tiles.
          await page.screenshot({ path: path.join(output, `${width}-${theme}-${route.replaceAll('/', '_')}-${snapshots.length}.png`), scale: 'css' });
        }
        await page.waitForTimeout(1600);
        snapshots.push(await geometry(page));
        await page.screenshot({ path: path.join(output, `${width}-${theme}-${route.replaceAll('/', '_')}-end.png`), scale: 'css' });
        const shaders = await page.evaluate(() => ({ errors: window.__audit.shaderErrors, entries: window.__audit.gl.filter((x) => x.canvas.isConnected).map((x) => ({ hero: x.canvas.hasAttribute('data-hero-core'), closing: x.canvas.hasAttribute('data-closing-shader'), draws: x.draws, error: x.gl.getError(), dpr: x.canvas.width / x.canvas.clientWidth, lost: x.gl.isContextLost() })) }));
        check(snapshots.every((s) => s.scrollWidth === s.width), 'Horizontal overflow', { width, theme, route, snapshots: snapshots.filter((s) => s.scrollWidth !== s.width) });
        check(snapshots.every((s) => !s.collisions.length), 'Control collision', { width, theme, route, collisions: snapshots.flatMap((s) => s.collisions) });
        check(snapshots.every((s) => !s.textBounds.length), 'Text bounds', { width, theme, route, text: snapshots.flatMap((s) => s.textBounds) });
        check(errors.length === start, 'Browser errors', { width, theme, route, errors: errors.slice(start) });
        check(!shaders.errors.length && shaders.entries.every((s) => !s.error && !s.lost), 'Shader health', { width, theme, route, shaders });
        check(shaders.entries.some((s) => s.closing && s.draws > 0), 'Closing shader rendered', { width, theme, route });
        if (route === '/') check(shaders.entries.some((s) => s.hero && s.draws > 0), 'Hero rendered', { width, theme });
        check(shaders.entries.filter((s) => s.hero || s.closing).every((s) => s.dpr >= .645 && s.dpr <= 1.01), 'Effective shader DPR', { width, theme, route, shaders });
        const broken = await page.locator('img').evaluateAll((es) => es.filter((e) => e.complete && !e.naturalWidth).map((e) => e.src));
        check(!broken.length, 'Broken images', { width, theme, route, broken });
        report.layouts.push({ width, height, theme, route, checkpoints: snapshots.length, shaders });
        console.log(`LAYOUT ${width} ${theme} ${route} (${report.failures.length} findings)`);
        save();
      }
      try { await interactions(page, context, width, height, theme); }
      catch (e) { report.failures.push({ name: 'Interaction exception', details: { width, theme, error: e.message } }); }
      await page.evaluate((theme) => localStorage.setItem('mc-theme', theme), theme);
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForTimeout(4000);
      check(await page.evaluate(() => window.__audit.gl.filter((g) => g.canvas.isConnected && g.canvas.hasAttribute('data-closing-shader')).every((g) => g.draws === 0)), 'Closing offscreen suspension', { width, theme });
      await sampleFrames(page, 'hero', `${width}x${height}`, theme);
      const getHeroDraws = () => page.evaluate(() => window.__audit.gl.find((x) => x.canvas.hasAttribute('data-hero-core'))?.draws || 0);
      await page.locator('[data-closing-shader]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      const heroDraws = await getHeroDraws();
      await sampleFrames(page, 'closing', `${width}x${height}`, theme);
      check(await getHeroDraws() === heroDraws, 'Hero offscreen suspension', { width, theme });
      save();
      console.log(`INTERACTIONS ${width} ${theme} (${report.failures.length} findings)`);
      await context.close();
    }
    for (const [width, height] of viewports) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
      await context.addInitScript(instrument);
      const page = await context.newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const count = () => page.evaluate(() => window.__audit.gl.find((x) => x.canvas.hasAttribute('data-hero-core'))?.draws || 0);
      const before = await count(); await page.waitForTimeout(500);
      check(await count() === before, 'Reduced-motion static hero', { width });
      check(await page.locator('[data-image-fx]').count() === 0, 'Reduced-motion no ripples', { width });
      await page.goto(base + '/works', { waitUntil: 'networkidle' });
      check(await page.getByRole('radio', { name: 'Grid', exact: true }).getAttribute('aria-checked') === 'true', 'Reduced-motion defaults to grid', { width });
      await page.getByRole('radio', { name: 'Snap Deck', exact: true }).tap();
      check(await page.locator('.touch-deck-card').first().evaluate((e) => getComputedStyle(e).transform === 'none'), 'Reduced-motion flat deck', { width });
      report.reducedMotion.push({ width, height, complete: true });
      await context.close();
    }
  } finally { await browser.close(); save(); }
  console.log(JSON.stringify({ layouts: report.layouts.length, interactions: report.interactions.length, failures: report.failures.length, output }));
  if (report.failures.length) process.exitCode = 1;
}
main().catch((error) => { report.failures.push({ name: 'Suite failure', details: error.stack }); save(); console.error(error); process.exitCode = 1; });
