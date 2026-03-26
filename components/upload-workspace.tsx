"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Alert, Button, Card, Progress, Space, Tag } from "tdesign-react";
import { CloudUploadIcon, FileIcon } from "tdesign-icons-react";

import { formatCurrency } from "@/lib/presenters";
import { UploadResponse } from "@/lib/types";

interface UploadWorkspaceProps {
  onUploaded: (response: UploadResponse) => void;
  initialPreview?: UploadResponse | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadWorkspace({ onUploaded, initialPreview = null }: UploadWorkspaceProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(initialPreview);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setError(null);
  }

  async function handleUpload() {
    if (!file) {
      setError("请先选择一张票据文件。");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/invoices/upload", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as UploadResponse | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "上传失败，请稍后再试。");
      }

      setLastUpload(payload);
      onUploaded(payload);
      setFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败，请稍后再试。");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="docs-upload-panel">
      <Card bordered={false} className="docs-section-card">
        <div className="docs-section-heading">
          <div>
            <div className="docs-section-heading__eyebrow">票据接收区</div>
            <h2>上传 PDF 或图片</h2>
          </div>
          <p>支持财务邮箱转入、截图上传和扫描件补录。识别后会自动落到票据队列。</p>
        </div>

        <Alert
          theme="info"
          title="上传后会自动处理"
          message="OCR 提取 -> 字段归一化 -> 阶段入池 -> 客服助手可继续执行页面和流程动作。"
        />

        <div className="docs-upload-dropzone" onClick={() => inputRef.current?.click()} role="button" tabIndex={0}>
          <input
            ref={inputRef}
            id="invoice-upload"
            className="docs-upload-input"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
        />
          <CloudUploadIcon size="32px" />
          <div>
            <strong>拖入票据文件，或点击选择本地 PDF / 图片</strong>
            <p>这里保持像腾讯文档一样的轻协作感，但底层是票据识别与流转系统。</p>
          </div>
        </div>

        <div className="docs-upload-meta">
          <div className="docs-upload-meta__file">
            <div className="docs-upload-meta__icon">
              <FileIcon />
            </div>
            <div>
              <strong>{file ? file.name : "尚未选择文件"}</strong>
              <p>{file ? `${file.type || "未知类型"} · ${formatBytes(file.size)}` : "支持发票 PDF、截图、拍照件和扫描件。"}</p>
            </div>
          </div>

          <Space>
            <Tag theme="primary" variant="light-outline">
              PDF / PNG / JPG / WEBP
            </Tag>
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              选择文件
            </Button>
            <Button theme="primary" loading={isUploading} disabled={!file || isUploading} onClick={handleUpload}>
              上传并识别
            </Button>
          </Space>
        </div>

        {error ? <p className="docs-inline-error">{error}</p> : null}

        {lastUpload ? (
          <div className="docs-upload-result">
            <div className="docs-upload-result__summary">
              <div>
                <div className="docs-section-heading__eyebrow">最新识别结果</div>
                <h3>{lastUpload.createdInvoice.title}</h3>
                <p>{lastUpload.createdInvoice.ocr.summary}</p>
              </div>
              <Tag theme="success" variant="light-outline">
                已入池 {lastUpload.createdInvoice.id}
              </Tag>
            </div>

            <div className="docs-upload-result__stats">
              <div className="docs-upload-kpi">
                <span>识别置信度</span>
                <strong>{Math.round(lastUpload.createdInvoice.ocr.confidence * 100)}%</strong>
              </div>
              <div className="docs-upload-kpi">
                <span>识别金额</span>
                <strong>{formatCurrency(lastUpload.createdInvoice.amount)}</strong>
              </div>
              <div className="docs-upload-kpi">
                <span>进入阶段</span>
                <strong>{lastUpload.createdInvoice.statusSummary}</strong>
              </div>
            </div>

            <div className="docs-ocr-grid">
              {lastUpload.createdInvoice.ocr.fields.slice(0, 6).map((field) => (
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
          </div>
        ) : null}
      </Card>
    </section>
  );
}
