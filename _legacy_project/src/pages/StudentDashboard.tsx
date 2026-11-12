import React from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Bookmark,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Bell,
  AlertCircle,
  Layers,
  ChevronRight,
  Calendar,
  Building2,
  Flame,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';
import { AcademicBranch } from '../types/placement';

export const StudentDashboard: React.FC = () => {
  const {
    userProfile,
    drives,
    syllabuses,
    notifications,
    navigateTo,
    setIsAuthModalOpen,
    getOverallProgress,
    getCompanyProgress,
    isCompanySaved,
    toggleSaveCompany,
    getNextRecommendedTopic,
    setSelectedBranch,
    setSelectedCompanyId
  } = usePlacement();

  const overall = getOverallProgress();
  const nextRec = getNextRecommendedTopic();

  // Find saved drives
  const savedDrivesList = drives.filter(d => userProfile.savedCompanyIds.includes(d.id));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Welcome Banner Card (Bento Row 1) */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyanAccent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyanAccent-500/20 text-cyanAccent-300 text-xs font-semibold border border-cyanAccent-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Placement Season 2026-27</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{userProfile.streakDays || 4} Day Prep Streak!</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {userProfile.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Targeting campus placements with verified technical roadmaps. Your academic branch is set to{' '}
              <strong className="text-cyanAccent-400 font-bold">{userProfile.branch}</strong> with a registered CGPA of{' '}
              <strong className="text-white font-bold">{userProfile.cgpa}</strong>.
            </p>
          </div>

          {/* Quick Profile Switch Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-cyanAccent-400" />
              <span>Switch Persona / Branch</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Preparation Score</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-cyanAccent-400">{overall.percentage}%</span>
              <span className="text-[11px] text-slate-400">ready</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Saved Drives</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{savedDrivesList.length}</span>
              <span className="text-[11px] text-slate-400">bookmarked</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Completed Topics</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{userProfile.completedTopicIds.length}</span>
              <span className="text-[11px] text-slate-400">done</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Eligible Drives</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {drives.filter(d => d.minCgpa <= userProfile.cgpa && d.eligibleBranches.includes(userProfile.branch)).length}
              </span>
              <span className="text-[11px] text-slate-400">matched</span>
            </div>
          </div>
        </div>
      </div>

      {/* SMART NEXT TOPIC HERO CARD */}
      {nextRec && (
        <div className="bg-gradient-to-r from-cyanAccent-950 via-navy-950 to-navy-900 text-white rounded-3xl p-6 border border-cyanAccent-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyanAccent-500/20 text-cyanAccent-300 border border-cyanAccent-500/30 flex items-center justify-center font-bold flex-shrink-0">
              <Zap className="w-5 h-5 text-cyanAccent-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyanAccent-400 bg-cyanAccent-500/20 px-2 py-0.5 rounded">
                  Next Recommended Topic
                </span>
                <span className="text-xs text-slate-400">
                  Target: <strong>{nextRec.company.name}</strong> ({userProfile.branch})
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {nextRec.topic.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1">{nextRec.topic.description}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedCompanyId(nextRec.company.id);
              setSelectedBranch(userProfile.branch);
              navigateTo('syllabus', nextRec.company.id, userProfile.branch);
            }}
            className="px-5 py-2.5 rounded-xl bg-cyanAccent-500 hover:bg-cyanAccent-400 text-navy-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 flex-shrink-0 self-start md:self-auto"
          >
            <span>Resume Study</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Dashboard Layout (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Drives & Syllabuses */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Urgent Upcoming Drives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-navy-950 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyanAccent-600" />
                  <span>Upcoming Placement Drives</span>
                </h3>
                <p className="text-xs text-slate-500">Official UMS schedule with eligibility checks for your profile</p>
              </div>
              <button
                onClick={() => navigateTo('drives')}
                className="text-xs font-bold text-cyanAccent-700 hover:text-cyanAccent-800 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {drives.slice(0, 3).map(drive => {
                const isEligible = userProfile.cgpa >= drive.minCgpa && drive.eligibleBranches.includes(userProfile.branch);
                const progress = getCompanyProgress(drive.id, userProfile.branch);
                const daysLeft = drive.urgencyDaysLeft || 5;

                return (
                  <div
                    key={drive.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl ${drive.logoBg} text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0`}>
                        {drive.logoText}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-navy-950">{drive.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isEligible ? 'Eligible on UMS' : 'Below Cutoff'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            daysLeft <= 3 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {daysLeft} days left
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">{drive.role}</p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Drive: <strong>{drive.driveDate}</strong>
                          </span>
                          <span>
                            Min CGPA: <strong>{drive.minCgpa}</strong>
                          </span>
                          <span className="font-bold text-navy-950 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-100">
                            {drive.ctcLpa} LPA
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-[11px] text-slate-500 sm:text-right">
                        Prep Progress: <strong className="text-cyanAccent-700 font-bold">{progress.percentage}%</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSaveCompany(drive.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isCompanySaved(drive.id)
                              ? 'bg-cyanAccent-50 border-cyanAccent-300 text-cyanAccent-700'
                              : 'border-slate-200 text-slate-400 hover:text-navy-900'
                          }`}
                          title="Bookmark Drive"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => navigateTo('syllabus', drive.id)}
                          className="px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyanAccent-400" />
                          <span>Prep Syllabus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Saved Companies Quick Access */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-navy-950 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-cyanAccent-600" />
              <span>Saved Companies for Preparation</span>
            </h3>

            {savedDrivesList.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300 space-y-2">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">You haven't bookmarked any placement drives yet.</p>
                <button
                  onClick={() => navigateTo('drives')}
                  className="text-xs font-bold text-cyanAccent-700 hover:underline"
                >
                  Browse Drives & Save Companies
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedDrivesList.map(drive => {
                  const progress = getCompanyProgress(drive.id, userProfile.branch);
                  return (
                    <div
                      key={drive.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-card-hover transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl ${drive.logoBg} text-white font-black text-xs flex items-center justify-center`}>
                              {drive.logoText}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-navy-950 line-clamp-1">{drive.name}</h4>
                              <span className="text-[10px] text-slate-500">{drive.role}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-cyanAccent-700 px-2 py-0.5 rounded bg-cyanAccent-50">
                            {drive.ctcLpa} LPA
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>Preparation Readiness</span>
                            <span className="font-bold text-navy-950">{progress.percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyanAccent-600 rounded-full transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => navigateTo('company-detail', drive.id)}
                          className="text-xs font-semibold text-slate-600 hover:text-navy-950"
                        >
                          UMS Notice
                        </button>
                        <button
                          onClick={() => navigateTo('syllabus', drive.id)}
                          className="text-xs font-bold text-cyanAccent-700 hover:underline flex items-center gap-1"
                        >
                          Open Syllabus →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Progress Widget & Notifications */}
        <div className="space-y-6">
          
          {/* Preparation Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Overall Readiness</span>
              </h3>
              <span className="text-xs font-bold text-cyanAccent-700 bg-cyanAccent-50 px-2 py-0.5 rounded">
                {userProfile.branch}
              </span>
            </div>

            <div className="text-center py-2">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-black text-navy-950 block">{overall.percentage}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Completed Topics</span>
                <strong className="text-navy-950">{overall.completed}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Remaining Target Topics</span>
                <strong className="text-navy-950">{overall.total - overall.completed}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Active Branch Track</span>
                <strong className="text-navy-950">{userProfile.branch}</strong>
              </div>
            </div>

            <button
              onClick={() => navigateTo('my-prep')}
              className="w-full py-3 rounded-2xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Manage Preparation Checklist</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyanAccent-400" />
            </button>
          </div>

          {/* Quick Notice Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyanAccent-600" />
                <span>Placement Notice Feed</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Live UMS Sync</span>
            </div>

            <div className="space-y-3">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => n.companyId && navigateTo('company-detail', n.companyId)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyanAccent-50/50 cursor-pointer border border-slate-100 transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950 line-clamp-1">{n.title}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rumour Buster Teaser */}
          <div className="bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 space-y-3 shadow-lg border border-slate-800">
            <div className="flex items-center gap-2 text-cyanAccent-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyanAccent-400" />
              <span>Campus Rumour Buster</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Heard a weird placement rumour on WhatsApp or Telegram? Check our verified fact-checked database.
            </p>
            <button
              onClick={() => navigateTo('rumours')}
              className="text-xs font-bold text-cyanAccent-300 hover:text-white flex items-center gap-1 pt-1"
            >
              <span>Explore Verified Facts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
