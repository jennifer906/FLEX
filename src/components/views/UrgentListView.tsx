"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type RoundFilter = "전체" | "주간" | "새벽";

const POSTS = [
  { id: "1", date: "오늘", day: "화", round: 1, sector: "강남구",  total: 5, filled: 2, deadline: "18:00", promo: 3000, status: "hot"  },
  { id: "2", date: "오늘", day: "화", round: 1, sector: "서초구",  total: 3, filled: 1, deadline: "18:00", promo: 2000, status: "open" },
  { id: "3", date: "오늘", day: "화", round: 2, sector: "송파구",  total: 4, filled: 3, deadline: "21:30", promo: 4000, status: "hot"  },
  { id: "4", date: "내일", day: "수", round: 1, sector: "강동구",  total: 6, filled: 4, deadline: "18:00", promo: 2500, status: "open" },
  { id: "5", date: "내일", day: "수", round: 2, sector: "마포구",  total: 3, filled: 3, deadline: "21:30", promo: 0,    status: "filled"},
  { id: "6", date: "6/5", day: "목", round: 1, sector: "용산구",  total: 2, filled: 0, deadline: "18:00", promo: 2000, status: "open" },
];

const BADGE: Record<string, { label: string; color: string; bg: string }> = {
  hot:    { label: "마감 임박", color: "#FF3B30", bg: "#FFF0EE" },
  open:   { label: "모집중",   color: "#00C471", bg: "#E8FAF2" },
  filled: { label: "마감",     color: "#888",    bg: "#F0F0F0" },
};

export default function UrgentListView() {
  const router = useRouter();
  const [filter, setFilter] = useState<RoundFilter>("전체");

  const filtered = POSTS.filter((p) => {
    if (filter === "주간") return p.round === 1;
    if (filter === "새벽") return p.round === 2;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* 프로모션 배너 */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-[#6262EE] to-[#6979F8] rounded-2xl px-4 py-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">🔥 긴급 구인</span>
        </div>
        <p className="text-white text-[15px] font-bold">지금 신청하면 추가 보상!</p>
        <p className="text-white/75 text-[12px] mt-0.5">기사 부족 지역에 합류해보세요</p>
      </div>

      {/* 필터 */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        {(["전체", "주간", "새벽"] as RoundFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 h-8 rounded-full text-[13px] font-medium border transition-all ${
              filter === f
                ? "bg-[#6262EE] text-white border-[#6262EE]"
                : "bg-white text-[#555] border-[#E8E8E8]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 카드 목록 */}
      <div className="px-4 space-y-3 pt-1">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-4xl">📭</span>
            <p className="text-[15px] text-[#888]">현재 진행 중인 급건 모집이 없어요</p>
          </div>
        )}

        {filtered.map((post) => {
          const badge = BADGE[post.status];
          const remain = post.total - post.filled;
          const isFilled = post.status === "filled";

          return (
            <button
              key={post.id}
              onClick={() => !isFilled && router.push(`/urgent-detail?id=${post.id}`)}
              className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.98] ${
                isFilled ? "bg-[#F7F8FA] border-[#E8E8E8] opacity-60" : "bg-white border-[#E8E8E8] shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] text-[#888]">{post.date} ({post.day})</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      post.round === 1 ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    }`}>
                      {post.round === 1 ? "주간" : "새벽"}
                    </span>
                  </div>
                  <p className="text-[17px] font-bold text-[#1A1A1A]">{post.sector}</p>
                </div>
                <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ color: badge.color, backgroundColor: badge.bg }}>
                  {badge.label}
                </span>
              </div>

              {/* 프로그레스 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-[#F0F0F0] rounded-full h-1.5">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${(post.filled / post.total) * 100}%`,
                      backgroundColor: post.status === "hot" ? "#FF3B30" : post.status === "filled" ? "#888" : "#00C471",
                    }}
                  />
                </div>
                <span className="text-[12px] text-[#888] flex-shrink-0">{remain}자리 남음</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] text-[#888]">마감</span>
                    <span className="text-[13px] font-semibold text-[#1A1A1A]">{post.deadline}</span>
                  </div>
                  {post.promo > 0 && (
                    <span className="text-[13px] font-bold text-[#FF6B00]">
                      +{post.promo.toLocaleString()}원
                    </span>
                  )}
                </div>
                {!isFilled && (
                  <div className="flex items-center gap-1 text-[#6262EE]">
                    <span className="text-[13px] font-semibold">신청하기</span>
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                      <path d="M1 1L5 5L1 9" stroke="#6262EE" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
