import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FieldProps {
  label?: string;
  className?: string;
}

/** 带标签的文本输入框 */
export function Input({
  label,
  className = '',
  ...rest
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-gray-600">{label}</span>}
      <input
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        {...rest}
      />
    </label>
  );
}

interface SelectProps
  extends FieldProps,
    SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

/** 带标签的下拉选择框 */
export function Select({ label, options, className = '', ...rest }: SelectProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-gray-600">{label}</span>}
      <select
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
