"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, ChevronRight, Loader2 } from "lucide-react";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspaces() {
      const { data } = await insforge.database
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setWorkspaces(data);
      setLoading(false);
    }
    loadWorkspaces();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-brand-crimson animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Workspaces</h1>
          <p className="text-gray-400 mt-1">Manage your team environments and shared decision assets.</p>
        </div>
        <Button asChild className="bg-brand-maroon hover:bg-brand-crimson">
          <Link href="/workspaces/new">
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Link>
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card className="bg-white/5 border-white/10 p-12 text-center border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon/20 mb-4">
            <Briefcase className="h-6 w-6 text-brand-crimson" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-white">No workspaces found</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by creating your first team workspace.</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/workspaces/new">
                <Plus className="mr-2 h-4 w-4" /> Create First Workspace
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link key={ws.id} href={`/workspaces/${ws.id}`}>
              <Card className="bg-white/5 border-white/10 hover:border-brand-maroon/50 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded bg-brand-maroon flex items-center justify-center mb-2">
                      <span className="text-white font-bold">{ws.name.charAt(0)}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-brand-crimson transition-colors" />
                  </div>
                  <CardTitle className="text-xl text-white">{ws.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    Created {new Date(ws.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Shared workspace for cross-functional decision intelligence.</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
