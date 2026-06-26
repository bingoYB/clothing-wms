import type {
  AttributeDef,
  InboundOrder,
  OutboundOrder,
  Product,
  PurchaseOrder,
  ReconciliationRecord,
  Sku,
  Stock,
  StockLedger,
  StocktakingOrder,
  Supplier,
  User,
} from '@/types';
import * as seed from '@/data/seed';

/**
 * 内存数据仓库（单例）。
 *
 * 作为前端的"数据库"，集中持有所有领域集合。
 * 设计要点：
 * - 单一职责：只负责数据持有与初始化，不含业务规则（业务规则在各 service）。
 * - 可重置：`reset()` 便于单元测试隔离。
 */
class DataStore {
  users: User[] = [];
  suppliers: Supplier[] = [];
  attributeDefs: AttributeDef[] = [];
  products: Product[] = [];
  skus: Sku[] = [];
  stocks: Stock[] = [];
  stockLedgers: StockLedger[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  inboundOrders: InboundOrder[] = [];
  outboundOrders: OutboundOrder[] = [];
  stocktakingOrders: StocktakingOrder[] = [];
  reconciliations: ReconciliationRecord[] = [];

  /** 单号自增序列 */
  seq: Record<string, number> = {};

  constructor() {
    this.reset();
  }

  /** 重置为初始种子数据（深拷贝，避免污染种子源） */
  reset(): void {
    const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
    this.users = clone(seed.seedUsers);
    this.suppliers = clone(seed.seedSuppliers);
    this.attributeDefs = clone(seed.seedAttributeDefs);
    this.products = clone(seed.seedProducts);
    this.skus = clone(seed.seedSkus);
    this.stocks = clone(seed.seedStocks);
    this.stockLedgers = clone(seed.seedStockLedgers);
    this.purchaseOrders = clone(seed.seedPurchaseOrders);
    this.inboundOrders = clone(seed.seedInboundOrders);
    this.outboundOrders = clone(seed.seedOutboundOrders);
    this.stocktakingOrders = clone(seed.seedStocktakingOrders);
    this.reconciliations = clone(seed.seedReconciliations);
    this.seq = {};
  }

  /** 取下一个单号序列值 */
  nextSeq(key: string): number {
    this.seq[key] = (this.seq[key] ?? 0) + 1;
    return this.seq[key];
  }
}

/** 全局单例数据仓库 */
export const store = new DataStore();
