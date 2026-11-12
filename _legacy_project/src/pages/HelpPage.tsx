import React from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  HelpCircle, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  BookOpen, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { PROJECT_INFO } from '../data/sampleData';

export const HelpPage: React.FC = () => {
  const { navigateTo, resetToDemoData } = useCampusFind();

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Help & Campus Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Frequently asked questions about lost and found belongings at Lovely Professional University.
        </p>
      </div>

      {/* Campus Handover Hubs Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Campus Collection Hubs</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Physical items turned in on our 600-acre campus are deposited at authorized collection points for safe custody:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="block text-slate-900">Central Security Desk (Gate 1)</strong>
            <p className="text-slate-500 text-[11px] mt-0.5">Open 24/7 • Primary hub for IDs, electronics, and keys</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="block text-slate-900">Central Library Reception (Block 35)</strong>
            <p className="text-slate-500 text-[11px] mt-0.5">9:00 AM – 8:00 PM • Bottles, books, stationary</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="block text-slate-900">Hostel Receptions (BH-1 to BH-7, GH-1 to GH-6)</strong>
            <p className="text-slate-500 text-[11px] mt-0.5">Warden / Caretaker offices</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <strong className="block text-slate-900">Uni-Mall Facility Desk</strong>
            <p className="text-slate-500 text-[11px] mt-0.5">Ground floor information kiosk</p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Frequently Asked Questions</h2>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
            <h3 className="font-bold text-slate-900">How do I claim an item found by someone else?</h3>
            <p className="text-slate-600 leading-relaxed">
              Find the item in the directory and click <strong>“View Details”</strong> followed by <strong>“Claim This Item”</strong>. Enter your name, student registration number, and describe distinguishing details (such as wallpaper, markings, or engravings). Staff will verify your claim before handover.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
            <h3 className="font-bold text-slate-900">Why are some item details hidden on the website?</h3>
            <p className="text-slate-600 leading-relaxed">
              To prevent fraudulent claims, private markings (such as secret stickers, engraved initials, or serial numbers) are withheld from public view and only accessible to verifying campus staff.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
            <h3 className="font-bold text-slate-900">What should I bring when collecting my item?</h3>
            <p className="text-slate-600 leading-relaxed">
              Bring your physical Student Registration ID card and your Claim ID number (found under <strong>My Reports</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* INT335 Project Banner */}
      <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
            INT335 Design Thinking
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            About Project P04: CampusFind
          </h3>
          <p className="text-xs text-slate-600 max-w-md">
            Developed by Karri Rohit, Sai Kamal, S. Adithya Raman, and Kalimalla Ashraf for B.Tech CSE (AI & ML), Session 2026–27.
          </p>
        </div>

        <button
          onClick={() => navigateTo('design-thinking')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 transition"
        >
          <span>View Design Thinking Case Study</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
