import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 配置。
 * - 自动启动 Vite 预览服务（先 build 后 preview，保证稳定）
 * - 生成 HTML 报告到 e2e-report/html
 * - 失败/全程截图保留到 e2e-report/screenshots
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e-report/html', open: 'never' }],
  ],
  outputDir: 'e2e-report/test-results',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
