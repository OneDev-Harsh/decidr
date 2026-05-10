import { insforge as defaultInsforge } from "@/lib/insforge";
import { withTrace } from "../core/tracer";

export async function detectContradictions(project: any, evidenceText: string, client?: any) {
  const insClient = client || defaultInsforge;
  const systemPrompt = `You are a strict Contradiction Detection Engine. Your ONLY job is to analyze the provided evidence and project context, and identify mutually exclusive facts, logical impossibilities, or data points that directly contradict each other. 
Return your response as a JSON object with a 'contradictions' array.`;
  
  const userPrompt = `
Project Title: ${project.title}
Problem Statement: ${project.problem_statement || 'Not provided'}

Evidence:
${evidenceText || 'No evidence provided.'}

Analyze for contradictions. For each contradiction, provide:
1. title (string) - Short summary of the conflict.
2. description (string) - Detailed explanation of why these facts conflict.
3. severity (string: "High", "Medium", "Low")
4. sources (array of strings) - Which pieces of evidence conflict.

Ensure the output is valid JSON matching this structure:
{
  "contradictions": [
    { "title": "...", "description": "...", "severity": "...", "sources": ["...", "..."] }
  ]
}

If absolutely no contradictions exist, return { "contradictions": [] }.
  `;

  const modelToUse = 'anthropic/claude-sonnet-4.5';
  
  const completion = await withTrace(
    { projectId: project.id, agentRole: 'contradiction_agent' },
    `System: ${systemPrompt}\n\nUser: ${userPrompt}`,
    modelToUse,
    () => insClient.ai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Lower temperature for analytical tasks
    }),
    insClient
  );

  return completion.choices[0].message.content;
}
