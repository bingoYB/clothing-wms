/**
 * 通用格式化工具：金额、日期。
 */

/** 格式化金额为人民币字符串 */
export function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`;
}

/** 将 ISO 日期字符串格式化为 YYYY-MM-DD HH:mm */
export function formatDateTime(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** 将 ISO 日期字符串格式化为 YYYY-MM-DD */
export function formatDate(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toISOString().slice(0, 10);
}
