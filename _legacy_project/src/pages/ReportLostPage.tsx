import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Search,
  Upload
} from 'lucide-react';
import { CATEGORIES, CAMPUS_LOCATIONS, ItemCategory } from '../types/campusfind';

export const ReportLostPage: React.FC = () => {
  const { reportLostItem, navigateTo } = useCampusFind();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('bottles');
  const [location, setLocation] = useState<string>(CAMPUS_LOCATIONS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [distinguishingFeature, setDistinguishingFeature] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Errors & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Please enter the item name';
    if (!description.trim()) errs.description = 'Please provide a short description';
    if (!location) errs.location = 'Please select where you last saw it';
    if (!date) errs.date = 'Please pick a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newId = reportLostItem({
      title: title.trim(),
      category,
      location,
      date,
      description: description.trim(),
      distinguishingFeature: distinguishingFeature.trim() || undefined,
      reporterName: contactName.trim() || 'Student Reporter',
      reporterContact: contactInfo.trim() || 'student@lpu.in',
      reporterRole: 'student',
      tags: [category, 'lost']
    });

    setSubmittedId(newId);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Lost Item Report Submitted!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your report has been saved. We'll cross-check this with items turned in by students and security staff.
          </p>
        </div>

        {/* Report ID */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-block font-mono text-sm">
          <span className="text-slate-500">Your Report ID: </span>
          <strong className="text-blue-600 text-base">#{submittedId}</strong>
        </div>

        {/* What Happens Next */}
        <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 text-left text-xs text-slate-700 space-y-2 max-w-md mx-auto">
          <p className="font-bold text-blue-900">What happens next?</p>
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            <li>Our system checks for matching found items automatically.</li>
            <li>If someone turns it in at a security desk or library, you can verify and claim it.</li>
            <li>You can track this report anytime under <strong>My Reports</strong>.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigateTo('browse')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search Found Items Now</span>
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Lost Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tell us a few details so we can help you find your belongings.
        </p>
      </div>

      {/* Simple Vertical Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. What did you lose? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Black water bottle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none ${
                errors.title ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
          </div>

          {/* 2. Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. What type of item is it? <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ItemCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white outline-none focus:border-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Last Seen Location Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              3. Where did you last see it? <span className="text-rose-500">*</span>
            </label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white outline-none focus:border-blue-500"
            >
              {CAMPUS_LOCATIONS.map((loc, idx) => (
                <option key={idx} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              4. When did you lose it? <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white outline-none focus:border-blue-500"
            />
          </div>

          {/* 5. Describe Your Item */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              5. Describe your item <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Black bottle with a silver cap and a minor scratch at the base"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none ${
                errors.description ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>

          {/* Optional: Additional Details */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Optional Details (Helps verify ownership)
            </span>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Any unique markings or stickers?
              </label>
              <input
                type="text"
                placeholder="e.g. Has a small Batman sticker on the back"
                value={distinguishingFeature}
                onChange={e => setDistinguishingFeature(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karri Rohit"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Contact Phone / Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 or student@lpu.in"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Primary Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-xs text-center"
            >
              Submit Lost Item Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
