import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { store } from '@/services/store';

/**
 * 单元测试全局设置。
 * 每个用例后清理 DOM 并重置内存数据，保证测试相互隔离。
 */
afterEach(() => {
  cleanup();
  store.reset();
});
