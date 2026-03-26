import { createDemoShell } from "@/lib/demo-pages";

export default function AuditPlayPage() {
  return createDemoShell({
    modeLabel: "风险审计演示页",
    initialView: "audit",
    initialSelectedInvoiceId: "INV-2026-0324-09",
    initialHighlightedTag: "重复报销"
  });
}
