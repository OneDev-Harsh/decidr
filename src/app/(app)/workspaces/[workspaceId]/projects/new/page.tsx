"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Cpu, PenTool } from "lucide-react";
import Link from "next/link";
import { AutonomousIngestion } from "@/components/app/AutonomousIngestion";
import { motion, AnimatePresence } from "framer-motion";

export default function NewProjectPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [autoFilledData, setAutoFilledData] = useState<any>(null);

  const handleAIComplete = async (data: any) => {
    // If we wanted to create immediately:
    setLoading(true);
    const { data: projectData, error: projectError } = await insforge.database
      .from('projects')
      .insert({ 
        workspace_id: workspaceId,
        title: data.title,
        description: data.description,
        problem_statement: data.problem_statement,
        goals: data.goals,
        status: data.status,
        priority: data.priority,
        strategic_drivers: data.strategic_drivers,
        key_assumptions: data.key_assumptions,
        success_criteria: data.success_criteria
      })
      .select()
      .single();

    if (projectError || !projectData) {
      setError(projectError?.message || "Failed to create project from AI data.");
      setLoading(false);
      return;
    }

    await insforge.database.from('project_activity').insert({
      project_id: projectData.id,
      action: 'project.created',
      details: `Project "${data.title}" autonomously initialized via AI Ingestion.`,
    });

    router.push(`/projects/${projectData.id}`);
  };

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;

    const { data: projectData, error: projectError } = await insforge.database
      .from('projects')
      .insert({ 
        workspace_id: workspaceId,
        title,
        description,
        priority,
        status: 'active'
      })
      .select()
      .single();

    if (projectError || !projectData) {
      setError(projectError?.message || "Failed to create project");
      setLoading(false);
      return;
    }

    // Log activity
    await insforge.database.from('project_activity').insert({
      project_id: projectData.id,
      action: 'project.created',
      details: `Project "${title}" manually initialized.`,
    });

    router.push(`/projects/${projectData.id}`);
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10">
        <Link href={`/workspaces/${workspaceId}`} className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white flex items-center transition-colors w-fit">
          <ArrowLeft className="mr-3 h-4 w-4" /> Return to Workspace
        </Link>
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">Initialize Intelligence</h1>
        <p className="text-zinc-500 max-w-xl mx-auto font-medium">Select an initialization vector. Let Decidr autonomously build your strategic architecture or construct it manually.</p>
        
        <div className="flex justify-center mt-8">
          <div className="bg-black border border-white/10 rounded-full p-1 flex">
            <button
              onClick={() => setMode("ai")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all ${
                mode === "ai" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Cpu className="h-4 w-4" /> AI Synthesis
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all ${
                mode === "manual" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              <PenTool className="h-4 w-4" /> Manual Setup
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "ai" ? (
          <motion.div
            key="ai-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AutonomousIngestion workspaceId={workspaceId} onComplete={handleAIComplete} />
            {error && (
              <div className="mt-4 text-sm text-brand-crimson font-medium bg-brand-crimson/10 p-4 rounded-xl border border-brand-crimson/20 text-center">
                {error}
              </div>
            )}
            {loading && (
              <div className="mt-8 text-center text-zinc-500 text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" /> Finalizing Database Objects...
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="manual-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl">
              <CardHeader className="pb-8 border-b border-white/5">
                <CardTitle className="text-xl text-white font-bold tracking-tight">Manual Initialization</CardTitle>
                <CardDescription className="text-zinc-500">
                  Define the core parameters of your strategic project. You can add deep context later.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleManualSubmit}>
                <CardContent className="space-y-6 pt-8">
                  <div className="space-y-3">
                    <label htmlFor="title" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                      Project Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      className="bg-black border-white/10 text-white h-12 focus-visible:ring-brand-crimson focus-visible:border-brand-crimson"
                      placeholder="e.g. Project Phoenix"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="description" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                      Brief Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-black px-4 py-3 text-[14px] placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-crimson focus-visible:border-brand-crimson text-white resize-y transition-all"
                      placeholder="What is the core objective?"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="priority" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                      Strategic Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      className="flex h-12 w-full rounded-md border border-white/10 bg-black px-4 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-crimson focus-visible:border-brand-crimson text-white appearance-none"
                      defaultValue="medium"
                    >
                      <option value="low">Low - Exploratory</option>
                      <option value="medium">Medium - Standard Operations</option>
                      <option value="high">High - Strategic Importance</option>
                      <option value="critical">Critical - Immediate Action Required</option>
                    </select>
                  </div>

                  {error && (
                    <div className="text-[13px] text-brand-crimson font-medium bg-brand-crimson/10 p-4 rounded-xl border border-brand-crimson/20">
                      {error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t border-white/5 pt-8 mt-2 bg-black/40 rounded-b-xl">
                  <Button variant="ghost" type="button" className="text-zinc-400 hover:text-white hover:bg-white/5" asChild>
                    <Link href={`/workspaces/${workspaceId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-white hover:bg-zinc-200 text-black font-bold h-10 px-8 transition-all">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Initialize Project
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
