import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Card } from '@/components/ui/Layout';
import { listAlerts } from '@/services/alertService';
import { listInbound } from '@/services/inboundService';
import { listOutbound } from '@/services/outboundService';
import { listStocktaking } from '@/services/stocktakingService';
import { listReconciliations } from '@/services/reconciliationService';
import { TriangleAlert, ArrowDownToLine, ArrowUpFromLine, ClipboardList, CircleDollarSign, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** 极简创意统计网格 */
function StatCard({
  label,
  value,
  icon,
  to,
  tone = 'text-black',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  to?: string;
  tone?: string;
}) {
  const content = (
    <Card className="group h-full flex flex-col justify-between hover:border-black transition-colors duration-300">
      <div className="flex items-start justify-between">
        <span className="text-gray-400 transition-colors duration-300 group-hover:text-black">
          {icon}
        </span>
        {to && (
          <span className="text-gray-300 transition-colors duration-300 group-hover:text-black">
            <ArrowRight size={20} strokeWidth={1.5} />
          </span>
        )}
      </div>
      <div className="mt-8">
        <div className={`font-display text-4xl font-normal tabular tracking-tight ${tone}`}>{value}</div>
        <div className="mt-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">{label}</div>
      </div>
    </Card>
  );
  return to ? (
    <Link to={to} className="block fade-up">
      {content}
    </Link>
  ) : (
    <div className="fade-up">{content}</div>
  );
}

/**
 * 首页待办面板。
 * 按角色展示不同的关键待办。
 */
export function DashboardPage() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const inbounds = listInbound();
    const outbounds = listOutbound();
    return {
      alertCount: listAlerts().length,
      todayInbound: inbounds.filter((o) => o.inboundAt?.startsWith(today)).length,
      todayOutbound: outbounds.filter((o) => o.outboundAt?.startsWith(today)).length,
      pendingStocktaking: listStocktaking().filter((o) => o.status === 'pending').length,
      unreconciled: listReconciliations().filter((r) => r.status === 'unreconciled').length,
    };
  }, []);

  return (
    <div>
      <div className="mb-10 fade-up border-b border-gray-200 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-black sm:text-4xl">
          欢迎回来，{user?.name}
        </h1>
        <p className="mt-2 text-sm font-medium tracking-wide text-gray-500">
          以下是当前需要关注的关键事项
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-200 sm:grid-cols-3 lg:grid-cols-5 border border-gray-200">
        <div className="bg-[#fafafa]">
          <StatCard
            label="Alerts"
            value={stats.alertCount}
            icon={<TriangleAlert size={20} strokeWidth={1.5} />}
            to="/alerts"
          />
        </div>
        <div className="bg-[#fafafa]">
          <StatCard label="Inbound" value={stats.todayInbound} icon={<ArrowDownToLine size={20} strokeWidth={1.5} />} to="/inbound" />
        </div>
        <div className="bg-[#fafafa]">
          <StatCard label="Outbound" value={stats.todayOutbound} icon={<ArrowUpFromLine size={20} strokeWidth={1.5} />} to="/outbound" />
        </div>
        <div className="bg-[#fafafa]">
          <StatCard
            label="Stocktaking"
            value={stats.pendingStocktaking}
            icon={<ClipboardList size={20} strokeWidth={1.5} />}
            to="/stocktaking"
          />
        </div>
        <div className="bg-[#fafafa]">
          <StatCard
            label="Reconciliation"
            value={stats.unreconciled}
            icon={<CircleDollarSign size={20} strokeWidth={1.5} />}
            to="/reconciliation"
          />
        </div>
      </div>
    </div>
  );
}
