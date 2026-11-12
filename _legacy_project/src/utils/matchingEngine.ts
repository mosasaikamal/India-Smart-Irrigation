import { ItemReport, MatchResult } from '../types/campusfind';

/**
 * Clean stopwords to filter out before keyword comparison
 */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'with', 'and', 'or', 'for', 'of', 'to',
  'is', 'it', 'my', 'by', 'near', 'from', 'left', 'found', 'lost', 'please',
  'help', 'item', 'campus', 'room', 'floor', 'hall', 'area'
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Transparent, explainable rule-based matching engine for CampusFind
 * Compares a Lost item against Found items, or a Found item against Lost items.
 */
export function calculateMatch(itemA: ItemReport, itemB: ItemReport): MatchResult | null {
  // Only compare opposite types (Lost vs Found)
  if (itemA.type === itemB.type) {
    return null;
  }

  let score = 0;
  const reasons: string[] = [];

  // 1. Category Matching (Weight: 40%)
  if (itemA.category === itemB.category) {
    score += 40;
    reasons.push(`Category match: Both are categorized as "${formatCategoryName(itemA.category)}"`);
  }

  // 2. Campus Location Matching (Weight: 25%)
  const locA = itemA.location.toLowerCase();
  const locB = itemB.location.toLowerCase();

  if (locA === locB) {
    score += 25;
    reasons.push(`Exact location match: Both reported at "${itemA.location}"`);
  } else {
    // Check if both are in adjacent academic zone or hostel zone
    const isAcademicA = locA.includes('block') || locA.includes('library') || locA.includes('classroom');
    const isAcademicB = locB.includes('block') || locB.includes('library') || locB.includes('classroom');
    const isHostelA = locA.includes('hostel') || locA.includes('mess');
    const isHostelB = locB.includes('hostel') || locB.includes('mess');

    if ((isAcademicA && isAcademicB) || (isHostelA && isHostelB)) {
      score += 15;
      reasons.push(`Nearby campus zone: Both reported in related campus facilities`);
    }
  }

  // 3. Keyword / Title Overlap (Weight: 25%)
  const wordsA = new Set([...extractKeywords(itemA.title), ...extractKeywords(itemA.description)]);
  const wordsB = new Set([...extractKeywords(itemB.title), ...extractKeywords(itemB.description)]);

  const commonWords: string[] = [];
  wordsA.forEach(w => {
    if (wordsB.has(w)) {
      commonWords.push(w);
    }
  });

  if (commonWords.length > 0) {
    const keywordPoints = Math.min(25, commonWords.length * 8);
    score += keywordPoints;
    reasons.push(`Keyword overlap (${commonWords.slice(0, 4).join(', ')}): +${keywordPoints}%`);
  }

  // 4. Date Proximity (Weight: 10%)
  try {
    const dateA = new Date(itemA.date).getTime();
    const dateB = new Date(itemB.date).getTime();
    const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

    if (diffDays <= 3) {
      score += 10;
      reasons.push(`Close timeframe: Reported within ${Math.round(diffDays)} day(s) of each other`);
    } else if (diffDays <= 7) {
      score += 5;
      reasons.push(`Reasonable timeframe: Reported within a week of each other`);
    }
  } catch {
    // Date parsing fallback
  }

  // Minimum threshold to qualify as a potential match
  if (score < 25) {
    return null;
  }

  let matchConfidence: 'high' | 'medium' | 'possible' = 'possible';
  if (score >= 65) {
    matchConfidence = 'high';
  } else if (score >= 40) {
    matchConfidence = 'medium';
  }

  return {
    sourceItem: itemA,
    matchedItem: itemB,
    score: Math.min(100, score),
    matchConfidence,
    reasons
  };
}

/**
 * Finds all potential matches for a given item among a list of candidates
 */
export function findMatchesForItem(targetItem: ItemReport, allItems: ItemReport[]): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const candidate of allItems) {
    if (candidate.id === targetItem.id) continue;
    const result = calculateMatch(targetItem, candidate);
    if (result) {
      matches.push(result);
    }
  }

  // Sort descending by score
  return matches.sort((a, b) => b.score - a.score);
}

function formatCategoryName(cat: string): string {
  return cat
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
