import { createDemoShell } from "@/lib/demo-pages";

export default function ArchivePlayPage() {
  return createDemoShell({
    modeLabel: "归档追踪演示页",
    initialView: "workflow",
    initialStageFilter: "archived",
    initialSelectedInvoiceId: "INV-2026-0322-06"
  });
}
