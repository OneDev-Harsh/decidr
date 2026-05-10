/**
 * Decidr — Shared Type Definitions
 * 
 * Central type registry for all database models, AI outputs,
 * and component interfaces. Eliminates `any` usage progressively.
 */

// ─── Database Models ───────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  description?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export type ProjectStatus = 'ACTIVE' | 'ANALYZING' | 'DECIDED' | 'ARCHIVED';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  problem_statement: string | null;
  goals: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  decided_at: string | null;
  last_graph: KnowledgeGraphData | null;
  last_scenarios: ScenarioResult[] | null;
  last_blindspots: BlindspotResult[] | null;
  last_recommendation: RecommendationResult | null;
  last_contradictions: ContradictionResult[] | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  workspaces?: Pick<Workspace, 'id' | 'name'>;
}

export type EvidenceType = 'text' | 'link' | 'file';

export interface Evidence {
  id: string;
  project_id: string;
  title: string;
  content: string;
  type: EvidenceType;
  file_path: string | null;
  created_at: string;
}

export interface DebateSession {
  id: string;
  project_id: string;
  topic: string;
  status: 'in_progress' | 'completed';
  synthesis: string | null;
  created_at: string;
  // Joined relations
  debate_messages?: DebateMessage[];
}

export type AgentRole = 'strategist' | 'skeptic' | 'moderator' | 'devil_advocate';

export interface DebateMessage {
  id: string;
  session_id: string;
  agent_role: AgentRole;
  content: string;
  created_at: string;
}

export type DecisionEventType =
  | 'SCENARIOS'
  | 'BLINDSPOTS'
  | 'RECOMMENDATION'
  | 'KNOWLEDGE_MAP'
  | 'REPORT'
  | 'DECISION_FINALIZED'
  | 'EVIDENCE_ADDED'
  | 'EVIDENCE_REMOVED'
  | 'PROJECT_UPDATED';

export interface DecisionEvent {
  id: string;
  project_id: string;
  event_type: DecisionEventType;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  action: string;
  details: string | null;
  user_id: string | null;
  created_at: string;
  // Joined relations
  projects?: Pick<Project, 'title'>;
}

export interface AITrace {
  id: string;
  project_id: string;
  agent_role: string;
  prompt: string;
  response: string;
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  latency_ms: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── AI Output Schemas ─────────────────────────────────────────────

export interface KnowledgeNode {
  id: string;
  label: string;
  description?: string;
  type: 'VARIABLE' | 'ASSUMPTION' | 'FACT' | 'RISK';
  importance: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export type EdgeType = 'SUPPORTS' | 'CONTRADICTS' | 'IMPACTS';

export interface KnowledgeEdge {
  source: string;
  target: string;
  type: EdgeType;
  label: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface ScenarioResult {
  type?: string;
  title: string;
  description: string;
  sensitivityVariable?: string;
  pros: string[];
  cons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  scores?: Record<string, number>;
  probability?: number;
  cascadingEffects?: string[];
  confidenceDecay?: string;
}

export interface BlindspotResult {
  area: string;
  finding: string;
  impact: 'High' | 'Medium' | 'Low';
  biasType: string;
  mitigation: string;
  evidenceNeeded?: string;
  severity?: number;
}

export interface RecommendationResult {
  recommendation: string;
  rationale: string;
  confidenceScore: number;
  keyRisks: string[];
  debateSummary?: string;
  assumptions?: string[];
  evidenceUsed?: string[];
  confidenceFactors?: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  name: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface ContradictionResult {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  sources: string[];
}

// ─── Component Props ───────────────────────────────────────────────

export interface AnalysisComponentProps {
  project: Project;
  onAnalysisComplete?: (data: Record<string, unknown>) => void;
}

export interface ProjectListComponentProps {
  projectId: string;
}

// ─── API Types ─────────────────────────────────────────────────────

export type AnalysisAction = 'scenarios' | 'recommendation' | 'blindspots' | 'knowledge_map' | 'bulk_extract';

export interface AnalysisRequest {
  project: Project;
  evidenceList: Evidence[];
  action: AnalysisAction;
}

export interface AnalysisResponse {
  contradictions: ContradictionResult[];
  // Action-specific fields are spread into the response
  [key: string]: unknown;
}

export interface APIErrorResponse {
  error: string;
  details?: string;
  rawOutput?: string;
}
