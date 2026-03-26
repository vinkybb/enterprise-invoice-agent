import { Card, Descriptions, Progress, Tag, Timeline } from "tdesign-react";

import { formatCurrency, priorityLabel, stageLabel, viewLabel } from "@/lib/presenters";
import { InvoiceRecord, ViewKey } from "@/lib/types";

interface InvoiceDetailProps {
  invoice: InvoiceRecord | null;
  activeView: ViewKey;
  highlightedTag: string | null;
}

export function InvoiceDetail({ invoice, activeView, highlightedTag }: InvoiceDetailProps) {
  if (!invoice) {
    return (
      <section className="docs-detail-panel">
        <Card bordered={false} className="docs-section-card">
          <div className="docs-empty-card">
          <strong>尚未选中票据</strong>
          <p>从左侧队列选择一张票据，查看 OCR 字段、流转轨迹和风险明细。</p>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="docs-detail-panel">
      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">票据详情</div>
            <h2>{invoice.title}</h2>
          </div>
          <div className="docs-detail-amount">
            <span>{viewLabel(activeView)}</span>
            <strong>{formatCurrency(invoice.amount)}</strong>
          </div>
        </div>

        <p className="docs-detail-copy">{invoice.statusSummary}</p>

        <div className="docs-tag-row">
          <Tag theme="primary" variant="light-outline">
            {invoice.id}
          </Tag>
          <Tag theme="default" variant="light-outline">
            {stageLabel(invoice.stage)}
          </Tag>
          <Tag theme="warning" variant="light-outline">
            {priorityLabel(invoice.priority)}
          </Tag>
          <Tag theme={invoice.riskLevel === "high" ? "danger" : invoice.riskLevel === "medium" ? "warning" : "success"} variant="light-outline">
            {invoice.riskLevel}
          </Tag>
        </div>

        <Descriptions
          bordered={false}
          column={2}
          items={[
            { label: "销方", content: invoice.vendor },
            { label: "来源文件", content: invoice.fileName },
            { label: "开票日期", content: invoice.issueDate },
            { label: "SLA 时点", content: invoice.dueDate }
          ]}
        />
      </Card>

      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">业务标签</div>
            <h3>协作字段与风险标记</h3>
          </div>
        </div>

        <div className="docs-tag-row">
          {invoice.tags.map((tag) => (
            <Tag key={tag} variant="light-outline">
              {tag}
            </Tag>
          ))}
          {invoice.riskTags.length > 0 ? (
            invoice.riskTags.map((tag) => (
              <Tag
                key={tag}
                theme="danger"
                variant={
                  highlightedTag && tag.toLowerCase().includes(highlightedTag.toLowerCase()) ? "dark" : "light-outline"
                }
              >
                {tag}
              </Tag>
            ))
          ) : (
            <Tag variant="light-outline">暂无风险标签</Tag>
          )}
        </div>
      </Card>

      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">OCR 识别结果</div>
            <h3>字段置信度</h3>
          </div>
          <Tag theme="primary" variant="light-outline">
            {invoice.ocr.provider}
          </Tag>
        </div>

        <div className="docs-ocr-grid">
          {invoice.ocr.fields.map((field) => (
            <div key={field.key} className="docs-ocr-item">
              <div className="docs-ocr-item__header">
                <span>{field.label}</span>
                <strong>{Math.round(field.confidence * 100)}%</strong>
              </div>
              <p>{field.value}</p>
              <Progress percentage={Math.round(field.confidence * 100)} />
            </div>
          ))}
        </div>
      </Card>

      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">流转时间线</div>
            <h3>系统动作与客服操作记录</h3>
          </div>
        </div>

        <Timeline mode="same">
          {invoice.workflow.map((event) => (
            <Timeline.Item key={event.id} label={event.at}>
              <div className="docs-timeline-item">
                <strong>{event.action}</strong>
                <p>{event.note}</p>
                <span>{event.actor}</span>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </section>
  );
}
