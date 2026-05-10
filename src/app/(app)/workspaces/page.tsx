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
      <div className="flex-1 p-12 flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-10 max-w-[1200px] mx-auto min-h-screen bg-black">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Workspaces</h1>
          <p className="text-[14px] text-zinc-400">Manage your team environments and shared decision assets.</p>
        </div>
        <Button asChild className="bg-white hover:bg-zinc-200 text-black font-medium px-4 h-9 border-none transition-colors rounded-md shadow-sm">
          <Link href="/workspaces/new">
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Link>
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="py-16 text-center border border-white/10 rounded-lg bg-[#0a0a0a]">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/5 mb-4">
            <Briefcase className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="text-[14px] font-medium text-white mb-1">No workspaces found</h3>
          <p className="text-[13px] text-zinc-500 mb-6">Get started by creating your first team workspace.</p>
          <Button asChild className="bg-white hover:bg-zinc-200 text-black font-medium transition-colors">
            <Link href="/workspaces/new">
              <Plus className="mr-2 h-4 w-4" /> Create Workspace
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link key={ws.id} href={`/workspaces/${ws.id}`}>
              <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-lg hover:border-white/20 transition-all group h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-8 rounded border border-white/10 flex items-center justify-center bg-white/5">
                      <span className="text-white font-medium text-[13px]">{ws.name.charAt(0)}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-[15px] font-medium text-white mb-1">{ws.name}</h3>
                  <p className="text-[13px] text-zinc-400 mb-4 line-clamp-2">Shared workspace for cross-functional decision intelligence.</p>
                </div>
                <div className="pt-4 border-t border-white/[0.05]">
                  <p className="text-[12px] text-zinc-500">
                    Created {new Date(ws.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
