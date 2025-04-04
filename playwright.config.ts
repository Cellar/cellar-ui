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
    use: { ...devices['Desktop Safari'] },
    reporter: getReporter('webkit-desktop'),
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
    use: { ...devices['iPhone 15 Pro Max'] },
    reporter: getReporter('webkit-mobile'),
  },
  {
    name: 'webkit-mobile-landscape',
    use: { ...devices['iPhone 15 Pro Max landscape'] },
    reporter: getReporter('webkit-mobile-landscape'),
  },
  {
    name: 'webkit-mobile-old',
    use: { ...devices['iPhone X'] },
    reporter: getReporter('webkit-mobile-old'),
  },
  {
    name: 'webkit-mobile-old-landscape',
    use: { ...devices['iPhone X landscape'] },
    reporter: getReporter('webkit-mobile-old-landscape'),
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
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
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
