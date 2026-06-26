import { test, expect } from '@playwright/test';
import { loginAs, navClick, shot } from './helpers';

/**
 * 盘点流程 E2E 测试。
 *
 * 操作流程（管理员角色，可录入也可确认）：
 * 1. 进入「盘点」，新建全仓盘点。
 * 2. 录入实盘数量（将 A1023-黑色-M 实盘改为 45），提交盘点。
 * 3. 管理员确认并调整库存。
 * 4. 进入「库存查询」验证库存按差异调整为 45。
 */
test('盘点确认后按差异调整库存', async ({ page }) => {
  await loginAs(page, '老板/管理员');

  await navClick(page, '盘点');
  await page.getByRole('button', { name: '新建全仓盘点' }).click();
  await expect(page.getByRole('cell', { name: '全仓盘点' })).toBeVisible();
  await shot(page, '30-盘点单列表');

  // 录入实盘
  await page.getByRole('button', { name: '录入实盘' }).click();
  await page.getByLabel('实盘-A1023-黑色-M').fill('45');
  await shot(page, '31-录入实盘数量');
  await page.getByRole('button', { name: '提交盘点' }).click();

  // 重新打开并确认
  await page.getByRole('button', { name: '查看' }).click();
  await expect(page.getByRole('button', { name: '确认并调整库存' })).toBeVisible();
  await shot(page, '32-待确认盘点');
  await page.getByRole('button', { name: '确认并调整库存' }).click();

  // 校验库存调整
  await navClick(page, '库存查询');
  const row = page.getByRole('row', { name: /A1023-黑色-M/ });
  await expect(row).toContainText('45');
  await shot(page, '33-盘点后库存调整');
});
