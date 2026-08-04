import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Trailing slash trimmed so we can append route paths cleanly.
const NEW_URL = (process.env.NEW_URL || 'http://localhost:3001/view').replace(/\/$/, '');
const OLD_URL = (process.env.OLD_URL || 'http://localhost:8080/view').replace(/\/$/, '');

// Public routes that render without an authenticated session. These exercise the
// upgraded surfaces: routing, MUI components/forms, the Navbar, and the
// statistics view (Autocomplete + Grid). Data-heavy routes still render their
// shell without a backend; we assert on structure, not fetched data.
// `redesigned: true` marks a route that has been intentionally restructured away
// from the old layout (e.g. Statistics → dashboard grid). For those we still
// require the new app to render and keep the same title + navigation, but we no
// longer assert heading/button/input equality against the old CRA structure.
const ROUTES = [
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/statistics', name: 'statistics', redesigned: true },
  // EBSW embeds the redesigned StatisticsView, so its structure diverges too.
  { path: '/ebsw', name: 'ebsw', redesigned: true },
  { path: '/', name: 'home' },
];

const SHOTS_DIR = path.join('e2e', 'screenshots');
fs.mkdirSync(SHOTS_DIR, { recursive: true });

// Console messages we don't care about for a parity check: these are caused by a
// missing/unauthenticated backend, not by the migration itself.
const IGNORED_CONSOLE = [
  /Failed to load resource/i,
  /Failed to fetch/i,
  /net::ERR/i,
  /ERR_CONNECTION/i,
  /the server responded with a status of (4\d\d|5\d\d)/i,
  /AxiosError/i,
  /favicon/i,
  /sentry/i,
  /Download the React DevTools/i,
];

// Fatal, migration-relevant errors we must never see in the new app.
const FATAL_CONSOLE = [
  /is not defined/i,
  /Cannot read propert/i,
  /is not a function/i,
  /Minified React error/i,
  /Rendered more hooks/i,
  /Element type is invalid/i,
  /Maximum update depth/i,
  /Objects are not valid as a React child/i,
];

function attachConsoleCollector(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

function fatalErrors(errors) {
  return errors.filter(
    (e) => FATAL_CONSOLE.some((re) => re.test(e)) && !IGNORED_CONSOLE.some((re) => re.test(e)),
  );
}

async function loadRoute(page, baseUrl, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  // Wait for React to mount into #root.
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return root && root.children.length > 0;
  }, { timeout: 45_000 });
  // Let async effects settle (best-effort; ignore if network never idles).
  await page.waitForLoadState('networkidle').catch(() => {});
}

// Snapshot of stable, backend-independent structure used to compare the two apps.
async function structuralSnapshot(page) {
  return page.evaluate(() => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const anchorTexts = Array.from(document.querySelectorAll('a'))
      .map((a) => norm(a.textContent))
      .filter(Boolean);
    return {
      title: document.title,
      // Compare the *user-facing* fields by identity (placeholder/name/type),
      // ignoring hidden/internal inputs — MUI 9's Autocomplete renders a
      // different number of internal inputs than MUI 5, which is not a
      // functional difference.
      inputs: Array.from(document.querySelectorAll('input, textarea'))
        .filter((el) => el.type !== 'hidden' && el.offsetParent !== null)
        .map((el) => norm(el.getAttribute('placeholder') || el.getAttribute('name') || el.getAttribute('type') || 'text'))
        .sort(),
      buttons: Array.from(document.querySelectorAll('button'))
        .map((b) => norm(b.textContent))
        .filter(Boolean)
        .sort(),
      headings: Array.from(document.querySelectorAll('h1,h2,h3,h4'))
        .map((h) => norm(h.textContent))
        .filter(Boolean),
      navLinks: Array.from(new Set(anchorTexts)).sort(),
    };
  });
}

async function isReachable(page, url) {
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8_000 });
    return !!res && res.status() < 500;
  } catch {
    return false;
  }
}

test.describe('new app renders every public route without fatal errors', () => {
  for (const route of ROUTES) {
    test(`new: ${route.name}`, async ({ page }) => {
      const errors = attachConsoleCollector(page);
      await loadRoute(page, NEW_URL, route.path);

      // The app shell mounted.
      const rootChildren = await page.evaluate(
        () => document.getElementById('root')?.children.length ?? 0,
      );
      expect(rootChildren, 'app mounted into #root').toBeGreaterThan(0);

      await page.screenshot({
        path: path.join(SHOTS_DIR, `new-${route.name}.png`),
        fullPage: true,
      });

      const fatal = fatalErrors(errors);
      expect(fatal, `fatal console errors on ${route.path}:\n${fatal.join('\n')}`).toEqual([]);
    });
  }
});

test.describe('parity: old vs new produce the same structure', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const up = await isReachable(page, OLD_URL);
    await page.close();
    test.skip(!up, `OLD_URL not reachable at ${OLD_URL} — start the old stack to run parity checks.`);
  });

  for (const route of ROUTES) {
    test(`parity: ${route.name}`, async ({ page }) => {
      await loadRoute(page, OLD_URL, route.path);
      const oldSnap = await structuralSnapshot(page);
      await page.screenshot({
        path: path.join(SHOTS_DIR, `old-${route.name}.png`),
        fullPage: true,
      });

      await loadRoute(page, NEW_URL, route.path);
      const newSnap = await structuralSnapshot(page);

      // Same page title and the same set of navigation links. Screenshots
      // (old-*.png / new-*.png) are saved alongside for a manual visual diff.
      expect(newSnap.title).toBe(oldSnap.title);
      expect(newSnap.navLinks).toEqual(oldSnap.navLinks);

      if (route.redesigned) {
        // Intentionally restructured page: the old layout is the baseline we're
        // moving away from, so only require that the new page rendered real
        // content rather than matching the old heading/control structure.
        expect(newSnap.headings.length, 'redesigned page rendered headings').toBeGreaterThan(0);
      } else {
        // Same headings and interactive form controls as the old app.
        expect(newSnap.headings).toEqual(oldSnap.headings);
        expect(newSnap.buttons).toEqual(oldSnap.buttons);
        expect(newSnap.inputs).toEqual(oldSnap.inputs);
      }
    });
  }
});
