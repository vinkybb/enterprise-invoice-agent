import { DashboardStat, InvoiceRecord, InvoiceStage, QueueLane, WorkflowEvent } from "@/lib/types";

function createEvent(id: string, at: string, actor: string, action: string, note: string): WorkflowEvent {
  return { id, at, actor, action, note };
}

export function createSeedInvoices(): InvoiceRecord[] {
  return [
    {
      id: "INV-2026-0325-01",
      title: "华东智造设备采购专票",
      vendor: "华东智造科技有限公司",
      buyer: "宁波维启企业服务平台",
      amount: 18420,
      currency: "CNY",
      stage: "finance_review",
      priority: "high",
      dueDate: "2026-03-27 18:00",
      issueDate: "2026-03-20",
      documentType: "增值税专用发票",
      fileName: "huadong-equipment.pdf",
      fileType: "application/pdf",
      statusSummary: "等待财务复核确认税码与成本中心",
      tags: ["设备采购", "成本中心 A12", "自动归类"],
      riskLevel: "medium",
      riskTags: ["税码待确认"],
      channel: "email",
      ocr: {
        provider: "Vision-OCR Enterprise",
        processedAt: "2026-03-25 09:14",
        confidence: 0.97,
        summary: "票据字段提取完整，税码需人工确认。",
        rawText: "华东智造科技有限公司 增值税专用发票 金额 18420.00 税额 2394.60",
        fields: [
          { key: "invoiceCode", label: "发票代码", value: "310026113942", confidence: 0.99 },
          { key: "invoiceNumber", label: "发票号码", value: "49120518", confidence: 0.98 },
          { key: "vendor", label: "销方名称", value: "华东智造科技有限公司", confidence: 0.99 },
          { key: "amount", label: "价税合计", value: "18420.00", confidence: 0.97 },
          { key: "issueDate", label: "开票日期", value: "2026-03-20", confidence: 0.96 }
        ]
      },
      workflow: [
        createEvent("evt-01", "2026-03-25 09:14", "OCR 引擎", "自动识别", "字段完整率 97%，进入财务复核。"),
        createEvent("evt-02", "2026-03-25 10:10", "李婷", "分配处理人", "已分派至财务共享中心。")
      ]
    },
    {
      id: "INV-2026-0325-02",
      title: "杭州云枢 SaaS 订阅票据",
      vendor: "杭州云枢网络科技有限公司",
      buyer: "宁波维启企业服务平台",
      amount: 6720.5,
      currency: "CNY",
      stage: "ocr_review",
      priority: "medium",
      dueDate: "2026-03-28 12:00",
      issueDate: "2026-03-23",
      documentType: "电子普通发票",
      fileName: "yunsu-saas.png",
      fileType: "image/png",
      statusSummary: "OCR 已识别，待核对合同编号与费用归属",
      tags: ["软件订阅", "市场部", "月度账单"],
      riskLevel: "low",
      riskTags: ["合同号缺失"],
      channel: "scan",
      ocr: {
        provider: "Vision-OCR Enterprise",
        processedAt: "2026-03-25 08:42",
        confidence: 0.92,
        summary: "合同编号置信度偏低，建议人工复核。",
        rawText: "杭州云枢网络科技有限公司 电子普通发票 合计 6720.50",
        fields: [
          { key: "invoiceCode", label: "发票代码", value: "033002600511", confidence: 0.95 },
          { key: "invoiceNumber", label: "发票号码", value: "44790103", confidence: 0.95 },
          { key: "vendor", label: "销方名称", value: "杭州云枢网络科技有限公司", confidence: 0.97 },
          { key: "amount", label: "价税合计", value: "6720.50", confidence: 0.94 },
          { key: "contractId", label: "合同编号", value: "待确认", confidence: 0.68 }
        ]
      },
      workflow: [
        createEvent("evt-03", "2026-03-25 08:42", "OCR 引擎", "自动识别", "检测到图片票据，已提取主要字段。"),
        createEvent("evt-04", "2026-03-25 08:49", "陈斌", "标记复核", "合同编号识别不稳定，进入 OCR 复核。")
      ]
    },
    {
      id: "INV-2026-0324-09",
      title: "苏州工业服务维保发票",
      vendor: "苏州工业服务有限公司",
      buyer: "宁波维启企业服务平台",
      amount: 128800,
      currency: "CNY",
      stage: "approval",
      priority: "critical",
      dueDate: "2026-03-26 17:30",
      issueDate: "2026-03-18",
      documentType: "增值税专用发票",
      fileName: "suzhou-maintenance.pdf",
      fileType: "application/pdf",
      statusSummary: "已完成财务复核，等待主管审批",
      tags: ["维保服务", "制造工厂", "预算内"],
      riskLevel: "high",
      riskTags: ["重复报销预警"],
      channel: "api",
      ocr: {
        provider: "Vision-OCR Enterprise",
        processedAt: "2026-03-24 16:12",
        confidence: 0.95,
        summary: "票据信息完整，但历史台账存在近似金额记录。",
        rawText: "苏州工业服务有限公司 增值税专用发票 金额 128800.00",
        fields: [
          { key: "invoiceCode", label: "发票代码", value: "310025100267", confidence: 0.98 },
          { key: "invoiceNumber", label: "发票号码", value: "11239004", confidence: 0.97 },
          { key: "vendor", label: "销方名称", value: "苏州工业服务有限公司", confidence: 0.99 },
          { key: "amount", label: "价税合计", value: "128800.00", confidence: 0.95 },
          { key: "riskSignal", label: "风险信号", value: "近似票据重复报销", confidence: 0.88 }
        ]
      },
      workflow: [
        createEvent("evt-05", "2026-03-24 16:12", "OCR 引擎", "自动识别", "识别完成，进入流程引擎。"),
        createEvent("evt-06", "2026-03-24 17:05", "周蓉", "财务复核", "税率、成本中心、预算项均已确认。"),
        createEvent("evt-07", "2026-03-25 11:10", "风控规则", "风险提示", "发现近似金额重复报销记录，等待主管确认。")
      ]
    },
    {
      id: "INV-2026-0326-03",
      title: "京南物流运输服务发票",
      vendor: "京南物流供应链有限公司",
      buyer: "宁波维启企业服务平台",
      amount: 24560,
      currency: "CNY",
      stage: "intake",
      priority: "high",
      dueDate: "2026-03-29 11:00",
      issueDate: "2026-03-26",
      documentType: "电子普通发票",
      fileName: "jingnan-logistics.jpg",
      fileType: "image/jpeg",
      statusSummary: "等待录入区确认部门与分摊规则",
      tags: ["物流服务", "华东仓", "新到票据"],
      riskLevel: "medium",
      riskTags: ["部门待归属"],
      channel: "scan",
      ocr: {
        provider: "Vision-OCR Enterprise",
        processedAt: "2026-03-26 09:02",
        confidence: 0.89,
        summary: "照片边缘有折痕，建议补拍或人工复核。",
        rawText: "京南物流供应链有限公司 电子普通发票 合计 24560.00",
        fields: [
          { key: "invoiceCode", label: "发票代码", value: "144032601291", confidence: 0.9 },
          { key: "invoiceNumber", label: "发票号码", value: "90124567", confidence: 0.88 },
          { key: "vendor", label: "销方名称", value: "京南物流供应链有限公司", confidence: 0.93 },
          { key: "amount", label: "价税合计", value: "24560.00", confidence: 0.9 },
          { key: "department", label: "归属部门", value: "待补全", confidence: 0.61 }
        ]
      },
      workflow: [
        createEvent("evt-08", "2026-03-26 09:02", "OCR 引擎", "自动识别", "照片票据入池，等待录入补全。")
      ]
    },
    {
      id: "INV-2026-0322-06",
      title: "北辰能源差旅票据",
      vendor: "北辰能源科技股份有限公司",
      buyer: "宁波维启企业服务平台",
      amount: 3860,
      currency: "CNY",
      stage: "archived",
      priority: "routine",
      dueDate: "2026-03-23 09:00",
      issueDate: "2026-03-17",
      documentType: "电子普通发票",
      fileName: "beichen-travel.pdf",
      fileType: "application/pdf",
      statusSummary: "归档完成，可追溯原始识别结果与审批轨迹",
      tags: ["差旅", "人事行政", "已入账"],
      riskLevel: "low",
      riskTags: [],
      channel: "email",
      ocr: {
        provider: "Vision-OCR Enterprise",
        processedAt: "2026-03-22 13:17",
        confidence: 0.98,
        summary: "字段完整，直通归档。",
        rawText: "北辰能源科技股份有限公司 电子普通发票 合计 3860.00",
        fields: [
          { key: "invoiceCode", label: "发票代码", value: "033002400875", confidence: 0.99 },
          { key: "invoiceNumber", label: "发票号码", value: "11027440", confidence: 0.98 },
          { key: "vendor", label: "销方名称", value: "北辰能源科技股份有限公司", confidence: 0.99 },
          { key: "amount", label: "价税合计", value: "3860.00", confidence: 0.99 }
        ]
      },
      workflow: [
        createEvent("evt-09", "2026-03-22 13:17", "OCR 引擎", "自动识别", "识别完成，字段置信度高。"),
        createEvent("evt-10", "2026-03-22 14:02", "系统流程", "自动流转", "满足直通规则，自动进入归档。")
      ]
    }
  ];
}

export function buildDashboardStats(invoices: InvoiceRecord[]): DashboardStat[] {
  const inFlight = invoices.filter((invoice) => invoice.stage !== "archived").length;
  const highRisk = invoices.filter((invoice) => invoice.riskLevel === "high").length;
  const automationRate = Math.round(
    (invoices.filter((invoice) => invoice.ocr.confidence >= 0.95).length / invoices.length) * 100
  );
  const expiringSoon = invoices.filter((invoice) => invoice.stage !== "archived" && invoice.priority !== "routine").length;

  return [
    {
      label: "在途票据",
      value: `${inFlight}`,
      delta: "较昨晚 +3",
      emphasis: "ink"
    },
    {
      label: "OCR 直通率",
      value: `${automationRate}%`,
      delta: "本周稳定在优先阈值以上",
      emphasis: "emerald"
    },
    {
      label: "高风险预警",
      value: `${highRisk}`,
      delta: "重复报销 / 税码异常已联动",
      emphasis: "gold"
    },
    {
      label: "SLA 紧迫件",
      value: `${expiringSoon}`,
      delta: "建议客服助手优先推进",
      emphasis: "slate"
    }
  ];
}

export function buildQueueLanes(invoices: InvoiceRecord[]): QueueLane[] {
  const laneMap: Array<{ key: InvoiceStage; label: string; description: string; accent: QueueLane["accent"] }> = [
    { key: "intake", label: "录入补全", description: "新票据落池，等待补齐业务语义。", accent: "steel" },
    { key: "ocr_review", label: "OCR 复核", description: "识别置信度不足或字段缺失。", accent: "amber" },
    { key: "finance_review", label: "财务复核", description: "成本中心、税码、预算项复核。", accent: "copper" },
    { key: "approval", label: "主管审批", description: "异常或大额票据进入审批流。", accent: "ink" },
    { key: "archived", label: "已归档", description: "流转闭环完成，可审计追踪。", accent: "forest" }
  ];

  return laneMap.map((lane) => ({
    ...lane,
    count: invoices.filter((invoice) => invoice.stage === lane.key).length
  }));
}
