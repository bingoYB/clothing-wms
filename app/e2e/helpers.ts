import { type Page, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/** 截图输出目录 */
export const SHOT_DIR = path.resolve(process.cwd(), 'e2e-report/screenshots');

/** 确保截图目录存在 */
export function ensureShotDir(): void {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
}

/**
 * 执行一个测试步骤并截图归档。
 * @param page Playwright 页面
 * @param name 步骤文件名（不含扩展名），建议形如 `01-登录页`
 */
export async function shot(page: Page, name: string): Promise<void> {
  ensureShotDir();
  await page.screenshot({
    path: path.join(SHOT_DIR, `${name}.png`),
    fullPage: true,
    // 将 CSS 动画冻结到最终态，避免截到入场动画中间帧
    animations: 'disabled',
  });
}

/**
 * 通过演示账号登录。
 * @param role 角色显示名按钮文案
 */
export async function loginAs(
  page: Page,
  role: '老板/管理员' | '仓管' | '采购' | '财务',
): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: role, exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
}

/**
 * 点击侧边栏导航菜单。
 *
 * 侧边栏链接的可访问名称带有 emoji 前缀（如「📥 入库单」），
 * 且首页卡片也含相同文字，故将定位范围限定在 navigation 地标内并用子串匹配。
 * @param label 菜单中文（不含 emoji）
 */
export async function navClick(page: Page, label: string): Promise<void> {
  await page.getByRole('navigation').getByRole('link', { name: label }).click();
}
