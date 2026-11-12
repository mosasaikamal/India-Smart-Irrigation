export type AcademicBranch = 'CSE/IT' | 'ECE/EEE' | 'ME/CE';

export type DriveStatus = 'Open' | 'Closing Soon' | 'Shortlisting' | 'Upcoming' | 'Completed';

export interface OfficialNoticeDetails {
  tenthTwelfthMinPercent: number;
  cgpaCutoff: number;
  backlogsAllowed: string;
  bondPeriodMonths?: number;
  dressCode: string;
  reportingVenue: string;
  reportingTime: string;
  mandatoryDocuments: string[];
  serviceAgreementDetails?: string;
}

export interface SelectionProcessRound {
  roundNumber: number;
  title: string;
  mode: 'Online Test' | 'Technical Interview' | 'Managerial Interview' | 'HR Interview' | 'Group Discussion';
  duration: string;
  description: string;
}

export interface CompanyDrive {
  id: string;
  name: string;
  slug: string;
  logoText: string;
  logoBg: string;
  role: string;
  ctcLpa: number | string; // e.g. 12.5 or "9 - 14"
  driveDate: string; // e.g. "Nov 22, 2026"
  deadlineDate: string; // e.g. "Nov 18, 2026, 11:59 PM"
  minCgpa: number;
  maxActiveBacklogs: number;
  eligibleBranches: AcademicBranch[];
  jobType: 'Full Time' | 'Internship + PPO' | 'Specialist Engineer';
  location: string;
  status: DriveStatus;
  umsCircularId: string;
  umsCircularDate: string;
  officialEligibilitySummary: string;
  officialNotice: OfficialNoticeDetails;
  selectionProcess: SelectionProcessRound[];
  preparationSummary: string;
  verifiedStatus: 'Verified (Demo)' | 'Under Review' | 'Community Sourced';
  syllabusAvailable: boolean;
  totalTopicsCount: number;
  tier?: 'Super Dream' | 'Dream' | 'Standard';
  urgencyDaysLeft?: number;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  priority: 'High' | 'Medium' | 'Low';
  keyConcepts: string[];
  sampleQuestion?: string;
  preparationTip?: string;
}

export interface SyllabusModule {
  id: string;
  title: string;
  description: string;
  category: string;
  topics: SyllabusTopic[];
}

export interface BranchSyllabus {
  branchKey: AcademicBranch;
  branchLabel: string;
  summary: string;
  recommendedDurationWeeks: number;
  modules: SyllabusModule[];
}

export interface AptitudeCategory {
  id: string;
  title: string;
  description: string;
  questionCountEstimate: string;
  topics: SyllabusTopic[];
}

export interface InterviewGuidanceRound {
  roundNumber: number;
  roundName: string;
  roundType: 'Online Assessment' | 'Technical Interview 1' | 'Technical Interview 2 / Managerial' | 'HR Round';
  duration: string;
  focusAreas: string[];
  sampleQuestions: { question: string; context: string; recommendedApproach: string }[];
  dos: string[];
  donts: string[];
}

export interface ContributorInfo {
  name: string;
  role: string;
  batch: string;
  branch: string;
  companyPlaced: string;
}

export interface CompanySyllabus {
  companyId: string;
  companyName: string;
  lastUpdated: string;
  verifiedBy: string;
  verificationDate: string;
  sourceOfInformation: string;
  confidenceScore: number; // e.g. 96 (%)
  historicalPatternDisclaimer: string;
  contributors: ContributorInfo[];
  aptitudeScreening: AptitudeCategory[];
  branchSyllabuses: Record<AcademicBranch, BranchSyllabus>;
  interviewGuidance: InterviewGuidanceRound[];
  generalAdvice: string[];
  commonMistakes: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  regNo: string;
  email: string;
  cgpa: number;
  branch: AcademicBranch;
  year: string;
  savedCompanyIds: string[];
  completedTopicIds: string[];
  recentCompanyIds: string[];
  streakDays?: number;
  targetPackageGoal?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'ums_drive' | 'syllabus_verified' | 'deadline' | 'deadline_alert' | 'rumour_alert' | 'system';
  unread: boolean;
  companyId?: string;
}

export interface RumourFactItem {
  id: string;
  rumour: string;
  reality: string;
  verdict: 'Busted' | 'Confirmed' | 'Partially True';
  category: 'Eligibility' | 'Technical Round' | 'Aptitude' | 'HR & Policy';
  source: string;
  confidenceNote: string;
  tags: string[];
  upvotes?: number;
  userUpvoted?: boolean;
}
