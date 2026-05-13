"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, Settings, ArrowLeft, Loader2, Trash2, Users, UserPlus } from "lucide-react";
import { InviteModal } from "@/components/app/InviteModal";
import { CollaborationAvatars } from "@/components/app/CollaborationAvatars";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      // 1. Wait for auth to be ready (prevents race condition on reload)
      await insforge.auth.getCurrentUser();

      // Fetch Workspace Details
      const { data: wsData, error: wsError } = await insforge.database
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
        
      if (wsError || !wsData) {
        console.error("Workspace load error:", wsError);
        // Only redirect if it's clearly a "Not Found" or "Unauthorized" after auth is ready
        if (!wsData || wsError?.status === 404 || wsError?.code === 'PGRST116') {
          router.push("/dashboard");
        }
        setLoading(false);
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

      // Fetch Workspace Members
      const { data: membersData } = await insforge.database
        .from('workspace_members')
        .select(`
          id,
          role,
          profiles (
            id,
            full_name,
            avatar_url,
            email,
            username
          )
        `)
        .eq('workspace_id', workspaceId);

      if (membersData) {
        setMembers(membersData);
        
        // Find current user's role
        const { data: userData } = await insforge.auth.getCurrentUser();
        const me = membersData.find(m => m.profiles?.id === userData?.user?.id);
        if (me) {
          setCurrentUserRole(me.role);
        } else if (wsData.owner_id === userData?.user?.id) {
          setCurrentUserRole('owner');
        }
      }

      setLoading(false);
    }
    
    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId, router]);

  async function handleDeleteProject(e: React.MouseEvent, id: string, title: string) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete project "${title}"? This action cannot be undone.`)) return;

    const { error } = await insforge.database
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Failed to delete project: " + error.message);
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  }

  async function handleRemoveMember(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) return;

    const { error } = await insforge.database
      .from('workspace_members')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Failed to remove member: " + error.message);
    } else {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  }

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
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{workspace?.name}</h1>
            <CollaborationAvatars channel={`presence:workspace:${workspaceId}`} />
          </div>
          <p className="text-[14px] text-zinc-400">Manage your decision projects within this workspace.</p>
        </div>
        <div className="flex gap-3">
          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsInviteModalOpen(true)}
                className="border-white/10 text-white hover:bg-white/5 h-9"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Invite
              </Button>
              <Button variant="outline" size="sm" asChild className="border-white/10 text-white hover:bg-white/5 h-9">
                <Link href={`/workspaces/${workspaceId}/settings`}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Link>
              </Button>
            </>
          )}
          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
            <Button asChild className="bg-white hover:bg-zinc-200 text-black font-medium px-4 h-9 border-none transition-colors rounded-md shadow-sm">
              <Link href={`/workspaces/${workspaceId}/projects/new`}>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
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
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-lg hover:border-white/20 transition-all group h-full flex flex-col justify-between relative">
                    {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id, project.title)}
                        className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-400/10 z-10"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <div>
                      <h3 className="text-[15px] font-medium text-white mb-2 leading-snug pr-8">{project.title}</h3>
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

        <div className="space-y-6">
          <div>
            <h2 className="text-[15px] font-medium text-white mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              Collaborators
            </h2>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white text-[11px] font-medium shrink-0">
                      {member.profiles?.avatar_url ? (
                        <img src={member.profiles.avatar_url} alt={member.profiles.full_name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        member.profiles?.full_name?.charAt(0) || member.profiles?.username?.charAt(0) || "U"
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-[13px] font-medium text-zinc-200 truncate">{member.profiles?.full_name || member.profiles?.username || member.profiles?.email}</p>
                      <p className="text-[11px] text-zinc-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {(currentUserRole === 'owner' || currentUserRole === 'admin') && member.profiles?.id !== workspace.owner_id && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.profiles?.full_name || member.profiles?.email)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-400/10"
                      title="Remove Member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-full justify-start text-zinc-500 hover:text-white hover:bg-white/5 h-8 px-2 gap-2 text-[12px]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Invite Collaborator
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        workspaceId={workspaceId}
        workspaceName={workspace?.name}
      />
    </div>
  );
}
