import { useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Field';
import { useRefresh } from '@/hooks/useRefresh';
import {
  confirmInbound,
  createInbound,
  listInbound,
} from '@/services/inboundService';
import { listInboundablePurchase, getPurchase } from '@/services/purchaseService';
import { getSku } from '@/services/productService';
import { getSupplierName } from '@/services/supplierService';
import { INBOUND_TYPE_LABELS, type InboundOrder } from '@/types';
import { formatDateTime } from '@/utils/format';

const STATUS_META = {
  draft: { tone: 'yellow' as const, label: '草稿' },
  confirmed: { tone: 'green' as const, label: '已确认' },
  cancelled: { tone: 'gray' as const, label: '已取消' },
};

/**
 * 入库单页。
 * 支持从采购单生成入库单草稿、录入实收数量、确认入库（增加库存）。
 */
export function InboundPage() {
  const { user } = useAuth();
  const [tick, refresh] = useRefresh();
  const [creating, setCreating] = useState(false);

  const orders = useMemo(() => listInbound(), [tick]);

  const handleConfirm = (id: string) => {
    try {
      confirmInbound(id, user!.name);
      refresh();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const columns: Column<InboundOrder>[] = [
    { title: '入库单号', render: (o) => o.code },
    { title: '类型', render: (o) => INBOUND_TYPE_LABELS[o.type] },
    {
      title: '关联采购单',
      render: (o) => getPurchase(o.purchaseOrderId ?? '')?.code ?? '-',
    },
    { title: '供应商', render: (o) => getSupplierName(o.supplierId) },
    {
      title: '实收件数',
      align: 'right',
      render: (o) => o.items.reduce((s, i) => s + i.receivedQty, 0),
    },
    { title: '入库时间', render: (o) => formatDateTime(o.inboundAt) },
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
            确认入库
          </Button>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="入库单"
        description="录入实际到货数量并确认入库，确认后库存增加并生成流水"
        actions={<Button onClick={() => setCreating(true)}>新建入库单</Button>}
      />
      <Table columns={columns} data={orders} rowKey={(o) => o.id} />

      {creating && (
        <CreateInboundModal
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

/** 新建入库单弹窗：从采购单生成 */
function CreateInboundModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const purchaseOrders = listInboundablePurchase();
  const [poId, setPoId] = useState(purchaseOrders[0]?.id ?? '');
  const po = poId ? getPurchase(poId) : undefined;
  // 实收数量录入状态，默认带出未入库数量
  const [received, setReceived] = useState<Record<string, number>>({});

  const handleCreate = () => {
    if (!po) return;
    const items = po.items.map((i) => ({
      skuId: i.skuId,
      purchaseQty: i.qty,
      receivedQty: received[i.skuId] ?? i.qty - i.inboundQty,
    }));
    const order = createInbound({
      type: 'purchase',
      purchaseOrderId: po.id,
      supplierId: po.supplierId,
      operator: user!.name,
      items,
    });
    confirmInbound(order.id, user!.name);
    onCreated();
  };

  return (
    <Modal
      open
      title="新建采购入库单"
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={!po}>
            确认入库
          </Button>
        </>
      }
    >
      {purchaseOrders.length === 0 ? (
        <p className="text-sm text-gray-500">暂无可入库的采购单（需先提交采购单）。</p>
      ) : (
        <div className="space-y-4">
          <Select
            label="选择采购单"
            value={poId}
            onChange={(e) => setPoId(e.target.value)}
            options={purchaseOrders.map((p) => ({
              value: p.id,
              label: `${p.code}（${getSupplierName(p.supplierId)}）`,
            }))}
          />
          {po && (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">SKU</th>
                  <th className="text-right">采购数量</th>
                  <th className="text-right">已入库</th>
                  <th className="text-right">实收数量</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item) => {
                  const sku = getSku(item.skuId);
                  const defaultQty = item.qty - item.inboundQty;
                  return (
                    <tr key={item.skuId} className="border-t border-gray-100">
                      <td className="py-2">{sku?.code}</td>
                      <td className="text-right">{item.qty}</td>
                      <td className="text-right">{item.inboundQty}</td>
                      <td className="text-right">
                        <input
                          type="number"
                          min={0}
                          aria-label={`实收数量-${sku?.code}`}
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-right"
                          value={received[item.skuId] ?? defaultQty}
                          onChange={(e) =>
                            setReceived((prev) => ({
                              ...prev,
                              [item.skuId]: Number(e.target.value),
                            }))
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Modal>
  );
}
