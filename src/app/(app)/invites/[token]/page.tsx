"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Loader2, Users, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadInvite() {
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (!userData?.user) {
        router.push(`/login?redirect=/invites/${token}`);
        return;
      }
      setUser(userData.user);

      // Handle shareable links
      if (token.startsWith("ws_")) {
        const workspaceId = token.replace("ws_", "");
        const { data: wsData, error: wsError } = await insforge.database
          .from('workspaces')
          .select('id, name')
          .eq('id', workspaceId)
          .single();
        
        if (wsError) {
          setError("Workspace not found or link is invalid.");
        } else {
          setInviteData({ workspace: wsData, isPublicLink: true });
        }
      } else {
        // Handle specific tokens
        const { data: invite, error: inviteError } = await insforge.database
          .from('invites')
          .select('*, workspaces(name)')
          .eq('token', token)
          .single();

        if (inviteError || !invite) {
          setError("Invite not found or has expired.");
        } else if (invite.used_at) {
          setError("This invite has already been used.");
        } else if (new Date(invite.expires_at) < new Date()) {
          setError("This invite has expired.");
        } else {
          setInviteData(invite);
        }
      }
      setLoading(false);
    }
    loadInvite();
  }, [token, router]);

  async function handleJoin() {
    setJoining(true);
    setError(null);

    try {
      const workspaceId = inviteData.isPublicLink ? inviteData.workspace.id : inviteData.workspace_id;
      
      // Check if already a member
      const { data: existingMember } = await insforge.database
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        router.push(`/workspaces/${workspaceId}`);
        return;
      }

      // Add to workspace_members
      const { error: joinError } = await insforge.database
        .from('workspace_members')
        .insert([{
          workspace_id: workspaceId,
          user_id: user.id,
          role: inviteData.role || 'member'
        }]);

      if (joinError) throw joinError;

      // Mark invite as used if it's a specific token
      if (!inviteData.isPublicLink) {
        await insforge.database
          .from('invites')
          .update({ used_at: new Date().toISOString() })
          .eq('id', inviteData.id);
      }
      window.location.href = `/workspaces/${workspaceId}`;
    } catch (err: any) {
      setError("Failed to join workspace: " + err.message);
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
            <Users className="h-8 w-8 text-zinc-400" />
          </div>
          
          {error ? (
            <>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-white">Invalid Invitation</h1>
                <p className="text-[14px] text-zinc-500">{error}</p>
              </div>
              <Button asChild variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-white">You've been invited</h1>
                <p className="text-[14px] text-zinc-500">
                  Join <span className="text-white font-medium">{inviteData.workspaces?.name || inviteData.workspace?.name}</span> to collaborate on strategic decisions.
                </p>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left">
                <p className="text-[12px] text-zinc-500 mb-1">Signed in as</p>
                <p className="text-[14px] font-medium text-white">{user.email}</p>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleJoin} 
                  disabled={joining}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-semibold h-11 transition-all shadow-lg"
                >
                  {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Accept Invitation
                </Button>
                <p className="text-[11px] text-zinc-600">
                  By joining, you will have access to all projects and evidence within this workspace based on your assigned role.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
