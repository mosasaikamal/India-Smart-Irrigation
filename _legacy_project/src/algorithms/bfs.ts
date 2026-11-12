import { SearchNode, SearchResult, SearchAction } from '../types';
import { IrrigationSearchProblem } from './problem';
import { calculateHeuristic } from './heuristic';

/**
 * Breadth First Search (BFS)
 * Explores state space level-by-level using a FIFO Queue.
 * Guarantees finding the shortest action path (minimal transitions).
 */
export function runBFS(problem: IrrigationSearchProblem): SearchResult {
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

  const queue: SearchNode[] = [rootNode];
  const allNodes: Map<string, SearchNode> = new Map();
  allNodes.set(rootNode.id, rootNode);

  let goalNode: SearchNode | null = null;

  while (queue.length > 0) {
    maxQueueSize = Math.max(maxQueueSize, queue.length);
    const currentNode = queue.shift()!;
    nodesExplored++;
    currentNode.expanded = true;

    // Check goal condition
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
        fCost: Number((nextState.cost + hVal).toFixed(2)),
        expanded: false,
      };

      allNodes.set(childNode.id, childNode);
      queue.push(childNode);
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
    algorithmId: 'bfs',
    algorithmName: 'Breadth First Search (BFS)',
    nodesExplored,
    maxQueueSize,
    executionTimeMs,
    pathFound: path,
    actionsTaken: actions,
    totalCost: finalNode.gCost,
    totalWaterUsed: finalNode.state.waterUsedLiters,
    finalMoisture: finalNode.state.moisture,
    isGoalReached: !!goalNode,
    heuristicExplanation: 'Uninformed Search: Explores all nodes at depth d before proceeding to depth d+1. Disregards heuristic guidance.',
    tree: Array.from(allNodes.values()).slice(0, 50), // Cap for smooth visual rendering
  };
}
