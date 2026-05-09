import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!
});

export async function POST(req: Request) {
  try {
    const { project, evidenceList, action } = await req.json();

    if (!project || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const evidenceText = evidenceList.map((e: any) => `[${e.type.toUpperCase()}] ${e.title}:\n${e.content}`).join('\n\n');

    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'scenarios') {
      systemPrompt = `You are an expert strategic advisor and decision-intelligence AI. Your task is to analyze the user's project and evidence, and generate exactly 3 distinct scenarios/alternatives for them to consider. Return your response as a JSON object with a 'scenarios' array.`;
      
      userPrompt = `
Project Title: ${project.title}
Project Description/Context: ${project.description || 'Not provided'}
Project Priority: ${project.priority}

Evidence:
${evidenceText || 'No evidence provided.'}

Generate 3 distinct scenarios. For each scenario, provide:
1. title (string)
2. description (string)
3. pros (array of strings)
4. cons (array of strings)
5. riskLevel (string: "Low", "Medium", or "High")

Ensure the output is valid JSON matching this structure:
{
  "scenarios": [
    { "title": "...", "description": "...", "pros": ["..."], "cons": ["..."], "riskLevel": "..." }
  ]
}
      `;
    } else if (action === 'recommendation') {
      systemPrompt = `You are a decisive executive advisor. Based on the project context and the available evidence, provide a definitive, single recommendation. Return your response as a JSON object.`;
      
      userPrompt = `
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
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const completion = await insforge.ai.chat.completions.create({
      model: 'anthropic/claude-sonnet-4.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    });

    const aiContent = completion.choices[0].message.content;
    
    // Attempt to parse JSON. Sometimes Claude wraps JSON in markdown blocks.
    let jsonMatch = aiContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
    let parsedResult;
    
    try {
      if (jsonMatch && jsonMatch[1]) {
        parsedResult = JSON.parse(jsonMatch[1]);
      } else {
        parsedResult = JSON.parse(aiContent);
      }
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", aiContent);
      return NextResponse.json({ error: 'AI failed to return valid JSON', rawOutput: aiContent }, { status: 500 });
    }

    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
