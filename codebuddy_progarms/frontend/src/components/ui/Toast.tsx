import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface Ctx {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<Ctx | null>(null);

export function useToast() {
  const c = useContext(ToastContext);
  if (!c) throw new Error('useToast 必须在 ToastProvider 内使用');
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = (message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const Icon = (type: ToastType) =>
    type === 'success' ? (
      <CheckCircle2 className="text-emerald-500" size={18} />
    ) : type === 'error' ? (
      <AlertCircle className="text-red-500" size={18} />
    ) : (
      <Info className="text-indigo-500" size={18} />
    );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass rounded-xl shadow-card px-4 py-3 flex items-center gap-2 text-sm animate-floatUp min-w-[220px]"
          >
            {Icon(t.type)}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
