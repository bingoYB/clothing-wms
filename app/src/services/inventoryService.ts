import { store } from './store';
import type { Sku, Stock, StockChangeType, StockLedger } from '@/types';
import { uid } from '@/utils/id';

/**
 * 库存服务。
 *
 * 这是整个系统最关键的服务：所有库存变化必须经过这里，且必须生成不可变流水。
 * 对应 PRD 第 10 章关键业务规则：
 * - 库存只能通过入库/出库/盘点/调整变化。
 * - 每次变化必须留痕（生成 StockLedger）。
 */

/** 获取指定 SKU 的当前库存数量（不存在则视为 0） */
export function getStockQty(skuId: string): number {
  return store.stocks.find((s) => s.skuId === skuId)?.qty ?? 0;
}

/** 获取或创建 SKU 的库存记录 */
function ensureStock(skuId: string): Stock {
  let stock = store.stocks.find((s) => s.skuId === skuId);
  if (!stock) {
    stock = { skuId, qty: 0 };
    store.stocks.push(stock);
  }
  return stock;
}

/**
 * 应用一次库存变化，并生成库存流水。
 * 这是唯一允许改动库存数量的入口。
 *
 * @returns 生成的库存流水
 * @throws 当出库导致库存为负时抛错（禁止超卖）
 */
export function applyStockChange(params: {
  skuId: string;
  changeType: StockChangeType;
  changeQty: number; // 正数增加，负数减少
  sourceType: string;
  sourceId: string;
  operator: string;
  remark?: string;
}): StockLedger {
  const stock = ensureStock(params.skuId);
  const before = stock.qty;
  const after = before + params.changeQty;

  if (after < 0) {
    throw new Error(`库存不足：当前 ${before}，本次变化 ${params.changeQty}`);
  }

  stock.qty = after;
  const now = new Date().toISOString();
  if (params.changeQty > 0) stock.lastInboundAt = now;
  if (params.changeQty < 0) stock.lastOutboundAt = now;

  const ledger: StockLedger = {
    id: uid('led'),
    skuId: params.skuId,
    changeType: params.changeType,
    beforeQty: before,
    changeQty: params.changeQty,
    afterQty: after,
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    operator: params.operator,
    operatedAt: now,
    remark: params.remark,
  };
  store.stockLedgers.push(ledger);
  return ledger;
}

/** 查询某 SKU 的库存流水（按时间倒序） */
export function getLedgersBySku(skuId: string): StockLedger[] {
  return store.stockLedgers
    .filter((l) => l.skuId === skuId)
    .sort((a, b) => b.operatedAt.localeCompare(a.operatedAt));
}

/** 库存状态判定 */
export function getStockStatus(sku: Sku, qty: number): 'normal' | 'low' | 'empty' {
  if (qty <= 0) return 'empty';
  if (qty <= sku.alertQty) return 'low';
  return 'normal';
}

/** 是否低库存（当前库存 <= 预警值） */
export function isLowStock(sku: Sku, qty: number): boolean {
  return qty <= sku.alertQty;
}
