/**
 * 领域模型类型定义。
 *
 * 这是整个前端的"单一数据契约"，所有服务、组件、页面都依赖这里定义的类型。
 * 遵循 SOLID 的依赖倒置原则：上层模块依赖抽象（类型），而非具体实现。
 */

// ============================ 用户与权限 ============================

/** 系统角色 */
export type Role = 'admin' | 'warehouse' | 'purchaser' | 'finance';

/** 角色中文显示名 */
export const ROLE_LABELS: Record<Role, string> = {
  admin: '老板/管理员',
  warehouse: '仓管',
  purchaser: '采购',
  finance: '财务',
};

/** 系统用户 */
export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  status: 'active' | 'disabled';
}

/** 权限编码：用于控制菜单与按钮可见性 */
export type Permission =
  | 'product.view'
  | 'product.edit'
  | 'product.attr.config'
  | 'inventory.view'
  | 'inventory.cost.view'
  | 'inbound.create'
  | 'inbound.confirm'
  | 'outbound.create'
  | 'outbound.confirm'
  | 'purchase.view'
  | 'purchase.edit'
  | 'stocktaking.input'
  | 'stocktaking.confirm'
  | 'supplier.manage'
  | 'reconciliation.view'
  | 'reconciliation.confirm'
  | 'user.manage';

// ============================ 商品与 SKU ============================

/** 商品分类 */
export type ProductCategory = '上衣' | '裤子' | '外套' | '裙装' | '其他';

/** 商品主数据 */
export interface Product {
  id: string;
  code: string; // 商品编号，唯一
  name: string; // 商品名称
  styleNo: string; // 款号
  category: ProductCategory;
  unit: string; // 单位：件/包/箱
  defaultSupplierId?: string;
  image?: string;
  status: 'active' | 'disabled';
  remark?: string;
  /** 自定义扩展属性值，key 为属性定义 id */
  attributes: Record<string, string>;
}

/** SKU（款号 + 颜色 + 尺码） */
export interface Sku {
  id: string;
  productId: string;
  code: string; // SKU 编码，唯一
  color: string;
  size: string;
  barcode?: string;
  costPrice: number; // 成本价
  wholesalePrice: number; // 批发价
  alertQty: number; // 库存预警值
  status: 'active' | 'disabled';
}

/** 商品自定义属性定义 */
export interface AttributeDef {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date';
  required: boolean;
  enabled: boolean;
  filterable: boolean;
  listVisible: boolean;
  options?: string[];
  sort: number;
}

// ============================ 供应商 ============================

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  settlement?: string;
  status: 'active' | 'disabled';
  remark?: string;
}

// ============================ 库存 ============================

/** SKU 当前库存 */
export interface Stock {
  skuId: string;
  qty: number;
  lastInboundAt?: string;
  lastOutboundAt?: string;
}

/** 库存流水变化类型 */
export type StockChangeType = 'inbound' | 'outbound' | 'stocktaking' | 'adjust';

/** 库存流水（不可修改、不可删除） */
export interface StockLedger {
  id: string;
  skuId: string;
  changeType: StockChangeType;
  beforeQty: number;
  changeQty: number; // 正数增加，负数减少
  afterQty: number;
  sourceType: string; // 来源单据类型
  sourceId: string; // 来源单据 id
  operator: string;
  operatedAt: string;
  remark?: string;
}

// ============================ 采购单 ============================

export type PurchaseStatus =
  | 'draft'
  | 'submitted'
  | 'partial'
  | 'completed'
  | 'cancelled';

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  partial: '部分入库',
  completed: '已完成',
  cancelled: '已取消',
};

export interface PurchaseItem {
  skuId: string;
  qty: number; // 采购数量
  price: number; // 采购单价
  inboundQty: number; // 已入库数量
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  purchaseDate: string;
  expectedDate?: string;
  creator: string;
  status: PurchaseStatus;
  remark?: string;
  items: PurchaseItem[];
}

// ============================ 入库单 ============================

export type InboundType = 'purchase' | 'return' | 'adjust' | 'other';
export type DocStatus = 'draft' | 'confirmed' | 'cancelled';

export const INBOUND_TYPE_LABELS: Record<InboundType, string> = {
  purchase: '采购入库',
  return: '退货入库',
  adjust: '调整入库',
  other: '其他入库',
};

export interface InboundItem {
  skuId: string;
  purchaseQty: number; // 采购数量（关联采购单时带出）
  receivedQty: number; // 实收数量
  diffReason?: string; // 差异原因
}

export interface InboundOrder {
  id: string;
  code: string;
  type: InboundType;
  purchaseOrderId?: string;
  supplierId?: string;
  operator: string;
  inboundAt?: string;
  status: DocStatus;
  remark?: string;
  items: InboundItem[];
}

// ============================ 出库单 ============================

export type OutboundType = 'sale' | 'transfer' | 'loss' | 'other';

export const OUTBOUND_TYPE_LABELS: Record<OutboundType, string> = {
  sale: '销售出库',
  transfer: '调拨出库',
  loss: '报损出库',
  other: '其他出库',
};

export interface OutboundItem {
  skuId: string;
  qty: number;
}

export interface OutboundOrder {
  id: string;
  code: string;
  type: OutboundType;
  customer?: string;
  operator: string;
  outboundAt?: string;
  status: DocStatus;
  remark?: string;
  items: OutboundItem[];
}

// ============================ 盘点单 ============================

export type StocktakingStatus = 'counting' | 'pending' | 'completed' | 'cancelled';

export const STOCKTAKING_STATUS_LABELS: Record<StocktakingStatus, string> = {
  counting: '盘点中',
  pending: '待确认',
  completed: '已完成',
  cancelled: '已取消',
};

export interface StocktakingItem {
  skuId: string;
  bookQty: number; // 账面库存
  actualQty: number; // 实盘库存
  reason?: string;
}

export interface StocktakingOrder {
  id: string;
  code: string;
  scope: string;
  creator: string;
  counter: string;
  confirmer?: string;
  status: StocktakingStatus;
  createdAt: string;
  confirmedAt?: string;
  remark?: string;
  items: StocktakingItem[];
}

// ============================ 对账 ============================

export interface ReconciliationRecord {
  id: string;
  supplierId: string;
  purchaseOrderId: string;
  inboundOrderId: string;
  skuId: string;
  purchaseQty: number;
  receivedQty: number;
  price: number;
  status: 'unreconciled' | 'reconciled';
  reconciledAt?: string;
}
