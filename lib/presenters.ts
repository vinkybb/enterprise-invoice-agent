import { InvoiceStage, Priority, ViewKey } from "@/lib/types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2
  }).format(amount);
}

export function stageLabel(stage: InvoiceStage): string {
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

export function viewLabel(view: ViewKey): string {
  switch (view) {
    case "commandCenter":
      return "企业总览";
    case "workspace":
      return "票据录入";
    case "workflow":
      return "流程流转";
    case "audit":
      return "风险审计";
    default:
      return view;
  }
}

export function priorityLabel(priority: Priority): string {
  switch (priority) {
    case "critical":
      return "紧急";
    case "high":
      return "高优先";
    case "medium":
      return "处理中";
    case "routine":
      return "常规";
    default:
      return priority;
  }
}
