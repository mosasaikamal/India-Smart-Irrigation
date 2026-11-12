import React, { useState } from 'react';
import { SearchNode } from '../../types';
import { Layers, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface SearchTreeGraphProps {
  nodes: SearchNode[];
  onSelectNode?: (node: SearchNode) => void;
}

export const SearchTreeGraph: React.FC<SearchTreeGraphProps> = ({ nodes, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Group nodes by depth
  const depthLevels: Record<number, SearchNode[]> = {};
  nodes.forEach((node) => {
    if (!depthLevels[node.depth]) {
      depthLevels[node.depth] = [];
    }
    depthLevels[node.depth].push(node);
  });

  const depths = Object.keys(depthLevels)
    .map(Number)
    .sort((a, b) => a - b);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes.find((n) => n.isOptimalPath && n.depth === Math.max(...depths)) || nodes[0];

  return (
    <div className="space-y-4">
      {/* Tree Exploration View */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">State-Space Search Tree Exploration</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 inline-block" />
              <span>Optimal Path Node</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
              <span>Explored State</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/40 border border-cyan-400 inline-block" />
              <span>Selected State</span>
            </span>
          </div>
        </div>

        {/* Tree Render across Depth Levels */}
        <div className="min-w-[700px] flex justify-between gap-6 py-4 px-2">
          {depths.map((depth) => {
            const levelNodes = depthLevels[depth].slice(0, 5); // Cap to 5 nodes per depth for clean rendering
            const moreCount = depthLevels[depth].length - levelNodes.length;

            return (
              <div key={depth} className="flex-1 flex flex-col items-center space-y-3">
                <div className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Depth {depth} (t+{depth * 4}h)
                </div>

                <div className="w-full space-y-2.5">
                  {levelNodes.map((node) => {
                    const isOptimal = node.isOptimalPath;
                    const isSelected = selectedNode?.id === node.id;

                    return (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          onSelectNode?.(node);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all duration-150 relative ${
                          isOptimal
                            ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                            : isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isOptimal && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[11px] text-white truncate max-w-[120px]">
                            {node.actionTaken ? node.actionTaken.name : 'Initial State'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {node.state.moisture}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>g:{node.gCost.toFixed(1)}</span>
                          <span>h:{node.hCost.toFixed(1)}</span>
                          <span className={`font-semibold ${isOptimal ? 'text-emerald-400' : 'text-slate-300'}`}>
                            f:{node.fCost.toFixed(1)}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {moreCount > 0 && (
                    <div className="text-center text-[10px] text-slate-400 py-1 bg-slate-900/50 rounded border border-dashed border-slate-800">
                      +{moreCount} more branches
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node State Inspector */}
      {selectedNode && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-2">
            <Info className="w-4 h-4" />
            <span>State Inspector — Node [{selectedNode.id}]</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Action Executed</span>
              <span className="font-semibold text-white">
                {selectedNode.actionTaken ? selectedNode.actionTaken.name : 'Root Node (Initial)'}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
              <span className="font-semibold text-emerald-400 font-mono text-sm">
                {selectedNode.state.moisture}%
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Path Cost g(n)</span>
              <span className="font-semibold text-white font-mono">{selectedNode.gCost.toFixed(2)}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Heuristic h(n)</span>
              <span className="font-semibold text-cyan-400 font-mono">{selectedNode.hCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-300 font-medium">Evaluation Formula: </span>
              <span className="font-mono text-emerald-400">
                f(n) = g(n) + h(n) = {selectedNode.gCost.toFixed(2)} + {selectedNode.hCost.toFixed(2)} ={' '}
                {selectedNode.fCost.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Accumulated Water: <strong className="text-white">{selectedNode.state.waterUsedLiters.toLocaleString()} L</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
