import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ItemReport, 
  ClaimRequest, 
  UserRole, 
  ToastMessage, 
  ItemCategory,
  CampusLocation
} from '../types/campusfind';
import { INITIAL_ITEMS, INITIAL_CLAIMS } from '../data/sampleData';
import { findMatchesForItem } from '../utils/matchingEngine';

export type NavigationTab = 
  | 'home'
  | 'browse'
  | 'report-lost'
  | 'report-found'
  | 'my-reports'
  | 'help'
  | 'dashboard'
  | 'item-detail'
  | 'claim-item'
  | 'claim-status'
  | 'admin'
  | 'design-thinking';

interface CampusFindContextType {
  // Navigation & View
  currentTab: NavigationTab;
  selectedItemId: string | null;
  selectedClaimId: string | null;
  navigateTo: (tab: NavigationTab, itemId?: string, claimId?: string) => void;
  
  // User Role
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;

  // Data Store
  items: ItemReport[];
  claims: ClaimRequest[];
  
  // Actions
  reportLostItem: (data: Omit<ItemReport, 'id' | 'type' | 'status' | 'createdAt'>) => string;
  reportFoundItem: (data: Omit<ItemReport, 'id' | 'type' | 'status' | 'createdAt'>) => string;
  submitClaim: (data: Omit<ClaimRequest, 'id' | 'status' | 'claimDate'>) => string;
  approveClaim: (claimId: string, staffNotes?: string, collectionLocation?: string) => void;
  rejectClaim: (claimId: string, staffNotes?: string) => void;
  markItemAsReturned: (itemId: string, returnedTo?: string) => void;
  deleteReport: (itemId: string) => void;
  resetToDemoData: () => void;

  // Search & Global Filter Shortcut
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: ItemCategory | 'all';
  setCategoryFilter: (category: ItemCategory | 'all') => void;
  typeFilter: 'all' | 'lost' | 'found' | 'returned';
  setTypeFilter: (type: 'all' | 'lost' | 'found' | 'returned') => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;

  // Matching helper
  getMatchesForItem: (item: ItemReport) => ReturnType<typeof findMatchesForItem>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const CampusFindContext = createContext<CampusFindContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ITEMS: 'campusfind_items_v2',
  CLAIMS: 'campusfind_claims_v2',
  ROLE: 'campusfind_user_role_v2'
};

export const CampusFindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found' | 'returned'>('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Role State (default student, can toggle to staff for viva evaluation)
  const [role, setRoleState] = useState<UserRole>('student');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Items and Claims Store
  const [items, setItems] = useState<ItemReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved items from localStorage:', e);
    }
    return INITIAL_ITEMS;
  });

  const [claims, setClaims] = useState<ClaimRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved claims from localStorage:', e);
    }
    return INITIAL_CLAIMS;
  });

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving items to localStorage:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    } catch (e) {
      console.error('Error saving claims to localStorage:', e);
    }
  }, [claims]);

  // Toast Helpers
  const addToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, description, type }]);

    // Auto dismiss after 5s
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
    } catch {
      // ignore
    }
    addToast(
      `Switched to ${newRole === 'staff' ? 'Staff / Security View' : 'Student View'}`,
      newRole === 'staff' ? 'Unlocked administrative controls & claim verification.' : 'Browsing as campus student.',
      'info'
    );
  };

  const toggleRole = () => {
    setRole(role === 'student' ? 'staff' : 'student');
  };

  const navigateTo = (tab: NavigationTab, itemId?: string, claimId?: string) => {
    if (itemId !== undefined) {
      setSelectedItemId(itemId);
    }
    if (claimId !== undefined) {
      setSelectedClaimId(claimId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Report Lost Item
  const reportLostItem = (data: Omit<ItemReport, 'id' | 'type' | 'status' | 'createdAt'>): string => {
    const nextNumber = items.filter(i => i.type === 'lost').length + 1;
    const newId = `LOST-2026-${String(nextNumber).padStart(3, '0')}`;

    const newItem: ItemReport = {
      ...data,
      id: newId,
      type: 'lost',
      status: 'lost',
      createdAt: new Date().toISOString()
    };

    setItems(prev => [newItem, ...prev]);
    addToast(
      'Lost Item Reported Successfully!',
      `Report #${newId} recorded. You will be alerted when a matching item is found.`,
      'success'
    );
    return newId;
  };

  // Report Found Item
  const reportFoundItem = (data: Omit<ItemReport, 'id' | 'type' | 'status' | 'createdAt'>): string => {
    const nextNumber = items.filter(i => i.type === 'found').length + 101;
    const newId = `FND-2026-${String(nextNumber).padStart(3, '0')}`;

    const newItem: ItemReport = {
      ...data,
      id: newId,
      type: 'found',
      status: 'found',
      createdAt: new Date().toISOString()
    };

    setItems(prev => [newItem, ...prev]);
    addToast(
      'Found Item Registered!',
      `Report #${newId} logged. Thank you for making our campus safer and more helpful.`,
      'success'
    );
    return newId;
  };

  // Submit Claim Request
  const submitClaim = (data: Omit<ClaimRequest, 'id' | 'status' | 'claimDate'>): string => {
    const nextNumber = claims.length + 801;
    const newClaimId = `CLM-2026-${String(nextNumber).padStart(3, '0')}`;

    const newClaim: ClaimRequest = {
      ...data,
      id: newClaimId,
      claimDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    // Update item status to claim_pending
    setItems(prev => prev.map(item => {
      if (item.id === data.itemId) {
        return { ...item, status: 'claim_pending' };
      }
      return item;
    }));

    setClaims(prev => [newClaim, ...prev]);
    addToast(
      'Ownership Claim Submitted!',
      `Claim #${newClaimId} is under verification by campus security / staff.`,
      'success'
    );
    return newClaimId;
  };

  // Approve Claim
  const approveClaim = (claimId: string, staffNotes?: string, collectionLocation?: string) => {
    let targetItemId = '';

    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        targetItemId = c.itemId;
        return {
          ...c,
          status: 'approved',
          staffNotes: staffNotes || c.staffNotes || 'Approved by campus authority upon verification.',
          collectionLocation: collectionLocation || 'Central Security Office (Main Gate 1 Booth)',
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Campus Security / Staff Desk'
        };
      }
      return c;
    }));

    if (targetItemId) {
      setItems(prev => prev.map(item => {
        if (item.id === targetItemId) {
          return { ...item, status: 'verified_claimed' };
        }
        return item;
      }));
    }

    addToast(
      'Claim Approved Successfully',
      `Claim #${claimId} approved. Pickup instructions have been updated for claimant.`,
      'success'
    );
  };

  // Reject Claim
  const rejectClaim = (claimId: string, staffNotes?: string) => {
    let targetItemId = '';

    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        targetItemId = c.itemId;
        return {
          ...c,
          status: 'rejected',
          staffNotes: staffNotes || 'Ownership proof could not be verified against the item record.',
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Campus Security Desk'
        };
      }
      return c;
    }));

    if (targetItemId) {
      // Revert item back to found status so others or re-claims are possible
      setItems(prev => prev.map(item => {
        if (item.id === targetItemId) {
          return { ...item, status: 'found' };
        }
        return item;
      }));
    }

    addToast('Claim Rejected', `Claim #${claimId} was marked as rejected.`, 'warning');
  };

  // Mark Item as Returned
  const markItemAsReturned = (itemId: string, returnedTo?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'returned',
          returnedAt: new Date().toISOString(),
          returnedTo: returnedTo || 'Verified Student Owner'
        };
      }
      return item;
    }));

    // If there's an approved claim for this item, mark it complete
    setClaims(prev => prev.map(c => {
      if (c.itemId === itemId && c.status === 'approved') {
        return {
          ...c,
          staffNotes: (c.staffNotes ? c.staffNotes + ' | ' : '') + 'Item physically collected.'
        };
      }
      return c;
    }));

    addToast(
      'Item Handover Complete! 🎉',
      `Item #${itemId} marked as successfully returned to owner.`,
      'success'
    );
  };

  // Delete Report
  const deleteReport = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    setClaims(prev => prev.filter(c => c.itemId !== itemId));
    addToast('Report Removed', `Item #${itemId} removed from system.`, 'info');
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setItems(INITIAL_ITEMS);
    setClaims(INITIAL_CLAIMS);
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
    } catch {
      // ignore
    }
    addToast('Demo Data Restored', 'Sample lost, found, and claim records reloaded.', 'info');
  };

  const getMatchesForItem = (item: ItemReport) => {
    return findMatchesForItem(item, items);
  };

  return (
    <CampusFindContext.Provider
      value={{
        currentTab,
        selectedItemId,
        selectedClaimId,
        navigateTo,
        role,
        setRole,
        toggleRole,
        items,
        claims,
        reportLostItem,
        reportFoundItem,
        submitClaim,
        approveClaim,
        rejectClaim,
        markItemAsReturned,
        deleteReport,
        resetToDemoData,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        typeFilter,
        setTypeFilter,
        locationFilter,
        setLocationFilter,
        getMatchesForItem,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </CampusFindContext.Provider>
  );
};

export const useCampusFind = () => {
  const context = useContext(CampusFindContext);
  if (!context) {
    throw new Error('useCampusFind must be used within a CampusFindProvider');
  }
  return context;
};
