import { useState } from 'react';
import { PageHeader } from '@/components/ui/Layout';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Field';
import { listSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/services/supplierService';
import type { Supplier } from '@/types';

/** 供应商管理页 */
export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(listSuppliers());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    status: 'active',
  });

  const handleRefresh = () => {
    setSuppliers([...listSuppliers()]);
  };

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({ ...supplier });
    } else {
      setEditingSupplier(null);
      setFormData({ status: 'active', code: `V${Date.now().toString().slice(-4)}` });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      alert('请填写必填项（供应商名称、编号）');
      return;
    }
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData as Omit<Supplier, 'id'>);
    } else {
      addSupplier(formData as Omit<Supplier, 'id'>);
    }
    handleRefresh();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该供应商吗？')) {
      deleteSupplier(id);
      handleRefresh();
    }
  };

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
    {
      title: '操作',
      render: (s) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(s)}>编辑</Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(s.id)}>删除</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageHeader title="供应商" description="维护采购供应商资料" />
        <Button onClick={() => handleOpenModal()}>新增供应商</Button>
      </div>
      <Table columns={columns} data={suppliers} rowKey={(s) => s.id} />

      <Modal
        open={modalOpen}
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
        onClose={handleCloseModal}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input 
            label="供应商编号 *" 
            value={formData.code || ''} 
            onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
            required
          />
          <Input 
            label="供应商名称 *" 
            value={formData.name || ''} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required
          />
          <Input 
            label="联系人" 
            value={formData.contact || ''} 
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })} 
          />
          <Input 
            label="联系电话" 
            value={formData.phone || ''} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
          />
          <Input 
            label="地址" 
            value={formData.address || ''} 
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
          />
          <Input 
            label="结算方式" 
            value={formData.settlement || ''} 
            onChange={(e) => setFormData({ ...formData, settlement: e.target.value })} 
          />
          <Select 
            label="状态" 
            value={formData.status || 'active'} 
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'disabled' })}
            options={[
              { value: 'active', label: '启用' },
              { value: 'disabled', label: '停用' }
            ]}
          />
          <Input 
            label="备注" 
            value={formData.remark || ''} 
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })} 
          />
        </div>
      </Modal>
    </div>
  );
}
