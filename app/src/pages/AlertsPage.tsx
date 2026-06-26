import { useMemo } from 'react';
import { PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useRefresh } from '@/hooks/useRefresh';
import { listAlerts, type AlertItem } from '@/services/alertService';
import { formatDateTime } from '@/utils/format';

/**
 * 库存预警页。
 * 列出当前库存 ≤ 预警值的 SKU，提醒采购补货（PRD 5.6）。
 */
export function AlertsPage() {
  const [tick] = useRefresh();
  const alerts = useMemo(() => listAlerts(), [tick]);

  const columns: Column<AlertItem>[] = [
    { title: '款号', render: (a) => a.styleNo },
    { title: '商品名称', render: (a) => a.productName },
    { title: '颜色', render: (a) => a.color },
    { title: '尺码', render: (a) => a.size },
    {
      title: '当前库存',
      align: 'right',
      render: (a) => <span className="font-medium text-red-600">{a.currentQty}</span>,
    },
    { title: '预警值', align: 'right', render: (a) => a.alertQty },
    {
      title: '建议采购量',
      align: 'right',
      render: (a) => Math.max(a.alertQty * 2 - a.currentQty, a.alertQty),
    },
    { title: '默认供应商', render: (a) => a.supplierName },
    { title: '最近入库', render: (a) => formatDateTime(a.lastInboundAt) },
  ];

  return (
    <div>
      <PageHeader
        title="库存预警"
        description="当前库存低于预警值的 SKU，建议及时补货"
        actions={<Badge tone="red">{alerts.length} 个低库存 SKU</Badge>}
      />
      <Table
        columns={columns}
        data={alerts}
        rowKey={(a) => a.id}
        emptyText="暂无低库存预警 🎉"
      />
    </div>
  );
}
