"use client";

import { FormEvent, useState } from "react";
import { Alert, Button, Card, Space, Tag, Textarea, Timeline } from "tdesign-react";
import { CaretRightSmallIcon, ChatIcon } from "tdesign-icons-react";

import { suggestedCommands } from "@/lib/copilot";
import { CopilotMessage, CopilotResponse, ExecutionStep, UiContext } from "@/lib/types";

interface CopilotConsoleProps {
  context: UiContext;
  isExecuting: boolean;
  executionSteps: ExecutionStep[];
  onPlanResolved: (response: CopilotResponse) => Promise<void>;
  initialMessages?: CopilotMessage[];
}

const defaultMessages: CopilotMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "我是票据智能客服助手。你可以直接说“切到流程协同，只看财务复核，打开第一条待处理票据”。"
  }
];

export function CopilotConsole({
  context,
  isExecuting,
  executionSteps,
  onPlanResolved,
  initialMessages = defaultMessages
}: CopilotConsoleProps) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>(initialMessages);

  async function submitCommand(command: string) {
    const trimmed = command.trim();

    if (!trimmed) {
      return;
    }

    setDraft("");
    setIsSubmitting(true);
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", content: trimmed }]);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          command: trimmed,
          context
        })
      });

      const payload = (await response.json()) as CopilotResponse | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "客服助手暂时无法执行这条指令。");
      }

      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", content: payload.plan.assistantMessage }
      ]);
      await onPlanResolved(payload);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "客服助手执行失败，请稍后再试。"
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCommand(draft);
  }

  return (
    <section className="docs-copilot-panel">
      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">智能客服助手</div>
            <h2>对话式操作入口</h2>
          </div>
          <Tag theme="primary" variant="light-outline">
            {context.activeView} / {context.stageFilter}
          </Tag>
        </div>

        <Alert
          theme="success"
          title="适合自动执行的动作"
          message="页面切换、阶段筛选、打开票据、推进流转、补写备注。"
        />

        <div className="docs-command-list">
          {suggestedCommands.map((command) => (
            <Button
              key={command}
              type="button"
              variant="outline"
              className="docs-command-button"
              onClick={() => void submitCommand(command)}
            >
              {command}
            </Button>
          ))}
        </div>

        <div className="docs-chat-log">
          {messages.map((message) => (
            <article key={message.id} className={`docs-chat-bubble docs-chat-bubble--${message.role}`}>
              <div className="docs-chat-bubble__role">{message.role === "assistant" ? "助手" : "你"}</div>
              <p>{message.content}</p>
            </article>
          ))}
        </div>

        <form className="docs-chat-form" onSubmit={handleSubmit}>
          <Textarea
            placeholder="例如：切到流程协同，只看财务复核，打开第一条待处理票据"
            value={draft}
            onChange={(value) => setDraft(String(value))}
            disabled={isSubmitting || isExecuting}
            autosize={{ minRows: 3, maxRows: 5 }}
          />
          <div className="docs-chat-form__actions">
            <Space>
              <Tag variant="light-outline">当前票据 {context.selectedInvoiceId ?? "未选择"}</Tag>
            </Space>
            <Button theme="primary" type="submit" loading={isSubmitting || isExecuting} icon={<ChatIcon />}>
              发送指令
            </Button>
          </div>
        </form>
      </Card>

      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">动作回放</div>
            <h3>Allowlist 自动执行链</h3>
          </div>
        </div>

        {executionSteps.length > 0 ? (
          <Timeline mode="same">
            {executionSteps.map((step) => (
              <Timeline.Item key={step.id} dot={<CaretRightSmallIcon />}>
                <div className={`docs-execution-item docs-execution-item--${step.status}`}>
                  <strong>{step.label}</strong>
                  <p>{step.description}</p>
                  <span>{step.status}</span>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <div className="docs-empty-card">
            <strong>等待下一条客服指令</strong>
            <p>收到指令后，这里会显示页面切换和流转动作链。</p>
          </div>
        )}
      </Card>
    </section>
  );
}
