import { insforge as defaultInsforge } from "@/lib/insforge";
import { withTrace } from "../core/tracer";

export async function bulkExtractProjectDetails(project: any, bulkText: string, client?: any) {
  const insClient = client || defaultInsforge;
  const systemPrompt = `You are a Project Strategy Analyst. Your task is to extract structured project details from a messy, bulk text input.
Identify the project title, a concise description, the core problem statement (the key question to answer), and specific goals or constraints.

Return your response as a JSON object:
{
  "title": "Short descriptive title",
  "description": "One-sentence overview",
  "problem_statement": "The core dilemma or question",
  "goals": "Bullet points of objectives and constraints",
  "status": "ACTIVE",
  "priority": "medium"
}

Ensure the output is valid JSON. If a field is not found, provide a reasonable inference based on the context.`;

  const userPrompt = `
Bulk Text Input:
"""
${bulkText}
"""

Extract the project details.
`;

  const modelToUse = 'openai/gpt-4o-mini';

  const completion = await withTrace(
    { projectId: project.id, agentRole: 'onboarding_agent' },
    `System: ${systemPrompt}\n\nUser: ${userPrompt}`,
    modelToUse,
    () => insClient.ai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    }),
    insClient
  );

  return completion.choices[0].message.content;
}
