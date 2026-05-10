"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewWorkspacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    const { data: userData } = await insforge.auth.getCurrentUser();
    if (!userData?.user) {
      router.push("/login");
      return;
    }

    // Ensure profile exists (fix for foreign key constraint)
    await insforge.database.from('profiles').upsert([{
      id: userData.user.id,
      full_name: userData.user.profile?.name || userData.user.email?.split('@')[0] || 'Unknown',
      email: userData.user.email
    }]);

    // Insert workspace (owner_id is set by DB or we pass it explicitly)
    const { data: wsData, error: wsError } = await insforge.database
      .from('workspaces')
      .insert({ name, owner_id: userData.user.id })
      .select()
      .single();

    if (wsError || !wsData) {
      setError(wsError?.message || "Failed to create workspace");
      setLoading(false);
      return;
    }

    // Insert workspace member (owner)
    const { error: memberError } = await insforge.database
      .from('workspace_members')
      .insert({
        workspace_id: wsData.id,
        user_id: userData.user.id,
        role: 'owner'
      });

    if (memberError) {
      // Handle partial failure gracefully in a real app, but for MVP:
      setError(memberError.message);
      setLoading(false);
      return;
    }

    // Refresh the router to update the sidebar, then redirect
    router.refresh();
    router.push(`/workspaces/${wsData.id}`);
  }

  return (
    <div className="flex-1 px-8 py-12 max-w-2xl mx-auto min-h-screen bg-black">
      <div className="mb-8">
        <Link href="/dashboard" className="text-[13px] font-medium text-zinc-500 hover:text-white flex items-center transition-colors w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Create a Workspace</h1>
        <p className="text-[14px] text-zinc-400 mb-8">
          A workspace is a shared environment for your team's decision projects.
        </p>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[13px] font-medium text-zinc-300">
                  Workspace Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Acme Corp Strategy"
                  required
                  className="bg-black border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/20 h-10 w-full"
                />
              </div>
              
              {error && (
                <div className="text-[13px] text-red-400 bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
                  {error}
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-white hover:bg-zinc-200 text-black font-medium transition-colors h-10 w-full sm:w-auto px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" /> Creating...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
