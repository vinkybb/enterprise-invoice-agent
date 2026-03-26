import { InvoiceRecord, InvoiceStage, CopilotAction, CopilotPlan, StageFilter, UiContext, ViewKey } from "@/lib/types";

const VIEW_MATCHERS: Array<{ view: ViewKey; label: string; patterns: string[] }> = [
  { view: "commandCenter", label: "企业总览", patterns: ["总览", "首页", "指挥台", "dashboard", "overview"] },
  { view: "workspace", label: "票据录入", patterns: ["上传", "录入", "识别", "ocr", "workspace"] },
  { view: "workflow", label: "流程流转", patterns: ["流程", "流转", "审核", "审批", "送审", "复核", "workflow"] },
  { view: "audit", label: "风险审计", patterns: ["风险", "风控", "审计", "台账", "audit"] }
];

const STAGE_MATCHERS: Array<{ stage: InvoiceStage; label: string; patterns: string[] }> = [
  { stage: "intake", label: "录入补全", patterns: ["录入", "新票据", "待补全", "入池"] },
  { stage: "ocr_review", label: "OCR 复核", patterns: ["ocr复核", "ocr", "识别复核", "待识别"] },
  { stage: "finance_review", label: "财务复核", patterns: ["财务复核", "财务审核", "财务"] },
  { stage: "approval", label: "主管审批", patterns: ["审批", "主管审批", "经理审批"] },
  { stage: "archived", label: "已归档", patterns: ["归档", "入账", "完成"] }
];

const RISK_TAG_MATCHERS = ["风险", "税码", "重复报销", "合同号", "部门待归属"];

export const suggestedCommands = [
  "切到流程流转，只看财务复核，打开第一条待处理票据",
  "去风险审计，把高风险票据高亮出来",
  "打开上传录入区，准备接收今天的新 PDF",
  "把当前票据提交到主管审批，并备注税码已确认"
];

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function createAction(type: CopilotAction["type"], label: string, description: string, payload: Record<string, string>): CopilotAction {
  return {
    id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    label,
    description,
    safe: true,
    payload
  };
}

function matchesKeyword(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern.toLowerCase()));
}

function findTargetView(command: string): { view: ViewKey; label: string } | null {
  const match = VIEW_MATCHERS.find((item) => matchesKeyword(command, item.patterns));
  return match ? { view: match.view, label: match.label } : null;
}

function findStage(command: string): { stage: InvoiceStage; label: string } | null {
  const match = STAGE_MATCHERS.find((item) => matchesKeyword(command, item.patterns));
  return match ? { stage: match.stage, label: match.label } : null;
}

function detectFilterStage(command: string): { stage: InvoiceStage; label: string } | null {
  if (
    command.includes("只看") ||
    command.includes("筛") ||
    command.includes("列表") ||
    command.includes("队列") ||
    command.includes("待处理") ||
    command.includes("第一条") ||
    command.includes("第一张")
  ) {
    return findStage(command);
  }

  return null;
}

function findInvoice(command: string, invoices: InvoiceRecord[], stageFilter: StageFilter, selectedInvoiceId: string | null): InvoiceRecord | null {
  const wantsInvoice =
    command.includes("票据") ||
    command.includes("发票") ||
    command.includes("当前") ||
    command.includes("这张") ||
    command.includes("打开") ||
    command.includes("查看") ||
    command.includes("聚焦") ||
    command.includes("处理") ||
    command.includes("第一") ||
    command.includes("首个");

  if (!wantsInvoice) {
    return null;
  }

  const explicit = invoices.find(
    (invoice) =>
      command.includes(invoice.id.toLowerCase()) ||
      command.includes(invoice.vendor.toLowerCase()) ||
      command.includes(invoice.title.toLowerCase())
  );

  if (explicit) {
    return explicit;
  }

  if ((command.includes("当前") || command.includes("这张")) && selectedInvoiceId) {
    return invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null;
  }

  const candidates = stageFilter === "all" ? invoices : invoices.filter((invoice) => invoice.stage === stageFilter);

  if (command.includes("第一") || command.includes("首个") || command.includes("第一条")) {
    return candidates[0] ?? null;
  }

  return candidates[0] ?? null;
}

function deriveTargetStage(command: string, invoice: InvoiceRecord | null): InvoiceStage | null {
  const explicit = findStage(command);
  if (explicit) {
    return explicit.stage;
  }

  if (!invoice) {
    return null;
  }

  if (command.includes("推进") || command.includes("流转") || command.includes("提交") || command.includes("送审")) {
    const order: InvoiceStage[] = ["intake", "ocr_review", "finance_review", "approval", "archived"];
    const currentIndex = order.indexOf(invoice.stage);
    return order[Math.min(currentIndex + 1, order.length - 1)] ?? invoice.stage;
  }

  return null;
}

function extractNote(command: string): string | null {
  const marker = ["备注", "留言", "说明"].find((item) => command.includes(item));
  if (!marker) {
    return null;
  }

  const note = command.split(marker)[1]?.replace(/^[:：，,\s]+/, "").trim();
  return note || "已由智能客服写入处理备注。";
}

export function buildCopilotPlan(commandText: string, context: UiContext, invoices: InvoiceRecord[]): CopilotPlan {
  const command = normalize(commandText);
  const steps: CopilotAction[] = [];
  const filterStage = detectFilterStage(command);
  const targetView = findTargetView(command);
  const selectedInvoice = findInvoice(command, invoices, filterStage?.stage ?? context.stageFilter, context.selectedInvoiceId);
  const targetStage = deriveTargetStage(command, selectedInvoice);
  const note = extractNote(command);
  const riskTag = RISK_TAG_MATCHERS.find((item) => command.includes(item.toLowerCase()));

  if (targetView) {
    steps.push(
      createAction("navigate", `切换到${targetView.label}`, `将客服工作台切换到 ${targetView.label} 视图。`, {
        view: targetView.view
      })
    );
  }

  if (filterStage) {
    steps.push(
      createAction("apply_filter", `筛选${filterStage.label}`, `将票据队列聚焦到 ${filterStage.label}。`, {
        stage: filterStage.stage
      })
    );
  }

  if (command.includes("上传") || command.includes("录入区") || command.includes("接收新")) {
    steps.push(
      createAction("open_upload", "打开上传工作区", "展开票据上传和 OCR 识别工作区。", {
        view: "workspace"
      })
    );
  }

  if (selectedInvoice) {
    steps.push(
      createAction("focus_invoice", `打开 ${selectedInvoice.id}`, `聚焦票据 ${selectedInvoice.title}。`, {
        invoiceId: selectedInvoice.id
      })
    );
  }

  if (riskTag) {
    steps.push(
      createAction("highlight_risk", `高亮${riskTag}`, `在审计视图中高亮与 ${riskTag} 相关的风险标签。`, {
        tag: riskTag
      })
    );
  }

  if (selectedInvoice && targetStage && targetStage !== selectedInvoice.stage) {
    const stageLabel = STAGE_MATCHERS.find((item) => item.stage === targetStage)?.label ?? targetStage;
    steps.push(
      createAction("advance_stage", `流转到${stageLabel}`, `将 ${selectedInvoice.id} 推进到 ${stageLabel}。`, {
        invoiceId: selectedInvoice.id,
        targetStage
      })
    );
  }

  if (selectedInvoice && note) {
    steps.push(
      createAction("append_note", "写入处理备注", `向 ${selectedInvoice.id} 追加处理说明。`, {
        invoiceId: selectedInvoice.id,
        note
      })
    );
  }

  const uniqueSteps = steps.filter(
    (step, index) =>
      steps.findIndex(
        (candidate) =>
          candidate.type === step.type &&
          JSON.stringify(candidate.payload) === JSON.stringify(step.payload)
      ) === index
  );

  if (uniqueSteps.length === 0) {
    return {
      id: `plan-${Date.now()}`,
      originalCommand: commandText,
      reasoning: "当前指令未命中 allowlist 内的安全 UI 动作，保持待命。",
      assistantMessage: "这条指令我暂时无法安全自动执行。可以试试“切到流程流转并打开第一条待处理票据”这类明确动作。",
      steps: []
    };
  }

  const summary = uniqueSteps.map((step) => step.label).join(" -> ");

  return {
    id: `plan-${Date.now()}`,
    originalCommand: commandText,
    reasoning: "已将自然语言拆解为 allowlist 内的页面导航、筛选、聚焦和流转动作，便于安全自动执行。",
    assistantMessage: `已为你规划 ${uniqueSteps.length} 步自动操作：${summary}。`,
    steps: uniqueSteps
  };
}
