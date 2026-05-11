"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Share2, ZoomIn, ZoomOut, Maximize2, Info, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { KnowledgeNode, KnowledgeEdge } from "@/lib/types";

const NODE_COLORS: Record<string, string> = {
  VARIABLE: '#71717a', // zinc-400
  ASSUMPTION: '#94a3b8', // slate-400
  FACT: '#52525b', // zinc-600
  RISK: '#450a0a', // red-950 (subtle)
};

const EDGE_COLORS: Record<string, string> = {
  CONTRADICTS: '#ef4444',
  SUPPORTS: '#10b981',
  IMPACTS: '#27272a',
};

// ─── Force-Directed Layout ──────────────────────────────────────
function applyForceLayout(nodes: KnowledgeNode[], edges: KnowledgeEdge[], width: number, height: number): KnowledgeNode[] {
  const positioned = nodes.map((n, i) => ({
    ...n,
    x: n.x ?? width / 2 + (Math.cos(i * 2.399) * 200),
    y: n.y ?? height / 2 + (Math.sin(i * 2.399) * 150),
    vx: 0,
    vy: 0,
  }));

  const iterations = 300;
  const repulsion = 40000;
  const attraction = 0.002;
  const damping = 0.8;
  const centerGravity = 0.001;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations;

    // Repulsion between all pairs
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const dx = positioned[j].x! - positioned[i].x!;
        const dy = positioned[j].y! - positioned[i].y!;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (repulsion * temp) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        positioned[i].vx! -= fx;
        positioned[i].vy! -= fy;
        positioned[j].vx! += fx;
        positioned[j].vy! += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const src = positioned.find(n => n.id === edge.source);
      const tgt = positioned.find(n => n.id === edge.target);
      if (!src || !tgt) continue;
      const dx = tgt.x! - src.x!;
      const dy = tgt.y! - src.y!;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = dist * attraction * temp;
      const fx = (dx / Math.max(dist, 1)) * force;
      const fy = (dy / Math.max(dist, 1)) * force;
      src.vx! += fx;
      src.vy! += fy;
      tgt.vx! -= fx;
      tgt.vy! -= fy;
    }

    // Center gravity + apply velocities
    for (const node of positioned) {
      node.vx! += (width / 2 - node.x!) * centerGravity;
      node.vy! += (height / 2 - node.y!) * centerGravity;
      node.vx! *= damping;
      node.vy! *= damping;
      node.x! += node.vx!;
      node.y! += node.vy!;
      // Clamp to bounds
      node.x = Math.max(60, Math.min(width - 60, node.x!));
      node.y = Math.max(60, Math.min(height - 60, node.y!));
    }
  }

  return positioned;
}

// ─── Curved Edge Path ───────────────────────────────────────────
function getEdgePath(sx: number, sy: number, tx: number, ty: number): string {
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(dist * 0.15, 40);
  const cx = mx - (dy / dist) * offset;
  const cy = my + (dx / dist) * offset;
  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
}

export const KnowledgeMap = memo(function KnowledgeMap({ project, onAnalysisComplete }: { project: any, onAnalysisComplete?: (data: any) => void }) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['VARIABLE', 'ASSUMPTION', 'FACT', 'RISK']));
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);

  // Zoom & Pan state
  const [viewBox, setViewBox] = useState({ x: -1500, y: -1000, w: 5000, h: 3000 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (project.last_graph) {
      const laid = applyForceLayout(
        project.last_graph.nodes || [],
        project.last_graph.edges || [],
        2000, 1000
      );
      setNodes(laid);
      setEdges(project.last_graph.edges || []);
    }
  }, [project.last_graph]);

  async function generateGraph() {
    setLoading(true);
    setError(null);
    try {
      const { data: evidenceList } = await insforge.database.from('evidence').select('*').eq('project_id', project.id);
      const authHeader = insforge.getHttpClient().getHeaders()['Authorization'];
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader || '' },
        body: JSON.stringify({ project, evidenceList: evidenceList || [], action: 'knowledge_map' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate map');

      const laid = applyForceLayout(data.nodes || [], data.edges || [], 2000, 1000);
      setNodes(laid);
      setEdges(data.edges || []);
      if (onAnalysisComplete) onAnalysisComplete(data);

      await insforge.database
        .from('projects')
        .update({ last_graph: { nodes: laid, edges: data.edges } })
        .eq('id', project.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Zoom, Pan, Filter & Search stay the same (omitted for brevity in replacement but usually included in full replace) ───
  // ... handleZoom, handleWheel, handleFit, handleMouseDown, handleMouseMove, handleMouseUp, toggleFilter, filteredNodes, filteredNodeIds, filteredEdges ...

  const handleZoom = useCallback((factor: number) => {
    setViewBox(prev => {
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      const nw = prev.w * factor;
      const nh = prev.h * factor;
      return { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY > 0 ? 1.1 : 0.9);
  }, [handleZoom]);

  const handleFit = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: 1000, h: 600 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  }, [viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStart.current.x) * scaleX;
    const dy = (e.clientY - panStart.current.y) * scaleY;
    setViewBox(prev => ({ ...prev, x: panStart.current.vx - dx, y: panStart.current.vy - dy }));
  }, [isPanning, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (!activeFilters.has(n.type)) return false;
      if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [nodes, activeFilters, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [edges, filteredNodeIds]);

  // ─── Empty State ──────────────────────────────────────────
  if (nodes.length === 0 && !loading) {
    return (
      <div className="text-center py-32 border border-white/[0.05] rounded-xl bg-[#0a0a0a]/50 border-dashed max-w-3xl mx-auto flex flex-col items-center justify-center h-[600px]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 mb-6">
          <Share2 className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-[18px] font-medium text-white mb-2">Visualize the Decision Topology</h3>
        <p className="text-[14px] text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
          Generate a semantic map of variables, risks, and facts to identify structural dependencies in your strategic logic.
        </p>
        <Button onClick={generateGraph} className="bg-white hover:bg-zinc-200 text-black font-medium px-8 h-10 transition-colors rounded-md shadow-sm">
          Initialize Knowledge Map
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] gap-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 text-[13px] bg-black border border-white/10 rounded-md text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 w-full md:w-64 transition-all"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border ${
                  activeFilters.has(type)
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/5 text-zinc-500 hover:border-white/10'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeFilters.has(type) ? color : '#333' }} />
                {type.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={generateGraph} disabled={loading} className="border-white/10 text-white hover:bg-white/5 h-9 shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2 text-zinc-400" />}
          Refresh Analysis
        </Button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-black rounded-xl border border-white/10 relative overflow-hidden group/graph shadow-inner">
          <div className="absolute top-4 left-4 text-[11px] font-medium text-zinc-600 uppercase tracking-widest pointer-events-none flex items-center gap-2">
            Topology View • {filteredNodes.length} Nodes
          </div>

          <svg
            ref={svgRef}
            className={`w-full h-full cursor-${isPanning ? 'grabbing' : 'grab'}`}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Edges */}
            <g>
              {filteredEdges.map((edge, i) => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                const isHovered = hoveredEdge === i;
                const color = isHovered ? '#fff' : EDGE_COLORS[edge.type] || '#27272a';
                return (
                  <motion.line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={color}
                    strokeWidth={isHovered ? 2 : 1.5}
                    strokeOpacity={isHovered ? 1 : 0.4}
                    strokeDasharray={edge.type === 'CONTRADICTS' ? "4,4" : "none"}
                    className="transition-all duration-300"
                    onMouseEnter={() => setHoveredEdge(i)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {filteredNodes.map((node) => (
                <motion.g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={selectedNode?.id === node.id ? 24 : 18}
                    fill={NODE_COLORS[node.type]}
                    stroke={selectedNode?.id === node.id ? '#fff' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={selectedNode?.id === node.id ? 2 : 1}
                    className="transition-all duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y! + 32}
                    textAnchor="middle"
                    fill={selectedNode?.id === node.id ? '#fff' : '#71717a'}
                    className="text-[13px] font-medium pointer-events-none select-none"
                  >
                    {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                  </text>
                </motion.g>
              ))}
            </g>
          </svg>

          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-50">
              <Loader2 className="h-6 w-6 text-zinc-400 animate-spin mb-4" />
              <p className="text-white font-medium text-[13px] tracking-widest uppercase">Mapping dependencies...</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {selectedNode ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 bg-[#0a0a0a] rounded-xl border border-white/10 p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-widest bg-white/5 border border-white/5" style={{ color: NODE_COLORS[selectedNode.type] }}>
                  {selectedNode.type}
                </span>
                <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h4 className="text-[18px] font-semibold text-white mb-2 leading-tight">
                  {selectedNode.label}
                </h4>
                <p className="text-[13px] text-zinc-400 leading-relaxed italic">
                  {selectedNode.description || "Analytical context being indexed."}
                </p>
              </div>
              
              <div className="h-px bg-white/[0.05]" />

              <div className="space-y-4">
                <h5 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Share2 className="h-3 w-3" /> Connections
                </h5>
                <div className="space-y-2">
                  {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((edge, i) => {
                    const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                    const otherNode = nodes.find(n => n.id === otherNodeId);
                    
                    return (
                      <div
                        key={i}
                        className="p-3 bg-black border border-white/5 rounded-lg flex flex-col gap-1.5 cursor-pointer hover:border-white/20 transition-all"
                        onClick={() => { if (otherNode) setSelectedNode(otherNode); }}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-medium ${
                            edge.type === 'CONTRADICTS' ? 'text-red-400' : 
                            edge.type === 'SUPPORTS' ? 'text-emerald-400' : 'text-zinc-400'
                          }`}>
                            {edge.type}
                          </span>
                        </div>
                        <p className="text-[13px] text-white font-medium">{otherNode?.label || 'Unknown Vector'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="w-80 bg-[#0a0a0a]/50 rounded-xl border border-white/[0.05] border-dashed p-6 flex flex-col items-center justify-center text-center">
              <Info className="h-6 w-6 text-zinc-700 mb-4" />
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Select a strategic node to perform dependency analysis.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
