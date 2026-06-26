import type { ReactNode } from 'react';

/** 表格列定义 */
export interface Column<T> {
  /** 列标题 */
  title: string;
  /** 单元格渲染函数 */
  render: (row: T) => ReactNode;
  /** 列对齐方式 */
  align?: 'left' | 'right' | 'center';
  /** 列宽 className */
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  /** 空数据提示 */
  emptyText?: string;
}

/**
 * 通用数据表格。
 *
 * 通过泛型 + 列定义实现：对扩展开放（任意数据类型），对修改关闭（组件本身不变）。
 * 体现 SOLID 的开闭原则。
 */
export function Table<T>({
  columns,
  data,
  rowKey,
  emptyText = '暂无数据',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white shadow-card">
      <table className="min-w-full divide-y divide-gray-200/80 text-sm tabular">
        <thead className="bg-gray-50/80">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                } ${col.className ?? ''}`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-14 text-center text-sm text-gray-400"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-brand-50/40">
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className={`whitespace-nowrap px-4 py-3 text-gray-700 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
