import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "딜리래빗 — 배송 신청",
  description: "딜리래빗 플렉스 기사 앱 — Dispatch v2.5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
