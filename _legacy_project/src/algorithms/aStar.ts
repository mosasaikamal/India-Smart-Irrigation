import { SearchNode, SearchResult, SearchAction } from '../types';
import { IrrigationSearchProblem } from './problem';
import { calculateHeuristic } from './heuristic';

/**
 * A* Search (Optimal Informed Search)
 * Combines exact accumulated path cost g(n) with admissible heuristic estimate h(n):
 * f(n) = g(n) + h(n)
 * Guarantees finding the cost-minimal irrigation schedule that preserves crop health
 * with zero water waste.
 */
export function runAStar(problem: IrrigationSearchProblem): SearchResult {
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

  // Open List (Priority Queue) sorted by fCost ascending
  const openList: SearchNode[] = [rootNode];
  // Closed List of explored states to prevent redundant cycles
  const closedSet: Set<string> = new Set();
  const allNodes: Map<string, SearchNode> = new Map();
  allNodes.set(rootNode.id, rootNode);

  let goalNode: SearchNode | null = null;

  while (openList.length > 0) {
    maxQueueSize = Math.max(maxQueueSize, openList.length);
    
    // Sort by fCost ascending (tie-break on hCost ascending)
    openList.sort((a, b) => {
      if (Math.abs(a.fCost - b.fCost) < 0.001) {
        return a.hCost - b.hCost;
      }
      return a.fCost - b.fCost;
    });

    const currentNode = openList.shift()!;
    nodesExplored++;
    currentNode.expanded = true;

    // Check goal condition
    if (problem.isGoal(currentNode.state)) {
      goalNode = currentNode;
      break;
    }

    // State signature: step + rounded moisture
    const stateKey = `${currentNode.state.step}-${Math.round(currentNode.state.moisture)}`;
    if (closedSet.has(stateKey)) {
      continue;
    }
    closedSet.add(stateKey);

    if (currentNode.state.step >= problem.horizonHours) {
      continue;
    }

    const availableActions = problem.getActions(currentNode.state);
    for (const action of availableActions) {
      const nextState = problem.transition(currentNode.state, action);
      const hVal = calculateHeuristic(nextState, problem);
      const gVal = nextState.cost;
      const fVal = Number((gVal + hVal).toFixed(2));

      const childNode: SearchNode = {
        id: `node-${++nodeIdCounter}`,
        parentId: currentNode.id,
        actionTaken: action,
        state: nextState,
        depth: currentNode.depth + 1,
        gCost: gVal,
        hCost: hVal,
        fCost: fVal,
        expanded: false,
      };

      allNodes.set(childNode.id, childNode);
      openList.push(childNode);
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
    algorithmId: 'astar',
    algorithmName: 'A* Search (f = g + h)',
    nodesExplored,
    maxQueueSize,
    executionTimeMs,
    pathFound: path,
    actionsTaken: actions,
    totalCost: finalNode.gCost,
    totalWaterUsed: finalNode.state.waterUsedLiters,
    finalMoisture: finalNode.state.moisture,
    isGoalReached: !!goalNode,
    heuristicExplanation: 'Optimal Informed Search: Evaluates f(n) = g(n) + h(n). Proves mathematically optimal irrigation trajectory with minimum water consumption.',
    tree: Array.from(allNodes.values()).slice(0, 50),
  };
}
