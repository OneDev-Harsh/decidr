"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Loader2, Shield } from "lucide-react";
import Link from "next/link";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      const { data, error } = await insforge.database
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
        
      if (error || !data) {
        router.push("/dashboard");
        return;
      }
      setWorkspace(data);
      setLoading(false);
    }
    loadWorkspace();
  }, [workspaceId, router]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    const { error } = await insforge.database
      .from('workspaces')
      .update({ name })
      .eq('id', workspaceId);

    if (error) {
      setMessage("Error saving: " + error.message);
    } else {
      setMessage("Workspace updated successfully!");
      setWorkspace({ ...workspace, name });
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Are you absolutely sure? This will delete all projects and evidence within this workspace. This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    const { error } = await insforge.database
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (error) {
      alert("Error deleting workspace: " + error.message);
      setDeleting(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto space-y-12 pb-24">
      <div className="space-y-6">
        <Link href={`/workspaces/${workspaceId}`} className="text-[13px] font-medium text-zinc-500 hover:text-white flex items-center transition-colors w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {workspace.name}
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Workspace Configuration</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage global environment settings and administrative controls.</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* General Details */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/[0.05]">
            <h3 className="text-[16px] font-medium text-white">General Identity</h3>
            <p className="text-[13px] text-zinc-500 mt-1">Basic identifying information for this analytical environment.</p>
          </div>
          <form onSubmit={handleSave} className="p-8 space-y-8">
            <div className="space-y-2 max-w-md">
              <label className="text-[13px] font-medium text-zinc-300">Workspace Label</label>
              <input 
                name="name" 
                defaultValue={workspace.name} 
                className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-[14px] h-10" 
                required 
              />
            </div>
            
            {message && (
              <div className={`text-[13px] font-medium p-4 rounded-lg border flex items-center gap-3 ${
                message.includes('Error') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {message}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-white/[0.05]">
              <p className="text-[11px] text-zinc-600 uppercase tracking-widest">Administrative access required</p>
              <Button type="submit" disabled={saving} className="bg-white hover:bg-zinc-200 text-black font-medium h-10 px-8 rounded-md transition-colors shadow-sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" />} Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#0a0a0a] border border-red-500/20 rounded-xl overflow-hidden">
          <div className="p-8 border-b border-white/[0.05] flex items-center gap-3">
            <Shield className="h-5 w-5 text-red-500/70" />
            <div>
              <h3 className="text-[16px] font-medium text-white">Critical Operations</h3>
              <p className="text-[13px] text-zinc-500 mt-1">Irreversible administrative actions.</p>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between p-6 bg-red-500/[0.02] rounded-lg border border-red-500/10">
              <div className="max-w-md">
                <p className="text-[14px] font-semibold text-white">Decommission Workspace</p>
                <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">
                  All projects, intelligence data, and evidence associated with this workspace will be permanently erased. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all font-medium h-10 px-8"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Terminate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
