import { SearchNode, SearchResult, SearchAction } from '../types';
import { IrrigationSearchProblem } from './problem';
import { calculateHeuristic } from './heuristic';

/**
 * Depth First Search (DFS)
 * Explores state space along each branch before backtracking using a LIFO Stack.
 * Memory efficient O(bm) but may find sub-optimal deep schedules.
 */
export function runDFS(problem: IrrigationSearchProblem, maxDepthLimit: number = 8): SearchResult {
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

  const stack: SearchNode[] = [rootNode];
  const allNodes: Map<string, SearchNode> = new Map();
  allNodes.set(rootNode.id, rootNode);

  let goalNode: SearchNode | null = null;

  while (stack.length > 0) {
    maxQueueSize = Math.max(maxQueueSize, stack.length);
    const currentNode = stack.pop()!;
    nodesExplored++;
    currentNode.expanded = true;

    if (problem.isGoal(currentNode.state)) {
      goalNode = currentNode;
      break;
    }

    if (currentNode.depth >= maxDepthLimit || currentNode.state.step >= problem.horizonHours) {
      continue;
    }

    const availableActions = problem.getActions(currentNode.state);
    // Push actions in reverse order so first action is evaluated first
    for (let i = availableActions.length - 1; i >= 0; i--) {
      const action = availableActions[i];
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
      stack.push(childNode);
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
    algorithmId: 'dfs',
    algorithmName: 'Depth First Search (DFS)',
    nodesExplored,
    maxQueueSize,
    executionTimeMs,
    pathFound: path,
    actionsTaken: actions,
    totalCost: finalNode.gCost,
    totalWaterUsed: finalNode.state.waterUsedLiters,
    finalMoisture: finalNode.state.moisture,
    isGoalReached: !!goalNode,
    heuristicExplanation: 'Uninformed Search: Explores deepest branches first using a LIFO stack. Non-optimal path cost and risk of over-irrigating.',
    tree: Array.from(allNodes.values()).slice(0, 50),
  };
}
