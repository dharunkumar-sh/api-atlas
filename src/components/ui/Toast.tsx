import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import type { Toast, ToastType } from '@/types/ui';

const TOAST_EVENT = 'api_atlas_toast_event';

type ToastEventDetail = Omit<Toast, 'id'> & { id?: string };

export const toast = {
  show(t: ToastEventDetail) {
    if (typeof window !== 'undefined') {
      const id =
        t.id ||
        `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, { detail: { ...t, id } })
      );
      return id;
    }
    return '';
  },
  success(title: string, message?: string) {
    return this.show({ type: 'success', title, message });
  },
  error(title: string, message?: string) {
    return this.show({ type: 'error', title, message });
  },
  warning(title: string, message?: string) {
    return this.show({ type: 'warning', title, message });
  },
  info(title: string, message?: string) {
    return this.show({ type: 'info', title, message });
  },
};

export function useToast() {
  return toast;
}

const typeStyles: Record<
  ToastType,
  { icon: ReactNode; bg: string; border: string; titleColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-atlas-cyan shrink-0" />,
    bg: 'bg-[#0E1726]',
    border: 'border-[#44CFCB]/50',
    titleColor: 'text-[#44CFCB]',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    bg: 'bg-[#0E1726]',
    border: 'border-rose-500/50',
    titleColor: 'text-rose-300',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    bg: 'bg-[#0E1726]',
    border: 'border-amber-500/50',
    titleColor: 'text-amber-300',
  },
  info: {
    icon: <Info className="w-5 h-5 text-atlas-sky shrink-0" />,
    bg: 'bg-[#0E1726]',
    border: 'border-[#224870]',
    titleColor: 'text-[#4EA5D9]',
  },
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Toast>;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      const duration = newToast.durationMs ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, duration);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
  }, [removeToast]);

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((item) => {
        const config = typeStyles[item.type];
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200',
              config.bg,
              config.border
            )}
          >
            {config.icon}
            <div className="flex-1 min-w-0 pr-1">
              <p
                className={cn(
                  'text-xs font-semibold leading-tight',
                  config.titleColor
                )}
              >
                {item.title}
              </p>
              {item.message && (
                <p className="mt-1 text-xs text-slate-300 leading-normal line-clamp-2">
                  {item.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              type="button"
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
