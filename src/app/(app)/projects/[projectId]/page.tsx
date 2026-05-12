"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, FileText, Database, GitMerge, CheckCircle, CheckCircle2, Target, Loader2, EyeOff, MessageSquare, Share2, Clock, Maximize2, Sparkles, Wand2 } from "lucide-react";
import { EvidenceManager } from "@/components/app/EvidenceManager";
import { ScenarioMatrix } from "@/components/app/ScenarioMatrix";
import { RecommendationView } from "@/components/app/RecommendationView";
import { BlindspotAnalysis } from "@/components/app/BlindspotAnalysis";
import { KnowledgeMap } from "@/components/app/KnowledgeMap";
import { DecisionTimeline } from "@/components/app/DecisionTimeline";
import { ContradictionAlert } from "@/components/app/ContradictionAlert";
import { DiscussionSection } from "@/components/app/DiscussionSection";
import { CollaborationAvatars } from "@/components/app/CollaborationAvatars";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("context");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contradictions, setContradictions] = useState<any[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [isAnalyzingBulk, setIsAnalyzingBulk] = useState(false);
  
  // Form refs for auto-fill
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function loadProject() {
      const { data: projData, error: projError } = await insforge.database
        .from('projects')
        .select('*, workspaces(id, name)')
        .eq('id', projectId)
        .single();
        
      if (projError || !projData) {
        router.push("/dashboard");
        return;
      }
      // Load evidence count for badge
      const { count: evCount } = await insforge.database
        .from('evidence')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      setProject({ ...projData, _evidenceCount: evCount || 0 });
      
      if (projData.last_contradictions) {
        setContradictions(projData.last_contradictions);
      }

      // Fetch unresolved comments count
      const { count: commentCount } = await insforge.database
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .is('resolved_at', null);

      setProject(prev => ({ ...prev, _unresolvedComments: commentCount || 0 }));
      
      setLoading(false);
    }
    
    if (projectId) {
      loadProject();
    }
  }, [projectId, router]);

  const handleAnalysisComplete = (data: any) => {
    if (data.contradictions) {
      setContradictions(data.contradictions);
    }
  };

  async function handleBulkAnalyze() {
    if (!bulkText.trim()) return;
    setIsAnalyzingBulk(true);
    try {
      const authHeader = insforge.getHttpClient().getHeaders()['Authorization'];
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader || '' },
        body: JSON.stringify({ 
          project, 
          action: 'bulk_extract',
          bulkText 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Extraction failed');

      // Update project state locally so fields reflect changes
      setProject({
        ...project,
        title: data.title || project.title,
        description: data.description || project.description,
        problem_statement: data.problem_statement || project.problem_statement,
        goals: data.goals || project.goals,
        status: data.status || project.status,
        priority: data.priority || project.priority,
      });
      setBulkText(""); // Clear after success
    } catch (err: any) {
      alert("Extraction error: " + err.message);
    } finally {
      setIsAnalyzingBulk(false);
    }
  }

  async function handleSaveDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      problem_statement: formData.get("problem_statement") as string,
      goals: formData.get("goals") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
    };

    const { error } = await insforge.database
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) {
      alert("Error saving project: " + error.message);
    } else {
      setProject({ ...project, ...updates });
      setIsEditing(false);
    }
    setSaving(false);
  }

  function handleGenerateReport() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex-1 p-12 flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  const tabs = [
    { id: "context", name: "Context & Goals", icon: Target },
    { id: "evidence", name: "Evidence & Sources", icon: Database },
    { id: "blindspots", name: "Blindspot Audit", icon: EyeOff },
    { id: "scenarios", name: "Scenarios", icon: GitMerge },
    { id: "graph", name: "Knowledge Map", icon: Share2 },
    { id: "timeline", name: "Decision Timeline", icon: Clock },
    { id: "debate", name: "Discussions", icon: MessageSquare },
    { id: "recommendation", name: "Recommendation", icon: CheckCircle },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-black">
      <div className="shrink-0 border-b border-white/10 bg-black px-8 pt-8 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-6">
            <Link href={`/workspaces/${project?.workspace_id}`} className="text-[13px] font-medium text-zinc-500 hover:text-white flex items-center transition-colors w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to {project?.workspaces?.name}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-2xl font-semibold tracking-tight text-white">{project?.title}</h1>
                <CollaborationAvatars channel={`presence:project:${projectId}`} />
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-white/10 text-white capitalize">
                  {project?.status}
                </span>
              </div>
              <p className="text-[14px] text-zinc-400 max-w-2xl">
                {project?.description || "No description provided."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="border-white/10 text-white hover:bg-white/5 h-9">
                <Edit className="mr-2 h-4 w-4" /> {isEditing ? "Cancel" : "Edit Details"}
              </Button>
              <Button size="sm" onClick={handleGenerateReport} className="bg-white hover:bg-zinc-200 text-black font-medium px-4 h-9 border-none transition-colors rounded-md shadow-sm">
                <FileText className="mr-2 h-4 w-4" /> Generate Report
              </Button>
            </div>
          </div>

          <div className="mt-8 flex space-x-6 overflow-x-auto no-scrollbar relative top-[1px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center pb-3 text-[14px] font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? "text-white border-white"
                    : "text-zinc-500 hover:text-zinc-300 border-transparent"
                }`}
              >
                <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? "text-white" : "text-zinc-500"}`} /> {tab.name}
                {tab.id === 'evidence' && project?._evidenceCount > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white/10 text-white" : "bg-white/5 text-zinc-500"}`}>
                    {project._evidenceCount}
                  </span>
                )}
                {tab.id === 'blindspots' && project?.last_blindspots?.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-red-500/20 text-red-400 border border-red-500/20" : "bg-white/5 text-zinc-500"}`}>
                    {project.last_blindspots.length}
                  </span>
                )}
                {tab.id === 'scenarios' && project?.last_scenarios?.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white/10 text-white" : "bg-white/5 text-zinc-500"}`}>
                    {project.last_scenarios.length}
                  </span>
                )}
                {tab.id === 'recommendation' && project?.status === 'DECIDED' && (
                  <CheckCircle2 className="ml-2 h-3 w-3 text-emerald-500" />
                )}
                {tab.id === 'debate' && project?._unresolvedComments > 0 && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-brand-maroon animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {/* Surface Contradictions across analytical tabs */}
        {(activeTab === 'scenarios' || activeTab === 'recommendation' || activeTab === 'debate' || activeTab === 'graph') && (
          <ContradictionAlert contradictions={contradictions} />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (isEditing ? '-editing' : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isEditing ? (
              <div className="max-w-3xl space-y-10 pb-24">
                {/* Bulk Analysis Section */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden relative">
                  <div className="p-6 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-[15px] font-medium text-white">AI Strategic Intake</h3>
                    </div>
                    <p className="text-[13px] text-zinc-500">
                      Paste a project brief, email, or meeting notes. Our AI will automatically structure the project context.
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <textarea 
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="Paste unstructured project details here..."
                      className="w-full min-h-[120px] bg-black border border-white/10 rounded-md px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
                    />
                    <Button 
                      onClick={handleBulkAnalyze} 
                      disabled={isAnalyzingBulk || !bulkText.trim()}
                      className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-10 text-[13px] font-medium transition-all group"
                    >
                      {isAnalyzingBulk ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" /> : <Wand2 className="mr-2 h-4 w-4 text-zinc-400 group-hover:rotate-12 transition-transform" />}
                      {isAnalyzingBulk ? "Analyzing Decision Vectors..." : "Synthesize & Auto-Fill Fields"}
                    </Button>
                  </div>
                </div>

                <form ref={formRef} onSubmit={handleSaveDetails} className="space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Manual Refinement</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-zinc-300">Project Title</label>
                        <input name="title" defaultValue={project.title} className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px] h-10" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-zinc-300">Description</label>
                        <input name="description" defaultValue={project.description} className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px] h-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-zinc-300">Problem Statement</label>
                      <textarea name="problem_statement" defaultValue={project.problem_statement} className="w-full min-h-[100px] bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px]" placeholder="What is the core question to answer?" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-zinc-300">Status</label>
                        <select name="status" defaultValue={project.status} className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px] h-10">
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ANALYZING">ANALYZING</option>
                          <option value="DECIDED">DECIDED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-zinc-300">Priority</label>
                        <select name="priority" defaultValue={project.priority} className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px] h-10">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-zinc-300">Goals & Constraints</label>
                      <textarea name="goals" defaultValue={project.goals} className="w-full min-h-[100px] bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px]" placeholder="What must be achieved and avoided?" />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-[12px] text-zinc-500">
                      Changes are not saved until committed.
                    </p>
                    <div className="flex gap-3">
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-white hover:bg-white/5 h-10 px-4">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving} className="bg-white hover:bg-zinc-200 text-black px-6 h-10 text-[14px] font-medium rounded-md shadow-sm transition-colors">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" />} Save Changes
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {activeTab === "context" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="h-4 w-4 text-zinc-500" />
                        <h4 className="text-[14px] font-medium text-zinc-500 uppercase tracking-widest">Problem Statement</h4>
                      </div>
                      <p className={`text-[15px] text-zinc-300 leading-relaxed font-light ${!project.problem_statement ? 'italic text-zinc-600' : ''}`}>
                        {project.problem_statement || "Not defined yet. Access edit mode to configure core problem statement."}
                      </p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                        <h4 className="text-[14px] font-medium text-zinc-500 uppercase tracking-widest">Goals & Constraints</h4>
                      </div>
                      <p className={`text-[15px] text-zinc-300 leading-relaxed font-light ${!project.goals ? 'italic text-zinc-600' : ''}`}>
                        {project.goals || "Not defined yet. Access edit mode to configure strategic goals."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "evidence" && <ErrorBoundary fallbackTitle="Evidence Manager Error"><EvidenceManager projectId={projectId} /></ErrorBoundary>}
                {activeTab === "blindspots" && <ErrorBoundary fallbackTitle="Blindspot Analysis Error"><BlindspotAnalysis project={project} onAnalysisComplete={handleAnalysisComplete} /></ErrorBoundary>}
                {activeTab === "scenarios" && <ErrorBoundary fallbackTitle="Scenario Matrix Error"><ScenarioMatrix project={project} onAnalysisComplete={handleAnalysisComplete} /></ErrorBoundary>}
                {activeTab === "graph" && (
                  <div className="relative h-[650px] border border-white/10 rounded-xl overflow-hidden bg-black/40 group">
                    <div className="absolute bottom-6 left-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-black/80 backdrop-blur-md border border-white/10 text-white hover:bg-zinc-900 shadow-lg h-9 px-4 text-[11px] font-medium transition-all"
                        onClick={() => setIsMapModalOpen(true)}
                      >
                        <Maximize2 className="mr-2 h-4 w-4" /> Fullscreen Explorer
                      </Button>
                    </div>
                    <ErrorBoundary fallbackTitle="Knowledge Map Error">
                      <KnowledgeMap project={project} onAnalysisComplete={handleAnalysisComplete} />
                    </ErrorBoundary>
                  </div>
                )}
                {activeTab === "timeline" && <ErrorBoundary fallbackTitle="Timeline Error"><DecisionTimeline projectId={projectId} /></ErrorBoundary>}
                {activeTab === "debate" && <ErrorBoundary fallbackTitle="Discussions Error"><DiscussionSection projectId={projectId} /></ErrorBoundary>}
                {activeTab === "recommendation" && <ErrorBoundary fallbackTitle="Recommendation Error"><RecommendationView project={project} onAnalysisComplete={handleAnalysisComplete} /></ErrorBoundary>}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fullscreen Knowledge Map Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="shrink-0 h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-brand-maroon flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Strategic Knowledge Explorer</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMapModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                Exit Explorer
              </Button>
            </div>
            <div className="flex-1 relative">
              <ErrorBoundary fallbackTitle="Knowledge Map Error">
                <KnowledgeMap project={project} onAnalysisComplete={handleAnalysisComplete} />
              </ErrorBoundary>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
