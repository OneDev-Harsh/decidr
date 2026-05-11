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
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Zap,
  BarChart3,
  Loader2
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
        .limit(6);

      if (projectsData) {
        setRecentProjects(projectsData);
      }

      const { data: activityData } = await insforge.database
        .from('project_activity')
        .select('*, projects(title)')
        .order('created_at', { ascending: false })
        .limit(10);
      
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
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-10 max-w-[1200px] mx-auto bg-black min-h-screen">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
            Dashboard
          </h1>
          <p className="text-[14px] text-zinc-400">
            Welcome back, {user?.profile?.full_name || user?.email?.split('@')[0]}
          </p>
        </div>
        <Button asChild className="bg-white hover:bg-zinc-200 text-black font-medium px-4 h-9 border-none transition-colors rounded-md shadow-sm">
          <Link href="/workspaces/new">
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Link>
        </Button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Decision Streams', value: recentProjects.length, icon: Zap },
          { label: 'Critical Priority', value: recentProjects.filter(p => p.priority === 'high').length, icon: ShieldCheck },
          { label: 'System Events (24h)', value: activities.length, icon: Activity },
          { label: 'System Health', value: 'Nominal', icon: BarChart3 },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-zinc-400">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Primary Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-[15px] font-medium text-white">Active Streams</h2>
            <Link href="/workspaces" className="text-[13px] text-zinc-400 hover:text-white transition-colors">
              View all
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="py-16 text-center border border-white/10 rounded-lg bg-[#0a0a0a]">
              <p className="text-zinc-500 text-[14px]">No active decision streams detected.</p>
              <Link href="/workspaces/new" className="text-[14px] font-medium text-brand-crimson hover:text-brand-crimson/80 transition-colors mt-2 inline-block">
                Initialize System
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-lg hover:border-white/20 transition-all group h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-medium text-zinc-500">{project.workspaces?.name}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-[15px] font-medium text-white mb-2 leading-snug">{project.title}</h3>
                      <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {project.description || "Synthesizing project intelligence..."}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          project.priority === 'high' ? 'bg-brand-crimson' : 
                          project.priority === 'medium' ? 'bg-amber-500' : 'bg-zinc-600'
                        }`} />
                        <span className="text-[12px] font-medium text-zinc-300 capitalize">{project.priority}</span>
                      </div>
                      <span className="text-[12px] text-zinc-500">{new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-[15px] font-medium text-white">Activity Log</h2>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-5">
            {activities.length === 0 ? (
              <p className="text-zinc-500 text-[13px] text-center py-4">Awaiting system events...</p>
            ) : (
              <div className="space-y-6 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative pl-6 group">
                    <div className="absolute left-[3px] top-[7px] h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-brand-crimson transition-colors" />
                    <div>
                      <p className="text-[13px] text-zinc-300 leading-relaxed">
                        <span className="text-zinc-500 font-mono text-[11px] mr-2">system.{activity.action}</span>
                        {activity.details || "Processing systemic event..."}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {activity.projects?.title && (
                          <span className="text-[11px] text-zinc-500">@ {activity.projects.title}</span>
                        )}
                        <span className="text-[11px] text-zinc-600 font-mono">
                          {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
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
