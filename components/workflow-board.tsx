import { Alert, Button, Card, Table, Tag } from "tdesign-react";

import { formatCurrency, priorityLabel, stageLabel } from "@/lib/presenters";
import { InvoiceRecord, QueueLane, StageFilter, ViewKey } from "@/lib/types";

interface WorkflowBoardProps {
  activeView: ViewKey;
  lanes: QueueLane[];
  invoices: InvoiceRecord[];
  selectedInvoiceId: string | null;
  stageFilter: StageFilter;
  highlightedTag: string | null;
  onSelectInvoice: (invoiceId: string) => void;
  onStageFilterChange: (stage: StageFilter) => void;
}

function boardTitle(view: ViewKey): { title: string; copy: string } {
  switch (view) {
    case "workspace":
      return {
        title: "识别后待办队列",
        copy: "新上传的票据会直接出现在这里，客服助手也会优先从该队列选择第一张待处理票据。"
      };
    case "workflow":
      return {
        title: "流程流转队列",
        copy: "按阶段查看当前票据积压，支持客服助手自动打开、推进和写入备注。"
      };
    case "audit":
      return {
        title: "审计与风险聚焦",
        copy: "高亮风险标签后，队列会优先展示需要人工确认的票据。"
      };
    default:
      return {
        title: "企业票据运营看板",
        copy: "这里汇总各阶段的票据运行状态，便于快速定位当日需要处理的核心事项。"
      };
  }
}

export function WorkflowBoard({
  activeView,
  lanes,
  invoices,
  selectedInvoiceId,
  stageFilter,
  highlightedTag,
  onSelectInvoice,
  onStageFilterChange
}: WorkflowBoardProps) {
  const filters: Array<{ value: StageFilter; label: string }> = [
    { value: "all", label: "全部" },
    ...lanes.map((lane) => ({ value: lane.key, label: lane.label }))
  ];
  const copy = boardTitle(activeView);
  const tableData = invoices.map((invoice) => ({
    ...invoice,
    amountLabel: formatCurrency(invoice.amount),
    stageLabel: stageLabel(invoice.stage),
    priorityLabel: priorityLabel(invoice.priority)
  }));
  const columns = [
    {
      colKey: "title",
      title: "票据主题",
      width: 320,
      cell: ({ row }: { row: InvoiceRecord }) => (
        <div className="docs-table-title">
          <strong>{row.title}</strong>
          <p>{row.statusSummary}</p>
        </div>
      )
    },
    {
      colKey: "vendor",
      title: "销方 / 来源",
      width: 220,
      cell: ({ row }: { row: InvoiceRecord }) => (
        <div className="docs-table-secondary">
          <span>{row.vendor}</span>
          <span>{row.fileName}</span>
        </div>
      )
    },
    {
      colKey: "amount",
      title: "金额",
      width: 140,
      cell: ({ row }: { row: InvoiceRecord }) => <strong>{formatCurrency(row.amount)}</strong>
    },
    {
      colKey: "stage",
      title: "阶段",
      width: 140,
      cell: ({ row }: { row: InvoiceRecord }) => (
        <Tag theme="primary" variant="light-outline">
          {stageLabel(row.stage)}
        </Tag>
      )
    },
    {
      colKey: "priority",
      title: "优先级",
      width: 120,
      cell: ({ row }: { row: InvoiceRecord }) => (
        <Tag
          theme={row.priority === "critical" || row.priority === "high" ? "warning" : "default"}
          variant="light-outline"
        >
          {priorityLabel(row.priority)}
        </Tag>
      )
    },
    {
      colKey: "riskLevel",
      title: "风险",
      width: 120,
      cell: ({ row }: { row: InvoiceRecord }) => (
        <Tag
          theme={row.riskLevel === "high" ? "danger" : row.riskLevel === "medium" ? "warning" : "success"}
          variant="light-outline"
        >
          {row.riskLevel}
        </Tag>
      )
    }
  ];
  const alertMessage =
    activeView === "workflow"
      ? "智能客服适合做打开票据、切换筛选、推进到下一阶段和写入备注。"
      : activeView === "audit"
        ? "风险审计视图会优先高亮异常标签，适合主管快速批量扫查。"
        : "首页会把今天最值得优先处理的票据排在前面。";

  return (
    <section className="docs-board-panel">
      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">票据队列</div>
            <h2>{copy.title}</h2>
          </div>
          <p>{copy.copy}</p>
        </div>

        <Alert theme="info" message={alertMessage} />

        <div className="docs-filter-row">
          <div className="docs-tag-row">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                theme={stageFilter === filter.value ? "primary" : "default"}
                variant={stageFilter === filter.value ? "base" : "outline"}
                onClick={() => onStageFilterChange(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="docs-lane-inline">
          {lanes.map((lane) => (
            <div key={lane.key} className="docs-lane-inline__item">
              <span>{lane.label}</span>
              <strong>{lane.count}</strong>
            </div>
          ))}
        </div>

        {invoices.length > 0 ? (
          <Table
            rowKey="id"
            hover
            stripe
            bordered={false}
            columns={columns}
            data={tableData}
            onRowClick={({ row }) => onSelectInvoice(row.id)}
            rowClassName={({ row }) => {
              const base =
                row.id === selectedInvoiceId ? "docs-table-row docs-table-row--selected" : "docs-table-row";
              const highlighted =
                highlightedTag !== null &&
                [...row.riskTags, ...row.tags].some((tag) => tag.toLowerCase().includes(highlightedTag.toLowerCase()));

              return highlighted ? `${base} docs-table-row--highlight` : base;
            }}
          />
        ) : (
          <div className="docs-empty-card">
            <strong>当前筛选条件下没有票据</strong>
            <p>可以切换阶段，或者去票据中心上传新的 PDF / 图片。</p>
          </div>
        )}
      </Card>

      <Card bordered={false} className="docs-section-card docs-section-card--compact">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">处理建议</div>
            <h3>适合直接交给客服助手的动作</h3>
          </div>
        </div>

        <ul className="docs-hint-list">
          <li>切到流程协同，只看财务复核，打开第一条待处理票据</li>
          <li>把当前票据推进到主管审批，并备注税码已确认</li>
          <li>去风险审计，把高风险票据高亮出来</li>
        </ul>
      </Card>
    </section>
  );
}
