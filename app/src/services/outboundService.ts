import { store } from './store';
import { applyStockChange, getStockQty } from './inventoryService';
import type { OutboundItem, OutboundOrder, OutboundType } from '@/types';
import { makeDocNo, uid } from '@/utils/id';

/**
 * 出库服务。
 *
 * 对应 PRD 5.4 出库流程与关键规则：
 * - 出库确认前不影响库存。
 * - 库存不足时禁止确认出库（防止超卖）。
 * - 出库确认后库存减少并生成流水。
 */

/** 全部出库单（新单在前） */
export function listOutbound(): OutboundOrder[] {
  return [...store.outboundOrders].reverse();
}

/** 按 id 取出库单 */
export function getOutbound(id: string): OutboundOrder | undefined {
  return store.outboundOrders.find((o) => o.id === id);
}

/** 创建出库单草稿 */
export function createOutbound(params: {
  type: OutboundType;
  customer?: string;
  operator: string;
  items: OutboundItem[];
  remark?: string;
}): OutboundOrder {
  const order: OutboundOrder = {
    id: uid('out'),
    code: makeDocNo('OUT', store.nextSeq('outbound')),
    type: params.type,
    customer: params.customer,
    operator: params.operator,
    status: 'draft',
    remark: params.remark,
    items: params.items,
  };
  store.outboundOrders.push(order);
  return order;
}

/**
 * 校验出库单库存是否充足。
 * @returns 库存不足的 skuId 列表（空数组表示充足）
 */
export function checkStockEnough(items: OutboundItem[]): string[] {
  return items
    .filter((item) => item.qty > getStockQty(item.skuId))
    .map((item) => item.skuId);
}

/**
 * 确认出库：校验库存 -> 减少库存 -> 生成流水。
 * @throws 当库存不足或单据非草稿时抛错
 */
export function confirmOutbound(id: string, operator: string): OutboundOrder {
  const order = getOutbound(id);
  if (!order) throw new Error('出库单不存在');
  if (order.status !== 'draft') throw new Error('仅草稿状态的出库单可确认');

  const shortage = checkStockEnough(order.items);
  if (shortage.length > 0) {
    throw new Error(`库存不足，无法出库：${shortage.join(', ')}`);
  }

  for (const item of order.items) {
    if (item.qty <= 0) continue;
    applyStockChange({
      skuId: item.skuId,
      changeType: 'outbound',
      changeQty: -item.qty,
      sourceType: '出库单',
      sourceId: order.id,
      operator,
      remark: order.code,
    });
  }

  order.status = 'confirmed';
  order.outboundAt = new Date().toISOString();
  order.operator = operator;
  return order;
}
