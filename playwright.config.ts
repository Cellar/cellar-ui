import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/src/**',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFile: 'test-results/e2e/html' }],
    ['junit', { outputFile: 'test-results/e2e/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    {
      name: 'chromium-mobile-landscape',
      use: { ...devices['Pixel 7 landscape'] },
    },
    { name: 'chromium-mobile-old', use: { ...devices['Pixel 3'] } },
    {
      name: 'chromium-mobile-old-landscape',
      use: { ...devices['Pixel 3 landscape'] },
    },
    { name: 'webkit-mobile', use: { ...devices['iPhone 15 Pro Max'] } },
    {
      name: 'webkit-mobile-landscape',
      use: { ...devices['iPhone 15 Pro Max landscape'] },
    },
    { name: 'webkit-mobile-old', use: { ...devices['iPhone X'] } },
    {
      name: 'webkit-mobile-old-landscape',
      use: { ...devices['iPhone X landscape'] },
    },
    {
      name: 'figma',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1194, height: 834 },
      },
    },
    {
      name: 'figma-mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'figma-mobile-tiny',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 350, height: 852 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
