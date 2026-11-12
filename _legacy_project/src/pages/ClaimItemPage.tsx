import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export const ClaimItemPage: React.FC = () => {
  const { 
    selectedItemId, 
    items, 
    submitClaim, 
    navigateTo 
  } = useCampusFind();

  const item = items.find(i => i.id === selectedItemId);

  const [claimantName, setClaimantName] = useState('');
  const [claimantRegNo, setClaimantRegNo] = useState('');
  const [claimantContact, setClaimantContact] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');

  // Errors & Submitted State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);

  if (!item) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Item Selected</h2>
        <p className="text-xs text-slate-500">
          Please select an item from the directory before submitting a claim.
        </p>
        <button
          onClick={() => navigateTo('browse')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Browse Items
        </button>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!claimantName.trim()) errs.claimantName = 'Your full name is required';
    if (!claimantRegNo.trim()) errs.claimantRegNo = 'Student Registration Number (UID) is required';
    if (!claimantContact.trim()) errs.claimantContact = 'Contact phone number or email is required';
    if (!proofDescription.trim()) errs.proofDescription = 'Please describe how this item belongs to you';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newClaimId = submitClaim({
      itemId: item.id,
      itemTitle: item.title,
      itemCategory: item.category,
      claimantName: claimantName.trim(),
      claimantRegNo: claimantRegNo.trim(),
      claimantEmail: claimantContact.includes('@') ? claimantContact.trim() : `${claimantRegNo.trim()}@lpu.in`,
      claimantPhone: claimantContact.includes('@') ? '9876543210' : claimantContact.trim(),
      proofDescription: proofDescription.trim(),
      verificationAnswerProvided: verificationAnswer.trim() || proofDescription.trim()
    });

    setSubmittedClaimId(newClaimId);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedClaimId) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Claim Request Submitted!
          </h1>
          <p className="text-sm text-slate-600">
            Your claim has been submitted. The item holder or staff member will review your request.
          </p>
        </div>

        {/* Claim ID & Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-block text-left text-xs space-y-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Claim ID:</span>
            <strong className="text-blue-600 font-bold text-sm">#{submittedClaimId}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Status:</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Pending Verification
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigateTo('claim-status', item.id, submittedClaimId)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
          >
            Track Claim Status
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
          onClick={() => navigateTo('item-detail', item.id)}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Item</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Claim Item: {item.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your details so campus staff can verify your ownership.
        </p>
      </div>

      {/* 3-Step Indicator */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold">
          1. Enter details
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
          2. Submit claim
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
          3. Verification
        </div>
      </div>

      {/* Clean Claim Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Karri Rohit"
              value={claimantName}
              onChange={e => setClaimantName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none ${
                errors.claimantName ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.claimantName && <p className="mt-1 text-xs text-rose-600">{errors.claimantName}</p>}
          </div>

          {/* Student Reg No */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Registration Number (UID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 12214589"
              value={claimantRegNo}
              onChange={e => setClaimantRegNo(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none ${
                errors.claimantRegNo ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.claimantRegNo && <p className="mt-1 text-xs text-rose-600">{errors.claimantRegNo}</p>}
          </div>

          {/* Contact Phone or Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone or Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 9876543210 or student@lpu.in"
              value={claimantContact}
              onChange={e => setClaimantContact(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none ${
                errors.claimantContact ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.claimantContact && <p className="mt-1 text-xs text-rose-600">{errors.claimantContact}</p>}
          </div>

          {/* Verification Challenge / Question (if item has one) */}
          {item.verificationQuestion && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <label className="block text-xs font-bold text-blue-950">
                Verification Question: "{item.verificationQuestion}"
              </label>
              <input
                type="text"
                placeholder="Type your answer to verify ownership..."
                value={verificationAnswer}
                onChange={e => setVerificationAnswer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm text-slate-900 outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-blue-800">
                Staff will check this against the physical item before handing it over.
              </p>
            </div>
          )}

          {/* Proof Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Describe your proof of ownership <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe unique details only the owner would know (e.g. stickers, wallpaper, scuff marks, receipt, lockscreen)..."
              value={proofDescription}
              onChange={e => setProofDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none ${
                errors.proofDescription ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.proofDescription && (
              <p className="mt-1 text-xs text-rose-600">{errors.proofDescription}</p>
            )}
          </div>

          {/* Primary Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-xs text-center"
            >
              Submit Claim Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
