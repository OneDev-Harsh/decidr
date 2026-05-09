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
        <Loader2 className="h-12 w-12 text-brand-crimson animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/workspaces/${workspaceId}`} className="text-sm font-medium text-gray-400 hover:text-white flex items-center transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workspace
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Workspace Settings</h1>
        <p className="text-gray-400 mt-1">Configure your environment for {workspace.name}.</p>
      </div>

      <div className="grid gap-8">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">General Details</CardTitle>
            <CardDescription className="text-gray-400">Manage the basic identifying information for this workspace.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-300">Workspace Name</label>
                <Input name="name" defaultValue={workspace.name} className="max-w-md" required />
              </div>
              {message && (
                <div className={`text-sm font-medium p-3 rounded-md border ${
                  message.includes('Error') ? 'bg-brand-crimson/10 text-brand-crimson border-brand-crimson/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-6">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-white/5 border-white/10 border-brand-crimson/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-crimson" />
              <CardTitle className="text-white text-lg">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Irreversible actions for this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-brand-crimson/5 rounded-lg border border-brand-crimson/10">
              <div>
                <p className="text-sm font-semibold text-white">Delete Workspace</p>
                <p className="text-xs text-gray-400 mt-1">All data associated with this workspace will be permanently removed.</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-brand-crimson hover:bg-red-700"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
