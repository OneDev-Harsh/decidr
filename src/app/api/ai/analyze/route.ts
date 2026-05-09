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
6. scores (object: { "Feasibility": 0-10, "Impact": 0-10, "Cost": 0-10, "Risk": 0-10, "Alignment": 0-10 })

Ensure the output is valid JSON matching this structure:
{
  "scenarios": [
    { 
      "title": "...", 
      "description": "...", 
      "pros": ["..."], 
      "cons": ["..."], 
      "riskLevel": "...",
      "scores": { "Feasibility": 8, "Impact": 9, "Cost": 5, "Risk": 3, "Alignment": 10 }
    }
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
    } else if (action === 'blindspots') {
      systemPrompt = `You are a Critical Thinking Agent and Cognitive Bias Expert. Your job is to find what is MISSING or BIASED in this decision project. Identify 3-4 blindspots, hidden risks, or missing evidence types. Format your response as a JSON object with a 'blindspots' array.`;
      
      userPrompt = `
Project Title: ${project.title}
Project Description/Context: ${project.description || 'Not provided'}
Problem Statement: ${project.problem_statement || 'Not provided'}
Goals: ${project.goals || 'Not provided'}

Evidence:
${evidenceText || 'No evidence provided.'}

Analyze for blindspots and biases. For each blindspot, provide:
1. title (string)
2. description (string) - Why this is a blindspot.
3. type (string) - e.g., "Cognitive Bias", "Data Gap", "Strategic Risk"
4. mitigation (string) - How to address it.

Ensure the output is valid JSON matching this structure:
{
  "blindspots": [
    { "title": "...", "description": "...", "type": "...", "mitigation": "..." }
  ]
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
