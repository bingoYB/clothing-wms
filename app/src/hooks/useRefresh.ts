import { useReducer } from 'react';

/**
 * 强制刷新 Hook。
 *
 * 由于演示数据存于可变的内存仓库（非不可变 state），
 * 在调用 service 改动数据后，用此 Hook 触发组件重渲染。
 * @returns [tick, refresh] tick 可作为 useMemo 依赖
 */
export function useRefresh(): [number, () => void] {
  const [tick, refresh] = useReducer((n: number) => n + 1, 0);
  return [tick, refresh];
}
