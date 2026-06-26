type Tone = 'gray' | 'green' | 'yellow' | 'red' | 'blue';

const TONE_CLASS: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/15',
  green: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

/** 状态标签组件 */
export function Badge({ tone = 'gray', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}
