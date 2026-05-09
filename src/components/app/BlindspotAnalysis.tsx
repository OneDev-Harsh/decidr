"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, EyeOff, ShieldAlert, Lightbulb, RefreshCw } from "lucide-react";

interface Blindspot {
  title: string;
  description: string;
  type: string;
  mitigation: string;
}

export function BlindspotAnalysis({ project }: { project: any }) {
  const [blindspots, setBlindspots] = useState<Blindspot[]>(project.last_blindspots || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const { data: evidenceList } = await insforge.database.from('evidence').select('*').eq('project_id', project.id);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, evidenceList: evidenceList || [], action: 'blindspots' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze blindspots');
      }

      const newBlindspots = data.blindspots || [];
      setBlindspots(newBlindspots);

      // Persist to database
      await insforge.database
        .from('projects')
        .update({ last_blindspots: newBlindspots })
        .eq('id', project.id);

      // Log activity
      const { data: userData } = await insforge.auth.getCurrentUser();
      await insforge.database
        .from('project_activity')
        .insert({
          project_id: project.id,
          user_id: userData.user?.id,
          action: 'blindspot_audit',
          details: { count: newBlindspots.length }
        });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (blindspots.length === 0 && !loading) {
    return (
      <Card className="bg-white/5 border-white/10 p-12 text-center border-dashed">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 mb-4">
          <EyeOff className="h-6 w-6 text-amber-500" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-white">Identify Hidden Blindspots</h3>
        <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
          Decidr AI will audit your evidence and goals to find missing data gaps, strategic risks, or potential cognitive biases.
        </p>
        <div className="mt-6">
          <Button onClick={generateAnalysis} className="bg-amber-600 hover:bg-amber-700 text-white border-none">
            <RefreshCw className="mr-2 h-4 w-4" /> Run Blindspot Audit
          </Button>
        </div>
        {error && <p className="mt-4 text-sm text-brand-crimson">{error}</p>}
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
        </div>
        <div>
          <p className="text-white font-medium">Auditing Decision Intelligence...</p>
          <p className="text-gray-500 text-sm mt-1 max-w-xs">Checking for cognitive biases, data gaps, and hidden externalities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-amber-500" /> Blindspot Audit
          </h3>
          <p className="text-sm text-gray-400">Critical analysis of risks and missing variables.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateAnalysis} className="border-white/10 hover:bg-white/5 text-gray-300">
          <RefreshCw className="mr-2 h-4 w-4" /> Re-audit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blindspots.map((item, index) => (
          <Card key={index} className="bg-white/5 border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert className="h-12 w-12 text-amber-500" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {item.type}
                </span>
              </div>
              <CardTitle className="text-white text-lg">{item.title}</CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2 flex items-center">
                  <Lightbulb className="mr-1.5 h-3.5 w-3.5" /> Mitigation Strategy
                </h4>
                <p className="text-sm text-gray-300 italic leading-relaxed">
                  "{item.mitigation}"
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
