import { createDemoShell, createUploadPreview } from "@/lib/demo-pages";

export default function WorkspacePlayPage() {
  return createDemoShell({
    modeLabel: "OCR 识别演示页",
    initialView: "workspace",
    initialSelectedInvoiceId: "INV-2026-0325-01",
    initialUploadPreview: createUploadPreview("INV-2026-0325-01")
  });
}
