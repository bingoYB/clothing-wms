import { store } from './store';
import { getStockQty, isLowStock } from './inventoryService';
import { toSkuView, type SkuView } from './productService';
import { getSupplierName } from './supplierService';

/**
 * 库存预警服务。
 *
 * 对应 PRD 5.6 库存预警：当前库存 ≤ 预警值即触发预警。
 */

/** 预警项：SKU 视图 + 当前库存 + 默认供应商 + 最近入库时间 */
export interface AlertItem extends SkuView {
  currentQty: number;
  supplierName: string;
  lastInboundAt?: string;
}

/** 返回全部低库存 SKU 预警列表 */
export function listAlerts(): AlertItem[] {
  return store.skus
    .filter((sku) => sku.status === 'active')
    .map((sku) => {
      const currentQty = getStockQty(sku.id);
      const view = toSkuView(sku);
      const product = store.products.find((p) => p.id === sku.productId);
      const stock = store.stocks.find((s) => s.skuId === sku.id);
      return {
        ...view,
        currentQty,
        supplierName: getSupplierName(product?.defaultSupplierId),
        lastInboundAt: stock?.lastInboundAt,
      };
    })
    .filter((item) => isLowStock(item, item.currentQty));
}
