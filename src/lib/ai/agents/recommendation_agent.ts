import { insforge as defaultInsforge } from "@/lib/insforge";
import { withTrace } from "../core/tracer";

export async function generateRecommendation(project: any, evidenceText: string, client?: any) {
  const insClient = client || defaultInsforge;
  const systemPrompt = `You are a decisive executive advisor. Based on the project context and the available evidence, provide a definitive, single recommendation. Return your response as a JSON object.`;
  
  const userPrompt = `
Project Title: ${project.title}
Project Description/Context: ${project.description || 'Not provided'}
Project Priority: ${project.priority}

Evidence:
${evidenceText || 'No evidence provided.'}

Provide a final recommendation. Give:
1. recommendation (string) - The clear action to take.
2. rationale (string) - Why this is the best path.
3. confidenceScore (number between 0 and 100)
4. keyRisks (array of strings) - The main risks of this decision.

Ensure the output is valid JSON matching this structure:
{
  "recommendation": "...",
  "rationale": "...",
  "confidenceScore": 85,
  "keyRisks": ["..."]
}
  `;

  const modelToUse = 'anthropic/claude-sonnet-4.5';
  
  const completion = await withTrace(
    { projectId: project.id, agentRole: 'recommendation_agent' },
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

