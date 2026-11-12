import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  CheckCircle2, 
  ArrowLeft,
  Search,
  Building
} from 'lucide-react';
import { CATEGORIES, CAMPUS_LOCATIONS, ItemCategory } from '../types/campusfind';

export const ReportFoundPage: React.FC = () => {
  const { reportFoundItem, navigateTo } = useCampusFind();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('bottles');
  const [location, setLocation] = useState<string>(CAMPUS_LOCATIONS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [storageLocation, setStorageLocation] = useState('Central Library Helpdesk');
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [secretVerificationAnswer, setSecretVerificationAnswer] = useState('');
  const [reporterName, setReporterName] = useState('');

  // Errors & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Please enter the item name';
    if (!description.trim()) errs.description = 'Please provide a short description';
    if (!location) errs.location = 'Please select where you found it';
    if (!date) errs.date = 'Please pick a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newId = reportFoundItem({
      title: title.trim(),
      category,
      location,
      date,
      description: description.trim(),
      storageLocation: storageLocation.trim() || 'Deposited at Campus Desk',
      verificationQuestion: verificationQuestion.trim() || 'Can you confirm any unique marking or color?',
      secretVerificationAnswer: secretVerificationAnswer.trim() || 'Matches reported item',
      reporterName: reporterName.trim() || 'Helpful Student',
      reporterRole: 'student',
      tags: [category, 'found']
    });

    setSubmittedId(newId);
  };

  // SUCCESS CONFIRMATION
  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Found Item Registered!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Thank you for being a helpful member of the campus. Your report is now visible for the owner to claim.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-block font-mono text-sm">
          <span className="text-slate-500">Report Reference: </span>
          <strong className="text-blue-600 text-base">#{submittedId}</strong>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 max-w-md mx-auto space-y-1">
          <p className="font-semibold text-slate-800">What should I do with the physical item?</p>
          <p className="leading-relaxed">
            Please hand the item over to the nearest campus desk (e.g. <strong>Central Library Reception</strong> or <strong>Gate 1 Security Booth</strong>) for safe custody.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigateTo('browse')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
          >
            View Campus Directory
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
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Help someone recover their belongings by sharing a few details.
        </p>
      </div>

      {/* Simple Vertical Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. What did you find? <span className="text-rose-500">*</span>
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
              2. Category <span className="text-rose-500">*</span>
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

          {/* 3. Location Found */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              3. Where did you find it? <span className="text-rose-500">*</span>
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

          {/* 4. Date Found */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              4. When did you find it? <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white outline-none focus:border-blue-500"
            />
          </div>

          {/* 5. Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              5. Short description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Black bottle found on study table #18 in the quiet reading hall"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none ${
                errors.description ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>

          {/* Optional Details */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Optional Handover & Safety Details
            </span>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Where did you drop it or keep it?
              </label>
              <input
                type="text"
                placeholder="e.g. Left at Central Library Counter 2, or Kept with Gate 1 Guard"
                value={storageLocation}
                onChange={e => setStorageLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Sai Kamal"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Primary Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-xs text-center"
            >
              Submit Found Item Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
