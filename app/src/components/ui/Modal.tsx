import type { ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** 底部操作区 */
  footer?: ReactNode;
  /** 宽度 className，默认中等 */
  widthClass?: string;
}

/** 通用弹窗组件 */
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  widthClass = 'max-w-lg',
}: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`modal-panel flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-float sm:rounded-2xl ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200/80 px-5 py-4">
          <h3 className="text-base font-semibold tracking-tight text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:scale-95"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-200/80 px-5 py-3">
          {footer ?? (
            <Button variant="secondary" onClick={onClose}>
              关闭
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
