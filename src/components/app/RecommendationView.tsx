"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, Target, AlertTriangle, ChevronRight } from "lucide-react";

interface Recommendation {
  recommendation: string;
  rationale: string;
  confidenceScore: number;
  keyRisks: string[];
}

export function RecommendationView({ project }: { project: any }) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(project.last_recommendation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateRecommendation() {
    setLoading(true);
    setError(null);

    try {
      const { data: evidenceList } = await insforge.database.from('evidence').select('*').eq('project_id', project.id);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, evidenceList: evidenceList || [], action: 'recommendation' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recommendation');
      }

      setRecommendation(data);

      // Persist to database
      await insforge.database
        .from('projects')
        .update({ last_recommendation: data })
        .eq('id', project.id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!recommendation && !loading) {
    return (
      <Card className="bg-white/5 border-white/10 p-12 text-center border-dashed">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon/20 mb-4">
          <CheckCircle className="h-6 w-6 text-brand-crimson" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-white">Synthesize Recommendation</h3>
        <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
          Let Decidr AI weigh all evidence, goals, and constraints to provide a definitive, actionable recommendation.
        </p>
        <div className="mt-6">
          <Button onClick={generateRecommendation} className="bg-brand-maroon hover:bg-brand-crimson text-white">
            <CheckCircle className="mr-2 h-4 w-4" /> Generate Recommendation
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
            <Target className="h-6 w-6 text-brand-crimson animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 font-medium animate-pulse">AI is formulating the final recommendation...</p>
      </div>
    );
  }

  if (!recommendation) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white">Final Recommendation</h3>
          <p className="text-sm text-gray-400">Synthesized intelligence output.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateRecommendation}>
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-brand-maroon/10 border-brand-maroon/30 shadow-lg shadow-brand-maroon/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-crimson"></div>
            <CardContent className="p-8">
              <h4 className="text-sm font-semibold text-brand-crimson uppercase tracking-wider mb-2 flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" /> Decidr Verdict
              </h4>
              <p className="text-2xl font-bold text-white leading-tight mb-6">
                {recommendation.recommendation}
              </p>
              
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-gray-300">Strategic Rationale</h5>
                <p className="text-gray-400 leading-relaxed">
                  {recommendation.rationale}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Target className="mr-2 h-4 w-4" /> Confidence Score
              </h4>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-bold text-white">{recommendation.confidenceScore}</span>
                <span className="text-xl text-gray-500 mb-1">/100</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${recommendation.confidenceScore >= 80 ? 'bg-emerald-500' : recommendation.confidenceScore >= 50 ? 'bg-yellow-500' : 'bg-brand-crimson'}`}
                  style={{ width: `${recommendation.confidenceScore}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" /> Key Risks
              </h4>
              <ul className="space-y-3">
                {recommendation.keyRisks.map((risk, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start">
                    <ChevronRight className="h-4 w-4 text-brand-crimson shrink-0 mr-1 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
