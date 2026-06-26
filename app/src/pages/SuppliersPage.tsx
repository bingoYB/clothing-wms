import { PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { listSuppliers } from '@/services/supplierService';
import type { Supplier } from '@/types';

/** 供应商管理页（一期为只读列表展示） */
export function SuppliersPage() {
  const suppliers = listSuppliers();

  const columns: Column<Supplier>[] = [
    { title: '供应商编号', render: (s) => s.code },
    { title: '供应商名称', render: (s) => s.name },
    { title: '联系人', render: (s) => s.contact ?? '-' },
    { title: '联系电话', render: (s) => s.phone ?? '-' },
    { title: '地址', render: (s) => s.address ?? '-' },
    { title: '结算方式', render: (s) => s.settlement ?? '-' },
    {
      title: '状态',
      render: (s) => (
        <Badge tone={s.status === 'active' ? 'green' : 'gray'}>
          {s.status === 'active' ? '启用' : '停用'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="供应商" description="维护采购供应商资料" />
      <Table columns={columns} data={suppliers} rowKey={(s) => s.id} />
    </div>
  );
}
