import { describe, expect, it } from "vitest";

import { buildCopilotPlan } from "@/lib/copilot";
import { createSeedInvoices } from "@/lib/mock-data";

describe("buildCopilotPlan", () => {
  const invoices = createSeedInvoices();

  it("maps queue navigation commands into workflow actions", () => {
    const plan = buildCopilotPlan(
      "切到流程流转，只看财务复核，打开第一条待处理票据",
      {
        activeView: "commandCenter",
        selectedInvoiceId: null,
        stageFilter: "all",
        highlightedTag: null
      },
      invoices
    );

    expect(plan.steps.map((step) => step.type)).toEqual(["navigate", "apply_filter", "focus_invoice"]);
    expect(plan.steps[1]?.payload.stage).toBe("finance_review");
    expect(plan.steps[2]?.payload.invoiceId).toBe("INV-2026-0325-01");
  });

  it("keeps the current invoice and advances it with a note", () => {
    const plan = buildCopilotPlan(
      "把当前票据提交到主管审批，并备注税码已确认",
      {
        activeView: "workflow",
        selectedInvoiceId: "INV-2026-0325-01",
        stageFilter: "finance_review",
        highlightedTag: null
      },
      invoices
    );

    const advanceAction = plan.steps.find((step) => step.type === "advance_stage");
    const noteAction = plan.steps.find((step) => step.type === "append_note");

    expect(advanceAction?.payload.invoiceId).toBe("INV-2026-0325-01");
    expect(advanceAction?.payload.targetStage).toBe("approval");
    expect(noteAction?.payload.note).toContain("税码已确认");
  });

  it("falls back safely for unsupported commands", () => {
    const plan = buildCopilotPlan(
      "帮我发邮件给供应商",
      {
        activeView: "commandCenter",
        selectedInvoiceId: null,
        stageFilter: "all",
        highlightedTag: null
      },
      invoices
    );

    expect(plan.steps).toHaveLength(0);
    expect(plan.assistantMessage).toContain("暂时无法安全自动执行");
  });
});
