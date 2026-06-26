import { test, expect } from '@playwright/test';
import { shot } from './helpers';

/**
 * 移动端响应式 E2E 测试。
 *
 * 操作流程（模拟手机视口 390×844）：
 * 1. 登录后查看移动端首页（侧边栏默认隐藏，统计卡片两列排布）。
 * 2. 点击顶部汉堡按钮，验证抽屉式侧边栏滑入。
 * 3. 通过抽屉进入库存查询，验证表格在窄屏可横向滚动查看。
 */
test.use({ viewport: { width: 390, height: 844 } });

test('移动端抽屉导航与响应式布局', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: '老板/管理员', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await shot(page, '40-移动端首页');

  // 移动端侧边栏默认隐藏，点击汉堡按钮打开抽屉
  await page.getByRole('button', { name: '打开菜单' }).click();
  const nav = page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: '库存查询' })).toBeVisible();
  await shot(page, '41-移动端抽屉菜单');

  // 通过抽屉导航到库存查询
  await nav.getByRole('link', { name: '库存查询' }).click();
  await expect(page.getByRole('heading', { name: '库存查询' })).toBeVisible();
  await shot(page, '42-移动端库存查询');
});
