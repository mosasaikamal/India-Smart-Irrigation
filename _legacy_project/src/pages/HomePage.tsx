import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { ItemCard } from '../components/common/ItemCard';
import { 
  Search, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { items, navigateTo, setSearchQuery, setTypeFilter } = useCampusFind();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      navigateTo('browse');
    }
  };

  // 4 most recent items
  const recentItems = items.slice(0, 4);

  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto">
      {/* 1. Main Hero Section */}
      <section className="text-center pt-6 pb-2 space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Lost something on campus?<br className="hidden sm:inline" />
          <span className="text-blue-600"> Let's help you find it.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Search reported items or tell us what you lost. If you found something, help return it to its owner.
        </p>

        {/* 2 Prominent Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 text-left max-w-3xl mx-auto">
          {/* Card 1: I Lost Something */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                I Lost Something
              </span>
              <h2 className="text-xl font-bold text-slate-900">Missing your belongings?</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Check whether someone has already found and handed it over to campus staff, or submit a lost report.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setTypeFilter('found');
                  navigateTo('browse');
                }}
                className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Find My Item</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateTo('report-lost')}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition text-center"
              >
                Report Lost Item
              </button>
            </div>
          </div>

          {/* Card 2: I Found Something */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                I Found Something
              </span>
              <h2 className="text-xl font-bold text-slate-900">Found an item on campus?</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Help a fellow student or staff member. Log the item in under a minute so the rightful owner can safely claim it.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigateTo('report-found')}
                className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Report Found Item</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Simple Search Bar */}
      <section className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for an item, e.g. black bottle, ID card, earphones..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm shadow-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
          >
            Search
          </button>
        </form>
      </section>

      {/* 3. Recently Reported Items */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recently Reported Items</h2>
            <p className="text-xs text-slate-500">Latest lost and found belongings on campus</p>
          </div>
          <button
            onClick={() => navigateTo('browse')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentItems.map(item => (
            <ItemCard key={item.id} item={item} showMatchIndicator={false} />
          ))}
        </div>
      </section>

      {/* 4. Short "How It Works" Section */}
      <section className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-900">How CampusFind Works</h3>
          <p className="text-xs text-slate-500">
            A simple, trustworthy process for returning belongings on campus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Report or Search</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe what you lost or found with campus location and date.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Verify Ownership</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Private markings are kept secret so only the true owner can claim.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Safe Handover</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collect your item at designated desks like Central Library or Gate 1.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
