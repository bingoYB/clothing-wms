import { useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRefresh } from '@/hooks/useRefresh';
import {
  confirmStocktaking,
  createStocktaking,
  diffAmount,
  listStocktaking,
  submitStocktaking,
} from '@/services/stocktakingService';
import { listSkus, getSku } from '@/services/productService';
import {
  STOCKTAKING_STATUS_LABELS,
  type StocktakingOrder,
  type StocktakingStatus,
} from '@/types';
import { formatMoney } from '@/utils/format';

const STATUS_TONE: Record<
  StocktakingStatus,
  'gray' | 'blue' | 'yellow' | 'green' | 'red'
> = {
  counting: 'blue',
  pending: 'yellow',
  completed: 'green',
  cancelled: 'red',
};

/**
 * 盘点页。
 * 仓管录入实盘数量并提交，管理员确认后按差异调整库存（PRD 5.7）。
 */
export function StocktakingPage() {
  const { user, can } = useAuth();
  const [tick, refresh] = useRefresh();
  const [detail, setDetail] = useState<StocktakingOrder | null>(null);

  const orders = useMemo(() => listStocktaking(), [tick]);

  const handleCreate = () => {
    createStocktaking({
      scope: '全仓盘点',
      creator: user!.name,
      counter: user!.name,
      skuIds: listSkus()
        .filter((s) => s.status === 'active')
        .map((s) => s.id),
    });
    refresh();
  };

  const columns: Column<StocktakingOrder>[] = [
    { title: '盘点单号', render: (o) => o.code },
    { title: '盘点范围', render: (o) => o.scope },
    { title: '盘点人', render: (o) => o.counter },
    { title: 'SKU 数', align: 'right', render: (o) => o.items.length },
    {
      title: '状态',
      render: (o) => (
        <Badge tone={STATUS_TONE[o.status]}>
          {STOCKTAKING_STATUS_LABELS[o.status]}
        </Badge>
      ),
    },
    {
      title: '操作',
      align: 'right',
      render: (o) => (
        <Button size="sm" variant="secondary" onClick={() => setDetail(o)}>
          {o.status === 'counting' ? '录入实盘' : '查看'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="盘点"
        description="核对账面与实盘差异，管理员确认后调整库存"
        actions={<Button onClick={handleCreate}>新建全仓盘点</Button>}
      />
      <Table columns={columns} data={orders} rowKey={(o) => o.id} />

      {detail && (
        <StocktakingDetailModal
          order={detail}
          canConfirm={can('stocktaking.confirm')}
          operator={user!.name}
          onClose={() => setDetail(null)}
          onChanged={() => {
            setDetail(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

/** 盘点详情/录入弹窗 */
function StocktakingDetailModal({
  order,
  canConfirm,
  operator,
  onClose,
  onChanged,
}: {
  order: StocktakingOrder;
  canConfirm: boolean;
  operator: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const editable = order.status === 'counting';
  const [actuals, setActuals] = useState<Record<string, number>>(
    Object.fromEntries(order.items.map((i) => [i.skuId, i.actualQty])),
  );

  const handleSubmit = () => {
    submitStocktaking(order.id, actuals);
    onChanged();
  };

  const handleConfirm = () => {
    confirmStocktaking(order.id, operator);
    onChanged();
  };

  return (
    <Modal
      open
      title={`盘点单 ${order.code}`}
      onClose={onClose}
      widthClass="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
          {editable && <Button onClick={handleSubmit}>提交盘点</Button>}
          {order.status === 'pending' && canConfirm && (
            <Button onClick={handleConfirm}>确认并调整库存</Button>
          )}
        </>
      }
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">SKU</th>
            <th className="text-right">账面库存</th>
            <th className="text-right">实盘库存</th>
            <th className="text-right">差异</th>
            <th className="text-right">差异金额</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => {
            const actual = editable ? actuals[item.skuId] : item.actualQty;
            const diff = actual - item.bookQty;
            return (
              <tr key={item.skuId} className="border-t border-gray-100">
                <td className="py-2">{getSku(item.skuId)?.code}</td>
                <td className="text-right">{item.bookQty}</td>
                <td className="text-right">
                  {editable ? (
                    <input
                      type="number"
                      min={0}
                      aria-label={`实盘-${getSku(item.skuId)?.code}`}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-right"
                      value={actuals[item.skuId]}
                      onChange={(e) =>
                        setActuals((prev) => ({
                          ...prev,
                          [item.skuId]: Number(e.target.value),
                        }))
                      }
                    />
                  ) : (
                    item.actualQty
                  )}
                </td>
                <td
                  className={`text-right ${
                    diff === 0 ? '' : diff > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {diff > 0 ? `+${diff}` : diff}
                </td>
                <td className="text-right">
                  {formatMoney(diffAmount({ ...item, actualQty: actual }))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {order.status === 'pending' && !canConfirm && (
        <p className="mt-3 text-sm text-yellow-600">
          已提交，等待管理员确认后调整库存。
        </p>
      )}
    </Modal>
  );
}
