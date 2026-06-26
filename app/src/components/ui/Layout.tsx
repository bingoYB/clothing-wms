import type { ReactNode } from 'react';

/** 页面标题栏：标题 + 描述 + 右侧操作区 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6 border-b border-gray-200 pb-6">
      <div className="min-w-0 fade-up">
        <h1 className="font-display text-3xl font-bold tracking-tight text-black sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3 fade-up" style={{ animationDelay: '0.1s' }}>{actions}</div>}
    </div>
  );
}

/** 内容卡片容器：极简无边框或细边框风格 */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 p-5 sm:p-8 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
