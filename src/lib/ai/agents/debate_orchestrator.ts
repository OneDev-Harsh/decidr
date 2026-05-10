import { insforge as defaultInsforge } from "@/lib/insforge";
import { withTrace } from "../core/tracer";

export async function runDebate(project: any, evidenceText: string, client?: any) {
  const insClient = client || defaultInsforge;
  const modelToUse = 'anthropic/claude-sonnet-4.5';
  
  // Create Debate Session in DB
  const { data: session } = await insClient.database
    .from('debate_sessions')
    .insert({
      project_id: project.id,
      topic: `Strategic Path for: ${project.title}`
    })
    .select()
    .single();

  const sessionId = session?.id;

  async function logMessage(role: string, content: string) {
    if (sessionId) {
      await insClient.database.from('debate_messages').insert({
        session_id: sessionId,
        agent_role: role,
        content: content
      });
    }
  }

  // ── ROUND 1: Strategist Proposes ──────────────────────────
  const strategistSystem = `You are the Lead Strategist, an expert in competitive strategy and market positioning. Based on the evidence, propose a strong, confident strategic direction for this project. Be specific about implementation steps. Keep it under 250 words.`;
  const userPrompt = `Project: ${project.title}\nContext: ${project.description || 'Not provided'}\nProblem: ${project.problem_statement || 'Not provided'}\nGoals: ${project.goals || 'Not provided'}\n\nEvidence:\n${evidenceText}\n\nPropose a clear strategic direction.`;
  
  const strategistRes = await withTrace(
    { projectId: project.id, agentRole: 'strategist' },
    `System: ${strategistSystem}\nUser: ${userPrompt}`,
    modelToUse,
    () => insClient.ai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: strategistSystem },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
    }),
    insClient
  );
  const strategistProposal = strategistRes.choices[0].message.content;
  await logMessage('strategist', strategistProposal);

  // ── ROUND 2: Skeptic Critiques ────────────────────────────
  const skepticSystem = `You are the Chief Risk Officer and Devil's Advocate. Your job is to find every weakness in the Strategist's proposal. Challenge assumptions, identify risks, expose logical gaps, and question feasibility. Be harsh but fair. Keep it under 250 words.`;
  const skepticPrompt = `Evidence:\n${evidenceText}\n\nStrategist Proposal:\n${strategistProposal}\n\nCritique this proposal. What could go wrong? What assumptions are unvalidated?`;
  
  const skepticRes = await withTrace(
    { projectId: project.id, agentRole: 'skeptic' },
    `System: ${skepticSystem}\nUser: ${skepticPrompt}`,
    modelToUse,
    () => insClient.ai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: skepticSystem },
        { role: 'user', content: skepticPrompt }
      ],
      temperature: 0.7,
    }),
    insClient
  );
  const skepticCritique = skepticRes.choices[0].message.content;
  await logMessage('skeptic', skepticCritique);

  // ── ROUND 3: Strategist Rebuttal ──────────────────────────
  const rebuttalSystem = `You are the Lead Strategist again. The Skeptic has raised valid concerns. Address each criticism directly — concede where fair, defend where warranted, and strengthen your proposal. Keep it under 200 words.`;
  const rebuttalPrompt = `Your original proposal:\n${strategistProposal}\n\nSkeptic's critique:\n${skepticCritique}\n\nProvide your rebuttal.`;

  const rebuttalRes = await withTrace(
    { projectId: project.id, agentRole: 'strategist' },
    `System: ${rebuttalSystem}\nUser: ${rebuttalPrompt}`,
    modelToUse,
    () => insClient.ai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: rebuttalSystem },
        { role: 'user', content: rebuttalPrompt }
      ],
      temperature: 0.5,
    }),
    insClient
  );
  const rebuttal = rebuttalRes.choices[0].message.content;
  await logMessage('strategist', rebuttal);

  // ── ROUND 4: Moderator Synthesizes (JSON Output) ──────────
  const moderatorSystem = `You are the Executive Moderator. You have reviewed the full adversarial debate between the Strategist and Skeptic, including the rebuttal. Synthesize a final, balanced recommendation that incorporates the strongest arguments from both sides. Return a JSON object.`;
  const moderatorPrompt = `
Evidence:
${evidenceText}

=== DEBATE TRANSCRIPT ===

[STRATEGIST — PROPOSAL]
${strategistProposal}

[SKEPTIC — CRITIQUE]
${skepticCritique}

[STRATEGIST — REBUTTAL]
${rebuttal}

=== END TRANSCRIPT ===

Synthesize this debate into a final recommendation. Weight the evidence carefully.
Return valid JSON matching this structure:
{
  "recommendation": "Clear, decisive action statement",
  "rationale": "Why this is the best path, acknowledging the debate",
  "confidenceScore": 0-100,
  "keyRisks": ["Risk 1", "Risk 2", "Risk 3"],
  "debateSummary": "Brief narrative of how the debate shaped the conclusion",
  "assumptions": ["Key assumption 1", "Key assumption 2"]
}
  `;

  const moderatorRes = await withTrace(
    { projectId: project.id, agentRole: 'moderator' },
    `System: ${moderatorSystem}\nUser: ${moderatorPrompt}`,
    modelToUse,
    () => insClient.ai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: moderatorSystem },
        { role: 'user', content: moderatorPrompt }
      ],
      temperature: 0.4,
    }),
    insClient
  );
  
  const synthesisContent = moderatorRes.choices[0].message.content;
  await logMessage('moderator', synthesisContent);

  // Update session
  if (sessionId) {
    await insClient.database.from('debate_sessions').update({
      status: 'completed',
      synthesis: synthesisContent
    }).eq('id', sessionId);
  }

  return synthesisContent;
}
