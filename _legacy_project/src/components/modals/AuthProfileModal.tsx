import React, { useState } from 'react';
import { X, UserCheck, GraduationCap, Sparkles, Check, Edit2, Shield } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import { AcademicBranch } from '../../types/placement';

export const AuthProfileModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    userProfile,
    profiles,
    switchUserProfile,
    updateUserProfile,
    showToast
  } = usePlacement();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name,
    regNo: userProfile.regNo,
    email: userProfile.email,
    cgpa: userProfile.cgpa.toString(),
    branch: userProfile.branch
  });

  if (!isAuthModalOpen) return null;

  const handleProfileSwitch = (id: string) => {
    switchUserProfile(id);
    const target = profiles.find(p => p.id === id);
    if (target) {
      setFormData({
        name: target.name,
        regNo: target.regNo,
        email: target.email,
        cgpa: target.cgpa.toString(),
        branch: target.branch
      });
    }
    setIsEditing(false);
  };

  const handleSaveCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCgpa = parseFloat(formData.cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      showToast('Please enter a valid CGPA between 0.0 and 10.0', 'warning');
      return;
    }

    updateUserProfile({
      name: formData.name.trim() || 'Student',
      regNo: formData.regNo.trim() || '12100000',
      email: formData.email.trim() || 'student@lpu.in',
      cgpa: Number(parsedCgpa.toFixed(2)),
      branch: formData.branch as AcademicBranch
    });
    setIsEditing(false);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyanAccent-500/20 text-cyanAccent-400 border border-cyanAccent-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Student Profile & Branch Selection</h3>
              <p className="text-xs text-slate-300">
                Switch demo persona to test branch-specific syllabuses and UMS CGPA checks.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Quick Persona Switcher for Evaluation */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyanAccent-600" />
                <span>Pre-configured Evaluation Personas</span>
              </label>
              <span className="text-[11px] text-slate-400">1-click switch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profiles.map(p => {
                const isActive = p.id === userProfile.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleProfileSwitch(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isActive
                        ? 'border-cyanAccent-500 bg-cyanAccent-50/60 ring-2 ring-cyanAccent-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-cyanAccent-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <div className="font-bold text-xs text-navy-900 truncate pr-4">{p.name}</div>
                    <div className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-navy-100 text-navy-900">
                      {p.branch}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      CGPA: <strong className="text-navy-900">{p.cgpa}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Profile Details or Edit Form */}
          <div className="pt-2 border-t border-slate-100">
            {!isEditing ? (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-navy-900">{userProfile.name}</h4>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyanAccent-100 text-cyanAccent-800">
                      {userProfile.branch}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Reg No: <span className="font-mono text-slate-700">{userProfile.regNo}</span> · Email: {userProfile.email}
                  </p>
                  <p className="text-xs text-slate-600">
                    Cumulative CGPA: <strong className="text-navy-900">{userProfile.cgpa}</strong> · {userProfile.year}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-navy-900 hover:border-navy-500 shadow-2xs self-start sm:self-auto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveCustomProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      value={formData.regNo}
                      onChange={e => setFormData({ ...formData, regNo: e.target.value })}
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Branch</label>
                    <select
                      value={formData.branch}
                      onChange={e => setFormData({ ...formData, branch: e.target.value as AcademicBranch })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
                    >
                      <option value="CSE/IT">CSE / IT (Computer Science & Engineering)</option>
                      <option value="ECE/EEE">ECE / EEE (Electronics & Electrical)</option>
                      <option value="ME/CE">Mechanical / Civil Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA (0.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={e => setFormData({ ...formData, cgpa: e.target.value })}
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-cyanAccent-50/70 border border-cyanAccent-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-navy-950">
            <Shield className="w-4 h-4 text-cyanAccent-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Evaluation Note:</strong> The active branch will automatically filter and customize the technical preparation topics on the <strong>Verified Syllabus</strong> and <strong>My Preparation</strong> screens.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-navy-900 text-white font-semibold text-xs hover:bg-navy-800 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
