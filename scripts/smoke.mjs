import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const port = 4173;
const url = value('url', `http://localhost:${port}/`);
const mobile = flag('mobile');
const result = {
  ok: false,
  url,
  mobile,
  errors: [],
  shot: `.smoke/${mobile ? 'mobile' : 'desktop'}.png`,
};

const executablePath = process.env.CHROMIUM_PATH || chromium.executablePath();

if (!existsSync(executablePath)) {
  if (process.env.CI) {
    console.log(JSON.stringify({ ...result, errors: ['chromium not installed'] }));
    process.exit(1);
  }
  console.log(
    JSON.stringify({
      ok: true,
      skipped: 'chromium not installed (npx playwright install chromium)',
    }),
  );
  process.exit(0);
}

let server;
const waitForServer = async () => {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error(`server not reachable at ${url}`);
};

const browser = await chromium.launch({
  executablePath,
  args: process.env.CHROMIUM_PATH ? ['--no-sandbox', '--no-zygote', '--single-process'] : [],
});
try {
  if (!flag('url')) {
    if (!existsSync('dist/index.html')) throw new Error('dist missing: run npm run build first');
    server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
      stdio: 'ignore',
      detached: true,
    });
    await waitForServer();
  }
  const page = await browser.newPage(
    mobile
      ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }
      : { viewport: { width: 1280, height: 800 } },
  );
  page.on('pageerror', (e) => result.errors.push(`pageerror: ${e.message.split('\n')[0]}`));
  page.on(
    'console',
    (m) => m.type() === 'error' && result.errors.push(`console: ${m.text().split('\n')[0]}`),
  );

  await page.goto(url);
  await page.waitForSelector('.Day-Today', { timeout: 5000 });
  await page.click('.Day-Today');
  const selected = await page.locator('.Day-Selected').count();
  if (selected < 1) result.errors.push('clicking today did not select it');
  result.selected = selected;

  if (!mobile) {
    const today = Number(await page.getAttribute('.Day-Today', 'data-ord'));
    const box = async (ord) => (await page.locator(`[data-ord="${ord}"]`).boundingBox()) ?? {};
    const a = await box(today + 1);
    const b = await box(today + 9);
    await page.mouse.move(a.x + 5, a.y + 5);
    await page.mouse.down();
    await page.mouse.move(b.x + 5, b.y + 5, { steps: 8 });
    result.preview = await page.locator('.Day-InRange').count();
    await page.mouse.up();
    result.dragged = (await page.locator('.Day-Selected').count()) - selected;
    if (result.dragged !== 9) result.errors.push(`drag selected ${result.dragged} days, want 9`);
  }

  mkdirSync('.smoke', { recursive: true });
  await page.screenshot({ path: result.shot });
  result.ok = result.errors.length === 0;
} catch (e) {
  result.errors.push(String(e.message ?? e).split('\n')[0]);
} finally {
  await browser.close();
  if (server) process.kill(-server.pid);
}
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);
