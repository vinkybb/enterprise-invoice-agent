import { PlatformShell } from "@/components/platform-shell";
import { buildCopilotPlan } from "@/lib/copilot";
import { getWorkspaceSnapshot } from "@/lib/store";
import { StageFilter, UploadResponse, ViewKey } from "@/lib/types";

interface DemoPageOptions {
  modeLabel: string;
  initialView?: ViewKey;
  initialStageFilter?: StageFilter;
  initialSelectedInvoiceId?: string | null;
  initialHighlightedTag?: string | null;
  command?: string;
  initialUploadPreview?: UploadResponse | null;
}

export function createUploadPreview(selectedInvoiceId: string): UploadResponse {
  const snapshot = getWorkspaceSnapshot();
  const createdInvoice =
    snapshot.invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? snapshot.invoices[0];

  return {
    snapshot,
    createdInvoice,
    focusInvoiceId: createdInvoice.id
  };
}

export function createDemoShell({
  modeLabel,
  initialView = "commandCenter",
  initialStageFilter = "all",
  initialSelectedInvoiceId = null,
  initialHighlightedTag = null,
  command,
  initialUploadPreview = null
}: DemoPageOptions) {
  const snapshot = getWorkspaceSnapshot();
  const context = {
    activeView: initialView,
    selectedInvoiceId: initialSelectedInvoiceId,
    stageFilter: initialStageFilter,
    highlightedTag: initialHighlightedTag
  };

  const plan =
    command && initialSelectedInvoiceId
      ? buildCopilotPlan(command, context, snapshot.invoices)
      : null;

  return (
    <PlatformShell
      initialSnapshot={snapshot}
      initialView={initialView}
      initialStageFilter={initialStageFilter}
      initialSelectedInvoiceId={initialSelectedInvoiceId}
      initialHighlightedTag={initialHighlightedTag}
      initialMessages={
        plan
          ? [
              {
                id: `${modeLabel}-user`,
                role: "user",
                content: command ?? ""
              },
              {
                id: `${modeLabel}-assistant`,
                role: "assistant",
                content: plan.assistantMessage
              }
            ]
          : undefined
      }
      initialExecutionSteps={
        plan
          ? plan.steps.map((step) => ({
              id: step.id,
              label: step.label,
              description: step.description,
              status: "done" as const
            }))
          : []
      }
      initialUploadPreview={initialUploadPreview}
      modeLabel={modeLabel}
    />
  );
}
