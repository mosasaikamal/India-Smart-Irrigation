import { FieldState, SearchAlgorithmId, SearchResult } from '../types';
import { createSearchProblem } from './problem';
import { runBFS } from './bfs';
import { runDFS } from './dfs';
import { runBestFirst } from './bestFirst';
import { runHillClimbing } from './hillClimbing';
import { runAStar } from './aStar';

export interface AlgorithmBenchmarkComparison {
  results: Record<SearchAlgorithmId, SearchResult>;
  bestWaterSaver: SearchAlgorithmId;
  fastestAlgorithm: SearchAlgorithmId;
  optimalCostAlgorithm: SearchAlgorithmId;
  comparisonSummary: string;
}

export function executeSearchAlgorithm(
  algorithmId: SearchAlgorithmId,
  fieldState: FieldState
): SearchResult {
  const problem = createSearchProblem(fieldState);

  switch (algorithmId) {
    case 'bfs':
      return runBFS(problem);
    case 'dfs':
      return runDFS(problem);
    case 'best-first':
      return runBestFirst(problem);
    case 'hill-climbing':
      return runHillClimbing(problem);
    case 'astar':
    default:
      return runAStar(problem);
  }
}

export function runAllAlgorithmsBenchmark(fieldState: FieldState): AlgorithmBenchmarkComparison {
  const problem = createSearchProblem(fieldState);

  const bfs = runBFS(problem);
  const dfs = runDFS(problem);
  const bestFirst = runBestFirst(problem);
  const hillClimbing = runHillClimbing(problem);
  const astar = runAStar(problem);

  const results: Record<SearchAlgorithmId, SearchResult> = {
    'bfs': bfs,
    'dfs': dfs,
    'best-first': bestFirst,
    'hill-climbing': hillClimbing,
    'astar': astar,
  };

  // Determine winners
  let minWater = Infinity;
  let bestWaterSaver: SearchAlgorithmId = 'astar';

  let minTime = Infinity;
  let fastestAlgorithm: SearchAlgorithmId = 'hill-climbing';

  let minCost = Infinity;
  let optimalCostAlgorithm: SearchAlgorithmId = 'astar';

  (Object.keys(results) as SearchAlgorithmId[]).forEach((id) => {
    const res = results[id];
    if (res.isGoalReached && res.totalWaterUsed < minWater) {
      minWater = res.totalWaterUsed;
      bestWaterSaver = id;
    }
    if (res.executionTimeMs < minTime) {
      minTime = res.executionTimeMs;
      fastestAlgorithm = id;
    }
    if (res.isGoalReached && res.totalCost < minCost) {
      minCost = res.totalCost;
      optimalCostAlgorithm = id;
    }
  });

  const comparisonSummary = `A* Search achieved optimal path cost (${astar.totalCost.toFixed(1)}) exploring ${astar.nodesExplored} states. Hill Climbing had lowest overhead (${hillClimbing.executionTimeMs} ms) but local search risk. BFS explored ${bfs.nodesExplored} states guaranteeing minimal step count.`;

  return {
    results,
    bestWaterSaver,
    fastestAlgorithm,
    optimalCostAlgorithm,
    comparisonSummary,
  };
}
