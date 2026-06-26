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

/**
 * 系统初始 mock 数据。
 *
 * 后端暂未实现，所有数据来自此处的种子数据，运行时存于内存。
 * 数据结构刻意做成可独立替换，未来接入真实 API 时只需替换 service 层即可。
 */

export const seedUsers: User[] = [
  { id: 'u_admin', username: 'admin', name: '王老板', role: 'admin', status: 'active' },
  { id: 'u_wh', username: 'warehouse', name: '李仓管', role: 'warehouse', status: 'active' },
  { id: 'u_pur', username: 'purchaser', name: '赵采购', role: 'purchaser', status: 'active' },
  { id: 'u_fin', username: 'finance', name: '钱财务', role: 'finance', status: 'active' },
];

export const seedSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    code: 'SUP001',
    name: '广州十三行服饰',
    contact: '陈姐',
    phone: '13800000001',
    address: '广州市越秀区',
    settlement: '月结30天',
    status: 'active',
  },
  {
    id: 'sup_2',
    code: 'SUP002',
    name: '杭州四季青批发',
    contact: '孙总',
    phone: '13800000002',
    address: '杭州市江干区',
    settlement: '现结',
    status: 'active',
  },
];

export const seedAttributeDefs: AttributeDef[] = [
  {
    id: 'attr_season',
    name: '季节',
    type: 'select',
    required: false,
    enabled: true,
    filterable: true,
    listVisible: true,
    options: ['春', '夏', '秋', '冬'],
    sort: 1,
  },
  {
    id: 'attr_fabric',
    name: '面料',
    type: 'text',
    required: false,
    enabled: true,
    filterable: false,
    listVisible: true,
    sort: 2,
  },
  {
    id: 'attr_year',
    name: '年份',
    type: 'number',
    required: false,
    enabled: true,
    filterable: true,
    listVisible: false,
    sort: 3,
  },
];

export const seedProducts: Product[] = [
  {
    id: 'p_1',
    code: 'P0001',
    name: '修身衬衫',
    styleNo: 'A1023',
    category: '上衣',
    unit: '件',
    defaultSupplierId: 'sup_1',
    status: 'active',
    attributes: { attr_season: '春', attr_fabric: '棉', attr_year: '2026' },
  },
  {
    id: 'p_2',
    code: 'P0002',
    name: '休闲牛仔裤',
    styleNo: 'B2050',
    category: '裤子',
    unit: '件',
    defaultSupplierId: 'sup_2',
    status: 'active',
    attributes: { attr_season: '秋', attr_fabric: '牛仔布', attr_year: '2026' },
  },
  {
    id: 'p_3',
    code: 'P0003',
    name: '羊毛大衣',
    styleNo: 'C3088',
    category: '外套',
    unit: '件',
    defaultSupplierId: 'sup_1',
    status: 'active',
    attributes: { attr_season: '冬', attr_fabric: '羊毛', attr_year: '2026' },
  },
];

export const seedSkus: Sku[] = [
  // 修身衬衫
  { id: 'sku_1', productId: 'p_1', code: 'A1023-黑色-M', color: '黑色', size: 'M', costPrice: 45, wholesalePrice: 89, alertQty: 20, status: 'active' },
  { id: 'sku_2', productId: 'p_1', code: 'A1023-黑色-L', color: '黑色', size: 'L', costPrice: 45, wholesalePrice: 89, alertQty: 20, status: 'active' },
  { id: 'sku_3', productId: 'p_1', code: 'A1023-白色-M', color: '白色', size: 'M', costPrice: 45, wholesalePrice: 89, alertQty: 20, status: 'active' },
  // 休闲牛仔裤
  { id: 'sku_4', productId: 'p_2', code: 'B2050-蓝色-M', color: '蓝色', size: 'M', costPrice: 68, wholesalePrice: 139, alertQty: 15, status: 'active' },
  { id: 'sku_5', productId: 'p_2', code: 'B2050-蓝色-L', color: '蓝色', size: 'L', costPrice: 68, wholesalePrice: 139, alertQty: 15, status: 'active' },
  // 羊毛大衣
  { id: 'sku_6', productId: 'p_3', code: 'C3088-驼色-L', color: '驼色', size: 'L', costPrice: 220, wholesalePrice: 459, alertQty: 10, status: 'active' },
];

export const seedStocks: Stock[] = [
  { skuId: 'sku_1', qty: 50, lastInboundAt: '2026-06-10T09:00:00.000Z' },
  { skuId: 'sku_2', qty: 12, lastInboundAt: '2026-06-10T09:00:00.000Z' }, // 低库存
  { skuId: 'sku_3', qty: 8, lastInboundAt: '2026-06-08T09:00:00.000Z' }, // 低库存
  { skuId: 'sku_4', qty: 40, lastInboundAt: '2026-06-12T09:00:00.000Z' },
  { skuId: 'sku_5', qty: 30, lastInboundAt: '2026-06-12T09:00:00.000Z' },
  { skuId: 'sku_6', qty: 5, lastInboundAt: '2026-06-05T09:00:00.000Z' }, // 低库存
];

export const seedStockLedgers: StockLedger[] = [
  {
    id: 'led_1',
    skuId: 'sku_1',
    changeType: 'inbound',
    beforeQty: 0,
    changeQty: 50,
    afterQty: 50,
    sourceType: '入库单',
    sourceId: 'in_seed',
    operator: '李仓管',
    operatedAt: '2026-06-10T09:00:00.000Z',
  },
];

export const seedPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po_1',
    code: 'PO20260615-0001',
    supplierId: 'sup_1',
    purchaseDate: '2026-06-15',
    expectedDate: '2026-06-20',
    creator: '赵采购',
    status: 'submitted',
    items: [
      { skuId: 'sku_2', qty: 100, price: 45, inboundQty: 0 },
      { skuId: 'sku_3', qty: 80, price: 45, inboundQty: 0 },
    ],
  },
];

export const seedInboundOrders: InboundOrder[] = [];
export const seedOutboundOrders: OutboundOrder[] = [];
export const seedStocktakingOrders: StocktakingOrder[] = [];
export const seedReconciliations: ReconciliationRecord[] = [];
