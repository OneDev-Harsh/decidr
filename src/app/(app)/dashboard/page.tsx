"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, Activity, Clock, FolderKanban } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await insforge.auth.getCurrentUser();
      setUser(userData?.user);

      // Fetch recent projects (user has access via workspaces)
      const { data: projectsData } = await insforge.database
        .from('projects')
        .select('*, workspaces(name)')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (projectsData) {
        setRecentProjects(projectsData);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-t-2 border-brand-crimson animate-spin mb-4"></div>
          <p className="text-gray-400">Loading your intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.profile?.name || user?.email?.split('@')[0]}</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/workspaces/new">
              <Plus className="mr-2 h-4 w-4" /> New Workspace
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-brand-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{recentProjects.length}</div>
            <p className="text-xs text-gray-500 mt-1">Across all workspaces</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">Decisions Made</CardTitle>
            <Activity className="h-4 w-4 text-brand-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-500 mt-1">Historical track record</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-brand-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-500 mt-1">Tasks requiring attention</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-white mb-4">Recent Activity</h2>
      
      {recentProjects.length === 0 ? (
        <Card className="bg-white/5 border-white/10 p-12 text-center border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon/20 mb-4">
            <FolderKanban className="h-6 w-6 text-brand-crimson" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-white">No projects</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new workspace and your first decision project.</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/workspaces/new">
                <Plus className="mr-2 h-4 w-4" /> New Workspace
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="bg-white/5 border-white/10 hover:border-brand-maroon/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-semibold text-white">{project.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {project.workspaces?.name} • Updated {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-maroon/20 text-brand-crimson border border-brand-maroon/20">
                      {project.status}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{project.priority} priority</span>
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
