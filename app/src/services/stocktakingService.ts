import { store } from './store';
import { applyStockChange, getStockQty } from './inventoryService';
import { getSku } from './productService';
import type { StocktakingItem, StocktakingOrder } from '@/types';
import { makeDocNo, uid } from '@/utils/id';

/**
 * 盘点服务。
 *
 * 对应 PRD 5.7 盘点流程与关键规则：
 * - 仓管录入实盘数量，但不能自行调整库存。
 * - 管理员确认后，才按差异调整库存并生成流水。
 */

/** 全部盘点单（新单在前） */
export function listStocktaking(): StocktakingOrder[] {
  return [...store.stocktakingOrders].reverse();
}

/** 按 id 取盘点单 */
export function getStocktaking(id: string): StocktakingOrder | undefined {
  return store.stocktakingOrders.find((o) => o.id === id);
}

/**
 * 创建盘点单：根据传入的 SKU 列表自动带出账面库存。
 */
export function createStocktaking(params: {
  scope: string;
  creator: string;
  counter: string;
  skuIds: string[];
  remark?: string;
}): StocktakingOrder {
  const items: StocktakingItem[] = params.skuIds.map((skuId) => ({
    skuId,
    bookQty: getStockQty(skuId),
    actualQty: getStockQty(skuId),
  }));

  const order: StocktakingOrder = {
    id: uid('st'),
    code: makeDocNo('ST', store.nextSeq('stocktaking')),
    scope: params.scope,
    creator: params.creator,
    counter: params.counter,
    status: 'counting',
    createdAt: new Date().toISOString(),
    remark: params.remark,
    items,
  };
  store.stocktakingOrders.push(order);
  return order;
}

/** 录入实盘数量并提交（盘点中 -> 待确认） */
export function submitStocktaking(
  id: string,
  actuals: Record<string, number>,
): StocktakingOrder {
  const order = getStocktaking(id);
  if (!order) throw new Error('盘点单不存在');
  for (const item of order.items) {
    if (actuals[item.skuId] !== undefined) {
      item.actualQty = actuals[item.skuId];
    }
  }
  order.status = 'pending';
  return order;
}

/**
 * 管理员确认盘点：按差异调整库存并生成流水。
 * @throws 当单据非待确认状态时抛错
 */
export function confirmStocktaking(id: string, confirmer: string): StocktakingOrder {
  const order = getStocktaking(id);
  if (!order) throw new Error('盘点单不存在');
  if (order.status !== 'pending') throw new Error('仅待确认状态的盘点单可确认');

  for (const item of order.items) {
    const diff = item.actualQty - item.bookQty;
    if (diff === 0) continue;
    applyStockChange({
      skuId: item.skuId,
      changeType: 'stocktaking',
      changeQty: diff,
      sourceType: '盘点单',
      sourceId: order.id,
      operator: confirmer,
      remark: item.reason ?? order.code,
    });
  }

  order.status = 'completed';
  order.confirmer = confirmer;
  order.confirmedAt = new Date().toISOString();
  return order;
}

/** 计算盘点差异金额（差异数量 × 成本价） */
export function diffAmount(item: StocktakingItem): number {
  const sku = getSku(item.skuId);
  return (item.actualQty - item.bookQty) * (sku?.costPrice ?? 0);
}
