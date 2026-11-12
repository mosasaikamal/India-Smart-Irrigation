import { SearchNode, SearchResult, SearchAction } from '../types';
import { IrrigationSearchProblem } from './problem';
import { calculateHeuristic } from './heuristic';

/**
 * Greedy Best-First Search
 * Informed search using Priority Queue sorted strictly by h(n) (lowest estimated cost to goal).
 * Fast exploration towards goal but lacks cost optimality guarantee (ignores g(n)).
 */
export function runBestFirst(problem: IrrigationSearchProblem): SearchResult {
  const startTime = performance.now();
  let nodeIdCounter = 0;
  let nodesExplored = 0;
  let maxQueueSize = 0;

  const rootH = calculateHeuristic(problem.initialState, problem);
  const rootNode: SearchNode = {
    id: `node-${++nodeIdCounter}`,
    parentId: null,
    actionTaken: null,
    state: problem.initialState,
    depth: 0,
    gCost: 0,
    hCost: rootH,
    fCost: rootH,
    expanded: false,
  };

  // Priority queue sorted by h(n) ascending
  const priorityQueue: SearchNode[] = [rootNode];
  const allNodes: Map<string, SearchNode> = new Map();
  allNodes.set(rootNode.id, rootNode);

  let goalNode: SearchNode | null = null;

  while (priorityQueue.length > 0) {
    maxQueueSize = Math.max(maxQueueSize, priorityQueue.length);
    // Sort by hCost ascending (Greedy)
    priorityQueue.sort((a, b) => a.hCost - b.hCost);
    const currentNode = priorityQueue.shift()!;
    nodesExplored++;
    currentNode.expanded = true;

    if (problem.isGoal(currentNode.state)) {
      goalNode = currentNode;
      break;
    }

    if (currentNode.state.step >= problem.horizonHours) {
      continue;
    }

    const availableActions = problem.getActions(currentNode.state);
    for (const action of availableActions) {
      const nextState = problem.transition(currentNode.state, action);
      const hVal = calculateHeuristic(nextState, problem);

      const childNode: SearchNode = {
        id: `node-${++nodeIdCounter}`,
        parentId: currentNode.id,
        actionTaken: action,
        state: nextState,
        depth: currentNode.depth + 1,
        gCost: nextState.cost,
        hCost: hVal,
        fCost: hVal, // Guided solely by h(n)
        expanded: false,
      };

      allNodes.set(childNode.id, childNode);
      priorityQueue.push(childNode);
    }
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

  // Reconstruct path
  const path: SearchNode[] = [];
  const actions: SearchAction[] = [];
  let curr = goalNode || rootNode;
  
  while (curr) {
    curr.isOptimalPath = true;
    path.unshift(curr);
    if (curr.actionTaken) {
      actions.unshift(curr.actionTaken);
    }
    curr = curr.parentId ? allNodes.get(curr.parentId)! : null!;
  }

  const finalNode = path[path.length - 1];

  return {
    algorithmId: 'best-first',
    algorithmName: 'Greedy Best-First Search',
    nodesExplored,
    maxQueueSize,
    executionTimeMs,
    pathFound: path,
    actionsTaken: actions,
    totalCost: finalNode.gCost,
    totalWaterUsed: finalNode.state.waterUsedLiters,
    finalMoisture: finalNode.state.moisture,
    isGoalReached: !!goalNode,
    heuristicExplanation: 'Informed Search: Prioritizes expansion based solely on minimum h(n). Rapidly descends towards goal but ignores past water cost g(n).',
    tree: Array.from(allNodes.values()).slice(0, 50),
  };
}
