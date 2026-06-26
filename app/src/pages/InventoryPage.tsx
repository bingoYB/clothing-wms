import { useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Card, PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { listSkuViews, type SkuView } from '@/services/productService';
import {
  getLedgersBySku,
  getStockQty,
  getStockStatus,
} from '@/services/inventoryService';
import { formatDateTime, formatMoney } from '@/utils/format';

/** 库存行视图：SKU 视图 + 当前库存 */
interface StockRow extends SkuView {
  currentQty: number;
}

const STATUS_META = {
  normal: { tone: 'green' as const, label: '正常' },
  low: { tone: 'yellow' as const, label: '低库存' },
  empty: { tone: 'red' as const, label: '无库存' },
};

/**
 * 库存查询页。
 * 支持关键词搜索、低库存筛选、查看 SKU 库存流水。
 * 成本价 / 库存金额按权限显示。
 */
export function InventoryPage() {
  const { can } = useAuth();
  const canViewCost = can('inventory.cost.view');
  const [keyword, setKeyword] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [ledgerSku, setLedgerSku] = useState<StockRow | null>(null);

  const rows = useMemo<StockRow[]>(() => {
    const kw = keyword.trim().toLowerCase();
    return listSkuViews()
      .map((sku) => ({ ...sku, currentQty: getStockQty(sku.id) }))
      .filter((row) => {
        const matchKw =
          !kw ||
          row.code.toLowerCase().includes(kw) ||
          row.styleNo.toLowerCase().includes(kw) ||
          row.productName.toLowerCase().includes(kw) ||
          row.color.includes(kw);
        const matchLow = !onlyLow || getStockStatus(row, row.currentQty) !== 'normal';
        return matchKw && matchLow;
      });
  }, [keyword, onlyLow]);

  const columns: Column<StockRow>[] = [
    { title: 'SKU 编码', render: (r) => r.code },
    { title: '款号', render: (r) => r.styleNo },
    { title: '商品名称', render: (r) => r.productName },
    { title: '颜色', render: (r) => r.color },
    { title: '尺码', render: (r) => r.size },
    { title: '当前库存', align: 'right', render: (r) => r.currentQty },
    { title: '预警值', align: 'right', render: (r) => r.alertQty },
    {
      title: '库存状态',
      render: (r) => {
        const meta = STATUS_META[getStockStatus(r, r.currentQty)];
        return <Badge tone={meta.tone}>{meta.label}</Badge>;
      },
    },
    ...(canViewCost
      ? [
          {
            title: '成本价',
            align: 'right' as const,
            render: (r: StockRow) => formatMoney(r.costPrice),
          },
          {
            title: '库存金额',
            align: 'right' as const,
            render: (r: StockRow) => formatMoney(r.costPrice * r.currentQty),
          },
        ]
      : []),
    {
      title: '操作',
      align: 'right',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setLedgerSku(r)}>
          库存流水
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="库存查询" description="实时查看每个 SKU 的当前库存与流水" />

      <Card className="mb-4 flex flex-wrap items-end gap-4">
        <Input
          label="关键词"
          placeholder="SKU / 款号 / 名称 / 颜色"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <label className="mb-2 flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={onlyLow}
            onChange={(e) => setOnlyLow(e.target.checked)}
          />
          只看低库存
        </label>
      </Card>

      <Table columns={columns} data={rows} rowKey={(r) => r.id} />

      <Modal
        open={!!ledgerSku}
        title={ledgerSku ? `${ledgerSku.code} 库存流水` : ''}
        onClose={() => setLedgerSku(null)}
        widthClass="max-w-3xl"
      >
        {ledgerSku && (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">时间</th>
                <th>类型</th>
                <th className="text-right">变化前</th>
                <th className="text-right">变化</th>
                <th className="text-right">变化后</th>
                <th>来源</th>
                <th>操作人</th>
              </tr>
            </thead>
            <tbody>
              {getLedgersBySku(ledgerSku.id).map((l) => (
                <tr key={l.id} className="border-t border-gray-100">
                  <td className="py-2">{formatDateTime(l.operatedAt)}</td>
                  <td>{l.sourceType}</td>
                  <td className="text-right">{l.beforeQty}</td>
                  <td
                    className={`text-right ${l.changeQty >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {l.changeQty > 0 ? `+${l.changeQty}` : l.changeQty}
                  </td>
                  <td className="text-right">{l.afterQty}</td>
                  <td>{l.remark ?? '-'}</td>
                  <td>{l.operator}</td>
                </tr>
              ))}
              {getLedgersBySku(ledgerSku.id).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    暂无流水记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
