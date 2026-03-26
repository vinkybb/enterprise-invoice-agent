import { createDemoShell } from "@/lib/demo-pages";

export default function CorePlayPage() {
  return createDemoShell({
    modeLabel: "核心玩法演示页",
    initialView: "workflow",
    initialStageFilter: "finance_review",
    initialSelectedInvoiceId: "INV-2026-0325-01",
    command: "把当前票据提交到主管审批，并备注税码已确认"
  });
}
