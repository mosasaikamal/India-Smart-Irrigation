import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademicBranch,
  CompanyDrive,
  CompanySyllabus,
  UserProfile,
  NotificationItem,
  RumourFactItem,
  SyllabusTopic
} from '../types/placement';
import {
  INITIAL_USER_PROFILES,
  MOCK_DRIVES,
  MOCK_SYLLABUSES,
  MOCK_NOTIFICATIONS,
  MOCK_RUMOURS
} from '../data/placementData';

export type AppTab =
  | 'home'
  | 'dashboard'
  | 'drives'
  | 'company-detail'
  | 'syllabus'
  | 'my-prep'
  | 'rumours'
  | 'about';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface PlacementContextType {
  currentTab: AppTab;
  selectedCompanyId: string;
  selectedBranch: AcademicBranch;
  userProfile: UserProfile;
  profiles: UserProfile[];
  drives: CompanyDrive[];
  syllabuses: Record<string, CompanySyllabus>;
  notifications: NotificationItem[];
  rumours: RumourFactItem[];
  unreadNotifCount: number;
  isAuthModalOpen: boolean;
  isDownloadModalOpen: boolean;
  searchQuery: string;
  selectedFilterBranch: string;
  toasts: ToastState[];
  drivesViewMode: 'grid' | 'list';
  filterOnlyEligible: boolean;
  
  // Actions
  navigateTo: (tab: AppTab, companyId?: string, branch?: AcademicBranch) => void;
  setSelectedBranch: (branch: AcademicBranch) => void;
  setSelectedCompanyId: (companyId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFilterBranch: (branch: string) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsDownloadModalOpen: (open: boolean) => void;
  setDrivesViewMode: (mode: 'grid' | 'list') => void;
  setFilterOnlyEligible: (val: boolean) => void;
  toggleUpvoteRumour: (id: string) => void;
  
  // Storage & Interactivity
  toggleSaveCompany: (companyId: string) => void;
  isCompanySaved: (companyId: string) => boolean;
  toggleTopicCompletion: (topicId: string) => void;
  isTopicCompleted: (topicId: string) => boolean;
  switchUserProfile: (profileId: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: (id: number) => void;
  
  // Calculations
  getCompanyTopics: (companyId: string, branch?: AcademicBranch) => SyllabusTopic[];
  getCompanyProgress: (companyId: string, branch?: AcademicBranch) => { total: number; completed: number; percentage: number };
  getOverallProgress: () => { total: number; completed: number; percentage: number };
  getSelectedCompany: () => CompanyDrive | undefined;
  getSelectedSyllabus: () => CompanySyllabus | undefined;
  getNextRecommendedTopic: () => { topic: SyllabusTopic; company: CompanyDrive } | null;
}

const PlacementContext = createContext<PlacementContextType | undefined>(undefined);

export const PlacementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('tcs-digital');
  const [selectedBranch, setSelectedBranch] = useState<AcademicBranch>('CSE/IT');
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('btrm_profiles');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILES;
  });
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('btrm_active_profile_id') || INITIAL_USER_PROFILES[0].id;
  });
  
  const [drives] = useState<CompanyDrive[]>(MOCK_DRIVES);
  const [syllabuses] = useState<Record<string, CompanySyllabus>>(MOCK_SYLLABUSES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('btrm_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });
  const [rumours, setRumours] = useState<RumourFactItem[]>(() => {
    const saved = localStorage.getItem('btrm_rumours');
    return saved ? JSON.parse(saved) : MOCK_RUMOURS;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterBranch, setSelectedFilterBranch] = useState('ALL');
  const [drivesViewMode, setDrivesViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOnlyEligible, setFilterOnlyEligible] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Current active user profile
  const userProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Sync selected branch when userProfile changes
  useEffect(() => {
    if (userProfile?.branch) {
      setSelectedBranch(userProfile.branch);
    }
  }, [userProfile?.id]);

  // Persist profiles
  useEffect(() => {
    localStorage.setItem('btrm_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Persist active profile ID
  useEffect(() => {
    localStorage.setItem('btrm_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('btrm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateTo = (tab: AppTab, companyId?: string, branch?: AcademicBranch) => {
    if (companyId) {
      setSelectedCompanyId(companyId);
      // Track recently viewed companies
      setProfiles(prev =>
        prev.map(p => {
          if (p.id === activeProfileId) {
            const recent = [companyId, ...p.recentCompanyIds.filter(id => id !== companyId)].slice(0, 5);
            return { ...p, recentCompanyIds: recent };
          }
          return p;
        })
      );
    }
    if (branch) {
      setSelectedBranch(branch);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveCompany = (companyId: string) => {
    const company = drives.find(d => d.id === companyId);
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === activeProfileId) {
          const isSaved = p.savedCompanyIds.includes(companyId);
          const newSaved = isSaved
            ? p.savedCompanyIds.filter(id => id !== companyId)
            : [...p.savedCompanyIds, companyId];
          return { ...p, savedCompanyIds: newSaved };
        }
        return p;
      })
    );
    const isCurrentlySaved = userProfile.savedCompanyIds.includes(companyId);
    showToast(
      isCurrentlySaved
        ? `Removed ${company?.name || 'Company'} from Saved Drives`
        : `Bookmarked ${company?.name || 'Company'} to My Preparation`,
      'success'
    );
  };

  const isCompanySaved = (companyId: string) => {
    return userProfile.savedCompanyIds.includes(companyId);
  };

  const toggleTopicCompletion = (topicId: string) => {
    const isCompleted = userProfile.completedTopicIds.includes(topicId);
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === activeProfileId) {
          const newCompleted = isCompleted
            ? p.completedTopicIds.filter(id => id !== topicId)
            : [...p.completedTopicIds, topicId];
          return { ...p, completedTopicIds: newCompleted };
        }
        return p;
      })
    );
    showToast(
      isCompleted ? 'Topic marked as pending' : 'Topic marked as completed! Keep going! 🚀',
      isCompleted ? 'info' : 'success'
    );
  };

  const isTopicCompleted = (topicId: string) => {
    return userProfile.completedTopicIds.includes(topicId);
  };

  const switchUserProfile = (profileId: string) => {
    const found = profiles.find(p => p.id === profileId);
    if (found) {
      setActiveProfileId(profileId);
      setSelectedBranch(found.branch);
      showToast(`Switched profile to ${found.name} (${found.branch})`, 'info');
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setProfiles(prev =>
      prev.map(p => (p.id === activeProfileId ? { ...p, ...updates } : p))
    );
    showToast('Student profile updated', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info');
  };

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  const getCompanyTopics = (companyId: string, branch: AcademicBranch = selectedBranch): SyllabusTopic[] => {
    const syllabus = syllabuses[companyId];
    if (!syllabus) return [];
    
    const allTopics: SyllabusTopic[] = [];
    
    // Aptitude topics
    syllabus.aptitudeScreening.forEach(cat => {
      allTopics.push(...cat.topics);
    });

    // Branch topics
    const branchSyl = syllabus.branchSyllabuses[branch];
    if (branchSyl) {
      branchSyl.modules.forEach(mod => {
        allTopics.push(...mod.topics);
      });
    }

    return allTopics;
  };

  const getCompanyProgress = (companyId: string, branch: AcademicBranch = selectedBranch) => {
    const topics = getCompanyTopics(companyId, branch);
    if (topics.length === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = topics.filter(t => userProfile.completedTopicIds.includes(t.id)).length;
    const percentage = Math.round((completed / topics.length) * 100);
    return { total: topics.length, completed, percentage };
  };

  const getOverallProgress = () => {
    // Collect all topics across all companies for user's branch
    const allRelevantTopicIds = new Set<string>();
    Object.keys(syllabuses).forEach(cid => {
      const topics = getCompanyTopics(cid, userProfile.branch);
      topics.forEach(t => allRelevantTopicIds.add(t.id));
    });

    if (allRelevantTopicIds.size === 0) return { total: 0, completed: 0, percentage: 0 };
    const total = allRelevantTopicIds.size;
    let completed = 0;
    allRelevantTopicIds.forEach(id => {
      if (userProfile.completedTopicIds.includes(id)) {
        completed++;
      }
    });
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const toggleUpvoteRumour = (id: string) => {
    setRumours(prev =>
      prev.map(r => {
        if (r.id === id) {
          const isUpvoted = r.userUpvoted;
          const count = r.upvotes || 0;
          return {
            ...r,
            userUpvoted: !isUpvoted,
            upvotes: isUpvoted ? Math.max(0, count - 1) : count + 1
          };
        }
        return r;
      })
    );
    showToast('Feedback recorded on verified rumour fact', 'success');
  };

  const getNextRecommendedTopic = (): { topic: SyllabusTopic; company: CompanyDrive } | null => {
    const targetCompId = userProfile.savedCompanyIds[0] || 'tcs-digital';
    const comp = drives.find(d => d.id === targetCompId) || drives[0];
    const topics = getCompanyTopics(comp.id, userProfile.branch);
    const nextPending = topics.find(t => !userProfile.completedTopicIds.includes(t.id));
    if (nextPending) {
      return { topic: nextPending, company: comp };
    }
    return null;
  };

  const getSelectedCompany = () => {
    return drives.find(d => d.id === selectedCompanyId) || drives[0];
  };

  const getSelectedSyllabus = () => {
    return syllabuses[selectedCompanyId] || syllabuses['tcs-digital'];
  };

  return (
    <PlacementContext.Provider
      value={{
        currentTab,
        selectedCompanyId,
        selectedBranch,
        userProfile,
        profiles,
        drives,
        syllabuses,
        notifications,
        rumours,
        unreadNotifCount,
        isAuthModalOpen,
        isDownloadModalOpen,
        searchQuery,
        selectedFilterBranch,
        drivesViewMode,
        filterOnlyEligible,
        toasts,
        navigateTo,
        setSelectedBranch,
        setSelectedCompanyId,
        setSearchQuery,
        setSelectedFilterBranch,
        setIsAuthModalOpen,
        setIsDownloadModalOpen,
        setDrivesViewMode,
        setFilterOnlyEligible,
        toggleUpvoteRumour,
        toggleSaveCompany,
        isCompanySaved,
        toggleTopicCompletion,
        isTopicCompleted,
        switchUserProfile,
        updateUserProfile,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        showToast,
        dismissToast,
        getCompanyTopics,
        getCompanyProgress,
        getOverallProgress,
        getSelectedCompany,
        getSelectedSyllabus,
        getNextRecommendedTopic
      }}
    >
      {children}
    </PlacementContext.Provider>
  );
};

export const usePlacement = () => {
  const context = useContext(PlacementContext);
  if (!context) {
    throw new Error('usePlacement must be used within a PlacementProvider');
  }
  return context;
};
