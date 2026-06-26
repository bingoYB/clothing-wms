import { store } from './store';
import type { PurchaseItem, PurchaseOrder } from '@/types';
import { makeDocNo, uid } from '@/utils/id';

/**
 * 采购单服务。
 *
 * 对应 PRD 5.2 采购流程：采购单不直接影响库存，只作为入库与对账依据。
 */

/** 全部采购单（新单在前） */
export function listPurchase(): PurchaseOrder[] {
  return [...store.purchaseOrders].reverse();
}

/** 按 id 取采购单 */
export function getPurchase(id: string): PurchaseOrder | undefined {
  return store.purchaseOrders.find((p) => p.id === id);
}

/** 仅返回可用于入库的采购单（已提交 / 部分入库） */
export function listInboundablePurchase(): PurchaseOrder[] {
  return store.purchaseOrders.filter(
    (p) => p.status === 'submitted' || p.status === 'partial',
  );
}

/** 创建采购单（默认草稿状态） */
export function createPurchase(params: {
  supplierId: string;
  purchaseDate: string;
  expectedDate?: string;
  creator: string;
  items: PurchaseItem[];
  remark?: string;
}): PurchaseOrder {
  const order: PurchaseOrder = {
    id: uid('po'),
    code: makeDocNo('PO', store.nextSeq('purchase')),
    supplierId: params.supplierId,
    purchaseDate: params.purchaseDate,
    expectedDate: params.expectedDate,
    creator: params.creator,
    status: 'draft',
    remark: params.remark,
    items: params.items,
  };
  store.purchaseOrders.push(order);
  return order;
}

/** 提交采购单（草稿 -> 已提交） */
export function submitPurchase(id: string): PurchaseOrder {
  const po = getPurchase(id);
  if (!po) throw new Error('采购单不存在');
  if (po.status !== 'draft') throw new Error('仅草稿可提交');
  po.status = 'submitted';
  return po;
}

/**
 * 取消采购单。
 * @throws 已有入库记录的采购单不可取消
 */
export function cancelPurchase(id: string): PurchaseOrder {
  const po = getPurchase(id);
  if (!po) throw new Error('采购单不存在');
  if (po.items.some((i) => i.inboundQty > 0)) {
    throw new Error('已有入库记录的采购单不可取消');
  }
  po.status = 'cancelled';
  return po;
}

/** 采购单小计金额 */
export function purchaseTotal(po: PurchaseOrder): number {
  return po.items.reduce((sum, i) => sum + i.qty * i.price, 0);
}
