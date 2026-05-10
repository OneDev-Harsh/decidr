"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, Settings, ArrowLeft, Loader2 } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      // Fetch Workspace Details
      const { data: wsData, error: wsError } = await insforge.database
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
        
      if (wsError || !wsData) {
        router.push("/dashboard");
        return;
      }
      setWorkspace(wsData);

      // Fetch Projects in Workspace
      const { data: projData } = await insforge.database
        .from('projects')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });
        
      if (projData) {
        setProjects(projData);
      }
      setLoading(false);
    }
    
    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId, router]);

  if (loading) {
    return (
      <div className="flex-1 p-12 flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-10 max-w-[1200px] mx-auto min-h-screen bg-black">
      <div className="mb-8">
        <Link href="/dashboard" className="text-[13px] font-medium text-zinc-500 hover:text-white flex items-center transition-colors w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">{workspace?.name}</h1>
          <p className="text-[14px] text-zinc-400">Manage your decision projects within this workspace.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" asChild className="border-white/10 text-white hover:bg-white/5 h-9">
            <Link href={`/workspaces/${workspaceId}/settings`}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
          <Button asChild className="bg-white hover:bg-zinc-200 text-black font-medium px-4 h-9 border-none transition-colors rounded-md shadow-sm">
            <Link href={`/workspaces/${workspaceId}/projects/new`}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>
      </div>

      <h2 className="text-[15px] font-medium text-white mb-4">Projects</h2>
      
      {projects.length === 0 ? (
        <div className="py-16 text-center border border-white/10 rounded-lg bg-[#0a0a0a]">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/5 mb-4">
            <Briefcase className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="text-[14px] font-medium text-white mb-1">No projects found</h3>
          <p className="text-[13px] text-zinc-500 mb-6">Create your first decision project in this workspace.</p>
          <Button asChild className="bg-white hover:bg-zinc-200 text-black font-medium transition-colors">
            <Link href={`/workspaces/${workspaceId}/projects/new`}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-lg hover:border-white/20 transition-all group h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-[15px] font-medium text-white mb-2 leading-snug">{project.title}</h3>
                  <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description || "No description provided."}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                  <span className="text-[12px] font-medium text-zinc-300 capitalize">
                    {project.status}
                  </span>
                  <span className="text-[12px] text-zinc-500">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
