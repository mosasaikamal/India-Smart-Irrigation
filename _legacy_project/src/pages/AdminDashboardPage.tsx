import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Search, 
  Filter, 
  AlertCircle, 
  Clock, 
  Package, 
  UserCheck, 
  RefreshCw,
  Eye,
  Building,
  Check,
  User,
  ExternalLink
} from 'lucide-react';
import { ItemReport, ClaimRequest } from '../types/campusfind';

export const AdminDashboardPage: React.FC = () => {
  const { 
    items, 
    claims, 
    approveClaim, 
    rejectClaim, 
    markItemAsReturned, 
    deleteReport,
    navigateTo,
    role,
    setRole
  } = useCampusFind();

  const [activeTab, setActiveTab] = useState<'claims' | 'items'>('claims');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found' | 'returned'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Custom modal or inline prompt state for approving
  const [approvingClaimId, setApprovingClaimId] = useState<string | null>(null);
  const [pickupBooth, setPickupBooth] = useState('Central Security Office (Main Gate 1 Booth)');
  const [staffNote, setStaffNote] = useState('Answer verified against physical item characteristics.');

  // Returning item state
  const [returningItemId, setReturningItemId] = useState<string | null>(null);
  const [returnedToName, setReturnedToName] = useState('');

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const approvedClaims = claims.filter(c => c.status === 'approved');

  const filteredItems = items.filter(item => {
    if (filterType === 'lost' && item.type !== 'lost') return false;
    if (filterType === 'found' && (item.type !== 'found' || item.status === 'returned')) return false;
    if (filterType === 'returned' && item.status !== 'returned') return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.reporterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmApproval = (claimId: string) => {
    approveClaim(claimId, staffNote, pickupBooth);
    setApprovingClaimId(null);
  };

  const handleConfirmReturn = (itemId: string) => {
    markItemAsReturned(itemId, returnedToName.trim() || 'Verified Owner');
    setReturningItemId(null);
    setReturnedToName('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Staff Mode Demo Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Campus Security & Staff Desk</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Evaluation Demo Access
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Authorized interface for campus security personnel, hostel wardens, and library staff to verify claims.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400">Current Mode:</span>
          <button
            onClick={() => setRole(role === 'staff' ? 'student' : 'staff')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            Switch to Student View
          </button>
        </div>
      </div>

      {/* Staff KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claims Awaiting Review</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingClaims.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Needs staff decision</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved for Handover</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{approvedClaims.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Ready at campus booths</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Managed Items</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{items.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Lost + Found</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Returns</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {items.filter(i => i.status === 'returned').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Successfully handed over</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Claim Verification Requests</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {claims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Campus Reports Directory</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {items.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CLAIMS VERIFICATION QUEUE */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Submitted Ownership Claims
            </h2>
            <span className="text-xs text-slate-500">
              Side-by-side comparison of claimant's answer vs secret record
            </span>
          </div>

          <div className="space-y-4">
            {claims.map(claim => {
              const matchedItem = items.find(i => i.id === claim.itemId);
              const isApproving = approvingClaimId === claim.id;

              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 transition"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        #{claim.id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-900">
                        {claim.itemTitle}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-mono">Item #{claim.itemId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Date: {claim.claimDate}</span>
                      {claim.status === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {claim.status === 'approved' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Approved
                        </span>
                      )}
                      {claim.status === 'rejected' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Claimant & Comparison Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                    {/* Claimant Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Claimant Profile
                      </p>
                      <div className="space-y-1 text-slate-800">
                        <p className="font-bold text-sm text-slate-900">{claim.claimantName}</p>
                        <p><span className="text-slate-500">Reg No:</span> {claim.claimantRegNo}</p>
                        <p><span className="text-slate-500">Email:</span> {claim.claimantEmail}</p>
                        <p><span className="text-slate-500">Phone:</span> {claim.claimantPhone}</p>
                      </div>
                    </div>

                    {/* Claimant Submitted Proof & Answer */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                      <p className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">
                        Submitted Verification Answer
                      </p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Claimant's Response:</span>
                          <p className="font-semibold text-slate-900 bg-white p-2.5 rounded-xl border border-blue-200">
                            "{claim.verificationAnswerProvided || 'None provided'}"
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Ownership Statement:</span>
                          <p className="text-slate-700 line-clamp-2">{claim.proofDescription}</p>
                        </div>
                      </div>
                    </div>

                    {/* Official Item Record Secret Verification Answer */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                      <p className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                        Item's Secret Verification Key (On File)
                      </p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Question Asked:</span>
                          <p className="text-slate-800 italic">
                            "{matchedItem?.verificationQuestion || 'None set'}"
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Secret True Answer:</span>
                          <p className="font-bold text-emerald-800 bg-white p-2.5 rounded-xl border border-amber-300">
                            {matchedItem?.secretVerificationAnswer || 'Not recorded'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Approval Form */}
                  {isApproving && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 animate-in fade-in">
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Configure Pickup & Handover Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">
                            Collection Booth:
                          </label>
                          <input
                            type="text"
                            value={pickupBooth}
                            onChange={e => setPickupBooth(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">
                            Staff Note for Claimant:
                          </label>
                          <input
                            type="text"
                            value={staffNote}
                            onChange={e => setStaffNote(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmApproval(claim.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                        >
                          Confirm & Issue Pickup Pass
                        </button>
                        <button
                          onClick={() => setApprovingClaimId(null)}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('item-detail', claim.itemId)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Full Item Report</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {claim.status === 'pending' && !isApproving && (
                        <>
                          <button
                            onClick={() => setApprovingClaimId(claim.id)}
                            className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Claim</span>
                          </button>

                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:', 'Answer did not match recorded item specifics.');
                              if (reason) rejectClaim(claim.id, reason);
                            }}
                            className="py-1.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject Claim</span>
                          </button>
                        </>
                      )}

                      {claim.status === 'approved' && matchedItem?.status !== 'returned' && (
                        <button
                          onClick={() => {
                            setReturningItemId(claim.itemId);
                            setReturnedToName(claim.claimantName);
                          }}
                          className="py-1.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Physical Item Handed Over</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ALL CAMPUS REPORTS & MODERATION */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search reports by title, ID, location, or reporter..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-500 w-64"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Filter:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterType('lost')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'lost' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setFilterType('found')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'found' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Found
              </button>
              <button
                onClick={() => setFilterType('returned')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'returned' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Returned
              </button>
            </div>
          </div>

          {/* Inline Return Item Dialog */}
          {returningItemId && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Mark Item #{returningItemId} as Successfully Returned
              </h4>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter Student Name / UID who received the item..."
                  value={returnedToName}
                  onChange={e => setReturnedToName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs text-slate-900"
                />
                <button
                  onClick={() => handleConfirmReturn(returningItemId)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Confirm Handover
                </button>
                <button
                  onClick={() => setReturningItemId(null)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Table / List View */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item ID & Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Campus Location</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4 text-right">Staff Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigateTo('item-detail', item.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left block"
                        >
                          {item.title}
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">#{item.id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.type === 'lost'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[180px] truncate" title={item.location}>
                        {item.location}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">{item.date}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'returned'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'claim_pending'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'verified_claimed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{item.reporterName}</span>
                        <span className="text-[10px] text-slate-400 block capitalize">{item.reporterRole || 'student'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {item.status !== 'returned' && (
                          <button
                            onClick={() => {
                              setReturningItemId(item.id);
                              setReturnedToName('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition"
                          >
                            Mark Returned
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Remove report #${item.id} from the campus system?`)) {
                              deleteReport(item.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          title="Remove report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
