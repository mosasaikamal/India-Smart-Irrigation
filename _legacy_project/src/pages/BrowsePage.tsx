import React, { useState, useMemo } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { ItemCard } from '../components/common/ItemCard';
import { 
  Search, 
  RotateCcw, 
  Inbox, 
  PlusCircle, 
  ArrowRight 
} from 'lucide-react';
import { CATEGORIES, CAMPUS_LOCATIONS, ItemCategory } from '../types/campusfind';

export const BrowsePage: React.FC = () => {
  const { 
    items, 
    searchQuery, 
    setSearchQuery, 
    categoryFilter, 
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    locationFilter,
    setLocationFilter,
    navigateTo 
  } = useCampusFind();

  const [inputSearch, setInputSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputSearch.trim());
  };

  const handleClearFilters = () => {
    setInputSearch('');
    setSearchQuery('');
    setCategoryFilter('all');
    setLocationFilter('all');
    setTypeFilter('all');
  };

  const hasFilters = 
    searchQuery.trim() !== '' || 
    categoryFilter !== 'all' || 
    locationFilter !== 'all' || 
    typeFilter !== 'all';

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Type
      if (typeFilter === 'lost' && item.type !== 'lost') return false;
      if (typeFilter === 'found' && (item.type !== 'found' || item.status === 'returned')) return false;

      // 2. Category
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // 3. Location
      if (locationFilter !== 'all' && !item.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      // 4. Keyword search (name, description, category, location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inCat = item.category.toLowerCase().includes(q);
        const inLoc = item.location.toLowerCase().includes(q);
        const inTags = item.tags?.some(t => t.toLowerCase().includes(q));

        if (!inTitle && !inDesc && !inCat && !inLoc && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [items, typeFilter, categoryFilter, locationFilter, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Title & Clear Search Header */}
      <div className="text-center space-y-3 pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          What are you looking for?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Search all reported lost and found belongings across the campus.
        </p>

        {/* Large Clear Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search for an item, e.g. black bottle, ID card, earphones..."
                value={inputSearch}
                onChange={e => setInputSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shrink-0"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* 3 Simple Dropdown Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Item Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as ItemCategory | 'all')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Campus Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Location
            </label>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white outline-none focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              {CAMPUS_LOCATIONS.map((loc, idx) => (
                <option key={idx} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Lost or Found */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lost or Found
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white outline-none focus:border-blue-500"
            >
              <option value="all">All Reports</option>
              <option value="lost">Lost Items Only</option>
              <option value="found">Found Items Only</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button if any active */}
        {hasFilters && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing filtered results
            </span>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredItems.length}</strong> items
        </span>
      </div>

      {/* Results Grid or Friendly Empty State */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Friendly Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No matching items found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Try changing your search or report the item you lost so others can help.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              onClick={handleClearFilters}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Clear Filters
            </button>
            <button
              onClick={() => navigateTo('report-lost')}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report a Lost Item</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
