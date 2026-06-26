import { store } from './store';
import type { ReconciliationRecord } from '@/types';

/**
 * 供应商对账服务。
 *
 * 对应 PRD 5.8 对账流程：应付金额 = 实收数量 × 采购单价（以实际入库为准）。
 */

/** 全部对账记录 */
export function listReconciliations(): ReconciliationRecord[] {
  return store.reconciliations;
}

/** 按供应商筛选对账记录 */
export function listBySupplier(supplierId: string): ReconciliationRecord[] {
  return store.reconciliations.filter((r) => r.supplierId === supplierId);
}

/** 单条记录应付金额 */
export function payable(record: ReconciliationRecord): number {
  return record.receivedQty * record.price;
}

/** 确认对账（未对账 -> 已对账） */
export function confirmReconciliation(id: string): ReconciliationRecord {
  const record = store.reconciliations.find((r) => r.id === id);
  if (!record) throw new Error('对账记录不存在');
  record.status = 'reconciled';
  record.reconciledAt = new Date().toISOString();
  return record;
}
