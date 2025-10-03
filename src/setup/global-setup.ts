import { chromium } from '@playwright/test';
import fs from 'fs';
import dotenv from 'dotenv';
import { LoginPage } from '../page-factory/pages/login.page';
import { ConfigManager } from '../utils/config/config-manager';

// Load environment variables
dotenv.config();

async function globalSetup() {
  // Get configuration from ConfigManager (which reads from .env)
  const configManager = ConfigManager.getInstance();
  const storageFile = configManager.get<string>('STORAGE_STATE_FILE');
  const dashboardURL = configManager.get<string>('DASHBOARD_URL');
  const username = configManager.get<string>('USERNAME');
  const password = configManager.get<string>('PASSWORD');

  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  // 1. If you have existing storage state, use that
  if (fs.existsSync(storageFile)) {
    try {
      const storageState = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
      await page.context().addCookies(storageState.cookies || []);
      
      await page.goto(dashboardURL, { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/Account/Login')) {
        await performFreshLogin(page, dashboardURL, username, password);
      }
    } catch (error) {
      await performFreshLogin(page, dashboardURL, username, password);
    }
  } else {
    // 3. If storage state itself not available, login
    await performFreshLogin(page, dashboardURL, username, password);
  }

  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
}

async function performFreshLogin(page: any, targetURL: string, username: string, password: string) {
  const configManager = ConfigManager.getInstance();
  const baseURL = configManager.get<string>('API_BASE_URL');
  const dashboardURL = configManager.get<string>('DASHBOARD_URL');
  
  await page.goto(baseURL);
  await page.waitForLoadState('domcontentloaded');
  
  const currentUrl = page.url();
  if (currentUrl.includes('/login') || currentUrl.includes('/Account/Login')) {
    const loginPage = new LoginPage(page);
    // Step 1: Enter username and click login button
    await loginPage.usernameInput.fill(username);
    await loginPage.loginButton.click();
    await page.waitForLoadState('domcontentloaded');
    // Step 2: Enter password and click login button again
    await loginPage.passwordInput.fill(password);
    await loginPage.loginButton.click();
    await page.waitForURL(/portal\.document360\.io/, { timeout: 60000 });
    await page.waitForLoadState('networkidle');
  }
  
  // Navigate to dashboard
  await page.goto(dashboardURL, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });
}

export default globalSetup;