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
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white flex items-center transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Create a Workspace</CardTitle>
          <CardDescription className="text-gray-400">
            A workspace is a shared environment for your team's decision projects.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">
                Workspace Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Acme Corp Strategy"
                required
                className="max-w-md"
              />
            </div>
            {error && (
              <div className="text-sm text-brand-crimson font-medium bg-brand-crimson/10 p-3 rounded-md border border-brand-crimson/20">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t border-white/5 pt-6 mt-6">
            <Button variant="ghost" type="button" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Workspace
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
