import React from 'react';
import { useCampusFind } from '../../context/CampusFindContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const CampusFindToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCampusFind();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        let border = 'border-emerald-200 bg-emerald-50/95 text-emerald-950';

        if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          border = 'border-rose-200 bg-rose-50/95 text-rose-950';
        } else if (toast.type === 'warning') {
          icon = <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
          border = 'border-amber-200 bg-amber-50/95 text-amber-950';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          border = 'border-blue-200 bg-blue-50/95 text-blue-950';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${border}`}
          >
            {icon}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
