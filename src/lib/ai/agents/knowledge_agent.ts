import { insforge as defaultInsforge } from "@/lib/insforge";
import { withTrace } from "../core/tracer";

export async function extractKnowledgeGraph(project: any, evidenceText: string, client?: any) {
  const insClient = client || defaultInsforge;
  const systemPrompt = `You are a Knowledge Engineering Agent. Your task is to extract a semantic network from the project context and evidence. 
Identify key entities (Variables, Assumptions, Facts, Risks) and the relationships between them.

Entity Types:
- VARIABLE: A moving part (e.g., "Market Demand", "Budget")
- ASSUMPTION: Something taken for granted (e.g., "Competitors will not react")
- FACT: A proven data point from evidence
- RISK: A potential negative outcome

Relationship Types:
- SUPPORTS: Entity A provides evidence for Entity B
- CONTRADICTS: Entity A conflicts with Entity B
- IMPACTS: Entity A influences the value/status of Entity B

Return your response as a JSON object:
{
  "nodes": [
    { "id": "node1", "label": "...", "description": "Concise analytical summary...", "type": "VARIABLE", "importance": 1-10 }
  ],
  "edges": [
    { "source": "node1", "target": "node2", "type": "SUPPORTS", "label": "..." }
  ]
}`;

  const userPrompt = `
Project: ${project.title}
Evidence:
${evidenceText}

Extract the knowledge graph.
`;

  const modelToUse = 'anthropic/claude-sonnet-4.5';

  const completion = await withTrace(
    { projectId: project.id, agentRole: 'knowledge_agent' },
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
