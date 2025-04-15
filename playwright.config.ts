import { defineConfig, devices } from '@playwright/test';

function getReporter(browserName: string): [string, object] {
  return [
    'junit',
    {
      outputFile: process.env.CI
        ? `junit-${browserName}.xml`
        : `test-results/e2e/junit-${browserName}.xml`,
      testSuiteTitle: `${browserName} Tests`,
      suiteNameFormat: `[${browserName}] {suite}`,
      testCaseNameFormat: `[${browserName}] {title}`,
    },
  ];
}

const projects = [
  {
    name: 'chromium-desktop',
    use: { ...devices['Desktop Chrome'] },
    reporter: getReporter('chromium-desktop'),
  },
  {
    name: 'firefox-desktop',
    use: { ...devices['Desktop Firefox'] },
    reporter: getReporter('firefox-desktop'),
  },
  {
    name: 'webkit-desktop',
    use: {
      ...devices['Desktop Safari'],
      launchOptions: {
        // Increase timeout for webkit
        timeout: process.env.CI ? 60000 : 30000,
      },
      // Add additional timeouts for WebKit
      navigationTimeout: 30000,
      actionTimeout: 15000,
      // WebKit specific settings for better security handling
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
      bypassCSP: true,
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      storageState: {
        cookies: [],
        origins: [],
      },
    },
    reporter: getReporter('webkit-desktop'),
    retries: process.env.CI ? 3 : 0, // More retries for webkit in CI
  },
  {
    name: 'chromium-mobile',
    use: { ...devices['Pixel 7'] },
    reporter: getReporter('chromium-mobile'),
  },
  {
    name: 'chromium-mobile-landscape',
    use: { ...devices['Pixel 7 landscape'] },
    reporter: getReporter('chromium-mobile-landscape'),
  },
  {
    name: 'chromium-mobile-old',
    use: { ...devices['Pixel 3'] },
    reporter: getReporter('chromium-mobile-old'),
  },
  {
    name: 'chromium-mobile-old-landscape',
    use: { ...devices['Pixel 3 landscape'] },
    reporter: getReporter('chromium-mobile-old-landscape'),
  },
  {
    name: 'webkit-mobile',
    use: {
      ...devices['iPhone 15 Pro Max'],
      launchOptions: {
        timeout: process.env.CI ? 60000 : 30000,
      },
    },
    reporter: getReporter('webkit-mobile'),
    retries: process.env.CI ? 3 : 0,
  },
  {
    name: 'webkit-mobile-landscape',
    use: {
      ...devices['iPhone 15 Pro Max landscape'],
      launchOptions: {
        timeout: process.env.CI ? 60000 : 30000,
      },
    },
    reporter: getReporter('webkit-mobile-landscape'),
    retries: process.env.CI ? 3 : 0,
  },
  {
    name: 'webkit-mobile-old',
    use: {
      ...devices['iPhone X'],
      launchOptions: {
        timeout: process.env.CI ? 60000 : 30000,
      },
    },
    reporter: getReporter('webkit-mobile-old'),
    retries: process.env.CI ? 3 : 0,
  },
  {
    name: 'webkit-mobile-old-landscape',
    use: {
      ...devices['iPhone X landscape'],
      launchOptions: {
        timeout: process.env.CI ? 60000 : 30000,
      },
    },
    reporter: getReporter('webkit-mobile-old-landscape'),
    retries: process.env.CI ? 3 : 0,
  },
  {
    name: 'figma',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1194, height: 834 },
    },
    reporter: getReporter('figma'),
  },
  {
    name: 'figma-mobile',
    use: {
      ...devices['Pixel 7'],
      viewport: { width: 393, height: 852 },
    },
    reporter: getReporter('figma-mobile'),
  },
  {
    name: 'figma-mobile-tiny',
    use: {
      ...devices['Pixel 7'],
      viewport: { width: 350, height: 852 },
    },
    reporter: getReporter('figma-mobile-tiny'),
  },
];

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/src/**',
  testMatch: '**/*.spec.ts',
  outputDir: 'test-results/e2e',
  snapshotDir: './tests/e2e/snapshots',
  timeout: process.env.CI ? 60000 : 30000, // Longer timeout in CI
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined, // Reduce parallel workers in CI to avoid resource contention
  use: {
    // When running in Docker, we'll be accessing the UI on localhost
    // since the UI and tests will be in the same container
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [['list'], ...projects.map((project) => project.reporter)],
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    ...projects,
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
