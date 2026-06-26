import { useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Field';
import { useRefresh } from '@/hooks/useRefresh';
import {
  confirmOutbound,
  createOutbound,
  listOutbound,
} from '@/services/outboundService';
import { getStockQty } from '@/services/inventoryService';
import { listSkuViews, getSku } from '@/services/productService';
import { OUTBOUND_TYPE_LABELS, type OutboundItem, type OutboundOrder } from '@/types';
import { formatDateTime } from '@/utils/format';

const STATUS_META = {
  draft: { tone: 'yellow' as const, label: '草稿' },
  confirmed: { tone: 'green' as const, label: '已出库' },
  cancelled: { tone: 'gray' as const, label: '已取消' },
};

/**
 * 出库单页。
 * 支持新建出库单、库存校验、确认出库（减少库存并生成流水）。
 */
export function OutboundPage() {
  const { user } = useAuth();
  const [tick, refresh] = useRefresh();
  const [creating, setCreating] = useState(false);

  const orders = useMemo(() => listOutbound(), [tick]);

  const handleConfirm = (id: string) => {
    try {
      confirmOutbound(id, user!.name);
      refresh();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const columns: Column<OutboundOrder>[] = [
    { title: '出库单号', render: (o) => o.code },
    { title: '类型', render: (o) => OUTBOUND_TYPE_LABELS[o.type] },
    { title: '客户', render: (o) => o.customer ?? '-' },
    {
      title: '出库件数',
      align: 'right',
      render: (o) => o.items.reduce((s, i) => s + i.qty, 0),
    },
    { title: '出库时间', render: (o) => formatDateTime(o.outboundAt) },
    {
      title: '状态',
      render: (o) => {
        const meta = STATUS_META[o.status];
        return <Badge tone={meta.tone}>{meta.label}</Badge>;
      },
    },
    {
      title: '操作',
      align: 'right',
      render: (o) =>
        o.status === 'draft' ? (
          <Button size="sm" onClick={() => handleConfirm(o.id)}>
            确认出库
          </Button>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="出库单"
        description="销售发货、报损等出库，确认前校验库存，禁止超卖"
        actions={<Button onClick={() => setCreating(true)}>新建出库单</Button>}
      />
      <Table columns={columns} data={orders} rowKey={(o) => o.id} />

      {creating && (
        <CreateOutboundModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

/** 新建出库单弹窗 */
function CreateOutboundModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const skus = listSkuViews();
  const [customer, setCustomer] = useState('');
  const [skuId, setSkuId] = useState(skus[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState<OutboundItem[]>([]);
  const [error, setError] = useState('');

  const addItem = () => {
    if (!skuId || qty <= 0) return;
    setItems((prev) => {
      const exist = prev.find((i) => i.skuId === skuId);
      if (exist) {
        return prev.map((i) => (i.skuId === skuId ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { skuId, qty }];
    });
    setQty(1);
  };

  const handleCreate = () => {
    setError('');
    if (items.length === 0) {
      setError('请至少添加一个出库商品');
      return;
    }
    try {
      const order = createOutbound({
        type: 'sale',
        customer: customer || undefined,
        operator: user!.name,
        items,
      });
      confirmOutbound(order.id, user!.name);
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal
      open
      title="新建销售出库单"
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleCreate}>确认出库</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="客户名称"
          value={customer}
          placeholder="可选"
          onChange={(e) => setCustomer(e.target.value)}
          className="max-w-xs"
        />

        <div className="flex flex-wrap items-end gap-2">
          <Select
            label="商品 SKU"
            value={skuId}
            onChange={(e) => setSkuId(e.target.value)}
            className="min-w-[12rem] flex-1"
            options={skus.map((s) => ({
              value: s.id,
              label: `${s.code}（库存 ${getStockQty(s.id)}）`,
            }))}
          />
          <Input
            label="数量"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-24"
          />
          <Button variant="secondary" onClick={addItem} className="mb-0.5">
            添加
          </Button>
        </div>

        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">SKU</th>
              <th className="text-right">当前库存</th>
              <th className="text-right">出库数量</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sku = getSku(item.skuId);
              const stock = getStockQty(item.skuId);
              const over = item.qty > stock;
              return (
                <tr key={item.skuId} className="border-t border-gray-100">
                  <td className="py-2">{sku?.code}</td>
                  <td className="text-right">{stock}</td>
                  <td className={`text-right ${over ? 'text-red-600 font-medium' : ''}`}>
                    {item.qty}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-400">
                  尚未添加商品
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}
