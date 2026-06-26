import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '@/services/store';
import { getStockQty } from '@/services/inventoryService';
import { confirmInbound, createInbound } from '@/services/inboundService';
import { listReconciliations } from '@/services/reconciliationService';
import { getPurchase } from '@/services/purchaseService';

/**
 * 入库服务单元测试。
 * 验证：确认入库增加库存、回写采购单进度、生成对账记录。
 */
describe('inboundService', () => {
  beforeEach(() => store.reset());

  it('确认采购入库后库存增加且采购单进度更新', () => {
    const po = getPurchase('po_1')!; // sku_2 采购 100，sku_3 采购 80
    const before2 = getStockQty('sku_2');

    const inbound = createInbound({
      type: 'purchase',
      purchaseOrderId: po.id,
      supplierId: po.supplierId,
      operator: '李仓管',
      items: [
        { skuId: 'sku_2', purchaseQty: 100, receivedQty: 100 },
        { skuId: 'sku_3', purchaseQty: 80, receivedQty: 80 },
      ],
    });
    confirmInbound(inbound.id, '李仓管');

    expect(getStockQty('sku_2')).toBe(before2 + 100);
    const updated = getPurchase('po_1')!;
    expect(updated.status).toBe('completed');
    expect(updated.items.find((i) => i.skuId === 'sku_2')!.inboundQty).toBe(100);
  });

  it('采购入库生成对账记录，应付按实收数量计算', () => {
    const po = getPurchase('po_1')!;
    const inbound = createInbound({
      type: 'purchase',
      purchaseOrderId: po.id,
      supplierId: po.supplierId,
      operator: '李仓管',
      items: [{ skuId: 'sku_2', purchaseQty: 100, receivedQty: 90 }],
    });
    confirmInbound(inbound.id, '李仓管');

    const recs = listReconciliations();
    expect(recs.length).toBeGreaterThan(0);
    const rec = recs.find((r) => r.skuId === 'sku_2')!;
    expect(rec.receivedQty).toBe(90);
    expect(rec.receivedQty * rec.price).toBe(90 * 45);
  });

  it('部分入库时采购单状态为 partial', () => {
    const po = getPurchase('po_1')!;
    const inbound = createInbound({
      type: 'purchase',
      purchaseOrderId: po.id,
      operator: '李仓管',
      items: [{ skuId: 'sku_2', purchaseQty: 100, receivedQty: 50 }],
    });
    confirmInbound(inbound.id, '李仓管');
    expect(getPurchase('po_1')!.status).toBe('partial');
  });
});
