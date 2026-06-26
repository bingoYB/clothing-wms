import { test, expect } from '@playwright/test';
import { loginAs, navClick, shot } from './helpers';

/**
 * 出库流程 E2E 测试。
 *
 * 操作流程（仓管角色）：
 * 1. 登录后进入「出库单」。
 * 2. 新建出库单，添加 SKU 并填写客户。
 * 3. 确认出库，验证库存减少（A1023-黑色-M 由 50 减至 40）。
 * 4. 再次验证超卖拦截：出库数量大于库存时报错。
 */
test('确认出库后库存减少', async ({ page }) => {
  await loginAs(page, '仓管');

  await navClick(page, '出库单');
  await page.getByRole('button', { name: '新建出库单' }).click();
  await expect(page.getByText('新建销售出库单')).toBeVisible();

  await page.getByLabel('客户名称').fill('批发客户甲');
  await page.getByLabel('数量', { exact: true }).fill('10');
  await page.getByRole('button', { name: '添加' }).click();
  await shot(page, '20-出库单填写');

  await page.getByRole('button', { name: '确认出库' }).click();
  await expect(page.getByText('已出库').first()).toBeVisible();
  await shot(page, '21-出库已确认');

  await navClick(page, '库存查询');
  const row = page.getByRole('row', { name: /A1023-黑色-M/ });
  await expect(row).toContainText('40');
  await shot(page, '22-出库后库存减少');
});

test('库存不足时禁止出库', async ({ page }) => {
  await loginAs(page, '仓管');
  await navClick(page, '出库单');
  await page.getByRole('button', { name: '新建出库单' }).click();

  await page.getByLabel('数量', { exact: true }).fill('99999');
  await page.getByRole('button', { name: '添加' }).click();
  await page.getByRole('button', { name: '确认出库' }).click();

  await expect(page.getByText(/库存不足/)).toBeVisible();
  await shot(page, '23-超卖被拦截');
});
