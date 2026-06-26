import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '@/services/store';
import { getStockQty } from '@/services/inventoryService';
import {
  checkStockEnough,
  confirmOutbound,
  createOutbound,
} from '@/services/outboundService';

/**
 * 出库服务单元测试。
 * 验证：草稿不影响库存、库存校验、确认出库减少库存。
 */
describe('outboundService', () => {
  beforeEach(() => store.reset());

  it('创建草稿不影响库存', () => {
    const before = getStockQty('sku_1');
    createOutbound({
      type: 'sale',
      operator: '李仓管',
      items: [{ skuId: 'sku_1', qty: 5 }],
    });
    expect(getStockQty('sku_1')).toBe(before);
  });

  it('确认出库后库存减少', () => {
    const before = getStockQty('sku_1');
    const order = createOutbound({
      type: 'sale',
      operator: '李仓管',
      items: [{ skuId: 'sku_1', qty: 5 }],
    });
    confirmOutbound(order.id, '李仓管');
    expect(getStockQty('sku_1')).toBe(before - 5);
  });

  it('库存不足时禁止确认出库', () => {
    const order = createOutbound({
      type: 'sale',
      operator: '李仓管',
      items: [{ skuId: 'sku_1', qty: 999999 }],
    });
    expect(() => confirmOutbound(order.id, '李仓管')).toThrow(/库存不足/);
  });

  it('checkStockEnough 返回库存不足的 skuId', () => {
    const shortage = checkStockEnough([{ skuId: 'sku_1', qty: 999999 }]);
    expect(shortage).toContain('sku_1');
  });
});
