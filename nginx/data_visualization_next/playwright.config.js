import { defineConfig, devices } from '@playwright/test';

// Parity tests compare the modernized (Vite/React 19) dashboard against the old
// (CRA/React 17) one, running side by side. Point them at the two deployments:
//   NEW_URL  – the modernized app  (default: Vite dev server at :3001/view)
//   OLD_URL  – the legacy app      (default: docker nginx at :8080/view)
// Example:  NEW_URL=http://localhost:3001/view OLD_URL=http://localhost:8080/view npm run test:e2e
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  use: {
    headless: true,
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
