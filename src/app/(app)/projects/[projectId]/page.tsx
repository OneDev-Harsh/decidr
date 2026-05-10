"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, FileText, Database, GitMerge, CheckCircle, CheckCircle2, Target, Loader2, EyeOff, MessageSquare, Share2, Clock, Maximize2 } from "lucide-react";
import { EvidenceManager } from "@/components/app/EvidenceManager";
import { ScenarioMatrix } from "@/components/app/ScenarioMatrix";
import { RecommendationView } from "@/components/app/RecommendationView";
import { BlindspotAnalysis } from "@/components/app/BlindspotAnalysis";
import { KnowledgeMap } from "@/components/app/KnowledgeMap";
import { DecisionTimeline } from "@/components/app/DecisionTimeline";
import { ContradictionAlert } from "@/components/app/ContradictionAlert";
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

  async function handleSaveDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      problem_statement: formData.get("problem_statement") as string,
      goals: formData.get("goals") as string,
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
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-t-2 border-brand-crimson animate-spin mb-4"></div>
        </div>
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
    { id: "recommendation", name: "Recommendation", icon: CheckCircle },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505]">
      <div className="shrink-0 border-b border-white/5 bg-black/60 backdrop-blur-xl px-8 py-6 sticky top-0 z-40">
        <div className="mb-4">
          <Link href={`/workspaces/${project?.workspace_id}`} className="text-sm font-medium text-gray-400 hover:text-white flex items-center transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {project?.workspaces?.name}
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-white">{project?.title}</h1>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-maroon/20 text-brand-crimson border border-brand-maroon/20">
                {project?.status}
              </span>
            </div>
            <p className="text-gray-400 max-w-2xl text-sm">
              {project?.description || "No description provided."}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="mr-2 h-4 w-4" /> {isEditing ? "Cancel" : "Edit Details"}
            </Button>
            <Button size="sm" onClick={handleGenerateReport} className="bg-brand-maroon hover:bg-brand-crimson text-white">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </div>
        </div>

        <div className="mt-8 flex space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#050505] text-white border-t border-l border-r border-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? (tab.id === 'blindspots' ? "text-amber-500" : "text-brand-crimson") : ""}`} />
              {tab.name}
              
              {/* Dynamic Badges */}
              {tab.id === 'evidence' && project?._evidenceCount !== undefined && (
                <span className="ml-2 text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{project._evidenceCount}</span>
              )}
              {tab.id === 'blindspots' && project?.last_blindspots?.length > 0 && (
                <span className="ml-2 text-[9px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-500 border border-amber-500/20">
                  {project.last_blindspots.length}
                </span>
              )}
              {tab.id === 'scenarios' && project?.last_scenarios?.length > 0 && (
                <span className="ml-2 text-[9px] font-bold bg-brand-crimson/10 px-1.5 py-0.5 rounded text-brand-crimson border border-brand-crimson/20">
                  {project.last_scenarios.length}
                </span>
              )}
              {tab.id === 'recommendation' && project?.status === 'DECIDED' && (
                <CheckCircle2 className="ml-2 h-3 w-3 text-emerald-500" />
              )}
            </button>
          ))}
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
              <form onSubmit={handleSaveDetails} className="max-w-4xl space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Project Title</label>
                    <input name="title" defaultValue={project.title} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <input name="description" defaultValue={project.description} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Problem Statement</label>
                  <textarea name="problem_statement" defaultValue={project.problem_statement} className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="What is the core question to answer?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Goals & Constraints</label>
                  <textarea name="goals" defaultValue={project.goals} className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="What must be achieved and avoided?" />
                </div>
                <Button type="submit" disabled={saving} className="bg-brand-crimson text-white">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Project Details
                </Button>
              </form>
            ) : (
              <>
                {activeTab === "context" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-white/5 border-white/10 h-fit glass-card">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Problem Statement</CardTitle>
                        <CardDescription className="text-gray-400">The core question to answer.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={`p-4 bg-black/50 rounded-md border border-white/5 text-gray-300 min-h-[100px] ${!project.problem_statement ? 'flex items-center justify-center italic' : ''}`}>
                          {project.problem_statement || "Not defined yet. Click edit to add."}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 h-fit glass-card">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Goals & Constraints</CardTitle>
                        <CardDescription className="text-gray-400">What must be achieved and avoided.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={`p-4 bg-black/50 rounded-md border border-white/5 text-gray-300 min-h-[100px] ${!project.goals ? 'flex items-center justify-center italic' : ''}`}>
                          {project.goals || "Not defined yet. Click edit to add."}
                        </div>
                      </CardContent>
                    </Card>
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
                        className="bg-brand-maroon/80 backdrop-blur-md border-white/10 text-white hover:bg-brand-maroon shadow-lg h-9 px-4 text-[10px] font-bold uppercase tracking-widest"
                        onClick={() => setIsMapModalOpen(true)}
                      >
                        <Maximize2 className="mr-2 h-3.5 w-3.5" /> Expand Explorer
                      </Button>
                    </div>
                    <ErrorBoundary fallbackTitle="Knowledge Map Error">
                      <KnowledgeMap project={project} onAnalysisComplete={handleAnalysisComplete} />
                    </ErrorBoundary>
                  </div>
                )}
                {activeTab === "timeline" && <ErrorBoundary fallbackTitle="Timeline Error"><DecisionTimeline projectId={projectId} /></ErrorBoundary>}
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
