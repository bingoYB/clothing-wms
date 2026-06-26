import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { ROLE_LABELS } from '@/types';
import { Menu } from 'lucide-react';

/** 顶部栏：极简透明发光风格 */
export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-3 border-b border-gray-200 bg-white/80 px-4 sm:px-10 backdrop-blur-md">
      {/* 左侧：移动端菜单按钮 */}
      <button
        onClick={onMenu}
        aria-label="打开菜单"
        className="-ml-2 p-2 text-ink-600 transition-colors hover:text-black active:scale-95 lg:hidden"
      >
        <Menu size={24} strokeWidth={1.5} />
      </button>

      {user && (
        <div className="ml-auto flex items-center gap-5 text-sm">
          <span className="hidden font-medium text-ink-500 sm:inline">{user.name}</span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-600">
            {ROLE_LABELS[user.role]}
          </span>
          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>
          <button 
            onClick={handleLogout}
            className="text-ink-600 hover:text-black font-medium transition-colors"
          >
            退出
          </button>
        </div>
      )}
    </header>
  );
}
