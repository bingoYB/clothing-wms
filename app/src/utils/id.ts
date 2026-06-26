/**
 * 通用工具函数：ID 生成与单号生成。
 * 仅前端 mock 使用，保证唯一性即可。
 */

let counter = 0;

/** 生成全局唯一 id */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

/** 生成业务单号，如 PO20260622-0001 */
export function makeDocNo(prefix: string, seq: number): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate(),
  ).padStart(2, '0')}`;
  return `${prefix}${ymd}-${String(seq).padStart(4, '0')}`;
}
