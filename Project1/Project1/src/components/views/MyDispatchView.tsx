"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "오늘" | "이번 주" | "전체";
type StatusKey = "CONFIRMED" | "HOLDING" | "UNDISPATCHED" | "ADDITIONAL";

const ST: Record<StatusKey, { label: string; color: string; bg: string }> = {
  CONFIRMED:    { label: "배차 확정",  color: "#00C471", bg: "#E8FAF2" },
  HOLDING:      { label: "배차 후보",  color: "#FFB800", bg: "#FFF8E7" },
  UNDISPATCHED: { label: "미배차",     color: "#FF3B30", bg: "#FFF0EE" },
  ADDITIONAL:   { label: "추가 배차",  color: "#007AFF", bg: "#EBF4FF" },
};

const ALL = [
  { id: "1", date: "오늘 (6/3)",  round: 1, sector: "강남구",  type: "urgent" as const,  status: "CONFIRMED" as StatusKey,    volume: 32, cancelable: true  },
  { id: "2", date: "오늘 (6/3)",  round: 2, sector: "송파구",  type: "normal" as const,  status: "HOLDING" as StatusKey,      volume: null, cancelable: true },
  { id: "3", date: "6/1 (일)",    round: 1, sector: "서초구",  type: "normal" as const,  status: "CONFIRMED" as StatusKey,    volume: 28, cancelable: false },
  { id: "4", date: "6/1 (일)",    round: 2, sector: "강동구",  type: "urgent" as const,  status: "ADDITIONAL" as StatusKey,   volume: 19, cancelable: false },
  { id: "5", date: "5/31 (토)",   round: 1, sector: "마포구",  type: "normal" as const,  status: "UNDISPATCHED" as StatusKey, volume: null, cancelable: false },
  { id: "6", date: "5/30 (금)",   round: 1, sector: "용산구",  type: "normal" as const,  status: "CONFIRMED" as StatusKey,    volume: 41, cancelable: false },
];

const TAB_DATA: Record<Tab, typeof ALL> = {
  "오늘":    ALL.slice(0, 2),
  "이번 주": ALL.slice(0, 4),
  "전체":    ALL,
};

export default function MyDispatchView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("오늘");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const items = TAB_DATA[tab];

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative">
      {/* 요약 */}
      <div className="px-4 py-3 bg-[#F7F8FA] border-b border-[#E8E8E8] flex gap-3 text-[13px]">
        <span className="text-[#888]">확정</span>
        <span className="font-bold text-[#6262EE]">
          {items.filter((i) => i.status === "CONFIRMED" || i.status === "ADDITIONAL").length}건
        </span>
        <span className="text-[#E8E8E8]">|</span>
        <span className="text-[#888]">후보</span>
        <span className="font-bold text-[#FFB800]">
          {items.filter((i) => i.status === "HOLDING").length}건
        </span>
      </div>

      {/* 탭 */}
      <div className="flex px-4 gap-5 border-b border-[#E8E8E8]">
        {(["오늘", "이번 주", "전체"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 text-[14px] font-semibold border-b-2 transition-all ${
              tab === t ? "text-[#6262EE] border-[#6262EE]" : "text-[#888] border-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="px-4 pt-3 space-y-3">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-4xl">📋</span>
            <p className="text-[15px] text-[#888]">신청 내역이 없어요</p>
          </div>
        )}

        {items.map((item) => {
          const st = ST[item.status];
          return (
            <div key={item.id} className="bg-white border border-[#E8E8E8] rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] text-[#888]">{item.date}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.round === 1 ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    }`}>
                      {item.round === 1 ? "주간" : "새벽"}
                    </span>
                  </div>
                  <p className="text-[17px] font-bold text-[#1A1A1A]">{item.sector}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: st.color, backgroundColor: st.bg }}>
                    {st.label}
                  </span>
                  {item.type === "urgent" ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#6262EE] text-white">
                      ⚡ 급건
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F2F2F7] text-[#8E8E93]">
                      일반
                    </span>
                  )}
                </div>
              </div>

              {item.volume != null && (
                <div className="flex items-center gap-2 mb-2.5 bg-[#F7F8FA] rounded-xl px-3 py-2">
                  <span className="text-[13px] text-[#888]">예상 물량</span>
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">{item.volume}건</span>
                </div>
              )}

              {item.status === "HOLDING" && (
                <p className="text-[12px] text-[#FFB800] mb-2.5">
                  📋 후보 대기 중 · 취소 발생 시 순서대로 배정돼요
                </p>
              )}

              {item.type === "urgent" ? (
                <div className="w-full h-9 rounded-xl bg-[#F2F2F7] flex items-center justify-center gap-1.5">
                  <span className="text-[13px] text-[#C7C7CC] font-medium">배차 취소 불가</span>
                  <span className="text-[11px] text-[#C7C7CC]">· 급건 확정 건</span>
                </div>
              ) : item.cancelable && (
                <button
                  onClick={() => setCancelId(item.id)}
                  className="w-full h-9 rounded-xl border border-[#FFD0CE] text-[#FF3B30] text-[13px] font-medium"
                >
                  배차 취소
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 취소 모달 */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          style={{ width: 375, left: "50%", transform: "translateX(-50%)" }}>
          <div className="w-full bg-white rounded-t-3xl px-5 pt-6 pb-3">
            <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2 text-center">배차를 취소할까요?</h3>
            <p className="text-[13px] text-[#888] text-center mb-5 leading-relaxed">
              취소 시 페널티가 부과될 수 있어요.<br/>정말 취소하시겠어요?
            </p>
            <div className="flex gap-3 mb-1">
              <button onClick={() => setCancelId(null)}
                className="flex-1 h-12 rounded-[14px] bg-[#F7F8FA] text-[#555] text-[15px] font-semibold">
                돌아가기
              </button>
              <button onClick={() => setCancelId(null)}
                className="flex-1 h-12 rounded-[14px] bg-[#FF3B30] text-white text-[15px] font-semibold">
                취소할게요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
