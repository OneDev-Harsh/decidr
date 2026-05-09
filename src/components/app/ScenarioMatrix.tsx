"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GitMerge, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Scenario {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  riskLevel: string;
}

export function ScenarioMatrix({ project }: { project: any }) {
  const [scenarios, setScenarios] = useState<Scenario[]>(project.last_scenarios || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateScenarios() {
    setLoading(true);
    setError(null);

    try {
      const { data: evidenceList } = await insforge.database.from('evidence').select('*').eq('project_id', project.id);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, evidenceList: evidenceList || [], action: 'scenarios' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate scenarios');
      }

      const newScenarios = data.scenarios || [];
      setScenarios(newScenarios);

      // Persist to database
      await insforge.database
        .from('projects')
        .update({ last_scenarios: newScenarios })
        .eq('id', project.id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (scenarios.length === 0 && !loading) {
    return (
      <Card className="bg-white/5 border-white/10 p-12 text-center border-dashed">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon/20 mb-4">
          <GitMerge className="h-6 w-6 text-brand-crimson" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-white">Generate Alternative Scenarios</h3>
        <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
          Let Decidr AI analyze your context and evidence to generate 3 distinct alternative paths forward.
        </p>
        <div className="mt-6">
          <Button onClick={generateScenarios} className="bg-brand-maroon hover:bg-brand-crimson text-white">
            <GitMerge className="mr-2 h-4 w-4" /> Generate Scenarios
          </Button>
        </div>
        {error && <p className="mt-4 text-sm text-brand-crimson">{error}</p>}
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-brand-crimson animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <GitMerge className="h-6 w-6 text-brand-crimson animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 font-medium animate-pulse">AI is synthesizing evidence and projecting outcomes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white">Alternative Scenarios</h3>
          <p className="text-sm text-gray-400">AI-generated paths forward based on your evidence.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateScenarios}>
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => (
          <Card key={index} className="bg-white/5 border-white/10 flex flex-col h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-white font-semibold">{scenario.title}</CardTitle>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                  scenario.riskLevel.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  scenario.riskLevel.toLowerCase() === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {scenario.riskLevel} Risk
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{scenario.description}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-emerald-500 flex items-center mb-2">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Pros
                </h4>
                <ul className="space-y-1">
                  {scenario.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start">
                      <span className="text-emerald-500 mr-2">•</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 border-t border-white/5 pt-4">
                <h4 className="text-sm font-medium text-brand-crimson flex items-center mb-2">
                  <XCircle className="mr-1 h-4 w-4" /> Cons
                </h4>
                <ul className="space-y-1">
                  {scenario.cons.map((con, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start">
                      <span className="text-brand-crimson mr-2">•</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
