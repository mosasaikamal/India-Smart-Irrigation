import React from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  Building, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Mail
} from 'lucide-react';
import { CATEGORIES } from '../types/campusfind';
import { MatchCard } from '../components/common/MatchCard';

export const ItemDetailPage: React.FC = () => {
  const { 
    selectedItemId, 
    items, 
    navigateTo, 
    getMatchesForItem,
    role,
    addToast 
  } = useCampusFind();

  const item = items.find(i => i.id === selectedItemId);

  if (!item) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Item Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested item could not be found or has been removed.
        </p>
        <button
          onClick={() => navigateTo('browse')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const matches = getMatchesForItem(item);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigateTo('browse')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Items</span>
        </button>
      </div>

      {/* Main Clean Item Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Simple Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  item.type === 'lost'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
              </span>
              <span className="text-xs font-mono text-slate-400 font-medium">#{item.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{item.title}</h1>
          </div>

          {item.status === 'returned' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shrink-0">
              Returned
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6">
          {/* Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Category</span>
              <span className="font-semibold text-slate-800">
                {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location</span>
              <span className="font-semibold text-slate-800 truncate block" title={item.location}>
                {item.location}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date</span>
              <span className="font-semibold text-slate-800">{item.date}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {item.description}
            </p>
          </div>

          {/* Storage / Custody location if Found */}
          {item.type === 'found' && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-blue-900 block">Current Custody / Collection Desk:</span>
              <p>{item.storageLocation || 'Secured at Campus Security Booth'}</p>
            </div>
          )}

          {/* ONE Primary Action Button */}
          <div className="pt-2">
            {item.type === 'found' && item.status !== 'returned' && (
              <button
                onClick={() => navigateTo('claim-item', item.id)}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-xs text-center flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            )}

            {item.type === 'lost' && item.status !== 'returned' && (
              <button
                onClick={() => {
                  addToast(
                    'Campus Security Contact Info',
                    'Visit Main Gate 1 Security Desk or email security@lpu.co.in with report #' + item.id,
                    'info'
                  );
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-xs text-center flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Campus Help Desk About This Item</span>
              </button>
            )}

            {item.status === 'returned' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium text-center">
                This item has been successfully returned to its owner.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Possible Matches (Simplified) */}
      {matches.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Possible Matches ({matches.length})
            </h3>
          </div>
          <div className="space-y-3">
            {matches.slice(0, 2).map((match, idx) => (
              <MatchCard key={idx} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
