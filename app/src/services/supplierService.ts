import { store } from './store';
import type { Supplier } from '@/types';

/** 供应商服务 */

/** 全部供应商 */
export function listSuppliers(): Supplier[] {
  return store.suppliers;
}

/** 按 id 取供应商 */
export function getSupplier(id?: string): Supplier | undefined {
  if (!id) return undefined;
  return store.suppliers.find((s) => s.id === id);
}

/** 供应商名称（找不到返回 '-'） */
export function getSupplierName(id?: string): string {
  return getSupplier(id)?.name ?? '-';
}
