import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * 受保护的应用布局。
 * 未登录用户重定向到登录页；已登录则渲染侧边栏 + 顶栏 + 内容区。
 * 采用了极简时尚杂志排版风格 (Editorial Atelier)，背景纯净，高雅留白。
 */
export function AppLayout() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // 路由切换时自动关闭移动端抽屉
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#fafafa] text-ink-900 font-sans selection:bg-black selection:text-white">
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
        <Topbar onMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 sm:py-10 z-0">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
