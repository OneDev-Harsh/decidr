"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  ChevronRight,
  Clock,
  ArrowUpRight
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await insforge.auth.getCurrentUser();
      
      if (userData?.user) {
        const { data: profileData } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        
        setUser({ ...userData.user, profile: profileData });
      }

      const { data: projectsData } = await insforge.database
        .from('projects')
        .select('*, workspaces(name)')
        .order('updated_at', { ascending: false })
        .limit(8);

      if (projectsData) {
        setRecentProjects(projectsData);
      }

      const { data: activityData } = await insforge.database
        .from('project_activity')
        .select('*, projects(title)')
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (activityData) {
        setActivities(activityData);
      }

      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-12 flex items-center justify-center min-h-screen bg-black">
        <div className="h-4 w-4 bg-brand-crimson animate-ping rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-12 max-w-[1400px] mx-auto bg-black min-h-screen">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-crimson" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Operational Dashboard</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Hello, {user?.profile?.full_name || user?.email?.split('@')[0]}
          </h1>
        </div>
        <Button asChild className="bg-white hover:bg-gray-200 text-black font-bold px-6 h-11 border-none transition-all">
          <Link href="/workspaces/new">
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Link>
        </Button>
      </header>

      {/* Primary Content Grid */}
      <div className="grid gap-16 lg:grid-cols-12">
        
        {/* Left Column: Projects */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Streams</h2>
            <Link href="/workspaces" className="text-xs font-medium text-gray-500 hover:text-white transition-colors">
              Manage All
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="py-20 text-center border border-white/5 rounded-lg bg-[#050505]">
              <p className="text-gray-500 text-sm">No active decision streams detected.</p>
              <Button asChild variant="link" className="text-brand-crimson mt-2">
                <Link href="/workspaces/new">Initialize System</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
              {recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="bg-black p-6 hover:bg-[#080808] transition-all group h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{project.workspaces?.name}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-gray-700 group-hover:text-brand-crimson transition-colors" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2 group-hover:text-white transition-colors">{project.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {project.description || "Synthesizing project intelligence..."}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          project.priority === 'high' ? 'bg-brand-crimson' : 
                          project.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-700'
                        }`} />
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{project.priority}</span>
                      </div>
                      <span className="text-[10px] text-gray-700 font-medium">{new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Log</h2>
            <div className="h-2 w-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-6">
            {activities.length === 0 ? (
              <p className="text-gray-600 text-xs italic">Awaiting system events...</p>
            ) : (
              <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative pl-8 group">
                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-black border border-white/10 group-hover:border-brand-crimson/50 transition-colors" />
                    <div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        <span className="text-gray-200 font-semibold lowercase">system.{activity.action}</span>
                        {activity.projects?.title && (
                          <span className="text-gray-600"> @ {activity.projects.title}</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-700 mt-1 uppercase tracking-wider font-medium">
                        {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
