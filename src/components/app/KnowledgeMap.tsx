"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Share2, ZoomIn, ZoomOut, Maximize2, Info, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { KnowledgeNode, KnowledgeEdge } from "@/lib/types";

const NODE_COLORS: Record<string, string> = {
  VARIABLE: '#3b82f6',
  ASSUMPTION: '#a855f7',
  FACT: '#10b981',
  RISK: '#ef4444',
};

const EDGE_COLORS: Record<string, string> = {
  CONTRADICTS: '#ef4444',
  SUPPORTS: '#10b981',
  IMPACTS: '#64748b',
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

  // ─── Zoom ─────────────────────────────────────────────────
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

  // ─── Pan ──────────────────────────────────────────────────
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

  // ─── Filter & Search ──────────────────────────────────────
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
      <Card className="bg-white/5 border-white/10 p-20 text-center border-dashed glass-card relative overflow-hidden h-[650px] flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-maroon/20 mb-6 shadow-[0_0_30px_rgba(153,27,27,0.2)]">
            <Share2 className="h-8 w-8 text-brand-crimson" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Visualize the Decision Topology</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            Generate a semantic map of variables, risks, and facts to identify critical paths and structural contradictions in your strategic logic.
          </p>
          {error && <p className="text-sm text-brand-crimson mb-4 px-4 py-2 bg-brand-crimson/10 border border-brand-crimson/20 rounded-lg">{error}</p>}
          <Button onClick={generateGraph} className="bg-brand-maroon hover:bg-brand-crimson text-white px-10 h-12 text-sm font-bold uppercase tracking-widest shadow-lg shadow-brand-maroon/20">
            Initialize Knowledge Map
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-[650px] gap-4">
      {/* Dynamic Command Center */}
      <div className="flex items-center justify-between gap-4 bg-black/40 backdrop-blur-xl p-3 rounded-xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-4 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-maroon/40 w-64 transition-all"
            />
          </div>
          <div className="h-6 w-px bg-white/5 mx-1" />
          <div className="flex gap-2">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] transition-all border ${
                  activeFilters.has(type)
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeFilters.has(type) ? color : '#222' }} />
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={generateGraph} disabled={loading} className="bg-brand-maroon/10 border-brand-maroon/20 text-brand-crimson hover:bg-brand-maroon/20 transition-all h-10 px-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            <span className="ml-2 font-bold uppercase tracking-widest text-[10px]">Refresh Analysis</span>
          </Button>
        </div>
      </div>

      {/* Main Analytical Canvas */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* SVG Visualization Area */}
        <div className="flex-1 bg-[#050505] rounded-xl border border-white/5 relative overflow-hidden group/graph shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.03)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute top-4 left-4 text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] pointer-events-none flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-brand-crimson animate-pulse" />
            Strategic Topology • {filteredNodes.length} Active Nodes
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
            <defs>
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <radialGradient key={type} id={`grad-${type}`}>
                  <stop offset="0%" stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.7" />
                </radialGradient>
              ))}
            </defs>

            {/* Logical Edges */}
            <g className="edges">
              {filteredEdges.map((edge, i) => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                const isHovered = hoveredEdge === i;
                const color = EDGE_COLORS[edge.type] || '#333';
                return (
                  <motion.line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isHovered ? '#fff' : color}
                    strokeWidth={isHovered ? 2 : 1}
                    strokeOpacity={isHovered ? 1 : 0.3}
                    strokeDasharray={edge.type === 'CONTRADICTS' ? "5,5" : "none"}
                    className="transition-all duration-300"
                    onMouseEnter={() => setHoveredEdge(i)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                );
              })}
            </g>

            {/* Strategic Nodes */}
            <g className="nodes">
              {filteredNodes.map((node) => (
                <motion.g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Outer Aura */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={35}
                    fill={NODE_COLORS[node.type]}
                    fillOpacity={selectedNode?.id === node.id ? 0.15 : 0}
                    className="transition-all duration-500"
                  />
                  {/* Core Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill={`url(#grad-${node.type})`}
                    stroke={selectedNode?.id === node.id ? '#fff' : 'rgba(255,255,255,0.05)'}
                    strokeWidth={selectedNode?.id === node.id ? 3 : 1}
                    style={{ filter: selectedNode?.id === node.id ? 'url(#node-glow)' : 'none' }}
                    className="transition-all duration-300"
                  />
                  {/* Metadata Label */}
                  <text
                    x={node.x}
                    y={node.y! + 38}
                    textAnchor="middle"
                    fill={selectedNode?.id === node.id ? '#fff' : '#888'}
                    className="text-[12px] font-bold pointer-events-none select-none tracking-tight"
                    filter={selectedNode?.id === node.id ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none'}
                  >
                    {node.label.length > 22 ? node.label.substring(0, 20) + '...' : node.label}
                  </text>
                </motion.g>
              ))}
            </g>
          </svg>

          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
              <Loader2 className="h-10 w-10 text-brand-crimson animate-spin mb-4" />
              <p className="text-white font-bold tracking-[0.2em] uppercase text-[10px] animate-pulse">Mapping Strategic Dependencies...</p>
            </div>
          )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-80 bg-white/5 rounded-xl border border-white/5 p-6 flex flex-col gap-6 glass-card shadow-2xl overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-white/10" style={{ color: NODE_COLORS[selectedNode.type] }}>
                    {selectedNode.type}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white" onClick={() => setSelectedNode(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <h4 className="text-xl font-bold text-white mb-2 leading-tight tracking-tight">
                  {selectedNode.label}
                </h4>
                
                <div className="h-px w-full bg-white/5 my-4" />

                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Description</span>
                    <p className="text-sm text-gray-400 leading-relaxed italic">
                      {selectedNode.description || `Analytical context for ${selectedNode.label.toLowerCase()} is currently being indexed.`}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Share2 className="h-3 w-3" /> Active Connections
                    </h5>
                    <div className="space-y-2">
                      {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((edge, i) => {
                        const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const otherNode = nodes.find(n => n.id === otherNodeId);
                        const isContradiction = edge.type === 'CONTRADICTS';
                        const isSupport = edge.type === 'SUPPORTS';
                        
                        return (
                          <div
                            key={i}
                            className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-1.5 cursor-pointer hover:bg-white/10 transition-colors group/conn"
                            onClick={() => { if (otherNode) setSelectedNode(otherNode); }}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold ${
                                isContradiction ? 'text-red-500' : isSupport ? 'text-emerald-500' : 'text-blue-400'
                              }`}>
                                {edge.type}
                              </span>
                              <span className="text-[9px] text-gray-600 uppercase font-mono">
                                {edge.source === selectedNode.id ? 'OUTGOING' : 'INCOMING'}
                              </span>
                            </div>
                            <p className="text-xs text-white font-medium group-hover/conn:text-brand-crimson transition-colors">{otherNode?.label || 'Unknown Vector'}</p>
                            {edge.label && <p className="text-[10px] text-gray-500 italic leading-tight">{edge.label}</p>}
                          </div>
                        );
                      })}
                      {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                        <p className="text-xs text-gray-600 italic px-2">No logical dependencies detected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* <div className="mt-auto pt-8">
                  <Button className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] h-11 transition-all">
                    Trace Dependency Stream
                  </Button>
                </div> */}
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full border border-dashed border-gray-800 flex items-center justify-center mb-6 opacity-40">
                  <Info className="h-6 w-6 text-gray-600" />
                </div>
                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">System Ready</h5>
                <p className="text-xs text-gray-600 px-4 leading-relaxed">
                  Select a strategic node to perform deep-stream dependency analysis and verification.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});
