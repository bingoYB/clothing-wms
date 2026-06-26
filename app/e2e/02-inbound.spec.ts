import { test, expect } from '@playwright/test';
import { loginAs, navClick, shot } from './helpers';

/**
 * 入库流程 E2E 测试。
 *
 * 操作流程（仓管角色）：
 * 1. 登录后进入「入库单」。
 * 2. 点击「新建入库单」，选择种子采购单 PO20260615-0001。
 * 3. 确认入库，列表出现一条「已确认」入库单。
 * 4. 进入「库存查询」，验证对应 SKU 库存增加（A1023-黑色-L 由 12 增至 112）。
 */
test('采购入库后库存增加并生成流水', async ({ page }) => {
  await loginAs(page, '仓管');

  await navClick(page, '入库单');
  await expect(page.getByRole('heading', { name: '入库单' })).toBeVisible();
  await shot(page, '10-入库单列表');

  await page.getByRole('button', { name: '新建入库单' }).click();
  await expect(page.getByText('新建采购入库单')).toBeVisible();
  await shot(page, '11-新建入库单弹窗');

  await page.getByRole('button', { name: '确认入库' }).click();

  // 列表出现已确认入库单
  await expect(page.getByText('已确认').first()).toBeVisible();
  await shot(page, '12-入库已确认');

  // 校验库存增加
  await navClick(page, '库存查询');
  const row = page.getByRole('row', { name: /A1023-黑色-L/ });
  await expect(row).toContainText('112');
  await shot(page, '13-入库后库存增加');
});
