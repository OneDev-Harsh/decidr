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
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);

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
        .select('*, projects(title), profiles(full_name, avatar_url, username)')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (activityData) {
        setActivities(activityData);
      }

      setLoading(false);
    }
    loadDashboard();
  }, []);

  const displayedActivities = showAllActivities ? activities : activities.slice(0, 3);

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
          { label: 'Team Activity', value: activities.length, icon: Activity },
          { label: 'Active Collaborators', value: new Set(activities.map(a => a.user_id)).size, icon: BarChart3 },
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

          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden">
            {activities.length === 0 ? (
              <p className="text-zinc-500 text-[13px] text-center py-12">Awaiting system events...</p>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {activities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="p-3.5 hover:bg-white/[0.02] transition-colors group cursor-default">
                    <div className="flex flex-col gap-1">
                      <p className="text-[13px] text-zinc-300 leading-snug">
                        <span className="text-brand-crimson/80 font-medium capitalize">
                          {activity.action.split('.').pop()?.replace('_', ' ')}
                        </span>
                        <span className="text-zinc-500 mx-1.5">by</span>
                        <span className="text-zinc-400 font-medium">
                          @{activity.profiles?.username || activity.profiles?.full_name?.split(' ')[0]?.toLowerCase() || "system"}
                        </span>
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-600 truncate mr-4">
                          {activity.projects?.title || "Global Protocol"}
                        </span>
                        <span className="text-[10px] text-zinc-700 font-mono shrink-0">
                          {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length > 3 && (
                  <button 
                    onClick={() => setShowAllActivities(true)}
                    className="w-full py-3 text-[11px] font-semibold text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all uppercase tracking-widest border-t border-white/[0.05]"
                  >
                    View Strategic History
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Activity Modal */}
      <AnimatePresence>
        {showAllActivities && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllActivities(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[101] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">System Audit Log</h2>
                  <p className="text-[13px] text-zinc-500">Comprehensive history of all decision vector modifications.</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllActivities(false)}
                  className="text-zinc-500 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 group">
                    <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {activity.profiles?.avatar_url ? (
                        <img src={activity.profiles.avatar_url} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {(activity.profiles?.full_name || activity.profiles?.username || "S").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] text-white font-medium uppercase tracking-wider text-brand-crimson/90">
                            {activity.action.split('.').pop()?.replace('_', ' ')}
                          </p>
                          <span className="text-[12px] text-zinc-500 font-medium">
                            @{activity.profiles?.username || activity.profiles?.full_name?.split(' ')[0]?.toLowerCase() || "system"}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-600 font-mono">
                          {new Date(activity.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-[13px] text-zinc-400 mb-2">
                        {activity.details}
                      </p>
                      {activity.projects?.title && (
                        <Link 
                          href={`/projects/${activity.project_id}`}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Activity className="h-3 w-3" />
                          {activity.projects.title}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/10 bg-black/20 text-center">
                <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-medium">End of Audit Trail</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
