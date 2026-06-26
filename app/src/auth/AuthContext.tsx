import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Permission, Role, User } from '@/types';
import { hasPermission } from './permissions';
import { store } from '@/services/store';

/**
 * 认证上下文。
 *
 * 负责保存当前登录用户，并对外暴露登录、登出与权限判定能力。
 * 组件通过 `useAuth()` 消费，避免直接依赖具体的用户存储实现（依赖倒置）。
 */
interface AuthContextValue {
  user: User | null;
  /** 使用用户名登录（mock：任意密码即可），失败返回 false */
  login: (username: string) => boolean;
  logout: () => void;
  /** 当前用户是否拥有某权限 */
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'wms_current_user';

/** 从 localStorage 恢复登录态 */
function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const id = JSON.parse(raw) as string;
    return store.users.find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = useCallback((username: string): boolean => {
    const found = store.users.find(
      (u) => u.username === username && u.status === 'active',
    );
    if (!found) return false;
    setUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found.id));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, login, logout, can }),
    [user, login, logout, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** 消费认证上下文 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}

/** 当前用户角色（未登录返回 undefined） */
export function useRole(): Role | undefined {
  return useAuth().user?.role;
}
