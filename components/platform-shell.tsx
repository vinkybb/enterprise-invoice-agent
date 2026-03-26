"use client";

import { startTransition, useEffect, useState, type ReactElement } from "react";
import { Avatar, Button, Card, Input, Layout, Menu, Space, Tag } from "tdesign-react";
import {
  AppIcon,
  ChatIcon,
  ChartIcon,
  DataBaseIcon,
  FileIcon,
  SearchIcon,
  SettingIcon,
  TaskIcon
} from "tdesign-icons-react";

import { CopilotConsole } from "@/components/copilot-console";
import { InvoiceDetail } from "@/components/invoice-detail";
import { OverviewPanel } from "@/components/overview-panel";
import { UploadWorkspace } from "@/components/upload-workspace";
import { WorkflowBoard } from "@/components/workflow-board";
import { viewLabel } from "@/lib/presenters";
import {
  CopilotMessage,
  CopilotResponse,
  ExecutionStep,
  StageFilter,
  UploadResponse,
  UiContext,
  ViewKey,
  WorkspaceSnapshot
} from "@/lib/types";

interface PlatformShellProps {
  initialSnapshot: WorkspaceSnapshot;
  initialView?: ViewKey;
  initialStageFilter?: StageFilter;
  initialSelectedInvoiceId?: string | null;
  initialHighlightedTag?: string | null;
  initialMessages?: CopilotMessage[];
  initialExecutionSteps?: ExecutionStep[];
  modeLabel?: string;
  initialUploadPreview?: UploadResponse | null;
}

const NAV_ITEMS: Array<{
  id: ViewKey;
  title: string;
  desc: string;
  icon: ReactElement;
}> = [
  { id: "commandCenter", title: "首页概览", desc: "今日待办、自动化与风险总览", icon: <AppIcon /> },
  { id: "workspace", title: "票据中心", desc: "接收 PDF / 图片并触发 OCR", icon: <FileIcon /> },
  { id: "workflow", title: "流程协同", desc: "复核、审批、归档一屏处理", icon: <TaskIcon /> },
  { id: "audit", title: "风险审计", desc: "重复报销、税码与异常追踪", icon: <ChartIcon /> }
];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function PlatformShell({
  initialSnapshot,
  initialView = "commandCenter",
  initialStageFilter = "all",
  initialSelectedInvoiceId,
  initialHighlightedTag = null,
  initialMessages,
  initialExecutionSteps = [],
  modeLabel = "腾讯文档风格协同控制台",
  initialUploadPreview = null
}: PlatformShellProps) {
  const [workspace, setWorkspace] = useState(initialSnapshot);
  const [activeView, setActiveView] = useState<ViewKey>(initialView);
  const [stageFilter, setStageFilter] = useState<StageFilter>(initialStageFilter);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialSelectedInvoiceId ?? initialSnapshot.invoices[0]?.id ?? null);
  const [highlightedTag, setHighlightedTag] = useState<string | null>(initialHighlightedTag);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(initialExecutionSteps);
  const [isExecuting, setIsExecuting] = useState(false);

  const visibleInvoices =
    stageFilter === "all" ? workspace.invoices : workspace.invoices.filter((invoice) => invoice.stage === stageFilter);
  const selectedInvoice =
    workspace.invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? visibleInvoices[0] ?? workspace.invoices[0] ?? null;

  useEffect(() => {
    if (!selectedInvoiceId && workspace.invoices[0]) {
      setSelectedInvoiceId(workspace.invoices[0].id);
    }
  }, [selectedInvoiceId, workspace.invoices]);

  useEffect(() => {
    if (selectedInvoiceId && !workspace.invoices.some((invoice) => invoice.id === selectedInvoiceId)) {
      setSelectedInvoiceId(workspace.invoices[0]?.id ?? null);
    }
  }, [selectedInvoiceId, workspace.invoices]);

  function handleViewChange(view: ViewKey) {
    setActiveView(view);

    if (view !== "audit") {
      setHighlightedTag(null);
    }

    if (view === "workflow" && stageFilter === "all") {
      const firstPending = workspace.invoices.find((invoice) => invoice.stage !== "archived");
      if (firstPending) {
        setSelectedInvoiceId(firstPending.id);
      }
    }
  }

  function handleStageFilterChange(filter: StageFilter) {
    setStageFilter(filter);

    if (filter !== "all") {
      const firstMatch = workspace.invoices.find((invoice) => invoice.stage === filter);
      if (firstMatch) {
        setSelectedInvoiceId(firstMatch.id);
      }
    }
  }

  function handleUploaded(payload: UploadResponse) {
    startTransition(() => {
      setWorkspace(payload.snapshot);
    });
    setActiveView("workspace");
    setStageFilter("all");
    setSelectedInvoiceId(payload.focusInvoiceId);
    setHighlightedTag(null);
  }

  async function handlePlanResolved(response: CopilotResponse) {
    setIsExecuting(true);
    setExecutionSteps(
      response.plan.steps.map((step) => ({
        id: step.id,
        label: step.label,
        description: step.description,
        status: "pending"
      }))
    );

    if (response.plan.steps.length === 0) {
      startTransition(() => {
        setWorkspace(response.snapshot);
      });
      setIsExecuting(false);
      return;
    }

    for (const step of response.plan.steps) {
      setExecutionSteps((current) =>
        current.map((item) => (item.id === step.id ? { ...item, status: "running" } : item))
      );

      if (step.type === "navigate") {
        setActiveView(step.payload.view as ViewKey);
      }

      if (step.type === "apply_filter") {
        setStageFilter(step.payload.stage as StageFilter);
      }

      if (step.type === "focus_invoice") {
        setSelectedInvoiceId(step.payload.invoiceId);
      }

      if (step.type === "highlight_risk") {
        setActiveView("audit");
        setHighlightedTag(step.payload.tag);
      }

      if (step.type === "open_upload") {
        setActiveView("workspace");
      }

      if (step.type === "advance_stage" || step.type === "append_note") {
        setSelectedInvoiceId(step.payload.invoiceId);
      }

      await wait(220);

      setExecutionSteps((current) =>
        current.map((item) => (item.id === step.id ? { ...item, status: "done" } : item))
      );
    }

    startTransition(() => {
      setWorkspace(response.snapshot);
    });
    setIsExecuting(false);
  }

  const context: UiContext = {
    activeView,
    selectedInvoiceId,
    stageFilter,
    highlightedTag
  };

  return (
    <Layout className="docs-shell">
      <Layout.Header className="docs-topbar">
        <div className="docs-topbar__brand">
          <div className="docs-topbar__mark">票</div>
          <div>
            <div className="docs-topbar__title">Vinky Docs Invoice</div>
            <div className="docs-topbar__subtitle">{modeLabel}</div>
          </div>
        </div>

        <div className="docs-topbar__search">
          <Input
            clearable
            prefixIcon={<SearchIcon />}
            placeholder="搜索票据编号、供应商、合同号或风险标签"
            size="large"
          />
        </div>

        <Space size="small">
          <Tag theme="primary" variant="light-outline">
            OCR Provider 在线
          </Tag>
          <Tag theme="success" variant="light-outline">
            自动操作已启用
          </Tag>
          <Button theme="default" variant="outline" icon={<SettingIcon />}>
            流程设置
          </Button>
          <Button theme="primary" icon={<DataBaseIcon />} onClick={() => handleViewChange("workspace")}>
            新建上传
          </Button>
          <Avatar size="40px">VK</Avatar>
        </Space>
      </Layout.Header>

      <Layout>
        <Layout.Aside className="docs-sidebar">
          <Card bordered={false} className="docs-brand-card">
            <div className="docs-brand-card__title">企业票据协同空间</div>
            <p>像腾讯文档一样把协作、处理、追踪放在同一处，今天的待办和自动流转建议会自动同步。</p>
          </Card>

          <Menu theme="light" value={activeView} onChange={(value) => handleViewChange(value as ViewKey)} width="100%">
            {NAV_ITEMS.map((item) => (
              <Menu.MenuItem key={item.id} value={item.id} icon={item.icon}>
                <div className="docs-menu-item">
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </Menu.MenuItem>
            ))}
          </Menu>

          <Card bordered={false} className="docs-side-note">
            <div className="docs-side-note__label">今日协作建议</div>
            <ul>
              <li>优先处理高风险和临近 SLA 的票据</li>
              <li>客服助手适合执行筛选、打开、推进和备注</li>
              <li>上传区支持 PDF、截图和拍照件混合接收</li>
            </ul>
          </Card>
        </Layout.Aside>

        <Layout.Content className="docs-content">
          <div className="docs-content__header">
            <div>
              <div className="docs-breadcrumb">票据协同空间 / {viewLabel(activeView)}</div>
              <h1>{viewLabel(activeView)}</h1>
              <p>统一查看 OCR 识别、流程流转和客服自动操作，减少重复切页与人工录入。</p>
            </div>
            <Space size="small">
              <Tag theme="warning" variant="light-outline">
                当前票据 {selectedInvoice ? selectedInvoice.id : "未选中"}
              </Tag>
              <Tag theme="default" variant="light-outline">
                总量 {workspace.invoices.length}
              </Tag>
            </Space>
          </div>

          <OverviewPanel
            activeView={activeView}
            stats={workspace.stats}
            lanes={workspace.lanes}
            featuredInvoice={selectedInvoice}
            onViewChange={handleViewChange}
            onStageFocus={(stage) => {
              setActiveView("workflow");
              handleStageFilterChange(stage);
            }}
          />

          <div className="docs-content-grid">
            <section className="docs-content-grid__main">
              {activeView === "workspace" ? (
                <UploadWorkspace onUploaded={handleUploaded} initialPreview={initialUploadPreview} />
              ) : null}
              <WorkflowBoard
                activeView={activeView}
                lanes={workspace.lanes}
                invoices={visibleInvoices}
                selectedInvoiceId={selectedInvoiceId}
                stageFilter={stageFilter}
                highlightedTag={highlightedTag}
                onSelectInvoice={setSelectedInvoiceId}
                onStageFilterChange={handleStageFilterChange}
              />
            </section>

            <aside className="docs-content-grid__side">
              <InvoiceDetail invoice={selectedInvoice} activeView={activeView} highlightedTag={highlightedTag} />
              <CopilotConsole
                context={context}
                isExecuting={isExecuting}
                executionSteps={executionSteps}
                onPlanResolved={handlePlanResolved}
                initialMessages={initialMessages}
              />
            </aside>
          </div>

          <Card bordered={false} className="docs-footer-card">
            <Space size="small" align="center">
              <ChatIcon />
              <span>客服自动操作接口采用 allowlist 动作桥接，只执行页面切换、筛选、聚焦、流转和备注这类安全动作。</span>
            </Space>
          </Card>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
