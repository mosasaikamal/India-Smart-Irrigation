import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  ArrowRight,
  MapPin,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const { items, claims, navigateTo } = useCampusFind();
  const [activeTab, setActiveTab] = useState<'claims' | 'reports'>('claims');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Reports & Claims
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track the status of your ownership claims and view your reported belongings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'claims'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Reported Items ({items.length})
        </button>
      </div>

      {/* TAB 1: CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {claims.length > 0 ? (
            claims.map(claim => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      Claim #{claim.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {claim.itemTitle}
                    </h3>
                  </div>

                  <div>
                    {claim.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved for Pickup
                      </span>
                    )}
                    {claim.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Verification Pending
                      </span>
                    )}
                    {claim.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Claimant</span>
                    <span className="font-medium text-slate-800">{claim.claimantName} ({claim.claimantRegNo})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date Submitted</span>
                    <span className="font-medium text-slate-800">{claim.claimDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pickup Hub</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {claim.collectionLocation || 'Central Security Office (Main Gate 1)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Target Item #{claim.itemId}
                  </span>
                  <button
                    onClick={() => navigateTo('claim-status', claim.itemId, claim.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View Full Claim Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <p className="text-sm font-semibold text-slate-700">No active claims found.</p>
              <p className="text-xs text-slate-400">When you claim a found item, it will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REPORTED ITEMS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.type === 'lost'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">#{item.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                  <button
                    onClick={() => navigateTo('item-detail', item.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
