import { useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Card, PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { listProducts, listSkusByProduct } from '@/services/productService';
import { getSupplierName } from '@/services/supplierService';
import { store } from '@/services/store';
import { formatMoney } from '@/utils/format';
import type { Product } from '@/types';

/**
 * 商品管理页。
 * 支持按款号/名称/编号搜索；查看商品 SKU 明细。
 * 成本价仅对有权限的角色可见（PRD 权限矩阵）。
 */
export function ProductsPage() {
  const { can } = useAuth();
  const canViewCost = can('inventory.cost.view');
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState<Product | null>(null);

  const products = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return listProducts().filter(
      (p) =>
        !kw ||
        p.name.toLowerCase().includes(kw) ||
        p.styleNo.toLowerCase().includes(kw) ||
        p.code.toLowerCase().includes(kw),
    );
  }, [keyword]);

  // 启用中的列表显示属性定义
  const listAttrs = store.attributeDefs.filter((a) => a.enabled && a.listVisible);

  const columns: Column<Product>[] = [
    { title: '商品编号', render: (p) => p.code },
    { title: '款号', render: (p) => p.styleNo },
    { title: '商品名称', render: (p) => p.name },
    { title: '分类', render: (p) => p.category },
    { title: '默认供应商', render: (p) => getSupplierName(p.defaultSupplierId) },
    ...listAttrs.map<Column<Product>>((attr) => ({
      title: attr.name,
      render: (p) => p.attributes[attr.id] ?? '-',
    })),
    {
      title: '状态',
      render: (p) => (
        <Badge tone={p.status === 'active' ? 'green' : 'gray'}>
          {p.status === 'active' ? '启用' : '停用'}
        </Badge>
      ),
    },
    {
      title: '操作',
      align: 'right',
      render: (p) => (
        <Button size="sm" variant="secondary" onClick={() => setDetail(p)}>
          查看 SKU
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="商品管理"
        description="维护商品款号、SKU 与扩展属性"
        actions={
          can('product.edit') ? <Button disabled>新增商品（演示）</Button> : undefined
        }
      />

      <Card className="mb-4">
        <Input
          placeholder="按款号 / 名称 / 商品编号搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
        />
      </Card>

      <Table columns={columns} data={products} rowKey={(p) => p.id} />

      <Modal
        open={!!detail}
        title={detail ? `${detail.name}（${detail.styleNo}）的 SKU` : ''}
        onClose={() => setDetail(null)}
        widthClass="max-w-2xl"
      >
        {detail && (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">SKU 编码</th>
                <th>颜色</th>
                <th>尺码</th>
                {canViewCost && <th className="text-right">成本价</th>}
                <th className="text-right">批发价</th>
                <th className="text-right">预警值</th>
              </tr>
            </thead>
            <tbody>
              {listSkusByProduct(detail.id).map((sku) => (
                <tr key={sku.id} className="border-t border-gray-100">
                  <td className="py-2">{sku.code}</td>
                  <td>{sku.color}</td>
                  <td>{sku.size}</td>
                  {canViewCost && (
                    <td className="text-right">{formatMoney(sku.costPrice)}</td>
                  )}
                  <td className="text-right">{formatMoney(sku.wholesalePrice)}</td>
                  <td className="text-right">{sku.alertQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
