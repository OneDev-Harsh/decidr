import { insforge as defaultInsforge } from "@/lib/insforge";
import { withTrace } from "../core/tracer";

export async function generateBlindspots(project: any, evidenceText: string, client?: any) {
  const insClient = client || defaultInsforge;
  const systemPrompt = `You are a Critical Thinking Agent and Cognitive Bias Expert. Your job is to find what is MISSING or BIASED in this decision project. Identify 3-5 blindspots, hidden risks, or missing evidence types. Be specific, actionable, and rigorous. Format your response as a JSON object with a 'blindspots' array.`;
  
  const userPrompt = `
Project Title: ${project.title}
Project Description/Context: ${project.description || 'Not provided'}
Problem Statement: ${project.problem_statement || 'Not provided'}
Goals: ${project.goals || 'Not provided'}

Evidence:
${evidenceText || 'No evidence provided.'}

Analyze for blindspots, biases, and evidence gaps. Check specifically for:
- Confirmation bias (only seeking supporting evidence)
- Anchoring bias (over-relying on first data point)
- Survivorship bias (ignoring failures)
- Sunk cost fallacy
- Missing stakeholder perspectives
- Hidden dependencies
- Strategic overconfidence
- Unvalidated assumptions

For each blindspot found, provide:
1. area (string) - The domain of the blindspot (e.g., "Market Analysis", "Risk Assessment", "Stakeholder Input")
2. finding (string) - A clear, specific description of what's missing or biased
3. impact ("High", "Medium", or "Low") - How much this could affect the decision outcome
4. biasType (string) - The type of cognitive bias or gap (e.g., "Confirmation Bias", "Data Gap", "Missing Stakeholder")
5. mitigation (string) - Specific action to address this blindspot
6. evidenceNeeded (string) - What data or research would resolve this gap

Ensure the output is valid JSON matching this structure:
{
  "blindspots": [
    { "area": "...", "finding": "...", "impact": "High", "biasType": "...", "mitigation": "...", "evidenceNeeded": "..." }
  ]
}
  `;

  const modelToUse = 'anthropic/claude-sonnet-4.5';
  
  const completion = await withTrace(
    { projectId: project.id, agentRole: 'blindspot_agent' },
    `System: ${systemPrompt}\n\nUser: ${userPrompt}`,
    modelToUse,
    () => insClient.ai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    }),
    insClient
  );

  return completion.choices[0].message.content;
}
