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
  cancelPurchase,
  createPurchase,
  listPurchase,
  purchaseTotal,
  submitPurchase,
} from '@/services/purchaseService';
import { listSuppliers, getSupplierName } from '@/services/supplierService';
import { listSkuViews, getSku } from '@/services/productService';
import {
  PURCHASE_STATUS_LABELS,
  type PurchaseItem,
  type PurchaseOrder,
  type PurchaseStatus,
} from '@/types';
import { formatMoney } from '@/utils/format';

const STATUS_TONE: Record<PurchaseStatus, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
  draft: 'gray',
  submitted: 'blue',
  partial: 'yellow',
  completed: 'green',
  cancelled: 'red',
};

/**
 * 采购单页。
 * 采购单不直接影响库存，仅作为入库与对账依据。
 */
export function PurchasePage() {
  const { user } = useAuth();
  const [tick, refresh] = useRefresh();
  const [creating, setCreating] = useState(false);

  const orders = useMemo(() => listPurchase(), [tick]);

  const act = (fn: () => void) => {
    try {
      fn();
      refresh();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const columns: Column<PurchaseOrder>[] = [
    { title: '采购单号', render: (o) => o.code },
    { title: '供应商', render: (o) => getSupplierName(o.supplierId) },
    { title: '采购日期', render: (o) => o.purchaseDate },
    {
      title: '采购金额',
      align: 'right',
      render: (o) => formatMoney(purchaseTotal(o)),
    },
    {
      title: '入库进度',
      render: (o) => {
        const total = o.items.reduce((s, i) => s + i.qty, 0);
        const done = o.items.reduce((s, i) => s + i.inboundQty, 0);
        return `${done} / ${total}`;
      },
    },
    {
      title: '状态',
      render: (o) => <Badge tone={STATUS_TONE[o.status]}>{PURCHASE_STATUS_LABELS[o.status]}</Badge>,
    },
    {
      title: '操作',
      align: 'right',
      render: (o) => (
        <div className="flex justify-end gap-2">
          {o.status === 'draft' && (
            <Button size="sm" onClick={() => act(() => submitPurchase(o.id))}>
              提交
            </Button>
          )}
          {(o.status === 'draft' || o.status === 'submitted') && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => act(() => cancelPurchase(o.id))}
            >
              取消
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="采购单"
        description="创建采购计划，提交后可用于到货入库"
        actions={<Button onClick={() => setCreating(true)}>新建采购单</Button>}
      />
      <Table columns={columns} data={orders} rowKey={(o) => o.id} />

      {creating && (
        <CreatePurchaseModal
          creator={user!.name}
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

/** 新建采购单弹窗 */
function CreatePurchaseModal({
  creator,
  onClose,
  onCreated,
}: {
  creator: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const suppliers = listSuppliers();
  const skus = listSkuViews();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [skuId, setSkuId] = useState(skus[0]?.id ?? '');
  const [qty, setQty] = useState(10);
  const [price, setPrice] = useState(skus[0] ? getSku(skus[0].id)!.costPrice : 0);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [error, setError] = useState('');

  const addItem = () => {
    if (!skuId || qty <= 0) return;
    setItems((prev) => [...prev, { skuId, qty, price, inboundQty: 0 }]);
  };

  const handleCreate = () => {
    setError('');
    if (items.length === 0) {
      setError('请至少添加一个采购明细');
      return;
    }
    const po = createPurchase({
      supplierId,
      purchaseDate: new Date().toISOString().slice(0, 10),
      creator,
      items,
    });
    submitPurchase(po.id); // 创建后直接提交，便于后续入库
    onCreated();
  };

  return (
    <Modal
      open
      title="新建采购单"
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleCreate}>提交采购单</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="供应商"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="max-w-xs"
          options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
        />

        <div className="flex flex-wrap items-end gap-2">
          <Select
            label="商品 SKU"
            value={skuId}
            onChange={(e) => {
              setSkuId(e.target.value);
              const sku = getSku(e.target.value);
              if (sku) setPrice(sku.costPrice);
            }}
            className="min-w-[12rem] flex-1"
            options={skus.map((s) => ({ value: s.id, label: s.code }))}
          />
          <Input
            label="数量"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-24"
          />
          <Input
            label="单价"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
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
              <th className="text-right">数量</th>
              <th className="text-right">单价</th>
              <th className="text-right">小计</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t border-gray-100">
                <td className="py-2">{getSku(item.skuId)?.code}</td>
                <td className="text-right">{item.qty}</td>
                <td className="text-right">{formatMoney(item.price)}</td>
                <td className="text-right">{formatMoney(item.qty * item.price)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  尚未添加明细
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
