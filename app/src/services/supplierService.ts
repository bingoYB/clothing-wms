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

/** 新增供应商 */
export function addSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
  const newSupplier: Supplier = {
    ...supplier,
    id: `SUP${Date.now()}`,
  };
  store.suppliers.push(newSupplier);
  return newSupplier;
}

/** 更新供应商 */
export function updateSupplier(id: string, updates: Partial<Omit<Supplier, 'id'>>): void {
  const index = store.suppliers.findIndex((s) => s.id === id);
  if (index !== -1) {
    store.suppliers[index] = { ...store.suppliers[index], ...updates };
  }
}

/** 删除供应商 */
export function deleteSupplier(id: string): void {
  const index = store.suppliers.findIndex((s) => s.id === id);
  if (index !== -1) {
    store.suppliers.splice(index, 1);
  }
}
