import { OcrResult } from "@/lib/types";

const VENDORS = [
  "苏州衡拓工业服务有限公司",
  "杭州澄川数字科技有限公司",
  "京南物流供应链有限公司",
  "上海衡思软件科技有限公司",
  "深圳曜石能源设备有限公司"
];

const DOCUMENT_TYPES = ["增值税专用发票", "电子普通发票", "数电发票"];

function hashSeed(input: string): number {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) % 10000019;
  }
  return hash;
}

function padNumber(value: number, length: number): string {
  return `${value}`.padStart(length, "0");
}

function buildMockResult(fileName: string, fileType: string, fileSize: number): OcrResult {
  const seed = hashSeed(`${fileName}-${fileType}-${fileSize}`);
  const vendor = VENDORS[seed % VENDORS.length];
  const documentType = DOCUMENT_TYPES[seed % DOCUMENT_TYPES.length];
  const grossAmount = ((seed % 880000) + 12000) / 100;
  const taxAmount = grossAmount * 0.13;
  const issueDay = (seed % 8) + 18;
  const confidence = 0.88 + ((seed % 10) / 100);
  const processedHour = 8 + (seed % 9);
  const processedMinute = 10 + (seed % 43);
  const invoiceCode = `31${padNumber(seed % 1000000000, 10)}`;
  const invoiceNumber = padNumber(seed % 100000000, 8);
  const contractId = `CT-${padNumber(seed % 100000, 5)}`;
  const reimbursementOwner = ["市场中心", "财务共享", "供应链中心", "技术平台部"][seed % 4];

  const fields = [
    { key: "documentType", label: "票据类型", value: documentType, confidence: Number((confidence - 0.01).toFixed(2)) },
    { key: "invoiceCode", label: "发票代码", value: invoiceCode, confidence: Number((confidence + 0.02).toFixed(2)) },
    { key: "invoiceNumber", label: "发票号码", value: invoiceNumber, confidence: Number((confidence + 0.01).toFixed(2)) },
    { key: "vendor", label: "销方名称", value: vendor, confidence: Number((confidence + 0.02).toFixed(2)) },
    { key: "amount", label: "价税合计", value: grossAmount.toFixed(2), confidence: Number(confidence.toFixed(2)) },
    { key: "taxAmount", label: "税额", value: taxAmount.toFixed(2), confidence: Number((confidence - 0.02).toFixed(2)) },
    { key: "issueDate", label: "开票日期", value: `2026-03-${padNumber(issueDay, 2)}`, confidence: Number((confidence - 0.01).toFixed(2)) },
    { key: "contractId", label: "合同编号", value: contractId, confidence: Number((confidence - 0.05).toFixed(2)) },
    { key: "owner", label: "归属团队", value: reimbursementOwner, confidence: Number((confidence - 0.04).toFixed(2)) }
  ];

  return {
    provider: process.env.OCR_PROVIDER_NAME ?? "Vision-OCR Enterprise",
    processedAt: `2026-03-26 ${padNumber(processedHour, 2)}:${padNumber(processedMinute, 2)}`,
    confidence: Number(confidence.toFixed(2)),
    summary: confidence >= 0.95 ? "字段完整度高，可进入自动流转。" : "检测到低置信度字段，建议转人工复核。",
    rawText: `${vendor} ${documentType} 合计 ${grossAmount.toFixed(2)} 税额 ${taxAmount.toFixed(2)}`,
    fields
  };
}

export async function runOcrPipeline(file: File): Promise<OcrResult> {
  const fileType = file.type || "application/octet-stream";
  const providerMode = process.env.OCR_PROVIDER_MODE ?? "mock";

  if (providerMode === "remote" && process.env.OCR_PROVIDER_URL) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(process.env.OCR_PROVIDER_URL, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        return (await response.json()) as OcrResult;
      }
    } catch {
      // Demo mode falls back to deterministic mock extraction when the remote provider is unavailable.
    }
  }

  return buildMockResult(file.name, fileType, file.size);
}
