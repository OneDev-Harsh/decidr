"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, Settings, ArrowLeft } from "lucide-react";

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
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-t-2 border-brand-crimson animate-spin mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white flex items-center transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{workspace?.name}</h1>
          <p className="text-gray-400 mt-1">Manage your decision projects within this workspace.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/workspaces/${workspaceId}/settings`}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/workspaces/${workspaceId}/projects/new`}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-white mb-4">Projects</h2>
      
      {projects.length === 0 ? (
        <Card className="bg-white/5 border-white/10 p-12 text-center border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon/20 mb-4">
            <Briefcase className="h-6 w-6 text-brand-crimson" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-white">No projects found</h3>
          <p className="mt-1 text-sm text-gray-400">Create your first decision project in this workspace.</p>
          <div className="mt-6">
            <Button asChild>
              <Link href={`/workspaces/${workspaceId}/projects/new`}>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="bg-white/5 border-white/10 hover:border-brand-maroon/50 transition-colors cursor-pointer h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                    {project.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-maroon/20 text-brand-crimson border border-brand-maroon/20">
                      {project.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
