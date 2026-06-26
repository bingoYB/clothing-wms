import type { Permission, Role } from '@/types';

/**
 * RBAC 权限矩阵。
 *
 * 严格对应 PRD 第 8 章「权限矩阵」。
 * 单一职责：本模块只负责「角色 -> 权限集合」的映射与判定，不涉及 UI。
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'product.view',
    'product.edit',
    'product.attr.config',
    'inventory.view',
    'inventory.cost.view',
    'inbound.create',
    'inbound.confirm',
    'outbound.create',
    'outbound.confirm',
    'purchase.view',
    'purchase.edit',
    'stocktaking.input',
    'stocktaking.confirm',
    'supplier.manage',
    'reconciliation.view',
    'reconciliation.confirm',
    'user.manage',
  ],
  warehouse: [
    'product.view',
    'inventory.view',
    'inbound.create',
    'inbound.confirm',
    'outbound.create',
    'outbound.confirm',
    'stocktaking.input',
  ],
  purchaser: [
    'product.view',
    'inventory.view',
    'inventory.cost.view',
    'purchase.view',
    'purchase.edit',
    'supplier.manage',
    'reconciliation.view',
  ],
  finance: [
    'product.view',
    'inventory.view',
    'inventory.cost.view',
    'supplier.manage',
    'reconciliation.view',
    'reconciliation.confirm',
  ],
};

/** 判断某角色是否拥有指定权限 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
