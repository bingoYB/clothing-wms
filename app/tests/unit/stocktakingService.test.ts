import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '@/services/store';
import { getStockQty } from '@/services/inventoryService';
import {
  confirmStocktaking,
  createStocktaking,
  submitStocktaking,
} from '@/services/stocktakingService';

/**
 * 盘点服务单元测试。
 * 验证：提交盘点不改库存，管理员确认后按差异调整库存。
 */
describe('stocktakingService', () => {
  beforeEach(() => store.reset());

  it('提交盘点不影响库存，确认后按差异调整', () => {
    const before = getStockQty('sku_1'); // 50
    const order = createStocktaking({
      scope: '全仓盘点',
      creator: '李仓管',
      counter: '李仓管',
      skuIds: ['sku_1'],
    });

    // 实盘 45，差异 -5
    submitStocktaking(order.id, { sku_1: 45 });
    expect(getStockQty('sku_1')).toBe(before); // 确认前不变
    expect(order.status).toBe('pending');

    confirmStocktaking(order.id, '王老板');
    expect(getStockQty('sku_1')).toBe(45);
    expect(order.status).toBe('completed');
  });

  it('未到待确认状态不可确认', () => {
    const order = createStocktaking({
      scope: '全仓盘点',
      creator: '李仓管',
      counter: '李仓管',
      skuIds: ['sku_1'],
    });
    expect(() => confirmStocktaking(order.id, '王老板')).toThrow(/待确认/);
  });
});
