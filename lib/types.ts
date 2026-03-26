export type InvoiceStage =
  | "intake"
  | "ocr_review"
  | "finance_review"
  | "approval"
  | "dispatched"
  | "archived";

export type ViewKey = "commandCenter" | "workspace" | "workflow" | "audit";

export type Priority = "critical" | "high" | "medium" | "routine";

export type RiskLevel = "high" | "medium" | "low";

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
}

export interface OcrResult {
  provider: string;
  processedAt: string;
  confidence: number;
  summary: string;
  rawText: string;
  fields: ExtractedField[];
}

export interface WorkflowEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  note: string;
}

export interface InvoiceRecord {
  id: string;
  title: string;
  vendor: string;
  buyer: string;
  amount: number;
  currency: "CNY";
  stage: InvoiceStage;
  priority: Priority;
  dueDate: string;
  issueDate: string;
  documentType: string;
  fileName: string;
  fileType: string;
  statusSummary: string;
  tags: string[];
  riskLevel: RiskLevel;
  riskTags: string[];
  channel: "email" | "scan" | "api";
  ocr: OcrResult;
  workflow: WorkflowEvent[];
}

export interface DashboardStat {
  label: string;
  value: string;
  delta: string;
  emphasis: "slate" | "ink" | "gold" | "emerald";
}

export interface QueueLane {
  key: InvoiceStage;
  label: string;
  description: string;
  count: number;
  accent: "steel" | "amber" | "copper" | "forest" | "ink";
}

export interface WorkspaceSnapshot {
  invoices: InvoiceRecord[];
  stats: DashboardStat[];
  lanes: QueueLane[];
}

export type StageFilter = InvoiceStage | "all";

export interface UiContext {
  activeView: ViewKey;
  selectedInvoiceId: string | null;
  stageFilter: StageFilter;
  highlightedTag: string | null;
}

export type CopilotActionType =
  | "navigate"
  | "apply_filter"
  | "focus_invoice"
  | "advance_stage"
  | "highlight_risk"
  | "open_upload"
  | "append_note";

export interface CopilotAction {
  id: string;
  type: CopilotActionType;
  label: string;
  description: string;
  safe: boolean;
  payload: Record<string, string>;
}

export interface CopilotPlan {
  id: string;
  originalCommand: string;
  reasoning: string;
  assistantMessage: string;
  steps: CopilotAction[];
}

export interface CopilotResponse {
  plan: CopilotPlan;
  snapshot: WorkspaceSnapshot;
}

export interface ExecutionStep {
  id: string;
  label: string;
  description: string;
  status: "pending" | "running" | "done";
}

export interface CopilotMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export interface UploadResponse {
  snapshot: WorkspaceSnapshot;
  createdInvoice: InvoiceRecord;
  focusInvoiceId: string;
}
