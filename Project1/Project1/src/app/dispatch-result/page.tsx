"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

type Status = "CONFIRMED" | "HOLDING" | "UNDISPATCHED" | "ADDITIONAL";

const STATUS_CONFIG: Record<Status, {
  label: string; color: string; bg: string; icon: string; desc: string; detail?: string;
}> = {
  CONFIRMED: {
    label: "배차 확정", color: "#00C471", bg: "#E8FAF2",
    icon: "✅", desc: "배차가 확정됐어요!\n오늘 배송 준비를 시작해주세요.",
    detail: "강남구 일대 · 예상 32건",
  },
  HOLDING: {
    label: "배차 후보", color: "#FFB800", bg: "#FFF8E7",
    icon: "⏳", desc: "현재 배차 후보 상태예요.\n추가 배정 시 바로 알림을 드려요.",
  },
  UNDISPATCHED: {
    label: "미배차", color: "#FF3B30", bg: "#FFF0EE",
    icon: "😔", desc: "이번 배차에서 아쉽게 탈락했어요.\n다음 기회에 다시 신청해주세요!",
  },
  ADDITIONAL: {
    label: "추가 배차", color: "#007AFF", bg: "#EBF4FF",
    icon: "🎉", desc: "추가 배차가 확정됐어요!\n새로 배정된 클러스터를 확인하세요.",
    detail: "서초구 일대 · 예상 28건",
  },
};

const STATUSES: Status[] = ["CONFIRMED", "HOLDING", "UNDISPATCHED", "ADDITIONAL"];

export default function DispatchResultPage() {
  const router = useRouter();
  const [current, setCurrent] = useState<Status>("CONFIRMED");
  const cfg = STATUS_CONFIG[current];

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#111]">
      <div className="w-[375px] min-h-[812px] bg-white flex flex-col">
        <StatusBar />
        <div style={{ height: 44 }} />

        {/* 상태 탭 */}
        <div className="px-4 pb-3 border-b border-border">
          <p className="text-[11px] text-text-caption mb-2 text-center">상태 미리 보기</p>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setCurrent(s)}
                className={`px-3 h-8 rounded-full text-[12px] font-semibold border transition-all ${
                  current === s
                    ? "text-white border-transparent"
                    : "bg-white text-text-caption border-border"
                }`}
                style={current === s ? { backgroundColor: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].color } : {}}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5">
          {/* 상태 카드 */}
          <div
            className="w-full rounded-3xl p-6 flex flex-col items-center mb-6 transition-all duration-300"
            style={{ backgroundColor: cfg.bg }}
          >
            <div className="text-5xl mb-4">{cfg.icon}</div>
            <span
              className="text-[13px] font-bold px-3 py-1 rounded-full text-white mb-3"
              style={{ backgroundColor: cfg.color }}
            >
              {cfg.label}
            </span>
            <p className="text-[16px] font-semibold text-text-primary text-center whitespace-pre-line leading-relaxed">
              {cfg.desc}
            </p>
          </div>

          {/* 배차 정보 (CONFIRMED / ADDITIONAL) */}
          {cfg.detail && (
            <div className="w-full bg-surface rounded-2xl p-5 mb-4 space-y-3">
              <p className="text-[13px] font-semibold text-text-caption">배차 정보</p>
              {[
                { label: "날짜", value: "2026년 6월 3일" },
                { label: "회차", value: "주간" },
                { label: "배송 지역", value: cfg.detail.split("·")[0].trim() },
                { label: "예상 물량", value: cfg.detail.split("·")[1]?.trim() || "" },
                { label: "픽업 시간", value: "PM 18:30 허브 출발" },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between">
                  <span className="text-[14px] text-text-caption">{label}</span>
                  <span className="text-[14px] font-semibold text-text-primary">{value}</span>
                </div>
              ) : null)}
            </div>
          )}

          {/* HOLDING 안내 */}
          {current === "HOLDING" && (
            <div className="w-full bg-[#FFF8E7] rounded-2xl p-4 mb-4 flex gap-3">
              <span className="text-xl flex-shrink-0">🔔</span>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                현재 배차 후보로 등록돼 있어요. 기존 확정자 중 취소가 발생하면 순서대로 배정해드려요.
              </p>
            </div>
          )}

          {/* 미배차 대안 */}
          {current === "UNDISPATCHED" && (
            <div className="w-full bg-[#F7F8FA] rounded-2xl p-4 mb-4">
              <p className="text-[14px] font-semibold text-text-primary mb-2">지금 급건 모집을 확인해보세요</p>
              <p className="text-[13px] text-text-caption mb-3">추가 보상과 함께 바로 신청할 수 있어요</p>
              <button
                onClick={() => router.push("/urgent-list")}
                className="w-full h-10 rounded-xl bg-primary/10 text-primary text-[14px] font-semibold"
              >
                급건 모집 보러가기 →
              </button>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="px-5 pb-1">
          <button
            onClick={() => router.push("/my-dispatch")}
            className="w-full h-[52px] rounded-[14px] bg-primary text-white text-[17px] font-semibold mb-2 active:opacity-80"
          >
            내 배차 현황 보기
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full h-[44px] text-text-caption text-[15px]"
          >
            홈으로
          </button>
          <HomeIndicator />
        </div>
      </div>
    </div>
  );
}
