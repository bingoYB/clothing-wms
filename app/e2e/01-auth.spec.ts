import { test, expect } from '@playwright/test';
import { loginAs, navClick, shot } from './helpers';

/**
 * 登录与基于角色的权限（RBAC）E2E 测试。
 *
 * 操作流程：
 * 1. 打开登录页。
 * 2. 以「老板/管理员」登录，进入首页。
 * 3. 以「仓管」登录，验证其看不到「采购单」「供应商」菜单，
 *    且库存查询中看不到「成本价」列（PRD 权限矩阵）。
 */
test.describe('登录与权限控制', () => {
  test('管理员登录后进入首页', async ({ page }) => {
    await page.goto('/login');
    await shot(page, '01-登录页');

    await page.getByRole('button', { name: '老板/管理员', exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('以下是当前需要关注的关键事项')).toBeVisible();
    await shot(page, '02-管理员首页');
  });

  test('仓管权限受限：无采购菜单且看不到成本价', async ({ page }) => {
    await loginAs(page, '仓管');
    await shot(page, '03-仓管首页');

    // 侧边栏不应出现「采购单」「供应商」「供应商对账」
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: '采购单' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: '供应商' })).toHaveCount(0);

    // 进入库存查询，成本价列不可见
    await navClick(page, '库存查询');
    await expect(page.getByRole('columnheader', { name: '当前库存' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '成本价' })).toHaveCount(0);
    await shot(page, '04-仓管库存无成本价');
  });

  test('采购可见成本价', async ({ page }) => {
    await loginAs(page, '采购');
    await navClick(page, '库存查询');
    await expect(page.getByRole('columnheader', { name: '成本价' })).toBeVisible();
    await shot(page, '05-采购库存含成本价');
  });
});
