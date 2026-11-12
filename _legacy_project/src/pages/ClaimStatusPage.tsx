import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  FileSearch, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Printer,
  HelpCircle,
  Building,
  User,
  AlertTriangle
} from 'lucide-react';

export const ClaimStatusPage: React.FC = () => {
  const { claims, selectedClaimId, navigateTo, items } = useCampusFind();

  const [searchClaimId, setSearchClaimId] = useState('');
  const [activeClaimId, setActiveClaimId] = useState<string>(
    selectedClaimId || (claims.length > 0 ? claims[0].id : '')
  );

  const activeClaim = claims.find(c => c.id === activeClaimId) || claims[0];
  const associatedItem = activeClaim ? items.find(i => i.id === activeClaim.itemId) : null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchClaimId.trim().toUpperCase();
    const found = claims.find(c => c.id.toUpperCase() === query);
    if (found) {
      setActiveClaimId(found.id);
    } else {
      alert(`No claim found with ID "${searchClaimId}". Please check the ID format (e.g. CLM-2026-801).`);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (!activeClaim) return 'pending';
    
    if (activeClaim.status === 'rejected') {
      if (stepIndex === 1) return 'completed';
      if (stepIndex === 2) return 'rejected';
      return 'disabled';
    }

    if (activeClaim.status === 'approved') {
      if (stepIndex <= 3) return 'completed';
      return 'ready';
    }

    // Pending status
    if (stepIndex === 1) return 'completed';
    if (stepIndex === 2) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-lg space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
          <FileSearch className="w-3.5 h-3.5" />
          <span>Real-time Claim Verification Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Track Your Claim Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Monitor the verification review of your ownership request in real-time. Once approved, you can collect your belongings from the campus security desk.
        </p>

        {/* Search Claim by ID Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-4 max-w-md flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Claim ID (e.g. CLM-2026-801)..."
            value={searchClaimId}
            onChange={e => setSearchClaimId(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-slate-400 text-xs border border-white/20 outline-none focus:bg-white focus:text-slate-900 transition"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
          >
            Find Claim
          </button>
        </form>
      </div>

      {/* Recent Claims Switcher (if multiple claims exist) */}
      {claims.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Switch Claim:
          </span>
          {claims.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveClaimId(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition ${
                activeClaimId === c.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              #{c.id} — {c.itemTitle.slice(0, 24)}...
            </button>
          ))}
        </div>
      )}

      {activeClaim ? (
        <div className="space-y-6">
          {/* Claim Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600">
                    Claim #{activeClaim.id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">Submitted on {activeClaim.claimDate}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{activeClaim.itemTitle}</h2>
                <p className="text-xs text-slate-500">
                  Target Item Reference: #{activeClaim.itemId}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {activeClaim.status === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approved for Pickup
                  </span>
                )}
                {activeClaim.status === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Staff Verification
                  </span>
                )}
                {activeClaim.status === 'rejected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" />
                    Claim Verification Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Visual 4-Step Stepper */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Verification Progress Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">Step 1</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Claim Logged</p>
                  <p className="text-[11px] text-slate-500">Student UID and proof registered.</p>
                </div>

                {/* Step 2 */}
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  getStepStatus(2) === 'rejected'
                    ? 'bg-rose-50 border-rose-200'
                    : getStepStatus(2) === 'completed'
                    ? 'bg-blue-50/70 border-blue-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Step 2</span>
                    {getStepStatus(2) === 'rejected' ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : getStepStatus(2) === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="font-semibold text-slate-900">Security Review</p>
                  <p className="text-[11px] text-slate-500">
                    {getStepStatus(2) === 'rejected' ? 'Verification mismatch.' : 'Comparing secret answers.'}
                  </p>
                </div>

                {/* Step 3 */}
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  getStepStatus(3) === 'completed'
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Step 3</span>
                    {getStepStatus(3) === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <p className="font-semibold text-slate-900">Authorization</p>
                  <p className="text-[11px] text-slate-500">Staff release permit issued.</p>
                </div>

                {/* Step 4 */}
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  activeClaim.status === 'approved'
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Step 4</span>
                    {activeClaim.status === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <p className="font-semibold text-slate-900">Physical Pickup</p>
                  <p className="text-[11px] text-slate-500">Handover at campus booth.</p>
                </div>
              </div>
            </div>

            {/* Next Steps & Handover Instructions */}
            {activeClaim.status === 'approved' && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Approved! Safe Handover Instructions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-emerald-900 pt-1">
                  <div>
                    <span className="font-bold">Designated Pickup Hub:</span>
                    <p className="font-medium mt-0.5">
                      {activeClaim.collectionLocation || 'Central Security Office (Main Gate 1 Booth)'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold">Operating Hours:</span>
                    <p className="font-medium mt-0.5">Monday to Saturday: 9:00 AM – 5:00 PM</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">What you need to bring:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                    <li>Original Physical Student Identity Card with RFID</li>
                    <li>Claim Reference Number: <strong>#{activeClaim.id}</strong></li>
                    <li>Phone showing this confirmation screen</li>
                  </ul>
                </div>

                {activeClaim.staffNotes && (
                  <p className="text-xs text-emerald-800 italic pt-1">
                    Staff Note: "{activeClaim.staffNotes}"
                  </p>
                )}
              </div>
            )}

            {activeClaim.status === 'pending' && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Review in Progress</span>
                </div>
                <p className="leading-relaxed">
                  Your verification answer has been routed to the respective desk in charge of this item. Verification is typically completed within 2 to 4 campus working hours.
                </p>
              </div>
            )}

            {activeClaim.status === 'rejected' && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-900">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Claim Verification Not Approved</span>
                </div>
                <p className="leading-relaxed">
                  The distinguishing attributes or verification answer provided did not match the physical item recorded by campus staff.
                </p>
                {activeClaim.staffNotes && (
                  <p className="italic text-[11px] text-rose-800">
                    Authority Remark: "{activeClaim.staffNotes}"
                  </p>
                )}
                <p className="text-[11px] text-slate-600 pt-1">
                  If you believe this was an error, please visit the Central Security Booth at Main Gate 1 in person with your Student ID card.
                </p>
              </div>
            )}

            {/* Claimant Record Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
              <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                Claimant Details on Record
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Name</span>
                  <span className="font-semibold">{activeClaim.claimantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Reg No</span>
                  <span className="font-semibold">{activeClaim.claimantRegNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email</span>
                  <span className="font-semibold">{activeClaim.claimantEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="font-semibold">{activeClaim.claimantPhone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Gate Pass Slip</span>
              </button>

              <button
                onClick={() => navigateTo('browse')}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
              >
                Browse Other Items
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No active claims found.</p>
          <button
            onClick={() => navigateTo('browse')}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Browse Campus Items
          </button>
        </div>
      )}
    </div>
  );
};
