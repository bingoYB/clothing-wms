import { store } from './store';
import type { Product, Sku } from '@/types';

/**
 * 商品服务：商品与 SKU 的查询与组装。
 * 单一职责：只处理商品/SKU 主数据，不涉及库存数量。
 */

/** 全部商品 */
export function listProducts(): Product[] {
  return store.products;
}

/** 按 id 取商品 */
export function getProduct(id: string): Product | undefined {
  return store.products.find((p) => p.id === id);
}

/** 全部 SKU */
export function listSkus(): Sku[] {
  return store.skus;
}

/** 取某商品下的 SKU 列表 */
export function listSkusByProduct(productId: string): Sku[] {
  return store.skus.filter((s) => s.productId === productId);
}

/** 按 id 取 SKU */
export function getSku(id: string): Sku | undefined {
  return store.skus.find((s) => s.id === id);
}

/** SKU 富信息：携带其所属商品的款号、名称，便于列表展示 */
export interface SkuView extends Sku {
  productName: string;
  styleNo: string;
}

/** 组装 SKU 视图（含商品款号与名称） */
export function toSkuView(sku: Sku): SkuView {
  const product = getProduct(sku.productId);
  return {
    ...sku,
    productName: product?.name ?? '-',
    styleNo: product?.styleNo ?? '-',
  };
}

/** 全部 SKU 视图 */
export function listSkuViews(): SkuView[] {
  return store.skus.map(toSkuView);
}
