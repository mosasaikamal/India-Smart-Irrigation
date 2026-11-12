import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  MessageSquare,
  Sparkles,
  Send,
  HelpCircle,
  ShieldCheck,
  Tag,
  ThumbsUp,
  Share2,
  Filter,
  Check
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';
import { RumourFactItem } from '../types/placement';

export const RumourBusterPage: React.FC = () => {
  const { rumours, showToast, toggleUpvoteRumour } = usePlacement();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Submit new rumour state
  const [newRumourText, setNewRumourText] = useState('');
  const [newRumourSource, setNewRumourSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRumours = rumours.filter(item => {
    const matchesSearch =
      item.rumour.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleSubmitRumour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRumourText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNewRumourText('');
      setNewRumourSource('');
      showToast('Rumour submitted for verification by T&P mentors! (Simulated)', 'success');
    }, 600);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Interactive Feature: Campus Placement Fact-Checker</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
          Beyond the Rumour Mill
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Don't lose a placement opportunity due to contradictory WhatsApp forwards or hostel gossip. Every fact here is cross-referenced with official university circulars and verified alumni debriefs.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search rumours by keyword (e.g. Python, Google, Backlogs, TCS Digital, CGPA)..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500 text-xs sm:text-sm bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase">Category:</span>
          {['ALL', 'Eligibility', 'Technical Round', 'HR & Policy'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-navy-950 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rumours List */}
      <div className="space-y-4">
        {filteredRumours.map(item => {
          const isBusted = item.verdict === 'Busted';
          const isConfirmed = item.verdict === 'Confirmed';

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-card-hover transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isBusted
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isConfirmed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {item.verdict.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-navy-950 pt-1">
                    "{item.rumour}"
                  </h3>
                </div>
              </div>

              {/* Verified Reality Box */}
              <div className="p-5 rounded-2xl bg-cyanAccent-50/60 border border-cyanAccent-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-navy-950">
                  <ShieldCheck className="w-4 h-4 text-cyanAccent-700" />
                  <span>The Verified Reality:</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {item.reality}
                </p>
                <div className="pt-2 border-t border-cyanAccent-200/50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1">
                  <span>Source: <strong className="text-slate-800">{item.source}</strong></span>
                  <span className="text-cyanAccent-800 font-semibold">{item.confidenceNote}</span>
                </div>
              </div>

              {/* Interactive Footer: Tags & Upvote Counter */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => toggleUpvoteRumour(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    item.userUpvoted
                      ? 'bg-cyanAccent-500 text-navy-950 border-cyanAccent-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Mark as helpful fact check"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${item.userUpvoted ? 'fill-current' : ''}`} />
                  <span>Helpful ({item.upvotes || 0})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Rumour Submission Form */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 border border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyanAccent-400" />
          <h3 className="font-extrabold text-base text-white">
            Heard a New Placement Rumour on WhatsApp?
          </h3>
        </div>
        <p className="text-xs text-slate-300 max-w-xl">
          Submit the message or forwarded text. Our student mentors and T&P alumni will investigate and publish verified findings.
        </p>

        <form onSubmit={handleSubmitRumour} className="space-y-3 max-w-2xl">
          <div>
            <textarea
              rows={3}
              value={newRumourText}
              onChange={e => setNewRumourText(e.target.value)}
              placeholder="Paste the rumor here (e.g., 'A senior said that Cognizant is cancelling interviews for 2027 batch...')"
              required
              className="w-full text-xs p-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={newRumourSource}
              onChange={e => setNewRumourSource(e.target.value)}
              placeholder="Source (e.g. WhatsApp Group, Telegram Channel, Hostel 4 Gossip)"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-cyanAccent-500 hover:bg-cyanAccent-400 text-navy-950 font-bold text-xs transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit for Fact-Checking'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
