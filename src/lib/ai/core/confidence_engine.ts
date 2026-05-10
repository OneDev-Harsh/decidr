/**
 * Decidr — Decomposable Confidence Engine
 * 
 * Breaks down a single confidence score into weighted, explainable factors.
 * Each factor is scored independently and contributes to a composite score
 * with full transparency about what drives the number up or down.
 */

import type { ConfidenceFactor } from "@/lib/types";

interface ConfidenceInput {
  evidenceCount: number;
  contradictionCount: number;
  blindspotCount: number;
  highImpactBlindspots: number;
  debateCompleted: boolean;
  scenarioCount: number;
  hasGoals: boolean;
  hasProblemStatement: boolean;
  rawAIScore?: number;
}

interface ConfidenceOutput {
  overallScore: number;
  factors: ConfidenceFactor[];
  caveats: string[];
  grade: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';
}

const WEIGHTS = {
  evidenceDensity: 0.25,
  contradictionRisk: 0.20,
  blindspotExposure: 0.15,
  debateRigor: 0.15,
  contextCompleteness: 0.10,
  scenarioCoverage: 0.10,
  aiConsensus: 0.05,
};

export function calculateConfidence(input: ConfidenceInput): ConfidenceOutput {
  const factors: ConfidenceFactor[] = [];
  const caveats: string[] = [];

  // Factor 1: Evidence Density
  const evScore = Math.min(100, input.evidenceCount * 20); // 5+ evidence = 100
  factors.push({
    name: 'Evidence Density',
    score: evScore,
    weight: WEIGHTS.evidenceDensity,
    explanation: input.evidenceCount === 0
      ? 'No evidence provided — decision is entirely speculative.'
      : input.evidenceCount < 3
        ? `Only ${input.evidenceCount} evidence source(s). Consider adding more data points.`
        : `${input.evidenceCount} evidence sources provide reasonable coverage.`,
  });
  if (input.evidenceCount === 0) caveats.push('No evidence was used to inform this recommendation.');

  // Factor 2: Contradiction Risk (inverse — fewer contradictions = higher score)
  const contrScore = input.contradictionCount === 0 ? 90 : Math.max(10, 90 - input.contradictionCount * 25);
  factors.push({
    name: 'Contradiction Risk',
    score: contrScore,
    weight: WEIGHTS.contradictionRisk,
    explanation: input.contradictionCount === 0
      ? 'No contradictions detected in the evidence base.'
      : `${input.contradictionCount} contradiction(s) detected — evidence conflicts may undermine reliability.`,
  });
  if (input.contradictionCount >= 2) caveats.push('Multiple contradictions exist in the evidence base.');

  // Factor 3: Blindspot Exposure (inverse — fewer blindspots = higher score)
  const bsScore = input.blindspotCount === 0 ? 70 : Math.max(15, 85 - input.blindspotCount * 15 - input.highImpactBlindspots * 10);
  factors.push({
    name: 'Blindspot Exposure',
    score: bsScore,
    weight: WEIGHTS.blindspotExposure,
    explanation: input.blindspotCount === 0
      ? 'Blindspot audit not yet performed — hidden risks may exist.'
      : input.highImpactBlindspots > 0
        ? `${input.highImpactBlindspots} high-impact blindspot(s) remain unresolved.`
        : `${input.blindspotCount} blindspot(s) identified, none at critical severity.`,
  });
  if (input.blindspotCount === 0) caveats.push('Blindspot audit has not been performed.');

  // Factor 4: Debate Rigor
  const debateScore = input.debateCompleted ? 85 : 30;
  factors.push({
    name: 'Debate Rigor',
    score: debateScore,
    weight: WEIGHTS.debateRigor,
    explanation: input.debateCompleted
      ? 'Multi-agent adversarial debate was conducted to pressure-test the recommendation.'
      : 'No adversarial debate was performed — recommendation has not been challenged.',
  });
  if (!input.debateCompleted) caveats.push('Recommendation was not adversarially challenged through debate.');

  // Factor 5: Context Completeness
  const contextScore = (input.hasGoals ? 50 : 0) + (input.hasProblemStatement ? 50 : 0);
  factors.push({
    name: 'Context Completeness',
    score: contextScore,
    weight: WEIGHTS.contextCompleteness,
    explanation: contextScore === 100
      ? 'Both problem statement and goals are defined, providing clear decision boundaries.'
      : contextScore === 50
        ? 'Partial context — either problem statement or goals are missing.'
        : 'No problem statement or goals defined — AI is operating without clear boundaries.',
  });

  // Factor 6: Scenario Coverage
  const scenarioScore = input.scenarioCount >= 3 ? 85 : input.scenarioCount > 0 ? 50 : 20;
  factors.push({
    name: 'Scenario Coverage',
    score: scenarioScore,
    weight: WEIGHTS.scenarioCoverage,
    explanation: input.scenarioCount >= 3
      ? 'Multiple scenarios modeled, providing good outcome visibility.'
      : input.scenarioCount > 0
        ? `Only ${input.scenarioCount} scenario(s) modeled — limited outcome visibility.`
        : 'No scenario analysis performed.',
  });

  // Factor 7: AI Consensus (from raw AI score if provided)
  const aiScore = input.rawAIScore ?? 50;
  factors.push({
    name: 'AI Model Consensus',
    score: Math.min(100, Math.max(0, aiScore)),
    weight: WEIGHTS.aiConsensus,
    explanation: `AI model self-reported confidence: ${aiScore}%.`,
  });

  // Calculate composite weighted score
  const overallScore = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  const grade: ConfidenceOutput['grade'] =
    overallScore >= 75 ? 'HIGH' :
    overallScore >= 50 ? 'MODERATE' :
    overallScore >= 25 ? 'LOW' : 'INSUFFICIENT';

  return { overallScore, factors, caveats, grade };
}
