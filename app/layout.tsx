import type { Metadata } from "next";
import "@/app/globals.css";
import "tdesign-react/es/style/index.css";

export const metadata: Metadata = {
  title: "Enterprise Invoice Agent",
  description: "企业票据管理平台，支持 OCR 识别、流程流转与智能客服自动操作。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
