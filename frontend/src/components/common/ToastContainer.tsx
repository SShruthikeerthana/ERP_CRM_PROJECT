import React from 'react';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 no-print">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-xl shadow-2xl border transition-all transform duration-300 ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                : isError
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

              <div className="text-sm">
                <h4 className="font-semibold text-white">{toast.title}</h4>
                {toast.message && <p className="mt-1 opacity-90 leading-relaxed">{toast.message}</p>}

                {toast.details?.shortItems && (
                  <div className="mt-2 p-2 bg-rose-900/40 rounded-md border border-rose-700/50 text-xs">
                    <p className="font-medium text-rose-300 mb-1">Products below required stock:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-rose-200">
                      {toast.details.shortItems.map((item: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-semibold">{item.name}</span> ({item.sku}): Requested {item.requested}, Available: {item.available}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors ml-3 p-1 rounded-md hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
