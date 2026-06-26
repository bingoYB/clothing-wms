import { NavLink } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { ROLE_LABELS } from '@/types';
import { NAV_ITEMS } from './navConfig';
import { X } from 'lucide-react';

/**
 * 侧边栏导航。
 * 极简的“时尚编辑”排版：纯白背景、极细描边、黑色高亮。
 */
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { can, user } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-out lg:static lg:z-auto lg:h-auto lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo 区域：极简且带有高光感 */}
        <div className="flex h-20 items-center justify-between gap-3 px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center bg-black text-sm font-black text-white">
              <span className="font-display">V</span>
            </span>
            <span className="font-display text-lg font-bold tracking-widest text-black uppercase">
              Vogue WMS
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="收起菜单"
            className="p-2 text-gray-500 transition-colors hover:text-black lg:hidden"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* 导航区 */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-4 px-4 py-3 text-sm transition-all duration-300 ${
                  isActive
                    ? 'font-medium text-black'
                    : 'text-gray-500 hover:text-black hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* 左侧极简黑线指示器 */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-1/2 w-[2px] -translate-y-1/2 bg-black" />
                  )}
                  <span className={`transition-transform duration-300 ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 用户卡片：纯净质感 */}
        {user && (
          <div className="border-t border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-black">{user.name}</div>
                <div className="truncate text-xs tracking-wider text-gray-500 uppercase mt-0.5">{ROLE_LABELS[user.role]}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
