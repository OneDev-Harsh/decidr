import { insforge as defaultInsforge } from "@/lib/insforge";
import { withTrace } from "../core/tracer";

export async function generateScenarios(project: any, evidenceText: string, client?: any) {
  const insClient = client || defaultInsforge;
  const systemPrompt = `You are an expert strategic advisor and decision-intelligence AI. Your task is to analyze the user's project and evidence, and generate exactly 3 explicitly modeled scenarios: 'Base Case', 'Best Case', and 'Worst Case'. Return your response as a JSON object with a 'scenarios' array.`;
  
  const userPrompt = `
Project Title: ${project.title}
Project Description/Context: ${project.description || 'Not provided'}
Project Priority: ${project.priority}

Evidence:
${evidenceText || 'No evidence provided.'}

Generate 3 modeled scenarios:
1. Base Case (Most likely outcome)
2. Best Case (Aggressive upside)
3. Worst Case (Risk realized)

For each scenario, provide:
1. type (string: "Base Case", "Best Case", "Worst Case")
2. title (string)
3. description (string)
4. sensitivityVariable (string) - The single biggest variable that drives this outcome.
5. probability (number: 0-100) - Estimated probability of this scenario manifesting.
6. cascadingEffects (array of strings) - 3-4 secondary effects that trigger if this scenario occurs.
7. strategicPivot (string) - How the organization should react if this scenario starts to manifest.
8. pros (array of strings)
9. cons (array of strings)
10. riskLevel (string: "Low", "Medium", or "High")
11. scores (object: { "Feasibility": 0-10, "Impact": 0-10, "Cost": 0-10, "Risk": 0-10, "Alignment": 0-10 })

Ensure the output is valid JSON matching this structure:
{
  "scenarios": [
    { 
      "type": "...",
      "title": "...", 
      "description": "...", 
      "sensitivityVariable": "...",
      "probability": 60,
      "cascadingEffects": ["...", "..."],
      "strategicPivot": "...",
      "pros": ["..."], 
      "cons": ["..."], 
      "riskLevel": "...",
      "scores": { "Feasibility": 8, "Impact": 9, "Cost": 5, "Risk": 3, "Alignment": 10 }
    }
  ]
}
  `;

  const modelToUse = 'anthropic/claude-sonnet-4.5';
  
  const completion = await withTrace(
    { projectId: project.id, agentRole: 'scenario_agent' },
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
