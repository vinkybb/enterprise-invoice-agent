import { NextResponse } from "next/server";

import { buildCopilotPlan } from "@/lib/copilot";
import { applyCopilotPlan, getInvoices, getWorkspaceSnapshot } from "@/lib/store";
import { CopilotResponse, UiContext } from "@/lib/types";

export const runtime = "nodejs";

function defaultContext(): UiContext {
  return {
    activeView: "commandCenter",
    selectedInvoiceId: null,
    stageFilter: "all",
    highlightedTag: null
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { command?: string; context?: UiContext };
  const command = body.command?.trim();

  if (!command) {
    return NextResponse.json({ error: "请输入需要执行的客服指令。" }, { status: 400 });
  }

  const plan = buildCopilotPlan(command, body.context ?? defaultContext(), getInvoices());
  const response: CopilotResponse = {
    plan,
    snapshot: plan.steps.length > 0 ? applyCopilotPlan(plan) : getWorkspaceSnapshot()
  };

  return NextResponse.json(response);
}
