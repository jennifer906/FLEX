"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

type RoundFilter = "전체" | "1회차" | "2회차";

interface Post {
  id: string;
  date: string;
  rawDate: string;
  day: string;
  round: 1 | 2;
  area: string;
  sector: string;
  unitArrivedCount: number; // UNITARRIVED 상태 박스 수
  totalPay: number;
}

const AREAS: Record<string, string[]> = {
  "서울": [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
    "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구",
    "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구",
    "종로구", "중구", "중랑구",
  ],
  "경기": [
    "고양시 덕양구", "고양시 일산동구", "고양시 일산서구",
    "광명시", "구리시", "군포시", "김포시", "남양주시", "부천시", "과천시",
    "성남시 수정구", "성남시 중원구", "성남시 분당구",
    "수원시 권선구", "수원시 영통구", "수원시 장안구", "수원시 팔달구",
    "시흥시", "안산시 단원구", "안산시 상록구",
    "안양시 동안구", "안양시 만안구",
    "양주시", "의정부시",
    "용인시 기흥구", "용인시 수지구",
    "파주시", "하남시", "화성시",
  ],
  "인천": [
    "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구",
  ],
  "대전": [
    "대덕구", "동구", "서구", "유성구", "중구",
  ],
  "충남": [
    "천안시", "아산시",
  ],
  "충북": [
    "청주시 상당구", "청주시 서원구", "청주시 청원구", "청주시 흥덕구",
  ],
};

const POSTS: Post[] = [
  { id: "1", date: "오늘",  rawDate: "2026-06-09", day: "화", round: 1, area: "서울", sector: "강남구", unitArrivedCount: 3, totalPay: 85000 },
  { id: "2", date: "오늘",  rawDate: "2026-06-09", day: "화", round: 1, area: "서울", sector: "서초구", unitArrivedCount: 5, totalPay: 72000 },
  { id: "3", date: "오늘",  rawDate: "2026-06-09", day: "화", round: 2, area: "서울", sector: "송파구", unitArrivedCount: 2, totalPay: 95000 },
  { id: "4", date: "내일",  rawDate: "2026-06-10", day: "수", round: 1, area: "서울", sector: "강동구", unitArrivedCount: 2, totalPay: 78000 },
  { id: "5", date: "내일",  rawDate: "2026-06-10", day: "수", round: 2, area: "서울", sector: "마포구", unitArrivedCount: 0, totalPay: 88000 },
  { id: "6", date: "6/11", rawDate: "2026-06-11", day: "목", round: 1, area: "경기", sector: "부천시", unitArrivedCount: 1, totalPay: 68000 },
];

// 데모: 이미 배차 신청한 날짜+회차 → 해당 긴급 구인 미노출 (오늘 2회차 신청 완료)
const MY_DISPATCH_APPLIED = [
  { rawDate: "2026-06-09", round: 2 },
];

function deriveStatus(post: Post): "hot" | "open" | "filled" {
  if (post.unitArrivedCount === 0) return "filled";
  if (post.unitArrivedCount <= 2) return "hot";
  return "open";
}

const BADGE: Record<string, { label: string; color: string; bg: string }> = {
  hot:  { label: "마감 임박", color: "#FF3B30", bg: "#FFF0EE" },
  open: { label: "모집중",   color: "#34C759", bg: "#E8F9ED" },
};

export default function UrgentListPage() {
  const router = useRouter();
  const [roundFilter, setRoundFilter] = useState<RoundFilter>("전체");
  const [areaFilter, setAreaFilter]   = useState<string>("전체");
  const [sectorFilter, setSectorFilter] = useState<string>("전체");

  function handleAreaChange(area: string) {
    setAreaFilter(area);
    setSectorFilter("전체");
  }

  const visible = POSTS.filter((p) => {
    const blocked = MY_DISPATCH_APPLIED.some(
      (d) => d.rawDate === p.rawDate && d.round === p.round
    );
    if (blocked) return false;
    if (deriveStatus(p) === "filled") return false;
    if (roundFilter === "1회차" && p.round !== 1) return false;
    if (roundFilter === "2회차" && p.round !== 2) return false;
    if (areaFilter !== "전체" && p.area !== areaFilter) return false;
    if (sectorFilter !== "전체" && p.sector !== sectorFilter) return false;
    return true;
  });

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#1a1a1a]">
      <div className="w-[375px] bg-[#F2F2F7] flex flex-col overflow-hidden" style={{ height: 812 }}>
        <StatusBar />

        {/* Nav Bar */}
        <div className="bg-white border-b border-[#E5E5EA] flex items-center px-4 relative" style={{ height: 44 }}>
          <button onClick={() => router.push("/")}
            className="text-[#6262EE] text-[15px] font-medium flex items-center gap-1">
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
              <path d="M7 1L1.5 6.5L7 12" stroke="#6262EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            뒤로
          </button>
          <span className="text-[17px] font-semibold text-[#1C1C1E] absolute left-1/2 -translate-x-1/2">긴급 구인</span>
        </div>

        {/* 프로모션 배너 */}
        <div className="mx-3 mt-3 bg-[#6262EE] rounded-2xl px-4 py-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
              🔥 기사 긴급 구인
            </span>
          </div>
          <p className="text-white text-[15px] font-bold">지금 신청하면 추가 보상!</p>
          <p className="text-white/75 text-[12px] mt-0.5">부족한 지역에 바로 합류해보세요</p>
        </div>

        {/* 필터 */}
        <div className="bg-white mt-3 px-3 pt-2.5 pb-2.5 space-y-2 border-b border-[#E5E5EA] flex-shrink-0">
          {/* 회차 */}
          <div className="flex gap-2">
            {(["전체", "1회차", "2회차"] as RoundFilter[]).map((f) => (
              <button key={f} onClick={() => setRoundFilter(f)}
                className={`px-4 h-8 rounded-full text-[13px] font-semibold border transition-all ${
                  f === roundFilter
                    ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                    : "bg-white text-[#8E8E93] border-[#E5E5EA]"
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* 권역 / 지역 드롭다운 */}
          <div className="flex gap-2">
            {/* 권역 */}
            <div className="relative flex-1">
              <select
                value={areaFilter}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full appearance-none bg-white border border-[#E5E5EA] rounded-xl px-3 pr-7 h-9 text-[13px] font-medium text-[#1C1C1E] focus:outline-none focus:border-[#6262EE]"
              >
                <option value="전체">전체 권역</option>
                {Object.keys(AREAS).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* 지역 */}
            <div className="relative flex-1">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                disabled={areaFilter === "전체"}
                className={`w-full appearance-none border rounded-xl px-3 pr-7 h-9 text-[13px] font-medium focus:outline-none focus:border-[#6262EE] ${
                  areaFilter === "전체"
                    ? "bg-[#F2F2F7] border-[#E5E5EA] text-[#C7C7CC]"
                    : "bg-white border-[#E5E5EA] text-[#1C1C1E]"
                }`}
              >
                <option value="전체">전체 지역</option>
                {(areaFilter !== "전체" ? AREAS[areaFilter] ?? [] : []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke={areaFilter === "전체" ? "#C7C7CC" : "#8E8E93"} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-3 pt-2.5 pb-4 space-y-2.5">
          {visible.length === 0 && (
            <div className="bg-white rounded-2xl px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-[#8E8E93]">현재 진행 중인 급건 모집이 없습니다.</p>
            </div>
          )}

          {visible.map((post) => {
            const status = deriveStatus(post);
            const badge = BADGE[status];

            return (
              <button
                key={post.id}
                onClick={() => router.push(`/urgent-detail?id=${post.id}`)}
                className="w-full text-left bg-white rounded-2xl px-4 py-4 shadow-sm transition-all active:scale-[0.98]"
              >
                {/* 상단 */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] text-[#8E8E93]">{post.date} ({post.day})</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={post.round === 1
                          ? { backgroundColor: "#EEF2FF", color: "#4F6BEE" }
                          : { backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
                        {post.round === 1 ? "1회차" : "2회차"}
                      </span>
                    </div>
                    <p className="text-[17px] font-bold text-[#1C1C1E]">{post.sector}</p>
                  </div>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ color: badge.color, backgroundColor: badge.bg }}>
                    {badge.label}
                  </span>
                </div>

                {/* 하단 */}
                <div className="flex items-center justify-between">
                  <div className="bg-[#FFF3EC] rounded-xl px-3 py-1.5 flex items-baseline gap-1">
                    <span className="text-[11px] font-semibold text-[#FF6B00]">최대</span>
                    <span className="text-[18px] font-extrabold text-[#FF6B00] leading-none">
                      {post.totalPay.toLocaleString()}
                    </span>
                    <span className="text-[12px] font-bold text-[#FF6B00]">원</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#6262EE]">
                    <span className="text-[13px] font-semibold">신청하기</span>
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                      <path d="M1 1L5 5L1 9" stroke="#6262EE" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <HomeIndicator />
      </div>
    </div>
  );
}
