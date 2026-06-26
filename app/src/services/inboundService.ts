import { store } from './store';
import { applyStockChange } from './inventoryService';
import type { InboundItem, InboundOrder, InboundType } from '@/types';
import { makeDocNo, uid } from '@/utils/id';

/**
 * 入库服务。
 *
 * 对应 PRD 5.3 入库流程与关键规则：
 * - 入库确认前不影响库存。
 * - 入库确认后库存增加并生成流水。
 * - 关联采购单时，更新采购单的已入库数量与状态。
 * - 采购入库会生成对账记录。
 */

/** 全部入库单（按创建倒序，新单在前） */
export function listInbound(): InboundOrder[] {
  return [...store.inboundOrders].reverse();
}

/** 按 id 取入库单 */
export function getInbound(id: string): InboundOrder | undefined {
  return store.inboundOrders.find((o) => o.id === id);
}

/** 创建入库单草稿 */
export function createInbound(params: {
  type: InboundType;
  purchaseOrderId?: string;
  supplierId?: string;
  operator: string;
  items: InboundItem[];
  remark?: string;
}): InboundOrder {
  const order: InboundOrder = {
    id: uid('in'),
    code: makeDocNo('IN', store.nextSeq('inbound')),
    type: params.type,
    purchaseOrderId: params.purchaseOrderId,
    supplierId: params.supplierId,
    operator: params.operator,
    status: 'draft',
    remark: params.remark,
    items: params.items,
  };
  store.inboundOrders.push(order);
  return order;
}

/**
 * 确认入库：增加库存、生成流水、回写采购单进度、生成对账记录。
 * @throws 当单据非草稿状态时抛错
 */
export function confirmInbound(id: string, operator: string): InboundOrder {
  const order = getInbound(id);
  if (!order) throw new Error('入库单不存在');
  if (order.status !== 'draft') throw new Error('仅草稿状态的入库单可确认');

  // 1. 逐项增加库存并生成流水
  for (const item of order.items) {
    if (item.receivedQty <= 0) continue;
    applyStockChange({
      skuId: item.skuId,
      changeType: 'inbound',
      changeQty: item.receivedQty,
      sourceType: '入库单',
      sourceId: order.id,
      operator,
      remark: order.code,
    });
  }

  order.status = 'confirmed';
  order.inboundAt = new Date().toISOString();
  order.operator = operator;

  // 2. 回写采购单已入库数量与状态
  if (order.purchaseOrderId) {
    updatePurchaseProgress(order);
  }

  return order;
}

/** 根据入库单回写采购单的已入库数量与状态 */
function updatePurchaseProgress(inbound: InboundOrder): void {
  const po = store.purchaseOrders.find((p) => p.id === inbound.purchaseOrderId);
  if (!po) return;

  for (const inItem of inbound.items) {
    const poItem = po.items.find((i) => i.skuId === inItem.skuId);
    if (poItem) {
      poItem.inboundQty += inItem.receivedQty;
    }
    // 生成对账记录（应付按实收数量 × 采购单价计算）
    if (poItem) {
      store.reconciliations.push({
        id: uid('rec'),
        supplierId: po.supplierId,
        purchaseOrderId: po.id,
        inboundOrderId: inbound.id,
        skuId: inItem.skuId,
        purchaseQty: poItem.qty,
        receivedQty: inItem.receivedQty,
        price: poItem.price,
        status: 'unreconciled',
      });
    }
  }

  const allDone = po.items.every((i) => i.inboundQty >= i.qty);
  const anyDone = po.items.some((i) => i.inboundQty > 0);
  po.status = allDone ? 'completed' : anyDone ? 'partial' : po.status;
}
