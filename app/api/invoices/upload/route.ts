import { NextResponse } from "next/server";

import { runOcrPipeline } from "@/lib/ocr";
import { createInvoiceFromUpload, getWorkspaceSnapshot } from "@/lib/store";
import { UploadResponse } from "@/lib/types";

const SUPPORTED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

function resolveFileType(file: File): string {
  if (file.type) {
    return file.type;
  }

  if (file.name.toLowerCase().endsWith(".pdf")) {
    return "application/pdf";
  }

  return "application/octet-stream";
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload = formData.get("file");

  if (!(payload instanceof File)) {
    return NextResponse.json({ error: "请上传 PDF 或图片文件。" }, { status: 400 });
  }

  const fileType = resolveFileType(payload);

  if (!SUPPORTED_TYPES.has(fileType)) {
    return NextResponse.json({ error: "仅支持 PDF、PNG、JPG、WEBP 文件。" }, { status: 400 });
  }

  const ocr = await runOcrPipeline(payload);
  const createdInvoice = createInvoiceFromUpload(
    {
      name: payload.name,
      type: fileType
    },
    ocr
  );

  const response: UploadResponse = {
    snapshot: getWorkspaceSnapshot(),
    createdInvoice,
    focusInvoiceId: createdInvoice.id
  };

  return NextResponse.json(response);
}
