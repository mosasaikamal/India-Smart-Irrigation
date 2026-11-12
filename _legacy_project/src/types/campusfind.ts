export type ReportType = 'lost' | 'found';

export type ItemStatus = 'lost' | 'found' | 'claim_pending' | 'verified_claimed' | 'returned';

export type ItemCategory = 
  | 'id_cards'
  | 'electronics'
  | 'bottles'
  | 'books_stationery'
  | 'bags'
  | 'keys'
  | 'clothing'
  | 'sports'
  | 'wallets'
  | 'other';

export interface CategoryInfo {
  id: ItemCategory;
  label: string;
  iconName: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'id_cards', label: 'Student / Faculty ID Cards', iconName: 'IdCard', color: 'blue' },
  { id: 'electronics', label: 'Electronics & Gadgets', iconName: 'Smartphone', color: 'indigo' },
  { id: 'bottles', label: 'Bottles & Flasks', iconName: 'CupSoda', color: 'cyan' },
  { id: 'books_stationery', label: 'Notebooks & Stationery', iconName: 'BookOpen', color: 'amber' },
  { id: 'bags', label: 'Bags & Backpacks', iconName: 'Briefcase', color: 'purple' },
  { id: 'keys', label: 'Keys & Locks', iconName: 'Key', color: 'emerald' },
  { id: 'clothing', label: 'Clothing & Wearables', iconName: 'Shirt', color: 'rose' },
  { id: 'sports', label: 'Sports Equipment', iconName: 'Trophy', color: 'orange' },
  { id: 'wallets', label: 'Wallets & Pouches', iconName: 'Wallet', color: 'teal' },
  { id: 'other', label: 'Other Items', iconName: 'Package', color: 'slate' },
];

export const CAMPUS_LOCATIONS = [
  'Central Library (Reference / 2nd Floor)',
  'Block 34 (Computer Science & Engineering)',
  'Block 36 (Applied Sciences & Labs)',
  'Block 38 (Management & Arts)',
  'Uni-Mall & Food Court (Ground Floor)',
  'Baldev Raj Mittal Unipolis',
  'Shanti Devi Mittal Sports Complex',
  'Boys Hostel Reception (BH-1 to BH-7)',
  'Girls Hostel Reception (GH-1 to GH-6)',
  'Central Mess & Food Streets',
  'Main Security Desk (Gate 1 - Main Entrance)',
  'Main Security Desk (Gate 2 - GT Road)',
  'Classroom Complex (Block 32 / 33)',
  'Campus Hospital / Health Centre',
  'Auditorium & Law Block (Block 25-28)',
] as const;

export type CampusLocation = typeof CAMPUS_LOCATIONS[number] | string;

export interface ItemReport {
  id: string; // e.g. "LOST-2026-001" or "FND-2026-002"
  type: ReportType;
  title: string;
  category: ItemCategory;
  description: string;
  location: CampusLocation;
  date: string; // YYYY-MM-DD
  status: ItemStatus;
  imageUrl?: string;
  
  // Privacy & Verification fields
  distinguishingFeature?: string; // Private details for owner verification
  contactPreference?: 'email' | 'phone' | 'desk';
  reporterName: string;
  reporterContact?: string;
  reporterRole?: 'student' | 'faculty' | 'guard' | 'staff';
  
  // For Found Items specifically
  storageLocation?: string; // e.g., "Deposited at Library Reception - Counter 2"
  handoverPreference?: string;
  verificationQuestion?: string; // e.g. "What color keychain is attached?"
  secretVerificationAnswer?: string; // Staff-only check: never shown to claimants!
  
  // Metadata
  createdAt: string;
  returnedAt?: string;
  returnedTo?: string;
  tags?: string[];
}

export interface ClaimRequest {
  id: string; // e.g. "CLM-2026-801"
  itemId: string;
  itemTitle: string;
  itemCategory: ItemCategory;
  claimantName: string;
  claimantRegNo: string;
  claimantEmail: string;
  claimantPhone: string;
  proofDescription: string;
  verificationAnswerProvided: string;
  claimDate: string;
  status: 'pending' | 'approved' | 'rejected';
  staffNotes?: string;
  collectionLocation?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface MatchScoreReason {
  categoryMatched: boolean;
  locationMatched: boolean;
  keywordsMatched: string[];
  dateProximityDays: number;
}

export interface MatchResult {
  sourceItem: ItemReport;
  matchedItem: ItemReport;
  score: number; // 0 - 100
  matchConfidence: 'high' | 'medium' | 'possible';
  reasons: string[];
}

export type UserRole = 'student' | 'staff';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
