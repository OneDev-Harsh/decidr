"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;

    const { data: projectData, error: projectError } = await insforge.database
      .from('projects')
      .insert({ 
        workspace_id: workspaceId,
        title,
        description,
        priority,
        status: 'active'
      })
      .select()
      .single();

    if (projectError || !projectData) {
      setError(projectError?.message || "Failed to create project");
      setLoading(false);
      return;
    }

    router.push(`/projects/${projectData.id}`);
  }

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/workspaces/${workspaceId}`} className="text-sm font-medium text-gray-400 hover:text-white flex items-center transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workspace
        </Link>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl text-white">New Decision Project</CardTitle>
          <CardDescription className="text-gray-400">
            Define the problem you need to solve or the decision you need to make.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-300">
                Project Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Q4 Marketing Strategy Allocation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-300">
                Brief Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-maroon disabled:cursor-not-allowed disabled:opacity-50 text-white resize-y"
                placeholder="What is the core objective of this decision?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium text-gray-300">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="flex h-9 w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-maroon text-white"
                defaultValue="medium"
              >
                <option value="low">Low - Exploratory</option>
                <option value="medium">Medium - Important</option>
                <option value="high">High - Critical</option>
              </select>
            </div>

            {error && (
              <div className="text-sm text-brand-crimson font-medium bg-brand-crimson/10 p-3 rounded-md border border-brand-crimson/20">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t border-white/5 pt-6 mt-6">
            <Button variant="ghost" type="button" asChild>
              <Link href={`/workspaces/${workspaceId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
