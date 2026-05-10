import { NextResponse } from 'next/server';
import { generateScenarios } from '@/lib/ai/agents/scenario_agent';
import { runDebate } from '@/lib/ai/agents/debate_orchestrator';
import { generateBlindspots } from '@/lib/ai/agents/blindspot_agent';
import { generateRecommendation } from '@/lib/ai/agents/recommendation_agent';
import { detectContradictions } from '@/lib/ai/agents/contradiction_agent';
import { extractKnowledgeGraph } from '@/lib/ai/agents/knowledge_agent';
import { createClient } from '@insforge/sdk';
import type { AnalysisAction } from '@/lib/types';

const VALID_ACTIONS: AnalysisAction[] = ['scenarios', 'recommendation', 'blindspots', 'knowledge_map'];

/**
 * Attempts to parse JSON from AI output using multiple strategies.
 * AI models sometimes wrap JSON in markdown code blocks or include
 * preamble text before the JSON object.
 */
function parseAIJson(raw: string): Record<string, unknown> {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(raw);
  } catch { /* continue */ }

  // Strategy 2: Extract from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch?.[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch { /* continue */ }
  }

  // Strategy 3: Find first { ... } or [ ... ] boundary
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
    } catch { /* continue */ }
  }

  // Strategy 4: Find array boundary
  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const arr = JSON.parse(raw.substring(firstBracket, lastBracket + 1));
      return { data: arr };
    } catch { /* continue */ }
  }

  throw new Error('Unable to parse JSON from AI response');
}

/**
 * Logs activity to both decision_events and project_activity tables.
 * Non-blocking — failures are logged but don't affect the response.
 */
async function logActivity(
  insforge: ReturnType<typeof createClient>,
  projectId: string,
  action: string,
  evidenceCount: number,
  parsedResult: Record<string, unknown>
) {
  const eventTitle = `AI ${action.charAt(0).toUpperCase() + action.slice(1)} Analysis`;
  const eventDescription = `Generated new ${action} data based on ${evidenceCount} evidence source${evidenceCount !== 1 ? 's' : ''}.`;

  const promises = [
    // Log to decision_events (immutable timeline)
    insforge.database.from('decision_events').insert({
      project_id: projectId,
      event_type: action.toUpperCase(),
      title: eventTitle,
      description: eventDescription,
      metadata: parsedResult
    }),
    // Log to project_activity (dashboard feed)
    insforge.database.from('project_activity').insert({
      project_id: projectId,
      action: `ai.${action}`,
      details: eventDescription,
    })
  ];

  const results = await Promise.allSettled(promises);
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`Failed to log activity (${i === 0 ? 'decision_events' : 'project_activity'}):`, result.reason);
    }
  });
}

export async function POST(req: Request) {
  try {
    // ── Auth ────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: token || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!
    });

    // ── Input Validation ────────────────────────────────────
    let body: { project?: any; evidenceList?: any[]; action?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body — expected JSON' },
        { status: 400 }
      );
    }

    const { project, evidenceList, action } = body;

    if (!project?.id || !project?.title) {
      return NextResponse.json(
        { error: 'Missing required field: project (must include id and title)' },
        { status: 400 }
      );
    }

    if (!action || !VALID_ACTIONS.includes(action as AnalysisAction)) {
      return NextResponse.json(
        { error: `Invalid action: "${action}". Valid actions: ${VALID_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Build Evidence Context ──────────────────────────────
    const safeEvidenceList = Array.isArray(evidenceList) ? evidenceList : [];
    const evidenceText = safeEvidenceList
      .map((e: any) => `[${(e.type || 'text').toUpperCase()}] ${e.title}:\n${e.content || ''}`)
      .join('\n\n') || '';

    // ── Parallel Contradiction Detection ────────────────────
    let contradictionsPromise = Promise.resolve('{"contradictions":[]}');
    if (['scenarios', 'recommendation', 'blindspots'].includes(action)) {
      contradictionsPromise = detectContradictions(project, evidenceText, insforge);
    }

    // ── Execute Primary Analysis ────────────────────────────
    let aiContent = "";

    switch (action) {
      case 'scenarios':
        aiContent = await generateScenarios(project, evidenceText, insforge);
        break;
      case 'recommendation':
        aiContent = await runDebate(project, evidenceText, insforge);
        break;
      case 'blindspots':
        aiContent = await generateBlindspots(project, evidenceText, insforge);
        break;
      case 'knowledge_map':
        aiContent = await extractKnowledgeGraph(project, evidenceText, insforge);
        break;
    }

    // ── Parse Contradictions ────────────────────────────────
    const contradictionsRaw = await contradictionsPromise;
    let contradictions: unknown[] = [];
    try {
      const parsed = parseAIJson(contradictionsRaw);
      contradictions = (parsed.contradictions as unknown[]) || [];
      
      // Cache contradictions in DB (non-blocking)
      insforge.database
        .from('projects')
        .update({ last_contradictions: contradictions })
        .eq('id', project.id)
        .then(({ error }) => {
          if (error) console.error("Failed to cache contradictions:", error);
        });
    } catch (e) {
      console.error("Failed to parse contradictions:", e);
    }
    
    // ── Parse Primary AI Output ─────────────────────────────
    let parsedResult: Record<string, unknown>;
    try {
      parsedResult = parseAIJson(aiContent);
    } catch (e) {
      console.error("Failed to parse AI response:", aiContent?.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'AI returned an unparseable response. Please retry.',
          details: 'The AI model did not return valid JSON. This can happen with complex analyses.',
        },
        { status: 502 }
      );
    }

    // ── Log Activity (non-blocking) ─────────────────────────
    logActivity(insforge, project.id, action, safeEvidenceList.length, parsedResult).catch(
      (err) => console.error("Activity logging failed:", err)
    );

    // ── Return Response ─────────────────────────────────────
    return NextResponse.json({
      ...parsedResult,
      contradictions,
    });

  } catch (error: any) {
    console.error('AI Analysis Error:', error);

    // Differentiate between known error types
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      return NextResponse.json(
        { error: 'Analysis timed out. The AI model took too long to respond. Please retry.' },
        { status: 504 }
      );
    }

    if (error.message?.includes('rate limit') || error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before retrying.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}
