import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { formatMoney } from '@/utils/format';

/**
 * UI 组件单元测试。
 * 验证通用 Badge 与泛型 Table 的渲染。
 */
describe('UI 组件', () => {
  it('Badge 渲染子内容', () => {
    render(<Badge tone="green">启用</Badge>);
    expect(screen.getByText('启用')).toBeInTheDocument();
  });

  it('Table 渲染数据行与空状态', () => {
    interface Row {
      id: string;
      name: string;
    }
    const columns: Column<Row>[] = [{ title: '名称', render: (r) => r.name }];

    const { rerender } = render(
      <Table columns={columns} data={[{ id: '1', name: '衬衫' }]} rowKey={(r) => r.id} />,
    );
    expect(screen.getByText('衬衫')).toBeInTheDocument();

    rerender(
      <Table columns={columns} data={[]} rowKey={(r) => r.id} emptyText="没有数据" />,
    );
    expect(screen.getByText('没有数据')).toBeInTheDocument();
  });

  it('formatMoney 格式化金额', () => {
    expect(formatMoney(45)).toBe('¥45.00');
  });
});
