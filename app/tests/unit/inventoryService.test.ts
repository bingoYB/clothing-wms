import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '@/services/store';
import {
  applyStockChange,
  getLedgersBySku,
  getStockQty,
  getStockStatus,
  isLowStock,
} from '@/services/inventoryService';
import { getSku } from '@/services/productService';

/**
 * 库存服务单元测试。
 * 验证 PRD 关键规则：库存变化留痕、禁止负库存。
 */
describe('inventoryService', () => {
  beforeEach(() => store.reset());

  it('增加库存后数量正确并生成流水', () => {
    const before = getStockQty('sku_1');
    const ledger = applyStockChange({
      skuId: 'sku_1',
      changeType: 'inbound',
      changeQty: 10,
      sourceType: '入库单',
      sourceId: 'test',
      operator: '测试',
    });
    expect(getStockQty('sku_1')).toBe(before + 10);
    expect(ledger.beforeQty).toBe(before);
    expect(ledger.afterQty).toBe(before + 10);
    expect(getLedgersBySku('sku_1')[0].id).toBe(ledger.id);
  });

  it('减少库存导致负数时抛错（禁止超卖）', () => {
    expect(() =>
      applyStockChange({
        skuId: 'sku_1',
        changeType: 'outbound',
        changeQty: -99999,
        sourceType: '出库单',
        sourceId: 'test',
        operator: '测试',
      }),
    ).toThrow(/库存不足/);
  });

  it('库存状态判定：正常 / 低库存 / 无库存', () => {
    const sku = getSku('sku_1')!; // alertQty = 20
    expect(getStockStatus(sku, 50)).toBe('normal');
    expect(getStockStatus(sku, 20)).toBe('low');
    expect(getStockStatus(sku, 0)).toBe('empty');
    expect(isLowStock(sku, 20)).toBe(true);
    expect(isLowStock(sku, 21)).toBe(false);
  });
});
