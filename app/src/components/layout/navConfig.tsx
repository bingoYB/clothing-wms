import type { ReactNode } from 'react';
import type { Permission } from '@/types';
import { 
  Home, 
  Shirt, 
  PackageSearch, 
  TriangleAlert, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Receipt, 
  ClipboardList, 
  Building2, 
  CircleDollarSign 
} from 'lucide-react';

/** 导航菜单项定义 */
export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  /** 访问所需权限，未配置表示登录即可见 */
  permission?: Permission;
}

/**
 * 侧边栏导航配置。
 * 使用统一风格的 stroke 图标替代了不专业的 emoji。
 */
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: '首页', icon: <Home size={20} strokeWidth={1.5} /> },
  { path: '/products', label: '商品管理', icon: <Shirt size={20} strokeWidth={1.5} />, permission: 'product.view' },
  { path: '/inventory', label: '库存查询', icon: <PackageSearch size={20} strokeWidth={1.5} />, permission: 'inventory.view' },
  { path: '/alerts', label: '库存预警', icon: <TriangleAlert size={20} strokeWidth={1.5} />, permission: 'inventory.view' },
  { path: '/inbound', label: '入库单', icon: <ArrowDownToLine size={20} strokeWidth={1.5} />, permission: 'inbound.create' },
  { path: '/outbound', label: '出库单', icon: <ArrowUpFromLine size={20} strokeWidth={1.5} />, permission: 'outbound.create' },
  { path: '/purchase', label: '采购单', icon: <Receipt size={20} strokeWidth={1.5} />, permission: 'purchase.view' },
  { path: '/stocktaking', label: '盘点', icon: <ClipboardList size={20} strokeWidth={1.5} />, permission: 'stocktaking.input' },
  { path: '/suppliers', label: '供应商', icon: <Building2 size={20} strokeWidth={1.5} />, permission: 'supplier.manage' },
  {
    path: '/reconciliation',
    label: '供应商对账',
    icon: <CircleDollarSign size={20} strokeWidth={1.5} />,
    permission: 'reconciliation.view',
  },
];
