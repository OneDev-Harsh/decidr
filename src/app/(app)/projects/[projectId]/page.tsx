"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Database, 
  GitMerge, 
  CheckCircle, 
  CheckCircle2, 
  Target, 
  Loader2, 
  EyeOff, 
  MessageSquare, 
  Share2, 
  Clock, 
  Maximize2, 
  Sparkles, 
  Wand2,
  BarChart3,
  GitPullRequest,
  ListTodo,
  Trophy,
  Activity as ActivityIcon,
  Compass,
  Lightbulb,
  AlertTriangle,
  ShieldCheck,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { EvidenceManager } from "@/components/app/EvidenceManager";
import { ScenarioMatrix } from "@/components/app/ScenarioMatrix";
import { RecommendationView } from "@/components/app/RecommendationView";
import { BlindspotAnalysis } from "@/components/app/BlindspotAnalysis";
import { KnowledgeMap } from "@/components/app/KnowledgeMap";
import { DecisionTimeline } from "@/components/app/DecisionTimeline";
import { ContradictionAlert } from "@/components/app/ContradictionAlert";
import { DiscussionSection } from "@/components/app/DiscussionSection";
import { CollaborationAvatars } from "@/components/app/CollaborationAvatars";
import { ProposalsSection } from "@/components/app/ProposalsSection";
import { ProjectTasksSection } from "@/components/app/ProjectTasksSection";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ReportGenerationModal } from "@/components/app/ReportGenerationModal";

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [isAnalyzingBulk, setIsAnalyzingBulk] = useState(false);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [topCollaborators, setTopCollaborators] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Form refs for auto-fill
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function loadProject() {
      // 1. Wait for auth to be ready (prevents race condition on reload)
      const { data: userData } = await insforge.auth.getCurrentUser();

      const { data: projData, error: projError } = await insforge.database
        .from('projects')
        .select('*, workspaces(id, name)')
        .eq('id', projectId)
        .single();
        
      if (projError || !projData) {
        console.error("Project load error:", projError);
        // Only redirect if it's clearly a "Not Found" or "Unauthorized" after auth is ready
        if (!projData || projError?.status === 404 || projError?.code === 'PGRST116') {
          router.push("/dashboard");
        }
        setLoading(false);
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
      
      // Fetch top collaborators based on activity
      const { data: activitySummary } = await insforge.database
        .from('project_activity')
        .select('user_id, profiles(full_name, username, avatar_url)')
        .eq('project_id', projectId);
      
      if (activitySummary) {
        const counts: Record<string, any> = {};
        activitySummary.forEach((a: any) => {
          if (!a.user_id) return;
          if (!counts[a.user_id]) {
            counts[a.user_id] = { ...a.profiles, count: 0 };
          }
          counts[a.user_id].count++;
        });
        setTopCollaborators(Object.values(counts).sort((a: any, b: any) => b.count - a.count).slice(0, 3));
      }

      // Fetch tasks
      const { data: taskData } = await insforge.database
        .from('project_tasks')
        .select('*, profiles!assigned_to(full_name, avatar_url)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (taskData) {
        setTasks(taskData);
      }

      // Fetch unresolved comments count
      const { count: commentCount } = await insforge.database
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .is('resolved_at', null);

      setProject(prev => ({ ...prev, _unresolvedComments: commentCount || 0 }));
      
      // Fetch open proposals count
      const { count: proposalCount } = await insforge.database
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('status', 'open');

      setProject(prev => ({ ...prev, _openProposals: proposalCount || 0 }));

      // Determine if user is owner/admin
      if (userData?.user) {
        const { data: memberData } = await insforge.database
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', projData.workspace_id)
          .eq('user_id', userData.user.id)
          .single();

        if (memberData && (memberData.role === 'owner' || memberData.role === 'admin')) {
          setIsOwnerOrAdmin(true);
        } else if (projData.workspaces?.owner_id === userData.user.id) {
          setIsOwnerOrAdmin(true);
        }
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
        strategic_drivers: data.strategic_drivers || project.strategic_drivers,
        key_assumptions: data.key_assumptions || project.key_assumptions,
        success_criteria: data.success_criteria || project.success_criteria,
      });

      // Log activity
      const { data: userData } = await insforge.auth.getCurrentUser();
      await insforge.database.from('project_activity').insert([{
        project_id: projectId,
        user_id: userData?.user?.id,
        action: 'project.bulk_update',
        details: 'Updated project details via AI Synthesis'
      }]);

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
      strategic_drivers: formData.get("strategic_drivers") as string,
      key_assumptions: formData.get("key_assumptions") as string,
      success_criteria: formData.get("success_criteria") as string,
    };

    const { error } = await insforge.database
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) {
      alert("Error saving project: " + error.message);
    } else {
      // Log activity
      const { data: userData } = await insforge.auth.getCurrentUser();
      await insforge.database.from('project_activity').insert([{
        project_id: projectId,
        user_id: userData?.user?.id,
        action: 'project.update',
        details: 'Updated project strategic details'
      }]);

      setProject({ ...project, ...updates });
      setIsEditing(false);
    }
    setSaving(false);
  }

  function handleGenerateReport() {
    setIsReportModalOpen(true);
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
    { id: "tasks", name: "Action Items", icon: ListTodo },
    { id: "proposals", name: "Strategic Proposals", icon: GitPullRequest },
    { id: "evidence", name: "Evidence & Sources", icon: Database },
    { id: "blindspots", name: "Blindspot Audit", icon: EyeOff },
    { id: "scenarios", name: "Scenarios", icon: GitMerge },
    { id: "graph", name: "Knowledge Map", icon: Share2 },
    { id: "timeline", name: "Decision Timeline", icon: Clock },
    { id: "contradictions", name: "Contradictions", icon: AlertTriangle },
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
                {tab.id === 'tasks' && tasks.filter(t => !t.is_completed).length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-zinc-500"}`}>
                    {tasks.filter(t => !t.is_completed).length}
                  </span>
                )}
                {tab.id === 'proposals' && project?._openProposals > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-zinc-500"}`}>
                    {project._openProposals}
                  </span>
                )}
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
                {tab.id === 'contradictions' && contradictions.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-red-500 text-white" : "bg-red-500/20 text-red-400"}`}>
                    {contradictions.length}
                  </span>
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
                  
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 space-y-8 shadow-2xl">
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Project Title</label>
                        <input name="title" defaultValue={project.title} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all h-11" required />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Short Description</label>
                        <input name="description" defaultValue={project.description} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all h-11" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Problem Statement</label>
                      <textarea name="problem_statement" defaultValue={project.problem_statement} className="w-full min-h-[100px] bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all" placeholder="What is the core question to answer?" />
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Current Status</label>
                        <select name="status" defaultValue={project.status} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all h-11 appearance-none">
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ANALYZING">ANALYZING</option>
                          <option value="DECIDED">DECIDED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Decision Priority</label>
                        <select name="priority" defaultValue={project.priority} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all h-11 appearance-none">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Goals & Constraints</label>
                      <textarea name="goals" defaultValue={project.goals} className="w-full min-h-[100px] bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all" placeholder="What must be achieved and avoided?" />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Strategic Drivers</label>
                      <textarea name="strategic_drivers" defaultValue={project.strategic_drivers} className="w-full min-h-[100px] bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all" placeholder="What market, tech, or business forces are driving this?" />
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Key Assumptions</label>
                        <textarea name="key_assumptions" defaultValue={project.key_assumptions} className="w-full min-h-[120px] bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all" placeholder="What are we taking for granted?" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Success Criteria</label>
                        <textarea name="success_criteria" defaultValue={project.success_criteria} className="w-full min-h-[120px] bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] transition-all" placeholder="How will we measure victory?" />
                      </div>
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
                {activeTab === "context" && project && (
                  <div className="grid gap-8 md:grid-cols-12 max-w-[1400px] mx-auto">
                    {/* Main Content Column */}
                    <div className="md:col-span-8 space-y-8">
                      {/* Strategic Narrative Card */}
                      <section className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg">
                              <LayoutDashboard className="h-4 w-4 text-zinc-100" />
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">Project Landscape</h3>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                            <Clock className="h-3 w-3" /> Updated {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="p-8 space-y-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <ActivityIcon className="h-4 w-4 text-zinc-400" />
                              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Current System State</h4>
                            </div>
                            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                              <p className={`text-[16px] text-zinc-200 leading-relaxed font-light ${!project.current_state ? 'italic text-zinc-600' : ''}`}>
                                {project.current_state || "System state not yet initialized. Define the current landscape to enable logical contradiction detection."}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-zinc-400" />
                              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Problem Statement</h4>
                            </div>
                            <p className={`text-[16px] text-zinc-300 px-6 leading-relaxed ${!project.problem_statement ? 'italic text-zinc-600' : ''}`}>
                              {project.problem_statement || "No problem statement defined."}
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* Strategic Dimensions Grid */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all group shadow-lg">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                              <Compass className="h-4 w-4 text-zinc-100" />
                            </div>
                            <h4 className="text-[12px] font-bold text-zinc-100 uppercase tracking-widest">Strategic Drivers</h4>
                          </div>
                          <p className={`text-[14px] text-zinc-400 leading-relaxed ${!project.strategic_drivers ? 'italic text-zinc-600' : ''}`}>
                            {project.strategic_drivers || "Drivers not defined."}
                          </p>
                        </div>

                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all group shadow-lg">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                              <CheckCircle2 className="h-4 w-4 text-zinc-100" />
                            </div>
                            <h4 className="text-[12px] font-bold text-zinc-100 uppercase tracking-widest">Goals & Constraints</h4>
                          </div>
                          <p className={`text-[14px] text-zinc-400 leading-relaxed ${!project.goals ? 'italic text-zinc-600' : ''}`}>
                            {project.goals || "Not defined yet."}
                          </p>
                        </div>

                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all group shadow-lg">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                              <Lightbulb className="h-4 w-4 text-zinc-100" />
                            </div>
                            <h4 className="text-[12px] font-bold text-zinc-100 uppercase tracking-widest">Key Assumptions</h4>
                          </div>
                          <p className={`text-[14px] text-zinc-400 leading-relaxed ${!project.key_assumptions ? 'italic text-zinc-600' : ''}`}>
                            {project.key_assumptions || "No assumptions logged."}
                          </p>
                        </div>

                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all group shadow-lg">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                              <Trophy className="h-4 w-4 text-zinc-100" />
                            </div>
                            <h4 className="text-[12px] font-bold text-zinc-100 uppercase tracking-widest">Success Criteria</h4>
                          </div>
                          <p className={`text-[14px] text-zinc-400 leading-relaxed ${!project.success_criteria ? 'italic text-zinc-600' : ''}`}>
                            {project.success_criteria || "Metrics for victory not defined."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="md:col-span-4 space-y-6">
                      {/* Strategic Health Sidebar */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Strategic Health</h4>
                          <ShieldCheck className={`h-4 w-4 ${[project.current_state, project.problem_statement, project.goals, project.strategic_drivers, project.key_assumptions, project.success_criteria].filter(Boolean).length >= 4 ? 'text-zinc-100' : 'text-zinc-600'}`} />
                        </div>
                        <div className="p-6 space-y-6">
                          <div>
                            <div className="flex items-center justify-between text-[13px] mb-2">
                              <span className="text-zinc-400">Context Completion</span>
                              <span className="font-mono text-zinc-100">
                                {Math.round(([project.current_state, project.problem_statement, project.goals, project.strategic_drivers, project.key_assumptions, project.success_criteria].filter(Boolean).length / 6) * 100)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${([project.current_state, project.problem_statement, project.goals, project.strategic_drivers, project.key_assumptions, project.success_criteria].filter(Boolean).length / 6) * 100}%` }}
                                className="h-full bg-zinc-100 transition-all duration-1000"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                                <span className="text-[13px] text-zinc-400">Intelligence Confidence</span>
                              </div>
                              <span className="text-[13px] font-medium text-zinc-100">Medium</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-zinc-100" />
                                <span className="text-[13px] text-zinc-400">Decision Readiness</span>
                              </div>
                              <span className="text-[13px] font-medium text-zinc-100">
                                {project.status === 'DECIDED' ? 'Complete' : 'Analysis In Progress'}
                              </span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 transition-colors h-10 text-[12px] font-medium"
                            onClick={() => setIsEditing(true)}
                          >
                            <Zap className="mr-2 h-3.5 w-3.5" /> Refine Framework
                          </Button>
                        </div>
                      </div>

                      {/* Active Tasks Sidebar Summary */}
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-900 rounded-md">
                              <ListTodo className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <h4 className="text-[11px] font-bold text-zinc-100 uppercase tracking-widest">Active Tasks</h4>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">{tasks.filter(t => !t.is_completed).length} open</span>
                        </div>
                        <div className="space-y-3">
                          {tasks.filter(t => !t.is_completed).length === 0 ? (
                            <p className="text-[12px] text-zinc-600 italic py-2">No active tasks assigned.</p>
                          ) : (
                            tasks.filter(t => !t.is_completed).slice(0, 3).map((task, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                                <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                                  task.priority === 'high' ? 'bg-zinc-100' : 
                                  task.priority === 'medium' ? 'bg-zinc-400' : 'bg-zinc-700'
                                }`} />
                                <p className="text-[12px] text-zinc-400 line-clamp-1 leading-snug">{task.title}</p>
                              </div>
                            ))
                          )}
                          {tasks.filter(t => !t.is_completed).length > 3 && (
                            <button onClick={() => setActiveTab('tasks')} className="w-full py-2 mt-2 text-[11px] text-zinc-500 hover:text-zinc-100 transition-colors text-center font-bold uppercase tracking-[0.2em] border-t border-zinc-900/50">
                              View All Tasks
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "tasks" && (
                  <ErrorBoundary fallbackTitle="Tasks Error">
                    <ProjectTasksSection 
                      projectId={projectId} 
                      tasks={tasks} 
                      onUpdate={() => window.location.reload()} 
                    />
                  </ErrorBoundary>
                )}

                {activeTab === "proposals" && project && (
                  <ErrorBoundary fallbackTitle="Proposals Error">
                    <ProposalsSection 
                      projectId={projectId} 
                      isOwnerOrAdmin={isOwnerOrAdmin} 
                      project={project}
                      onMerged={() => {
                        // Reload project to reflect merged changes
                        window.location.reload();
                      }}
                    />
                  </ErrorBoundary>
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
                {activeTab === "contradictions" && (
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 shadow-inner">
                        <AlertTriangle className="h-5 w-5 text-zinc-100" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">Strategic Contradiction Audit</h2>
                        <p className="text-[14px] text-zinc-500 font-medium tracking-tight">Real-time analysis of logical inconsistencies across evidence, scenarios, and recommendations.</p>
                      </div>
                    </div>
                    
                    {contradictions.length === 0 ? (
                      <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-20 flex flex-col items-center justify-center text-center shadow-2xl">
                        <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-white/5">
                          <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2 uppercase tracking-tight">Zero Divergence Detected</h3>
                        <p className="text-zinc-500 max-w-md text-[14px] font-medium tracking-tight">Your current decision framework, evidence, and scenarios are logically consistent. The system will alert you if new evidence introduces structural conflicts.</p>
                      </div>
                    ) : (
                      <ContradictionAlert contradictions={contradictions} />
                    )}
                  </div>
                )}
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

      <ReportGenerationModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
