import type { ReactElement } from "react";
import { Button, Card, Statistic, Tag } from "tdesign-react";
import { ChartIcon, Edit1Icon, FileIcon, TaskIcon } from "tdesign-icons-react";

import { formatCurrency, viewLabel } from "@/lib/presenters";
import { DashboardStat, InvoiceRecord, InvoiceStage, QueueLane, ViewKey } from "@/lib/types";

const VIEW_SWITCHES: Array<{ id: ViewKey; label: string; icon: ReactElement }> = [
  { id: "commandCenter", label: "首页概览", icon: <ChartIcon /> },
  { id: "workspace", label: "票据中心", icon: <FileIcon /> },
  { id: "workflow", label: "流程协同", icon: <TaskIcon /> },
  { id: "audit", label: "风险审计", icon: <Edit1Icon /> }
];

interface OverviewPanelProps {
  activeView: ViewKey;
  stats: DashboardStat[];
  lanes: QueueLane[];
  featuredInvoice: InvoiceRecord | null;
  onViewChange: (view: ViewKey) => void;
  onStageFocus: (stage: InvoiceStage) => void;
}

export function OverviewPanel({
  activeView,
  stats,
  lanes,
  featuredInvoice,
  onViewChange,
  onStageFocus
}: OverviewPanelProps) {
  return (
    <section className="docs-overview">
      <Card bordered={false} className="docs-hero-card">
        <div className="docs-hero-card__main">
          <div>
            <div className="docs-hero-card__eyebrow">像文档一样组织票据协同</div>
            <h2>让上传、识别、复核和审批保持在一条清晰的工作链上</h2>
            <p>
              当前正在查看 {viewLabel(activeView)}。无论是新上传的发票、待复核的字段，还是需要主管确认的异常票据，都能在同一工作区接力处理。
            </p>
          </div>

          <div className="docs-hero-card__actions">
            <div className="docs-tag-row">
              {VIEW_SWITCHES.map((view) => (
                <Button
                  key={view.id}
                  theme={activeView === view.id ? "primary" : "default"}
                  variant={activeView === view.id ? "base" : "outline"}
                  icon={view.icon}
                  onClick={() => onViewChange(view.id)}
                >
                  {view.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="docs-hero-card__aside">
          <div className="docs-focus-card">
            <div className="docs-focus-card__label">当前焦点</div>
            <strong>{featuredInvoice ? featuredInvoice.title : "等待选择票据"}</strong>
            <p>{featuredInvoice ? `${featuredInvoice.id} · ${formatCurrency(featuredInvoice.amount)}` : "选择一张票据后查看详情和时间线。"}</p>
            <div className="docs-tag-row">
              <Tag theme="primary" variant="light-outline">
                {viewLabel(activeView)}
              </Tag>
              {featuredInvoice ? (
                <Tag theme="warning" variant="light-outline">
                  {featuredInvoice.vendor}
                </Tag>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <div className="docs-stat-grid">
        {stats.map((stat) => (
          <Card key={stat.label} bordered={false} className="docs-stat-card">
            <Statistic title={stat.label} value={Number.parseInt(stat.value, 10) || 0} animationStart={false} />
            <div className="docs-stat-card__raw">{stat.value}</div>
            <p>{stat.delta}</p>
          </Card>
        ))}
      </div>

      <div className="docs-lane-grid">
        {lanes.map((lane) => (
          <button key={lane.key} type="button" className="docs-card-button" onClick={() => onStageFocus(lane.key)}>
            <Card bordered={false} className="docs-lane-card">
              <div className="docs-lane-card__topline">
                <span>{lane.label}</span>
                <strong>{lane.count}</strong>
              </div>
              <p>{lane.description}</p>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}
