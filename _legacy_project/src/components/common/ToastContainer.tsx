import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = usePlacement();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map(toast => {
        let bg = 'bg-navy-900 border-slate-700 text-white';
        let icon = <Info className="w-4 h-4 text-cyanAccent-400 flex-shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-navy-900 border-emerald-500/50 text-white';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-navy-900 border-amber-500/50 text-white';
          icon = <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg ${bg} text-xs sm:text-sm animate-slide-up backdrop-blur-md`}
          >
            <div className="flex items-center gap-2.5 mr-2">
              {icon}
              <p className="font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
