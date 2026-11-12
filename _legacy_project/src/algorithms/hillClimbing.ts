import { SearchNode, SearchResult, SearchAction } from '../types';
import { IrrigationSearchProblem } from './problem';
import { calculateHeuristic } from './heuristic';

/**
 * Hill Climbing (Steepest Ascent / Descent)
 * Local search algorithm that inspects all immediate neighbors and picks the single neighbor
 * with the best evaluation score.
 * Academic note: Can get trapped in local optima, ridges, or plateaus where no immediate step improves the score.
 */
export function runHillClimbing(problem: IrrigationSearchProblem): SearchResult {
  const startTime = performance.now();
  let nodeIdCounter = 0;
  let nodesExplored = 0;

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
    expanded: true,
  };

  const allNodes: Map<string, SearchNode> = new Map();
  allNodes.set(rootNode.id, rootNode);

  const path: SearchNode[] = [rootNode];
  const actions: SearchAction[] = [];
  let currentNode = rootNode;
  let reachedLocalOptimum = false;

  while (currentNode.state.step < problem.horizonHours) {
    nodesExplored++;
    const availableActions = problem.getActions(currentNode.state);
    if (availableActions.length === 0) break;

    let bestChildNode: SearchNode | null = null;
    let bestEvaluation = Infinity;

    for (const action of availableActions) {
      const nextState = problem.transition(currentNode.state, action);
      const hVal = calculateHeuristic(nextState, problem);
      // Evaluation function for local search: combines step cost and heuristic
      const evalScore = nextState.cost + hVal;

      const childNode: SearchNode = {
        id: `node-${++nodeIdCounter}`,
        parentId: currentNode.id,
        actionTaken: action,
        state: nextState,
        depth: currentNode.depth + 1,
        gCost: nextState.cost,
        hCost: hVal,
        fCost: evalScore,
        expanded: false,
      };

      allNodes.set(childNode.id, childNode);

      if (evalScore < bestEvaluation) {
        bestEvaluation = evalScore;
        bestChildNode = childNode;
      }
    }

    // Check if the best neighbor actually improves upon current evaluation
    if (!bestChildNode || bestEvaluation >= currentNode.fCost + 2.0) {
      // Plateau or local optimum reached
      reachedLocalOptimum = true;
      if (bestChildNode) {
        // Take step anyway if goal not reached to make progress
        bestChildNode.expanded = true;
        path.push(bestChildNode);
        if (bestChildNode.actionTaken) actions.push(bestChildNode.actionTaken);
        currentNode = bestChildNode;
      }
      break;
    } else {
      bestChildNode.expanded = true;
      path.push(bestChildNode);
      if (bestChildNode.actionTaken) actions.push(bestChildNode.actionTaken);
      currentNode = bestChildNode;
    }

    if (problem.isGoal(currentNode.state)) {
      break;
    }
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
  path.forEach((n) => (n.isOptimalPath = true));
  const finalNode = path[path.length - 1];

  return {
    algorithmId: 'hill-climbing',
    algorithmName: 'Hill Climbing (Steepest Descent)',
    nodesExplored,
    maxQueueSize: 1, // Hill climbing maintains only the current state
    executionTimeMs,
    pathFound: path,
    actionsTaken: actions,
    totalCost: finalNode.gCost,
    totalWaterUsed: finalNode.state.waterUsedLiters,
    finalMoisture: finalNode.state.moisture,
    isGoalReached: problem.isGoal(finalNode.state),
    heuristicExplanation: `Local Search: Evaluates immediate successors and greedily commits to the steepest improvement. ${
      reachedLocalOptimum ? 'Halted at local optimum or plateau.' : 'Successfully descended to target horizon.'
    }`,
    tree: Array.from(allNodes.values()).slice(0, 50),
  };
}
