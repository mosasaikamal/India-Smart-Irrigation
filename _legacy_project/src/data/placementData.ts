import {
  CompanyDrive,
  CompanySyllabus,
  UserProfile,
  NotificationItem,
  RumourFactItem,
  AcademicBranch
} from '../types/placement';

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'user-aryan',
    name: 'Aryan Sharma',
    regNo: '12108452',
    email: 'aryan.sharma@lpu.in',
    cgpa: 8.42,
    branch: 'CSE/IT',
    year: '4th Year (Batch 2027)',
    savedCompanyIds: ['tcs-digital', 'google-swe', 'microsoft-swe'],
    completedTopicIds: ['tcs-quant-1', 'tcs-quant-2', 'tcs-cse-dsa-1', 'tcs-cse-dbms-1', 'goog-cse-arrays'],
    recentCompanyIds: ['tcs-digital', 'google-swe'],
    streakDays: 4,
    targetPackageGoal: '12+ LPA'
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    regNo: '12104391',
    email: 'priya.patel@lpu.in',
    cgpa: 7.85,
    branch: 'ECE/EEE',
    year: '4th Year (Batch 2027)',
    savedCompanyIds: ['texas-instruments', 'tcs-digital'],
    completedTopicIds: ['ti-ece-dig-1', 'ti-ece-micro-1', 'tcs-quant-1'],
    recentCompanyIds: ['texas-instruments'],
    streakDays: 3,
    targetPackageGoal: '10+ LPA'
  },
  {
    id: 'user-rahul',
    name: 'Rahul Verma',
    regNo: '12109823',
    email: 'rahul.verma@lpu.in',
    cgpa: 7.30,
    branch: 'ME/CE',
    year: '4th Year (Batch 2027)',
    savedCompanyIds: ['lt-construction', 'tcs-digital'],
    completedTopicIds: ['lt-me-thermo-1', 'lt-me-mechanics-1'],
    recentCompanyIds: ['lt-construction'],
    streakDays: 2,
    targetPackageGoal: '7+ LPA'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'UMS Notice: TCS Digital Drive Schedule Released',
    message: 'Placement registration for TCS Digital closes on Nov 18, 2026. Verify your CGPA on UMS before applying.',
    timestamp: '15 mins ago',
    type: 'ums_drive',
    unread: true,
    companyId: 'tcs-digital'
  },
  {
    id: 'notif-2',
    title: 'Verified Syllabus Added: Texas Instruments (ECE/EEE)',
    message: 'Our alumni-verified technical breakdown for TI Embedded & Digital rounds is now live.',
    timestamp: '2 hours ago',
    type: 'syllabus_verified',
    unread: true,
    companyId: 'texas-instruments'
  },
  {
    id: 'notif-3',
    title: 'Deadline Alert: Google Campus Application',
    message: 'Only 3 days remaining to submit your verified resume for Google SWE Campus Drive.',
    timestamp: '1 day ago',
    type: 'deadline',
    unread: false,
    companyId: 'google-swe'
  },
  {
    id: 'notif-4',
    title: 'Rumour Busted: TCS Digital Coding Languages',
    message: 'Official confirmation: C, C++, Java, and Python 3 are all allowed in the coding section.',
    timestamp: '2 days ago',
    type: 'rumour_alert',
    unread: false
  }
];

export const MOCK_DRIVES: CompanyDrive[] = [
  {
    id: 'tcs-digital',
    name: 'Tata Consultancy Services (TCS Digital / Prime)',
    slug: 'tcs-digital',
    logoText: 'TCS',
    logoBg: 'bg-gradient-to-br from-blue-700 to-indigo-900',
    role: 'Digital Software Engineer & Systems Architect',
    ctcLpa: '7.5 - 9.0',
    driveDate: 'Nov 24, 2026',
    deadlineDate: 'Nov 18, 2026, 11:59 PM',
    minCgpa: 6.5,
    maxActiveBacklogs: 0,
    eligibleBranches: ['CSE/IT', 'ECE/EEE', 'ME/CE'],
    jobType: 'Full Time',
    location: 'Pan India (Bengaluru, Hyderabad, Pune, Delhi NCR)',
    status: 'Closing Soon',
    umsCircularId: 'UMS/T&P/2026-27/D-408',
    umsCircularDate: 'Nov 04, 2026',
    officialEligibilitySummary: 'Min 60% or 6.5 CGPA in 10th, 12th, and ongoing B.Tech. No active backlogs allowed. Max academic gap of 2 years allowed.',
    officialNotice: {
      tenthTwelfthMinPercent: 60,
      cgpaCutoff: 6.5,
      backlogsAllowed: 'Strictly 0 active backlogs at time of drive. Past cleared backlogs permitted.',
      bondPeriodMonths: 12,
      dressCode: 'Strict Formal Attire (White shirt, dark trousers, formal leather shoes, college ID card)',
      reportingVenue: 'Block 34, Shanti Devi Mittal Auditorium & Online Proctored Portal',
      reportingTime: '08:30 AM Sharp on Nov 24, 2026',
      mandatoryDocuments: [
        'LPU Student ID Card (Original + 1 Photocopy)',
        'Updated Resume (2 Hard copies with recent passport photo)',
        'Government Photo ID (Aadhaar Card or Passport)',
        '10th, 12th, and all B.Tech semester grade sheets (Self-attested)'
      ],
      serviceAgreementDetails: '1-year service commitment with retention bonus upon completion.'
    },
    selectionProcess: [
      {
        roundNumber: 1,
        title: 'National Qualifier Online Assessment',
        mode: 'Online Test',
        duration: '110 Minutes',
        description: 'Advanced Quantitative Aptitude (30m), Logical Reasoning (30m), and 2 Hands-on Coding problems (50m).'
      },
      {
        roundNumber: 2,
        title: 'Technical Interview',
        mode: 'Technical Interview',
        duration: '45 Minutes',
        description: 'Deep dive into data structures, branch-specific core fundamentals, OOP, SQL, and final-year capstone project.'
      },
      {
        roundNumber: 3,
        title: 'Managerial & HR Interview',
        mode: 'HR Interview',
        duration: '25 Minutes',
        description: 'Evaluation of adaptability, problem-solving mindset, relocation readiness, communication and cultural fit.'
      }
    ],
    preparationSummary: 'Heavy focus on speed math, logical data sufficiency, and standard dynamic programming/hashmap problems for Round 1.',
    verifiedStatus: 'Verified (Demo)',
    syllabusAvailable: true,
    totalTopicsCount: 24,
    tier: 'Dream',
    urgencyDaysLeft: 2
  },
  {
    id: 'google-swe',
    name: 'Google India',
    slug: 'google-swe',
    logoText: 'G',
    logoBg: 'bg-gradient-to-br from-red-500 via-yellow-500 to-blue-600',
    role: 'Software Engineer - University Graduate',
    ctcLpa: 32.5,
    driveDate: 'Dec 02, 2026',
    deadlineDate: 'Nov 22, 2026, 06:00 PM',
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    eligibleBranches: ['CSE/IT', 'ECE/EEE'],
    jobType: 'Full Time',
    location: 'Bengaluru / Hyderabad',
    status: 'Open',
    umsCircularId: 'UMS/T&P/2026-27/D-422',
    umsCircularDate: 'Nov 06, 2026',
    officialEligibilitySummary: 'Min 7.5 CGPA with zero active backlogs. Strong foundations in computer science theory and scalable algorithms.',
    officialNotice: {
      tenthTwelfthMinPercent: 75,
      cgpaCutoff: 7.5,
      backlogsAllowed: 'Zero active or pending backlogs. No academic gap exceeding 1 year.',
      dressCode: 'Business Casuals / Neat Collared Shirt with ID Card',
      reportingVenue: 'Google Meet Virtual Drive & Coding Sandbox',
      reportingTime: '15 Minutes prior to scheduled interview link',
      mandatoryDocuments: [
        'Current University Transcript with Official Stamp',
        'Official Government ID (Passport / Aadhaar)',
        'Comprehensive 1-page Technical Resume',
        'GitHub repository links of featured projects'
      ]
    },
    selectionProcess: [
      {
        roundNumber: 1,
        title: 'Online Coding Challenge (Google Sandbox)',
        mode: 'Online Test',
        duration: '90 Minutes',
        description: 'Two complex algorithmic problems covering graph traversals, dynamic programming, or interval scheduling.'
      },
      {
        roundNumber: 2,
        title: 'Technical Coding Interview 1',
        mode: 'Technical Interview',
        duration: '45 Minutes',
        description: 'Live interactive coding on Google Docs/Sandbox with emphasis on time/space trade-offs and edge-case handling.'
      },
      {
        roundNumber: 3,
        title: 'Technical Coding Interview 2 (System & Algorithms)',
        mode: 'Technical Interview',
        duration: '45 Minutes',
        description: 'Advanced data structure design, recursion, concurrency basics, and algorithmic optimizations.'
      },
      {
        roundNumber: 4,
        title: 'Googliness & Leadership Round',
        mode: 'HR Interview',
        duration: '30 Minutes',
        description: 'Behavioral scenarios, diversity awareness, ethical problem solving, and collaboration history.'
      }
    ],
    preparationSummary: 'Rigorous algorithmic depth required. Master binary search variants, DFS/BFS on grids, 2-pointer sliding windows, and memoization.',
    verifiedStatus: 'Verified (Demo)',
    syllabusAvailable: true,
    totalTopicsCount: 28,
    tier: 'Super Dream',
    urgencyDaysLeft: 6
  },
  {
    id: 'texas-instruments',
    name: 'Texas Instruments (TI)',
    slug: 'texas-instruments',
    logoText: 'TI',
    logoBg: 'bg-gradient-to-br from-red-700 to-rose-950',
    role: 'Analog / Digital & Embedded Systems Engineer',
    ctcLpa: 18.5,
    driveDate: 'Nov 30, 2026',
    deadlineDate: 'Nov 20, 2026, 05:00 PM',
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    eligibleBranches: ['ECE/EEE', 'CSE/IT'],
    jobType: 'Full Time',
    location: 'Bengaluru',
    status: 'Open',
    umsCircularId: 'UMS/T&P/2026-27/D-415',
    umsCircularDate: 'Nov 02, 2026',
    officialEligibilitySummary: 'B.Tech ECE, EEE, or relevant Dual Degree with min 7.0 CGPA. Strong grip on digital design, microcontrollers, and C programming.',
    officialNotice: {
      tenthTwelfthMinPercent: 70,
      cgpaCutoff: 7.0,
      backlogsAllowed: '0 active backlogs allowed. Max 1 cleared backlog permitted in earlier semesters.',
      dressCode: 'Formals / Smart Casuals with University ID badge',
      reportingVenue: 'Block 38 - Embedded Systems Lab & Virtual Teams Call',
      reportingTime: '09:00 AM on Nov 30, 2026',
      mandatoryDocuments: [
        'LPU Student ID Card',
        'Academic transcripts up to 6th Semester',
        'Hardware / Embedded Project Portfolio Document',
        'Aadhaar / Passport'
      ]
    },
    selectionProcess: [
      {
        roundNumber: 1,
        title: 'Technical Screening Test (Digital + Analog + C)',
        mode: 'Online Test',
        duration: '75 Minutes',
        description: 'Core electronics MCQs, timing diagrams, K-maps, op-amp circuits, and bitwise C manipulation questions.'
      },
      {
        roundNumber: 2,
        title: 'Technical Deep-Dive Round',
        mode: 'Technical Interview',
        duration: '60 Minutes',
        description: 'Whiteboard logic circuit design, state machine synthesis (Moore/Mealy), timer interrupts, and memory-mapped I/O.'
      },
      {
        roundNumber: 3,
        title: 'Techno-Managerial & Fitment Round',
        mode: 'Managerial Interview',
        duration: '40 Minutes',
        description: 'Lab experience discussion, hardware debugging methodologies, cross-domain collaboration, and work ethics.'
      }
    ],
    preparationSummary: 'Essential for ECE: Master flip-flops, setup/hold time violations, ARM Cortex architecture, and pointer manipulation in Embedded C.',
    verifiedStatus: 'Verified (Demo)',
    syllabusAvailable: true,
    totalTopicsCount: 22,
    tier: 'Super Dream',
    urgencyDaysLeft: 4
  },
  {
    id: 'lt-construction',
    name: 'Larsen & Toubro (L&T)',
    slug: 'lt-construction',
    logoText: 'L&T',
    logoBg: 'bg-gradient-to-br from-amber-600 to-yellow-800',
    role: 'Graduate Engineer Trainee (GET) - Engineering & Projects',
    ctcLpa: 7.2,
    driveDate: 'Dec 08, 2026',
    deadlineDate: 'Nov 28, 2026, 11:59 PM',
    minCgpa: 6.75,
    maxActiveBacklogs: 0,
    eligibleBranches: ['ME/CE', 'ECE/EEE'],
    jobType: 'Full Time',
    location: 'Mumbai, Chennai, Site Offices Pan-India',
    status: 'Upcoming',
    umsCircularId: 'UMS/T&P/2026-27/D-430',
    umsCircularDate: 'Nov 07, 2026',
    officialEligibilitySummary: 'Min 65% aggregate in 10th, 12th & min 6.75 CGPA in B.Tech Mechanical / Civil / Electrical without active backlogs.',
    officialNotice: {
      tenthTwelfthMinPercent: 65,
      cgpaCutoff: 6.75,
      backlogsAllowed: 'Strictly zero pending backlogs. Must be medically fit for site operations.',
      bondPeriodMonths: 24,
      dressCode: 'Formals (Light shirt, dark trousers, formal shoes)',
      reportingVenue: 'Block 13 - Civil & Mechanical Engineering Block',
      reportingTime: '08:45 AM on Dec 08, 2026',
      mandatoryDocuments: [
        'LPU Student ID Card (Original)',
        'Updated Resume (3 copies)',
        'Class 10th and 12th Marksheets (Original for verification)',
        'Semester marksheets up to 6th Semester'
      ]
    },
    selectionProcess: [
      {
        roundNumber: 1,
        title: 'L&T GET National Aptitude & Technical Assessment',
        mode: 'Online Test',
        duration: '120 Minutes',
        description: 'Section 1: General Aptitude & Verbal (40m), Section 2: Domain Technical (Mechanical / Civil core) (80m).'
      },
      {
        roundNumber: 2,
        title: 'Group Discussion & Case Study',
        mode: 'Group Discussion',
        duration: '30 Minutes',
        description: 'Real-world infrastructure problem statement: team dynamics, cost optimization, and safety considerations.'
      },
      {
        roundNumber: 3,
        title: 'Technical & HR Panel Interview',
        mode: 'Technical Interview',
        duration: '45 Minutes',
        description: 'Solid mechanics, thermodynamics, fluid machinery, project estimation, readiness for industrial site postings.'
      }
    ],
    preparationSummary: 'Focus on Strength of Materials, Thermodynamics laws, Fluid mechanics, Structural analysis, and engineering drawing standards.',
    verifiedStatus: 'Verified (Demo)',
    syllabusAvailable: true,
    totalTopicsCount: 20,
    tier: 'Standard',
    urgencyDaysLeft: 12
  },
  {
    id: 'cognizant-genc-next',
    name: 'Cognizant (GenC Next)',
    slug: 'cognizant-genc-next',
    logoText: 'CTS',
    logoBg: 'bg-gradient-to-br from-cyan-600 to-blue-900',
    role: 'Digital Specialist Engineer & Cloud Associate',
    ctcLpa: '6.75 - 9.0',
    driveDate: 'Dec 12, 2026',
    deadlineDate: 'Dec 01, 2026, 11:59 PM',
    minCgpa: 6.5,
    maxActiveBacklogs: 0,
    eligibleBranches: ['CSE/IT', 'ECE/EEE', 'ME/CE'],
    jobType: 'Full Time',
    location: 'Chennai, Coimbatore, Bengaluru, Kolkata, Pune',
    status: 'Upcoming',
    umsCircularId: 'UMS/T&P/2026-27/D-438',
    umsCircularDate: 'Nov 09, 2026',
    officialEligibilitySummary: 'Min 60% throughout academics with max 1 year study gap. Open to all branches with coding aptitude.',
    officialNotice: {
      tenthTwelfthMinPercent: 60,
      cgpaCutoff: 6.5,
      backlogsAllowed: 'No current standing arrears/backlogs allowed.',
      dressCode: 'Formals / Smart Formals',
      reportingVenue: 'Superset / Virtual Assessment Platform',
      reportingTime: 'As per individual slot allocation',
      mandatoryDocuments: [
        'Government ID Proof',
        'All semester marks memos',
        'Passport-sized photographs',
        'Signed Student Placement Undertaking Form'
      ]
    },
    selectionProcess: [
      {
        roundNumber: 1,
        title: 'GenC Next Skill-Based Assessment',
        mode: 'Online Test',
        duration: '100 Minutes',
        description: 'Advanced Coding (2 questions: DP / Trees), SQL query writing, and Cloud/Web architecture fundamentals.'
      },
      {
        roundNumber: 2,
        title: 'Combined Technical & Fitment Interview',
        mode: 'Technical Interview',
        duration: '40 Minutes',
        description: 'Project code review, REST APIs, database normalization, agile workflows, and willingness to learn emerging tech.'
      }
    ],
    preparationSummary: 'Brush up on SQL JOINs, REST API concepts, Git commands, and medium-difficulty array/string manipulation questions.',
    verifiedStatus: 'Verified (Demo)',
    syllabusAvailable: true,
    totalTopicsCount: 21,
    tier: 'Dream',
    urgencyDaysLeft: 15
  },
  {
    id: 'microsoft-swe',
    name: 'Microsoft India',
    slug: 'microsoft-swe',
    logoText: 'MSFT',
    logoBg: 'bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-950',
    role: 'Software Development Engineer - Campus Hire',
    ctcLpa: 44.0,
    driveDate: 'Dec 18, 2026',
    deadlineDate: 'Dec 05, 2026, 05:00 PM',
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    eligibleBranches: ['CSE/IT', 'ECE/EEE'],
    jobType: 'Full Time',
    location: 'Hyderabad, Bengaluru, Noida',
    status: 'Upcoming',
    umsCircularId: 'UMS/T&P/2026-27/D-445',
    umsCircularDate: 'Nov 09, 2026',
    officialEligibilitySummary: 'Min 8.0 CGPA throughout engineering. Exceptional grasp of scalable system design and data structures.',
    officialNotice: {
      tenthTwelfthMinPercent: 80,
      cgpaCutoff: 8.0,
      backlogsAllowed: 'Strictly zero backlogs throughout history (all previous semesters cleared in first attempt).',
      dressCode: 'Smart Casuals',
      reportingVenue: 'Microsoft Teams Campus Portal',
      reportingTime: '10 Minutes prior to slot',
      mandatoryDocuments: [
        'Official Transcript from Examination Department',
        'Verified Resume with live project URLs',
        'Valid Passport / Aadhaar Card'
      ]
    },
    selectionProcess: [
      {
        roundNumber: 1,
        title: 'Codility Online Screening Challenge',
        mode: 'Online Test',
        duration: '90 Minutes',
        description: '3 Algorithmic questions covering dynamic programming, graph traversal, and bitwise optimization.'
      },
      {
        roundNumber: 2,
        title: 'Technical Round 1 (Data Structures & Coding)',
        mode: 'Technical Interview',
        duration: '50 Minutes',
        description: 'Live coding on shared editor, code modularity, test cases, time and space complexity discussion.'
      },
      {
        roundNumber: 3,
        title: 'Technical Round 2 (System Design & OOP)',
        mode: 'Technical Interview',
        duration: '50 Minutes',
        description: 'Low Level Design (LLD) of a real-world system (e.g., parking lot, elevator, rate limiter), OOP principles.'
      },
      {
        roundNumber: 4,
        title: 'AA (As Appropriate) / Leadership Interview',
        mode: 'HR Interview',
        duration: '45 Minutes',
        description: 'Cultural alignment, growth mindset, dealing with ambiguity, and technical passion.'
      }
    ],
    preparationSummary: 'Focus on clean code, design patterns (SOLID), BFS/DFS, Trees, Graphs, and System Design fundamentals.',
    verifiedStatus: 'Verified (Demo)',
    syllabusAvailable: true,
    totalTopicsCount: 30,
    tier: 'Super Dream',
    urgencyDaysLeft: 19
  }
];

export const MOCK_SYLLABUSES: Record<string, CompanySyllabus> = {
  'tcs-digital': {
    companyId: 'tcs-digital',
    companyName: 'Tata Consultancy Services (TCS Digital / Prime)',
    lastUpdated: 'Nov 08, 2026',
    verifiedBy: 'T&P Student Mentor Cell & Alumni Network (Demo Status)',
    verificationDate: 'Verified for 2026-2027 Placement Season',
    sourceOfInformation: 'Aggregated from 34+ verified student interview debriefs (Batch 2024–2026) and mock recruitment evaluations.',
    confidenceScore: 94,
    historicalPatternDisclaimer: 'Important Note: This preparation syllabus is constructed from historical placement trends and senior interview debriefs. Companies update their question banks periodically. This guidance provides proven preparation direction but does not guarantee identical questions.',
    contributors: [
      {
        name: 'Rohan Deshmukh',
        role: 'Placed SDE (TCS Digital)',
        batch: 'B.Tech CSE, Batch 2025',
        branch: 'CSE',
        companyPlaced: 'TCS Digital'
      },
      {
        name: 'Sneha Kumari',
        role: 'Placed Associate (TCS Prime)',
        batch: 'B.Tech ECE, Batch 2025',
        branch: 'ECE',
        companyPlaced: 'TCS Prime'
      },
      {
        name: 'Vikram Singh',
        role: 'Placement Mentor',
        batch: 'B.Tech Mechanical, Batch 2024',
        branch: 'Mechanical',
        companyPlaced: 'TCS Innovation Labs'
      }
    ],
    aptitudeScreening: [
      {
        id: 'tcs-quant',
        title: 'Quantitative Aptitude (Advanced)',
        description: 'High-speed calculation, numerical reasoning, and word problems with negative marking.',
        questionCountEstimate: '15 Questions in 30 Minutes',
        topics: [
          {
            id: 'tcs-quant-1',
            title: 'Numbers, Divisibility & Remainders',
            description: 'Euler totient, unit digits, prime factorization, and trailing zeroes.',
            difficulty: 'Medium',
            estimatedHours: 4,
            priority: 'High',
            keyConcepts: ['Fermat Little Theorem', 'Chinese Remainder Theorem basics', 'Cyclicity of powers'],
            sampleQuestion: 'Find the remainder when 7^84 is divided by 342.',
            preparationTip: 'Memorize cubes up to 25 and squares up to 35 for rapid mental calculation.'
          },
          {
            id: 'tcs-quant-2',
            title: 'Time, Speed & Distance / Work',
            description: 'Relative speed, trains, circular tracks, and pipes & cisterns.',
            difficulty: 'Medium',
            estimatedHours: 3,
            priority: 'High',
            keyConcepts: ['Harmonic mean for average speed', 'LCM method for work', 'Races and head starts'],
            sampleQuestion: 'A and B run in opposite directions around a 400m circular track at 8 m/s and 12 m/s. When will they meet for the 3rd time?'
          },
          {
            id: 'tcs-quant-3',
            title: 'Combinatorics & Probability',
            description: 'Permutations, combinations, conditional probability, and distributions.',
            difficulty: 'Hard',
            estimatedHours: 5,
            priority: 'Medium',
            keyConcepts: ['Derangements formula', 'Selection with repetition', 'Bayes Theorem fundamentals']
          }
        ]
      },
      {
        id: 'tcs-logical',
        title: 'Logical Reasoning & Data Interpretation',
        description: 'Analytical puzzles, blood relations, and complex tabular deductions.',
        questionCountEstimate: '15 Questions in 30 Minutes',
        topics: [
          {
            id: 'tcs-logic-1',
            title: 'Data Sufficiency & Statement Logic',
            description: 'Determining if provided statements are sufficient to answer without solving.',
            difficulty: 'Medium',
            estimatedHours: 3,
            priority: 'High',
            keyConcepts: ['Statement elimination', 'Consistency checks', 'Inequalities evaluation']
          },
          {
            id: 'tcs-logic-2',
            title: 'Seating Arrangements & Grid Puzzles',
            description: 'Circular and linear multi-variable constraints.',
            difficulty: 'Hard',
            estimatedHours: 4,
            priority: 'High',
            keyConcepts: ['Inward/Outward circular logic', 'Parallel rows matching', 'Multi-attribute matrices']
          }
        ]
      }
    ],
    branchSyllabuses: {
      'CSE/IT': {
        branchKey: 'CSE/IT',
        branchLabel: 'Computer Science & Information Technology',
        summary: 'Targeted technical preparation focusing on algorithmic problem solving, database internals, and object-oriented architecture.',
        recommendedDurationWeeks: 4,
        modules: [
          {
            id: 'mod-cse-dsa',
            title: 'Data Structures & Algorithms',
            category: 'Core Coding',
            description: 'Primary coding rounds test efficiency and clean implementation.',
            topics: [
              {
                id: 'tcs-cse-dsa-1',
                title: 'Arrays, Two-Pointers & Sliding Window',
                description: 'Subarray problems, prefix sums, duplicate detection, and window maxima.',
                difficulty: 'Medium',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Kadane Algorithm', 'Dutch National Flag algorithm', 'Prefix-Sum array hashing'],
                sampleQuestion: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its boundaries.',
                preparationTip: 'Ensure your code runs in O(N) time and handles negative integer cases.'
              },
              {
                id: 'tcs-cse-dsa-2',
                title: 'Hashing & HashMaps',
                description: 'Frequency counters, pair sum searches, and string anagrams in O(1) lookup.',
                difficulty: 'Easy',
                estimatedHours: 4,
                priority: 'High',
                keyConcepts: ['Collision resolution strategies', 'HashMap internal bucket structure', 'HashSet uniqueness']
              },
              {
                id: 'tcs-cse-dsa-3',
                title: 'Trees & Binary Search Trees (BST)',
                description: 'Tree traversals (Inorder, Preorder, Postorder, Level order), diameter, LCA.',
                difficulty: 'Hard',
                estimatedHours: 8,
                priority: 'High',
                keyConcepts: ['Lowest Common Ancestor', 'Zigzag level order', 'Valid BST validation']
              },
              {
                id: 'tcs-cse-dsa-4',
                title: 'Dynamic Programming (Knapsack & 1D Array)',
                description: 'Memoization vs tabulation, coin change problem, longest increasing subsequence.',
                difficulty: 'Hard',
                estimatedHours: 10,
                priority: 'High',
                keyConcepts: ['State transition equations', 'Space optimization', 'Overlapping subproblems']
              }
            ]
          },
          {
            id: 'mod-cse-core',
            title: 'Core CS Fundamentals (DBMS, OS, OOP)',
            category: 'Technical Interview',
            description: 'Crucial for passing Round 2 technical panel evaluations.',
            topics: [
              {
                id: 'tcs-cse-dbms-1',
                title: 'Relational Database Management & SQL',
                description: 'ACID properties, indexing (B-Tree/Hash), normalization (1NF to BCNF), and complex JOINs.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['INNER, LEFT, RIGHT, FULL OUTER JOIN', 'Group By & Having clauses', 'Subqueries vs CTEs'],
                sampleQuestion: 'Write a SQL query to find the second highest salary without using the LIMIT or TOP clause.'
              },
              {
                id: 'tcs-cse-oop-1',
                title: 'Object-Oriented Programming (Java/C++)',
                description: 'Abstraction, Encapsulation, Inheritance, Polymorphism, and abstract classes vs interfaces.',
                difficulty: 'Easy',
                estimatedHours: 4,
                priority: 'High',
                keyConcepts: ['Method Overloading vs Overriding', 'Virtual tables (vtable) in C++', 'Garbage collection in Java']
              },
              {
                id: 'tcs-cse-os-1',
                title: 'Operating Systems & Concurrency',
                description: 'Processes vs threads, CPU scheduling algorithms, deadlock handling, virtual memory paging.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'Medium',
                keyConcepts: ['Deadlock 4 conditions', 'Semaphores & Mutexes', 'Page replacement (LRU/FIFO)']
              }
            ]
          }
        ]
      },
      'ECE/EEE': {
        branchKey: 'ECE/EEE',
        branchLabel: 'Electronics & Communication / Electrical Engineering',
        summary: 'Tailored for ECE/EEE candidates: combines essential programming with digital electronics, microprocessors, and circuit logic.',
        recommendedDurationWeeks: 4,
        modules: [
          {
            id: 'mod-ece-digital',
            title: 'Digital Electronics & Logic Design',
            category: 'Core Electronics',
            description: 'Frequently tested in technical interviews for electronics students.',
            topics: [
              {
                id: 'tcs-ece-dig-1',
                title: 'Boolean Algebra, K-Maps & Logic Gates',
                description: 'Minimization of logic expressions, standard POS/SOP forms, universal gates.',
                difficulty: 'Easy',
                estimatedHours: 4,
                priority: 'High',
                keyConcepts: ['4-variable K-Maps', 'Don’t care conditions', 'NAND/NOR gate realizations'],
                sampleQuestion: 'Design an XOR gate using only 4 two-input NAND gates.'
              },
              {
                id: 'tcs-ece-dig-2',
                title: 'Combinational & Sequential Circuits',
                description: 'Multiplexers, decoders, flip-flops (SR, JK, D, T), counters, and shift registers.',
                difficulty: 'Medium',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Race-around condition in JK flip-flop', 'Master-slave configuration', 'Synchronous counter design']
              }
            ]
          },
          {
            id: 'mod-ece-embedded',
            title: 'Microprocessors, Microcontrollers & Embedded C',
            category: 'Embedded Foundations',
            description: 'Key questions asked during technical panels regarding real-world hardware interfaces.',
            topics: [
              {
                id: 'tcs-ece-micro-1',
                title: '8085 / 8051 Architecture & Interrupts',
                description: 'Pin diagrams, addressing modes, instruction sets, and interrupt service routines.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['Memory segmentation', 'Vector interrupts', 'Timer and serial communication modes']
              },
              {
                id: 'tcs-ece-c-1',
                title: 'C Programming & Bitwise Operations',
                description: 'Bit masking, pointers, memory layout (stack vs heap), structure padding.',
                difficulty: 'Medium',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Bit manipulation (set, clear, toggle bit)', 'Volatile keyword importance', 'Pointer arithmetic'],
                sampleQuestion: 'Write a C macro to toggle the 3rd bit of an 8-bit register without affecting other bits.'
              }
            ]
          },
          {
            id: 'mod-ece-basic-dsa',
            title: 'Essential DSA for Electronics Engineers',
            category: 'Coding Preparation',
            description: 'Baseline programming competence expected for IT service selection.',
            topics: [
              {
                id: 'tcs-ece-dsa-1',
                title: 'Basic Arrays, Strings & Search Algorithms',
                description: 'Linear search, binary search, string reversal, palindrome checks, and sorting.',
                difficulty: 'Easy',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['Binary search implementation', 'Character array manipulation', 'Time complexity comparison']
              }
            ]
          }
        ]
      },
      'ME/CE': {
        branchKey: 'ME/CE',
        branchLabel: 'Mechanical & Civil Engineering',
        summary: 'Designed for core engineering students: emphasizes engineering mechanics, strength of materials, thermodynamics, plus foundational programming logic.',
        recommendedDurationWeeks: 4,
        modules: [
          {
            id: 'mod-me-core1',
            title: 'Strength of Materials & Engineering Mechanics',
            category: 'Core Fundamentals',
            description: 'Core concepts tested during cross-disciplinary and engineering panel rounds.',
            topics: [
              {
                id: 'tcs-me-som-1',
                title: 'Stress-Strain Relations, SFD & BMD',
                description: 'Hooke’s law, Young’s modulus, shear force and bending moment diagrams for cantilevers and simply supported beams.',
                difficulty: 'Medium',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Point of contraflexure', 'Factor of safety', 'Euler column buckling equation'],
                sampleQuestion: 'Draw the shear force and bending moment diagram for a cantilever beam carrying a uniformly distributed load (UDL) of w kN/m.'
              },
              {
                id: 'tcs-me-mech-1',
                title: 'Equilibrium of Rigid Bodies & Friction',
                description: 'Free body diagrams, Lami’s theorem, laws of friction, center of gravity.',
                difficulty: 'Easy',
                estimatedHours: 4,
                priority: 'High',
                keyConcepts: ['Conditions of static equilibrium', 'Angle of repose', 'Truss analysis method of joints']
              }
            ]
          },
          {
            id: 'mod-me-thermo',
            title: 'Thermodynamics & Fluid Mechanics',
            category: 'Thermal & Fluids',
            description: 'Standard technical interview questions for mechanical & civil candidates.',
            topics: [
              {
                id: 'tcs-me-thermo-1',
                title: 'Laws of Thermodynamics & Cycles',
                description: 'Zeroth, First, and Second laws, Carnot cycle efficiency, Otto and Diesel cycles.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['Entropy principle', 'Carnot theorem', 'Reversible vs irreversible processes']
              },
              {
                id: 'tcs-me-fluids-1',
                title: 'Fluid Properties & Bernoulli’s Principle',
                description: 'Viscosity, Pascal’s law, continuity equation, Bernoulli’s theorem, and head loss.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'Medium',
                keyConcepts: ['Navier-Stokes overview', 'Laminar vs turbulent flow', 'Venturi meter application']
              }
            ]
          },
          {
            id: 'mod-me-programming',
            title: 'Foundational Programming & Logical Aptitude',
            category: 'Digital Competence',
            description: 'Essential programming logic for tech consulting and digital project roles.',
            topics: [
              {
                id: 'tcs-me-logic-1',
                title: 'Basic C / Python Syntax & Flow Control',
                description: 'Loops, conditionals, arrays, functions, and basic mathematical series (Fibonacci, primes).',
                difficulty: 'Easy',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['For and While loop traces', 'Writing modular functions', 'File I/O basics']
              }
            ]
          }
        ]
      }
    },
    interviewGuidance: [
      {
        roundNumber: 2,
        roundName: 'Technical Interview',
        roundType: 'Technical Interview 1',
        duration: '40 - 50 Minutes',
        focusAreas: [
          'Detailed explanation of final year capstone project',
          'Live code execution on simple data structure or query problem',
          'Branch core fundamentals (DBMS/OS for CSE, Microprocessors for ECE, SOM/Thermodynamics for ME)',
          'Knowledge of latest tech trends (Cloud, AI/ML basics, IoT)'
        ],
        sampleQuestions: [
          {
            question: 'Walk me through your academic project: what problem does it solve, what was your role, and what happens if user traffic triples?',
            context: 'Panel wants to see genuine ownership vs superficial group contribution.',
            recommendedApproach: 'Use the STAR methodology: Situation, Task, Action, and Result. Mention specific tech stack decisions and lessons learned.'
          },
          {
            question: 'What is the practical difference between a Process and a Thread? How does context switching overhead differ?',
            context: 'Tests deep OS understanding rather than textbook memorization.',
            recommendedApproach: 'Explain memory space sharing (threads share heap/code, have private stack), PCB vs TCB overhead, and inter-thread communication ease.'
          }
        ],
        dos: [
          'Be honest if you do not know a specific framework; state how you would find out.',
          'Start coding with a brute-force approach, explain its complexity, and then optimize.',
          'Bring clean, printed copies of your project architecture diagram if in-person.'
        ],
        donts: [
          'Never put a technology on your resume (e.g. Docker, React, Verilog) unless you can answer 3 follow-up questions on it.',
          'Do not interrupt the interviewer while they are explaining a problem constraint.'
        ]
      },
      {
        roundNumber: 3,
        roundName: 'Managerial & HR Interview',
        roundType: 'HR Round',
        duration: '20 - 30 Minutes',
        focusAreas: [
          'Flexibility regarding pan-India work locations and shifts',
          'Team collaboration and handling conflicting viewpoints',
          'Reason for choosing TCS over competitors',
          'Understanding of company history and current digital initiatives'
        ],
        sampleQuestions: [
          {
            question: 'Are you ready to relocate to any Indian city based on project allocation, including working in night or rotating shifts?',
            context: 'Standard compliance question. Hesitation often results in rejection.',
            recommendedApproach: 'Express clear enthusiasm for cross-location learning and project assignments, affirming full mobility.'
          },
          {
            question: 'Where do you see yourself in 3 years in our technology practice?',
            context: 'Evaluates long-term stability versus flight risk.',
            recommendedApproach: 'Discuss becoming a domain expert, mentoring junior engineers, and earning technical certifications.'
          }
        ],
        dos: [
          'Maintain smiling, confident posture and steady eye contact.',
          'Prepare 2 thoughtful questions to ask the interviewer at the end.'
        ],
        donts: [
          'Never speak negatively about college faculties, group members, or previous internships.',
          'Do not bring up salary negotiation in campus hiring rounds—packages are predetermined.'
        ]
      }
    ],
    generalAdvice: [
      'Take at least 3 timed mock tests prior to the actual NQT test window.',
      'Practice writing code on a plain text editor without auto-complete or syntax highlighting.',
      'Sleep for at least 7 hours the night before the drive; cognitive speed in Section 1 is critical.'
    ],
    commonMistakes: [
      'Spending more than 2.5 minutes on a single quantitative aptitude question.',
      'Failing to test edge cases (empty array, single element, negative numbers, overflow limits).',
      'Wearing informal shoes or forgetting original college ID card at the verification desk.'
    ]
  },
  'google-swe': {
    companyId: 'google-swe',
    companyName: 'Google India',
    lastUpdated: 'Nov 06, 2026',
    verifiedBy: 'Alumni Placement Mentors & Former Google Interns (Demo Status)',
    verificationDate: 'Updated Nov 2026 for 2026-27 Season',
    sourceOfInformation: 'Compiled from 12+ detailed Google technical interview transcripts, campus debriefs, and LeetCode discussion patterns.',
    confidenceScore: 96,
    historicalPatternDisclaimer: 'Important Note: Google conducts open-ended algorithmic rounds where interviewers frequently invent novel twists on standard problems. Focus on problem-solving patterns and time/space efficiency rather than memorizing solutions.',
    contributors: [
      {
        name: 'Aditya Raj',
        role: 'Software Engineer II',
        batch: 'B.Tech CSE, Batch 2024',
        branch: 'CSE',
        companyPlaced: 'Google Bengaluru'
      },
      {
        name: 'Divya Nambiar',
        role: 'Cloud Solutions Engineer',
        batch: 'B.Tech ECE, Batch 2025',
        branch: 'ECE',
        companyPlaced: 'Google Cloud'
      }
    ],
    aptitudeScreening: [
      {
        id: 'goog-screening',
        title: 'Online Coding Screen (Sandbox)',
        description: 'Two pure algorithmic challenges on Google sandbox platform. No traditional verbal/aptitude MCQs.',
        questionCountEstimate: '2 Algorithmic Questions in 90 Minutes',
        topics: [
          {
            id: 'goog-scr-1',
            title: 'Graph Traversal & Shortest Path',
            description: 'BFS, DFS, Dijkstra, Union-Find for connected components.',
            difficulty: 'Hard',
            estimatedHours: 12,
            priority: 'High',
            keyConcepts: ['Topological Sorting (Kahn Algorithm)', 'Disjoint Set Union (Rank & Path Compression)', 'Cycle detection in directed graphs']
          },
          {
            id: 'goog-scr-2',
            title: 'Dynamic Programming & State Compression',
            description: 'Interval scheduling, bitmask DP, grid paths with obstacles.',
            difficulty: 'Hard',
            estimatedHours: 14,
            priority: 'High',
            keyConcepts: ['State memoization table sizing', 'Rolling array space reduction', 'Game theory minimax logic']
          }
        ]
      }
    ],
    branchSyllabuses: {
      'CSE/IT': {
        branchKey: 'CSE/IT',
        branchLabel: 'Computer Science & Engineering',
        summary: 'World-class algorithmic rigor: Graphs, Trees, Dynamic Programming, and Concurrency.',
        recommendedDurationWeeks: 8,
        modules: [
          {
            id: 'mod-goog-algo',
            title: 'Advanced Data Structures & Algorithms',
            category: 'Algorithmic Mastery',
            description: 'Google technical rounds test optimal O(N) or O(N log N) solutions with clean modular code.',
            topics: [
              {
                id: 'goog-cse-arrays',
                title: 'Monotonic Stacks & Deques',
                description: 'Next greater element, largest rectangle in histogram, sliding window maximum.',
                difficulty: 'Hard',
                estimatedHours: 8,
                priority: 'High',
                keyConcepts: ['Monotonic queue invariant', 'Two-pass linear scans', 'Boundary indexing']
              },
              {
                id: 'goog-cse-trees',
                title: 'Trie & Prefix Trees',
                description: 'Word search, autocomplete engines, XOR maximum pair matching.',
                difficulty: 'Hard',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['TrieNode pointer design', 'Prefix search in O(L)', 'Bitwise Trie for maximum XOR']
              },
              {
                id: 'goog-cse-graphs',
                title: 'Graph Algorithms & Minimum Spanning Trees',
                description: 'Kruskal, Prim, Dijkstra with PriorityQueue, Bellman-Ford.',
                difficulty: 'Hard',
                estimatedHours: 12,
                priority: 'High',
                keyConcepts: ['Fibonacci Heap vs Binary Heap complexity', 'Negative cycle detection', 'Bipartite graph verification']
              }
            ]
          }
        ]
      },
      'ECE/EEE': {
        branchKey: 'ECE/EEE',
        branchLabel: 'Electronics & Communication',
        summary: 'Rigorous algorithmic fundamentals + understanding of low-level memory, cache performance, and hardware-software interface.',
        recommendedDurationWeeks: 8,
        modules: [
          {
            id: 'mod-goog-ece-algo',
            title: 'Core Data Structures for Hardware/Software Interface',
            category: 'Systems & Algorithms',
            description: 'Algorithmic efficiency combined with memory architecture awareness.',
            topics: [
              {
                id: 'goog-ece-bit',
                title: 'Bitwise Manipulation & Low-Level Tricks',
                description: 'Bitmasks, counting set bits (Brian Kernighan), power of 2 checks, bitwise XOR properties.',
                difficulty: 'Medium',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Endianness awareness', 'Bitmask subsets generation', 'Fast bitwise parity check']
              },
              {
                id: 'goog-ece-dsa',
                title: 'Arrays, Linked Lists & Pointers',
                description: 'Cache locality, memory fragmentation, pointer manipulation, circular buffers.',
                difficulty: 'Medium',
                estimatedHours: 8,
                priority: 'High',
                keyConcepts: ['LRU Cache implementation', 'Fast and slow pointer cycle detection', 'Cache lines and spatial locality']
              }
            ]
          }
        ]
      },
      'ME/CE': {
        branchKey: 'ME/CE',
        branchLabel: 'Mechanical & Civil Engineering',
        summary: 'Algorithmic foundations for computational modeling and software engineering.',
        recommendedDurationWeeks: 8,
        modules: [
          {
            id: 'mod-goog-me-math',
            title: 'Computational Mathematics & Algorithmic Foundations',
            category: 'Core Problem Solving',
            description: 'Mathematical reasoning, matrix computations, and clean programming.',
            topics: [
              {
                id: 'goog-me-math-1',
                title: 'Matrix Transformations & Graph Modeling',
                description: 'Matrix multiplication, coordinate systems, grid traversals, and BFS.',
                difficulty: 'Medium',
                estimatedHours: 8,
                priority: 'High',
                keyConcepts: ['Sparse matrix representations', '2D grid BFS traversal', 'Connected components']
              }
            ]
          }
        ]
      }
    },
    interviewGuidance: [
      {
        roundNumber: 2,
        roundName: 'Live Coding Interview',
        roundType: 'Technical Interview 1',
        duration: '45 Minutes',
        focusAreas: [
          'Communication: Think out loud before writing a single line of code',
          'Asking clarifying questions regarding scale, null values, and constraints',
          'Writing production-ready, clean, idiomatic code',
          'Dry running test cases with sample inputs'
        ],
        sampleQuestions: [
          {
            question: 'Given an array of strings representing logs with timestamps and IP addresses, write an algorithm to find the top K most active IPs in the last 15 minutes window.',
            context: 'Assesses ability to choose appropriate data structures (Min-Heap, Queue, HashMap) under streaming constraints.',
            recommendedApproach: 'Discuss sliding window with deque + hashmap + min-heap. Analyze memory footprint when scale reaches 100,000 logs/sec.'
          }
        ],
        dos: [
          'Always clarify constraints: "Can numbers be negative?", "Does the graph contain cycles?"',
          'Test your code with edge cases: empty input, single element, large numbers.',
          'State Big-O time and space complexity clearly.'
        ],
        donts: [
          'Do not rush into writing code in silence.',
          'Never use unhelpful variable names like a, b, c, x, y.'
        ]
      }
    ],
    generalAdvice: [
      'Practice on a plain Google Doc or whiteboard without syntax highlighting.',
      'Be comfortable with standard library containers (e.g. Java Collections, C++ STL, Python collections/heapq).'
    ],
    commonMistakes: [
      'Assuming constraints that were never specified in the problem statement.',
      'Failing to communicate thought process during pauses.'
    ]
  },
  'texas-instruments': {
    companyId: 'texas-instruments',
    companyName: 'Texas Instruments (TI)',
    lastUpdated: 'Nov 07, 2026',
    verifiedBy: 'ECE Faculty Advisor & Alumni in Core Semiconductors (Demo Status)',
    verificationDate: 'Updated Nov 2026',
    sourceOfInformation: 'Verified from 15+ TI technical debriefs, campus recruitment papers, and lab viva patterns.',
    confidenceScore: 95,
    historicalPatternDisclaimer: 'Important Note: TI tests deep hardware fundamentals. Be ready to draw circuits, timing diagrams, and explain transistor behaviors on paper.',
    contributors: [
      {
        name: 'Karthik Raman',
        role: 'Analog Design Trainee',
        batch: 'B.Tech ECE, Batch 2025',
        branch: 'ECE',
        companyPlaced: 'Texas Instruments Bengaluru'
      }
    ],
    aptitudeScreening: [
      {
        id: 'ti-tech-screen',
        title: 'Core Electronics & Embedded Screening',
        description: 'Comprehensive assessment of circuits, digital logic, and C programming.',
        questionCountEstimate: '40 MCQs in 75 Minutes',
        topics: [
          {
            id: 'ti-scr-1',
            title: 'Op-Amp Circuits & Filter Design',
            description: 'Inverting, non-inverting, differential amplifiers, CMRR, and Bode plots.',
            difficulty: 'Medium',
            estimatedHours: 5,
            priority: 'High',
            keyConcepts: ['Virtual ground concept', 'Slew rate limitations', 'Active low-pass and high-pass filters']
          }
        ]
      }
    ],
    branchSyllabuses: {
      'ECE/EEE': {
        branchKey: 'ECE/EEE',
        branchLabel: 'Electronics & Communication / Electrical',
        summary: 'Deep dive into semiconductor physics, digital synthesis, microcontrollers, and low-level embedded firmware.',
        recommendedDurationWeeks: 6,
        modules: [
          {
            id: 'mod-ti-dig',
            title: 'Digital Electronics & State Machine Synthesis',
            category: 'Hardware Architecture',
            description: 'Essential for Digital IC and hardware evaluation.',
            topics: [
              {
                id: 'ti-ece-dig-1',
                title: 'Setup Time, Hold Time & Metastability',
                description: 'Timing paths, clock skew, jitter, and synchronizers for clock domain crossing.',
                difficulty: 'Hard',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Setup time equation', 'Hold time margin', 'Two-flip-flop synchronizer'],
                sampleQuestion: 'Calculate the maximum operating clock frequency given T_clk-q = 2ns, T_comb = 5ns, and T_setup = 1ns.'
              },
              {
                id: 'ti-ece-dig-2',
                title: 'FSM Design: Mealy vs Moore',
                description: 'State transition diagrams, glitch elimination, output decoding.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['State minimization', 'One-hot vs binary state encoding', 'Glitches in Mealy machines']
              }
            ]
          },
          {
            id: 'mod-ti-embedded',
            title: 'Microcontroller Architecture & Embedded C',
            category: 'Firmware Design',
            description: 'ARM Cortex-M fundamentals, memory-mapped peripherals, and interrupt handling.',
            topics: [
              {
                id: 'ti-ece-micro-1',
                title: 'Interrupt Latency & Vector Tables',
                description: 'Context saving, nested vectored interrupt controllers (NVIC), atomic operations.',
                difficulty: 'Hard',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Volatile keyword in ISRs', 'Critical sections and mutex locks', 'Direct Memory Access (DMA)']
              }
            ]
          }
        ]
      },
      'CSE/IT': {
        branchKey: 'CSE/IT',
        branchLabel: 'Computer Science',
        summary: 'Systems programming, operating system kernels, and bitwise manipulation.',
        recommendedDurationWeeks: 5,
        modules: [
          {
            id: 'mod-ti-cse',
            title: 'Low-Level Systems & Device Drivers',
            category: 'Systems Software',
            description: 'Kernel-space concepts, C pointer mastery, memory allocation.',
            topics: [
              {
                id: 'ti-cse-c-1',
                title: 'Pointer Arithmetic & Memory Layout',
                description: 'Function pointers, stack frames, heap fragmentation, and custom malloc.',
                difficulty: 'Hard',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Structure alignment and packing', 'Function pointer dispatch tables', 'Double pointers']
              }
            ]
          }
        ]
      },
      'ME/CE': {
        branchKey: 'ME/CE',
        branchLabel: 'Mechanical Engineering',
        summary: 'Mechatronics, sensors, actuators, and thermal management of electronic enclosures.',
        recommendedDurationWeeks: 4,
        modules: [
          {
            id: 'mod-ti-me',
            title: 'Mechatronics & Thermal Packaging',
            category: 'Electro-Mechanical Systems',
            description: 'Heat dissipation in semiconductor packages and robotic control.',
            topics: [
              {
                id: 'ti-me-thermal-1',
                title: 'Heat Sinks & Convective Cooling in Electronics',
                description: 'Thermal resistance networks, junction temperature limits, fan sizing.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['Thermal resistance R_theta', 'Natural vs forced convection', 'Junction-to-case resistance']
              }
            ]
          }
        ]
      }
    },
    interviewGuidance: [
      {
        roundNumber: 2,
        roundName: 'Technical Hardware & Logic Interview',
        roundType: 'Technical Interview 1',
        duration: '60 Minutes',
        focusAreas: [
          'Drawing circuit diagrams and waveform timing charts on blank paper',
          'Explaining physical electronics concepts (MOSFET operation regions, saturation vs triode)',
          'Writing concise Embedded C functions to read/write hardware registers'
        ],
        sampleQuestions: [
          {
            question: 'What happens if the hold time condition is violated in a flip-flop? Can we fix it by lowering the clock frequency?',
            context: 'Tests whether the student understands that hold time violations are frequency-independent.',
            recommendedApproach: 'Explain that hold time depends purely on internal delay paths and clock skew, not on clock period. Lowering clock frequency does NOT fix a hold violation; adding data path delay buffers is necessary.'
          }
        ],
        dos: [
          'Draw clear timing waveforms with labeled axes (V, t).',
          'Explain why specific component values (resistors, capacitors) were selected.'
        ],
        donts: [
          'Do not guess circuit values without performing basic KCL/KVL checks.'
        ]
      }
    ],
    generalAdvice: [
      'Review your 3rd and 4th semester lab manuals on Digital Logic and Microprocessors.',
      'Practice explaining your capstone hardware schematic line by line.'
    ],
    commonMistakes: [
      'Confusing Mealy and Moore machine output dependencies.',
      'Forgetting that volatile keyword prevents compiler optimizations on memory-mapped registers.'
    ]
  },
  'lt-construction': {
    companyId: 'lt-construction',
    companyName: 'Larsen & Toubro (L&T)',
    lastUpdated: 'Nov 09, 2026',
    verifiedBy: 'Core Engineering Alumni & T&P Mentor Panel (Demo Status)',
    verificationDate: 'Updated Nov 2026',
    sourceOfInformation: 'Collected from 20+ L&T GET recruitment drives, GD transcripts, and technical interview reports.',
    confidenceScore: 93,
    historicalPatternDisclaimer: 'Important Note: L&T strongly evaluates practical site readiness, technical drawing interpretation, and physical engineering intuition.',
    contributors: [
      {
        name: 'Harpreet Singh',
        role: 'Graduate Engineer Trainee (Mechanical)',
        batch: 'B.Tech ME, Batch 2024',
        branch: 'Mechanical',
        companyPlaced: 'L&T Heavy Engineering'
      }
    ],
    aptitudeScreening: [
      {
        id: 'lt-screen',
        title: 'L&T GET Technical & Aptitude Test',
        description: 'Two-part test covering general numerical/verbal reasoning and core branch engineering.',
        questionCountEstimate: '100 Questions in 120 Minutes',
        topics: [
          {
            id: 'lt-apt-1',
            title: 'Mechanical / Civil Core Principles',
            description: 'Strength of materials, fluid mechanics, surveying, and machine design.',
            difficulty: 'Medium',
            estimatedHours: 6,
            priority: 'High',
            keyConcepts: ['Mohr’s circle for stress analysis', 'Deflection of beams formulas', 'Concrete mix ratios']
          }
        ]
      }
    ],
    branchSyllabuses: {
      'ME/CE': {
        branchKey: 'ME/CE',
        branchLabel: 'Mechanical & Civil Engineering',
        summary: 'Comprehensive review of structural analysis, fluid machinery, thermodynamics, and construction management.',
        recommendedDurationWeeks: 5,
        modules: [
          {
            id: 'mod-lt-me-core',
            title: 'Structural Mechanics & Machine Design',
            category: 'Core Engineering',
            description: 'Standard technical interview questions at L&T.',
            topics: [
              {
                id: 'lt-me-mechanics-1',
                title: 'Stresses in Beams, Shafts & Pressure Vessels',
                description: 'Bending stress, torsional shear stress, thin and thick cylinders, hoop stress.',
                difficulty: 'Medium',
                estimatedHours: 6,
                priority: 'High',
                keyConcepts: ['Torsion formula T/J = tau/r = G*theta/L', 'Bending equation M/I = sigma/y = E/R', 'Lame’s equations']
              },
              {
                id: 'lt-me-thermo-1',
                title: 'Heat Engines, Boilers & Refrigeration',
                description: 'Rankine cycle, steam tables, refrigeration COP, psychrometry basics.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['Reheating and regeneration in Rankine cycle', 'Vapor compression refrigeration cycle', 'Relative humidity']
              }
            ]
          }
        ]
      },
      'ECE/EEE': {
        branchKey: 'ECE/EEE',
        branchLabel: 'Electrical Engineering',
        summary: 'Power systems, transformers, switchgear, and industrial motor drives.',
        recommendedDurationWeeks: 5,
        modules: [
          {
            id: 'mod-lt-eee-core',
            title: 'Power Generation & Industrial Drives',
            category: 'Power Systems',
            description: 'High-voltage substations, transformer testing, and induction motors.',
            topics: [
              {
                id: 'lt-eee-motor-1',
                title: '3-Phase Induction Motors & Star-Delta Starters',
                description: 'Torque-slip characteristics, starting methods, speed control, power factor correction.',
                difficulty: 'Medium',
                estimatedHours: 5,
                priority: 'High',
                keyConcepts: ['Torque equation', 'Synchronous speed formula Ns = 120f/P', 'Capacitor bank sizing']
              }
            ]
          }
        ]
      },
      'CSE/IT': {
        branchKey: 'CSE/IT',
        branchLabel: 'Computer Science (Digital Projects)',
        summary: 'Data engineering, GIS mapping tools, and project management software integration.',
        recommendedDurationWeeks: 4,
        modules: [
          {
            id: 'mod-lt-cse-core',
            title: 'Database Management & Cloud Integration',
            category: 'Enterprise Tech',
            description: 'Relational data structures, ERP concepts, and web APIs.',
            topics: [
              {
                id: 'lt-cse-db-1',
                title: 'SQL Databases & Construction ERP Concepts',
                description: 'Data warehousing, tracking project milestones, inventory databases.',
                difficulty: 'Easy',
                estimatedHours: 4,
                priority: 'Medium',
                keyConcepts: ['Entity relationship diagrams', 'Transaction management', 'Reporting queries']
              }
            ]
          }
        ]
      }
    },
    interviewGuidance: [
      {
        roundNumber: 3,
        roundName: 'Technical & Practical Field Panel',
        roundType: 'Technical Interview 1',
        duration: '45 Minutes',
        focusAreas: [
          'Practical application of engineering formulas to physical structures',
          'Reading and explaining engineering drawings (CAD, isometric views)',
          'Readiness for rural infrastructure site locations and weather conditions'
        ],
        sampleQuestions: [
          {
            question: 'Why are I-sections predominantly used as structural beams instead of rectangular solid sections?',
            context: 'Tests basic physical understanding of section modulus and moment of inertia.',
            recommendedApproach: 'Explain that the outer fibers experience maximum bending stress while the neutral axis has zero stress. Concentrating material at the flanges maximizes the area moment of inertia with minimal dead weight.'
          }
        ],
        dos: [
          'Demonstrate clear enthusiasm for on-site field engineering and project execution.',
          'Review standard safety equipment (PPE) guidelines and construction terminology.'
        ],
        donts: [
          'Do not demand exclusive air-conditioned office postings during an initial GET training interview.'
        ]
      }
    ],
    generalAdvice: [
      'Be prepared for Group Discussions on infrastructure, smart cities, and sustainable construction.',
      'Keep your academic project drawings handy for discussion.'
    ],
    commonMistakes: [
      'Inability to state basic units (Pascal, Newton-meter, Bar, Poise) accurately.',
      'Showing reluctance towards temporary remote site rotations.'
    ]
  }
};

export const MOCK_RUMOURS: RumourFactItem[] = [
  {
    id: 'rumour-1',
    rumour: 'WhatsApp forward: "Google will automatically reject your code if you write in Python during Round 1."',
    reality: 'Completely FALSE. Google officially allows C++, Java, Python 3, and Go. Interviewers assess algorithmic efficiency (time and space complexity), clean code, and edge case handling—not the choice of language.',
    verdict: 'Busted',
    category: 'Technical Round',
    source: 'Verified by placed Google SWEs (LPU Alumni 2024 & 2025) and official Google recruitment guidelines.',
    confidenceNote: '100% verified across all recent Google campus drives.',
    tags: ['Google', 'Coding', 'Python', 'Programming Languages'],
    upvotes: 284,
    userUpvoted: false
  },
  {
    id: 'rumour-2',
    rumour: 'Telegram group claim: "If you have a 5-star LeetCode or CodeChef rating, the T&P Cell can bypass the UMS 7.0 CGPA cutoff."',
    reality: 'Completely FALSE. UMS automated database filters strictly reject applications below the specified company CGPA cutoff before online test links or hall tickets are issued. Companies do not grant manual individual exemptions to students.',
    verdict: 'Busted',
    category: 'Eligibility',
    source: 'Official LPU Training & Placement Cell Operating Procedure.',
    confidenceNote: 'Confirmed by multiple T&P Coordinators.',
    tags: ['CGPA Cutoff', 'UMS', 'Eligibility', 'T&P Rules'],
    upvotes: 312,
    userUpvoted: false
  },
  {
    id: 'rumour-3',
    rumour: 'Hostel rumor: "ECE and Mechanical students do not need to solve the DSA coding section in the TCS Digital test."',
    reality: 'Completely FALSE. The TCS Digital NQT coding test is 100% identical for all participating engineering branches. Every candidate must solve the 2 programming problems (in C, C++, Java, or Python) to qualify for the Digital role.',
    verdict: 'Busted',
    category: 'Technical Round',
    source: 'TCS National Qualifier Test Syllabus & 2025 Placed Non-CSE Alumni debriefs.',
    confidenceNote: 'All students are graded on identical test rubrics.',
    tags: ['TCS Digital', 'ECE', 'Mechanical', 'Coding Round'],
    upvotes: 198,
    userUpvoted: false
  },
  {
    id: 'rumour-4',
    rumour: 'WhatsApp audio message: "Larsen & Toubro (L&T) only selects Mechanical students and asks zero computer questions."',
    reality: 'PARTIALLY TRUE. L&T predominantly recruits Mechanical and Civil graduates (80% intake), but Electrical/ECE students are also eligible for project execution. Basic logical problem-solving or introductory programming logic is occasionally assessed.',
    verdict: 'Partially True',
    category: 'Eligibility',
    source: 'L&T GET Campus Eligibility Notice 2026-27.',
    confidenceNote: 'Check exact UMS notice for branch-specific opening codes.',
    tags: ['L&T', 'Mechanical', 'Branch Eligibility'],
    upvotes: 147,
    userUpvoted: false
  },
  {
    id: 'rumour-5',
    rumour: 'Telegram rumor: "If you had a backlog in 2nd semester that you already cleared, Microsoft will automatically filter you out."',
    reality: 'VERIFIED FACT (FALSE FEAR). Microsoft requires ZERO active backlogs at the time of drive registration. Past backlogs that have already been cleared and reflect as passed in current marksheets do NOT disqualify you, provided your cumulative CGPA meets the 8.0 requirement.',
    verdict: 'Confirmed',
    category: 'Eligibility',
    source: 'Microsoft University Recruitment Criteria Document.',
    confidenceNote: 'Active backlogs disqualify; cleared history backlogs are accepted.',
    tags: ['Microsoft', 'Backlogs', 'CGPA'],
    upvotes: 421,
    userUpvoted: true
  },
  {
    id: 'rumour-6',
    rumour: 'Senior advice on WhatsApp: "HR Round is just a casual meet-and-greet; no one ever gets eliminated in HR."',
    reality: 'Completely FALSE. Historical LPU placement data indicates that 10% to 15% of candidates who clear rigorous technical rounds are rejected in the HR round due to refusal to relocate, inability to articulate communication, or behavioral red flags.',
    verdict: 'Busted',
    category: 'HR & Policy',
    source: 'LPU Placement Statistics Debrief (Batch 2024-2025).',
    confidenceNote: 'Never take HR rounds casually—practice the STAR method.',
    tags: ['HR Round', 'Interview Tips', 'Rejections'],
    upvotes: 265,
    userUpvoted: false
  }
];

export const DESIGN_THINKING_DATA = {
  projectTitle: 'Beyond the Rumour Mill: Verified Placement Preparation Intelligence',
  projectId: 'P08',
  course: 'INT335 – Design Thinking',
  institution: 'Lovely Professional University, Phagwara, Punjab',
  conceptStatement: 'Combining official university placement administration notices with verified, company-specific technical preparation syllabuses to eliminate anxiety and WhatsApp misinformation.',
  stages: [
    {
      number: 1,
      name: 'Empathize',
      objective: 'Understand real student stress, confusion, and preparation behavior prior to campus placement drives.',
      keyActivities: [
        'Conducted 18 semi-structured in-depth interviews with 3rd and 4th year B.Tech students (CSE, ECE, Mechanical).',
        'Analyzed 12 active unofficial student WhatsApp & Telegram placement preparation groups.',
        'Observed student anxiety spikes during the 48 hours following a UMS placement announcement.'
      ],
      findings: [
        '86% of surveyed students rely on unverified WhatsApp forwards for syllabus and interview expectations.',
        'UMS notifications convey administrative parameters (CGPA, dress code, venue, bond) but zero technical prep direction.',
        'Students waste 15–20 hours studying irrelevant topics (e.g. studying React.js for backend rounds or skipping DSA for core branches).'
      ]
    },
    {
      number: 2,
      name: 'Define',
      objective: 'Frame a human-centered problem statement and establish clear user personas.',
      problemStatement: 'Pre-final and final-year engineering students at LPU need a reliable, single-source platform that pairs official placement administrative eligibility with verified, branch-specific technical preparation syllabuses, because unverified rumors on messaging channels cause acute anxiety, wasted study hours, and preventable drive rejections.',
      userPersona: {
        name: 'Amanpreet Singh',
        branch: 'B.Tech ECE (7th Semester), CGPA 7.4',
        goal: 'Crack a Tier-1 tech or core electronics placement drive without getting confused by contradictory senior advice.',
        frustrations: 'UMS circular arrives with 4 days notice. WhatsApp group argues whether ECE students have to write code. YouTube channels give generic advice from 2019.'
      }
    },
    {
      number: 3,
      name: 'Ideate',
      objective: 'Brainstorm divergent solutions and converge on a high-impact, feasible prototype.',
      brainstormedIdeas: [
        'Idea A: An AI chatbot answering placement questions (High complexity, high hallucination risk).',
        'Idea B: A peer review forum like Reddit (Risk of propagating more unverified rumors).',
        'Idea C: Official Placement Notice + Alumni-Verified Preparation Syllabus Platform (Selected Winner).',
        'Idea D: WhatsApp bot broadcasting placement updates (Limited UI, hard to track progress).'
      ],
      selectedConcept: 'A unified web dashboard providing official UMS administrative criteria directly alongside verified, branch-specific preparation tracks, topic checklists, and interview guidance.'
    },
    {
      number: 4,
      name: 'Prototype',
      objective: 'Develop high-fidelity interactive digital prototypes iterating across Checkpoints CP1 to CP6.',
      iterations: [
        {
          checkpoint: 'CP1 - Paper Sketches',
          focus: 'Low-fidelity layout of placement drive card + syllabus drawer.'
        },
        {
          checkpoint: 'CP3 - Mid-Fi Wireframes',
          focus: 'Card grid with filters for CGPA, branch eligibility, and package.'
        },
        {
          checkpoint: 'CP5 - Initial Interactive Digital Prototype',
          focus: 'First functional web interface with split-screen syllabus display.'
        },
        {
          checkpoint: 'CP6 - Usability-Tested Prototype (Current)',
          focus: 'Implemented 4 crucial user testing enhancements: prominent syllabus CTAs, dedicated branch selection screens, transparent verification metadata, and bite-sized checklists to reduce cognitive overload.'
        }
      ]
    },
    {
      number: 5,
      name: 'Test',
      objective: 'Validate usability, clarity, and trust with five representative LPU students.',
      userTestingCohort: '5 Students (2 CSE, 2 ECE, 1 Mechanical) across 7th and 8th semesters.',
      testingFeedbackAndFixes: [
        {
          issue: 'Improvement 1: Prominent Syllabus Access',
          observedProblem: 'In CP5, 4 out of 5 students missed the syllabus download link because it was buried at the bottom of the card.',
          solutionImplemented: 'Added a prominent, high-contrast "Download Verified Prep Syllabus" button near the top of the placement drive view.'
        },
        {
          issue: 'Improvement 2: Branch Selection Confusion',
          observedProblem: 'Split-screen syllabus displaying CSE, ECE, and Mechanical topics simultaneously overwhelmed non-CSE students.',
          solutionImplemented: 'Created a dedicated branch selection tab with individual buttons (CSE/IT, ECE/EEE, Mechanical/Civil), displaying only relevant domain topics.'
        },
        {
          issue: 'Improvement 3: Trust & Verification Transparency',
          observedProblem: 'Students questioned if the syllabus was officially endorsed or just another student opinion.',
          solutionImplemented: 'Introduced comprehensive verification metadata cards showing verifying authority, date, confidence rating, contributor alumni details, and clear historical pattern disclaimers.'
        },
        {
          issue: 'Improvement 4: Information Overload Reduction',
          observedProblem: 'Dense paragraphs of text caused students to skim and miss critical preparation requirements.',
          solutionImplemented: 'Converted topics into structured checklists with difficulty badges, estimated hours, key concept tags, and expandable detail cards.'
        }
      ]
    }
  ]
};
