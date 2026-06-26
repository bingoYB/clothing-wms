import { useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Card, PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { useRefresh } from '@/hooks/useRefresh';
import {
  confirmReconciliation,
  listReconciliations,
  payable,
} from '@/services/reconciliationService';
import { listSuppliers, getSupplierName } from '@/services/supplierService';
import { getSku } from '@/services/productService';
import { getPurchase } from '@/services/purchaseService';
import { getInbound } from '@/services/inboundService';
import type { ReconciliationRecord } from '@/types';
import { formatMoney } from '@/utils/format';

/**
 * 供应商对账页。
 * 应付金额 = 实收数量 × 采购单价（以实际入库为准，PRD 5.8）。
 */
export function ReconciliationPage() {
  const { can } = useAuth();
  const canConfirm = can('reconciliation.confirm');
  const [tick, refresh] = useRefresh();
  const [supplierId, setSupplierId] = useState('all');

  const records = useMemo(() => {
    const all = listReconciliations();
    return supplierId === 'all'
      ? all
      : all.filter((r) => r.supplierId === supplierId);
  }, [tick, supplierId]);

  const totalPayable = records.reduce((s, r) => s + payable(r), 0);

  const handleConfirm = (id: string) => {
    confirmReconciliation(id);
    refresh();
  };

  const columns: Column<ReconciliationRecord>[] = [
    { title: '供应商', render: (r) => getSupplierName(r.supplierId) },
    { title: '采购单号', render: (r) => getPurchase(r.purchaseOrderId)?.code ?? '-' },
    { title: '入库单号', render: (r) => getInbound(r.inboundOrderId)?.code ?? '-' },
    { title: 'SKU', render: (r) => getSku(r.skuId)?.code ?? '-' },
    { title: '采购数量', align: 'right', render: (r) => r.purchaseQty },
    { title: '实收数量', align: 'right', render: (r) => r.receivedQty },
    {
      title: '差异',
      align: 'right',
      render: (r) => {
        const diff = r.receivedQty - r.purchaseQty;
        return (
          <span className={diff === 0 ? '' : diff > 0 ? 'text-green-600' : 'text-red-600'}>
            {diff > 0 ? `+${diff}` : diff}
          </span>
        );
      },
    },
    { title: '采购单价', align: 'right', render: (r) => formatMoney(r.price) },
    {
      title: '应付金额',
      align: 'right',
      render: (r) => <span className="font-medium">{formatMoney(payable(r))}</span>,
    },
    {
      title: '对账状态',
      render: (r) => (
        <Badge tone={r.status === 'reconciled' ? 'green' : 'gray'}>
          {r.status === 'reconciled' ? '已对账' : '未对账'}
        </Badge>
      ),
    },
    {
      title: '操作',
      align: 'right',
      render: (r) =>
        canConfirm && r.status === 'unreconciled' ? (
          <Button size="sm" onClick={() => handleConfirm(r.id)}>
            确认对账
          </Button>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="供应商对账"
        description="基于实际入库数量生成应付金额"
      />

      <Card className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Select
          label="供应商"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="max-w-xs"
          options={[
            { value: 'all', label: '全部供应商' },
            ...listSuppliers().map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <div className="text-left sm:text-right">
          <div className="text-sm text-gray-500">应付合计</div>
          <div className="text-xl font-bold tabular text-brand-600">
            {formatMoney(totalPayable)}
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={records}
        rowKey={(r) => r.id}
        emptyText="暂无对账数据（采购入库后自动生成）"
      />
    </div>
  );
}
