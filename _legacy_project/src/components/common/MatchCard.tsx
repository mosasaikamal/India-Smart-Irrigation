import React from 'react';
import { MatchResult } from '../../types/campusfind';
import { useCampusFind } from '../../context/CampusFindContext';
import { Sparkles, MapPin, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

interface MatchCardProps {
  match: MatchResult;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { navigateTo } = useCampusFind();
  const { matchedItem, score, matchConfidence, reasons } = match;

  const getConfidenceBadge = () => {
    switch (matchConfidence) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            High Probability Match
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Moderate Match
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Possible Match
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white shadow-xs hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                {matchedItem.type === 'found' ? 'Found Item Candidate' : 'Lost Item Candidate'}
              </span>
              <span className="text-xs font-mono text-slate-400">#{matchedItem.id}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{matchedItem.title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
            <span>{score}% Match</span>
          </div>
          {getConfidenceBadge()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-blue-600' : 'bg-amber-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Item summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-3 bg-white/80 p-2.5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{matchedItem.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{matchedItem.date}</span>
        </div>
      </div>

      {/* Explainable Reasons */}
      <div className="space-y-1 mb-4">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Why this is considered a match:
        </p>
        <ul className="space-y-1">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
        <button
          onClick={() => navigateTo('item-detail', matchedItem.id)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1"
        >
          <span>Compare Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {matchedItem.type === 'found' && matchedItem.status !== 'returned' && (
          <button
            onClick={() => navigateTo('claim-item', matchedItem.id)}
            className="py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
          >
            Claim This
          </button>
        )}
      </div>
    </div>
  );
};
