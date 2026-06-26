import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';

/** 演示账号列表，便于快速登录体验各角色 */
const DEMO_ACCOUNTS = [
  { username: 'admin', label: '老板/管理员' },
  { username: 'warehouse', label: '仓管' },
  { username: 'purchaser', label: '采购' },
  { username: 'finance', label: '财务' },
];

/** 登录页 */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (name?: string) => {
    const account = name ?? username;
    if (login(account)) {
      navigate('/dashboard');
    } else {
      setError('账号不存在或已停用');
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-brand-50 via-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200/70 bg-white/90 p-8 shadow-float backdrop-blur">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-card">
            衣
          </div>
          <h1 className="mt-3 text-xl font-bold tracking-tight text-gray-900">
            服装批发进销存系统
          </h1>
          <p className="mt-1 text-sm text-gray-500">请登录以继续</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <Input
            label="账号"
            value={username}
            placeholder="请输入账号"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="密码"
            type="password"
            value={password}
            placeholder="演示环境密码任意"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            登录
          </Button>
        </form>

        <div className="mt-6">
          <p className="mb-2 text-center text-xs text-gray-400">点击快速登录演示账号</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <Button
                key={acc.username}
                variant="secondary"
                size="sm"
                onClick={() => handleLogin(acc.username)}
              >
                {acc.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
