import { describe, expect, it } from 'vitest';
import { hasPermission, ROLE_PERMISSIONS } from '@/auth/permissions';

/**
 * 权限矩阵单元测试。
 * 对照 PRD 第 8 章权限矩阵的关键约束。
 */
describe('permissions', () => {
  it('仓管不可查看成本价、不可管理用户', () => {
    expect(hasPermission('warehouse', 'inventory.cost.view')).toBe(false);
    expect(hasPermission('warehouse', 'user.manage')).toBe(false);
  });

  it('采购不可确认入库、不可调整库存（无该权限）', () => {
    expect(hasPermission('purchaser', 'inbound.confirm')).toBe(false);
    expect(hasPermission('purchaser', 'stocktaking.confirm')).toBe(false);
  });

  it('财务可确认对账，不可录入盘点', () => {
    expect(hasPermission('finance', 'reconciliation.confirm')).toBe(true);
    expect(hasPermission('finance', 'stocktaking.input')).toBe(false);
  });

  it('管理员拥有全部权限', () => {
    const allPerms = new Set(Object.values(ROLE_PERMISSIONS).flat());
    for (const perm of allPerms) {
      expect(hasPermission('admin', perm)).toBe(true);
    }
  });
});
