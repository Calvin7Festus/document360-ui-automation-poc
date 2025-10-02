import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Playwright configuration for Document360 UI Automation Framework
 * Supports both authenticated and non-authenticated test execution
 */
export default defineConfig({
  testDir: './src/tests',
  
  /* Run tests in files in parallel */
  fullyParallel: process.env.FULLY_PARALLEL === 'true',
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: process.env.CI === 'true',
  
  /* Retry on CI only */
  retries: process.env.CI === 'true' ? parseInt(process.env.RETRIES_ON_CI || '2') : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI === 'true' ? parseInt(process.env.WORKERS_ON_CI || '1') : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: process.env.HTML_REPORT_DIR || 'playwright-report' }],
    ['json', { outputFile: process.env.JSON_REPORT_FILE || 'test-results/results.json' }],
    ['junit', { outputFile: process.env.JUNIT_REPORT_FILE || 'test-results/results.xml' }]
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.TRACE_ON_RETRY === 'true' ? 'on-first-retry' : 'off',
    
    /* Take screenshot on failure */
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    
    /* Record video on failure */
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'retain-on-failure' : 'off',
    
    /* Global timeout for each action */
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '30000'),
    
    /* Global timeout for navigation */
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT_GLOBAL || '60000'),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use storage state for authentication
        storageState: process.env.STORAGE_STATE_FILE || 'storageState.json',
        // Browser-specific settings
        launchOptions: {
          args: [
            ...(process.env.BROWSER_DISABLE_WEB_SECURITY === 'true' ? ['--disable-web-security'] : []),
            ...(process.env.BROWSER_DISABLE_VIZ_COMPOSITOR === 'true' ? ['--disable-features=VizDisplayCompositor'] : [])
          ]
        }
      },
    },
    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     // Use storage state for authentication
    //     storageState: 'storageState.json',
    //     // Firefox-specific settings
    //     launchOptions: {
    //       firefoxUserPrefs: {
    //         'dom.webnotifications.enabled': false,
    //         'dom.push.enabled': false
    //       }
    //     }
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //     // Use storage state for authentication
    //     storageState: 'storageState.json',
    //     // WebKit-specific settings
    //     launchOptions: {
    //       args: ['--disable-web-security']
    //     }
    //   },
    // },
    // // {
    // //   name: 'no-auth',
    // //   use: {
    // //     ...devices['Desktop Chrome'],
    // //     // No storage state for tests that don't need authentication
    // //     // This project is for framework validation tests
    // //   },
    // }
  ],

        /* Global setup - only for E2E tests */
        globalSetup: require.resolve('./src/setup/global-setup'),

  /* Test timeout */
  timeout: parseInt(process.env.DEFAULT_TIMEOUT || '300000'), // 5 minutes

  /* Expect timeout */
  expect: {
    timeout: parseInt(process.env.UI_TIMEOUT || '10000'), // 10 seconds
  },

  /* Output directory for test results */
  outputDir: 'test-results/',

  /* Web server configuration for local development */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});