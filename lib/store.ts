import { buildDashboardStats, buildQueueLanes, createSeedInvoices } from "@/lib/mock-data";
import { OcrResult, CopilotPlan, InvoiceRecord, InvoiceStage, WorkspaceSnapshot } from "@/lib/types";

interface InvoiceStore {
  invoices: InvoiceRecord[];
}

declare global {
  var __enterpriseInvoiceStore__: InvoiceStore | undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getStore(): InvoiceStore {
  if (!globalThis.__enterpriseInvoiceStore__) {
    globalThis.__enterpriseInvoiceStore__ = {
      invoices: createSeedInvoices()
    };
  }

  return globalThis.__enterpriseInvoiceStore__;
}

function stageLabel(stage: InvoiceStage): string {
  switch (stage) {
    case "intake":
      return "录入补全";
    case "ocr_review":
      return "OCR 复核";
    case "finance_review":
      return "财务复核";
    case "approval":
      return "主管审批";
    case "dispatched":
      return "已派发";
    case "archived":
      return "已归档";
    default:
      return stage;
  }
}

function generatePriority(confidence: number): InvoiceRecord["priority"] {
  if (confidence < 0.9) {
    return "high";
  }

  if (confidence < 0.95) {
    return "medium";
  }

  return "routine";
}

function generateRiskLevel(confidence: number): InvoiceRecord["riskLevel"] {
  if (confidence < 0.9) {
    return "high";
  }

  if (confidence < 0.95) {
    return "medium";
  }

  return "low";
}

function findFieldValue(ocr: OcrResult, key: string, fallback: string): string {
  return ocr.fields.find((field) => field.key === key)?.value ?? fallback;
}

export function getInvoices(): InvoiceRecord[] {
  return clone(getStore().invoices);
}

export function getWorkspaceSnapshot(): WorkspaceSnapshot {
  const invoices = getInvoices();
  return {
    invoices,
    stats: buildDashboardStats(invoices),
    lanes: buildQueueLanes(invoices)
  };
}

export function createInvoiceFromUpload(file: { name: string; type: string }, ocr: OcrResult): InvoiceRecord {
  const store = getStore();
  const id = `INV-2026-0326-${String(store.invoices.length + 1).padStart(2, "0")}`;
  const amount = Number(findFieldValue(ocr, "amount", "0"));
  const documentType = findFieldValue(ocr, "documentType", file.type.includes("pdf") ? "增值税专用发票" : "电子普通发票");
  const vendor = findFieldValue(ocr, "vendor", "待确认供应商");
  const contractId = findFieldValue(ocr, "contractId", "待补充");
  const owner = findFieldValue(ocr, "owner", "待确认团队");

  const created: InvoiceRecord = {
    id,
    title: `${vendor.replace("有限公司", "")} ${documentType}`,
    vendor,
    buyer: "宁波维启企业服务平台",
    amount,
    currency: "CNY",
    stage: ocr.confidence >= 0.95 ? "finance_review" : "intake",
    priority: generatePriority(ocr.confidence),
    dueDate: "2026-03-29 18:00",
    issueDate: findFieldValue(ocr, "issueDate", "2026-03-26"),
    documentType,
    fileName: file.name,
    fileType: file.type,
    statusSummary: ocr.confidence >= 0.95 ? "OCR 置信度高，已自动送入财务复核。" : "票据已入池，等待录入补全后流转。",
    tags: [contractId, owner, "新上传"],
    riskLevel: generateRiskLevel(ocr.confidence),
    riskTags: ocr.confidence >= 0.95 ? [] : ["低置信度字段待确认"],
    channel: "scan",
    ocr,
    workflow: [
      {
        id: `${id}-event-1`,
        at: ocr.processedAt,
        actor: "OCR 引擎",
        action: "自动识别",
        note: ocr.summary
      }
    ]
  };

  store.invoices.unshift(created);
  return clone(created);
}

export function applyCopilotPlan(plan: CopilotPlan): WorkspaceSnapshot {
  const store = getStore();

  for (const step of plan.steps) {
    if (step.type === "advance_stage") {
      const invoice = store.invoices.find((item) => item.id === step.payload.invoiceId);

      if (invoice) {
        invoice.stage = step.payload.targetStage as InvoiceStage;
        invoice.statusSummary = `已由智能客服推进到 ${stageLabel(invoice.stage)}。`;
        invoice.workflow.unshift({
          id: `${invoice.id}-advance-${Date.now()}`,
          at: "2026-03-26 14:10",
          actor: "智能客服助手",
          action: "自动流转",
          note: `根据操作指令推进至 ${stageLabel(invoice.stage)}。`
        });
      }
    }

    if (step.type === "append_note") {
      const invoice = store.invoices.find((item) => item.id === step.payload.invoiceId);

      if (invoice) {
        invoice.workflow.unshift({
          id: `${invoice.id}-note-${Date.now()}`,
          at: "2026-03-26 14:12",
          actor: "智能客服助手",
          action: "写入备注",
          note: step.payload.note
        });
      }
    }
  }

  return getWorkspaceSnapshot();
}
