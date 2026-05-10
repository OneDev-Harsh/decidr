import { insforge } from "@/lib/insforge";

export interface TraceContext {
  projectId: string;
  agentRole: string;
}

export async function withTrace<T>(
  context: TraceContext,
  promptText: string,
  model: string,
  operation: () => Promise<any>,
  client?: any
): Promise<any> {
  const insClient = client || insforge;
  const startTime = Date.now();
  let responseText = "";
  let tokensInput = 0;
  let tokensOutput = 0;
  let metadata: any = {};
  
  try {
    const response = await operation();
    
    // Extract standard OpenAI-compatible usage metrics if available
    if (response?.usage) {
      tokensInput = response.usage.prompt_tokens || 0;
      tokensOutput = response.usage.completion_tokens || 0;
    }
    
    // Extract response text (assuming standard chat completion structure)
    if (response?.choices && response.choices.length > 0) {
      responseText = response.choices[0].message?.content || "";
    } else {
      responseText = JSON.stringify(response);
    }
    
    return response;
  } catch (error: any) {
    responseText = `[ERROR]: ${error.message}`;
    metadata = { error: error.stack };
    throw error;
  } finally {
    const latencyMs = Date.now() - startTime;
    
    // Log the trace asynchronously so it doesn't block the critical path
    insClient.database.from('ai_traces').insert({
      project_id: context.projectId,
      agent_role: context.agentRole,
      prompt: promptText,
      response: responseText,
      model_used: model,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      latency_ms: latencyMs,
      metadata
    }).then(({ error }: { error: any }) => {
      if (error) {
        console.error("Failed to log AI trace:", error);
      }
    });
  }
}
