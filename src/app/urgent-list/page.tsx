"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

type RoundFilter = "전체" | "1회차" | "2회차";
type PostType = "모집중" | "긴급" | "수기공고";
type SortKey = "최신순" | "금액 높은 순" | "수량 많은 순";

interface Post {
  id: string;
  date: string;
  rawDate: string;
  day: string;
  round: 1 | 2;
  area: string;
  sector: string;
  unitArrivedCount: number;
  totalPay: number;
  volume: number;
  postType: PostType;
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
  "인천": ["계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구"],
  "대전": ["대덕구", "동구", "서구", "유성구", "중구"],
  "충남": ["천안시", "아산시"],
  "충북": ["청주시 상당구", "청주시 서원구", "청주시 청원구", "청주시 흥덕구"],
};

const POSTS: Post[] = [
  { id: "1", date: "오늘",  rawDate: "2026-06-15", day: "일", round: 1, area: "서울", sector: "강남구", unitArrivedCount: 3, totalPay: 88000,  volume: 45, postType: "긴급"    },
  { id: "2", date: "오늘",  rawDate: "2026-06-15", day: "일", round: 1, area: "서울", sector: "서초구", unitArrivedCount: 5, totalPay: 72000,  volume: 38, postType: "모집중"  },
  { id: "3", date: "오늘",  rawDate: "2026-06-15", day: "일", round: 2, area: "서울", sector: "송파구", unitArrivedCount: 2, totalPay: 95000,  volume: 52, postType: "수기공고" },
  { id: "4", date: "내일",  rawDate: "2026-06-16", day: "월", round: 1, area: "서울", sector: "강동구", unitArrivedCount: 4, totalPay: 68000,  volume: 40, postType: "모집중"  },
  { id: "5", date: "내일",  rawDate: "2026-06-16", day: "월", round: 2, area: "서울", sector: "마포구", unitArrivedCount: 1, totalPay: 103000, volume: 48, postType: "긴급"    },
  { id: "6", date: "6/17", rawDate: "2026-06-17", day: "화", round: 1, area: "경기", sector: "부천시", unitArrivedCount: 2, totalPay: 78000,  volume: 35, postType: "수기공고" },
  { id: "7", date: "오늘",  rawDate: "2026-06-15", day: "월", round: 1, area: "서울", sector: "강서구", unitArrivedCount: 1, totalPay: 85000,  volume: 42, postType: "긴급"    },
];

const MY_DISPATCH_APPLIED = [{ rawDate: "2026-06-15", round: 2 }];

const POST_BADGE: Record<PostType, { label: string; color: string; bg: string }> = {
  "모집중":   { label: "모집중",   color: "#34C759", bg: "#E8F9ED" },
  "긴급":     { label: "긴급",     color: "#FF6B00", bg: "#FFF3EC" },
  "수기공고": { label: "수기공고", color: "#007AFF", bg: "#EAF4FF" },
};

const SORT_OPTIONS: SortKey[] = ["최신순", "금액 높은 순", "수량 많은 순"];

function isFilled(post: Post) { return post.unitArrivedCount === 0; }

const BASE_DATE = new Date("2026-06-15T00:00:00");
const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK_DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + i);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return {
    rawDate: `${d.getFullYear()}-${mm}-${dd}`,
    day: DAY_KO[d.getDay()],
    date: d.getDate(),
  };
});

export default function UrgentListPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter]       = useState<string>("전체");
  const [roundFilter, setRoundFilter]     = useState<RoundFilter>("전체");
  const [areaFilter, setAreaFilter]       = useState<string>("전체");
  const [sectorFilter, setSectorFilter]   = useState<string>("전체");
  const [sortKey, setSortKey]             = useState<SortKey>("최신순");
  const [showSortMenu, setShowSortMenu]   = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function handleAreaChange(area: string) {
    setAreaFilter(area);
    setSectorFilter("전체");
  }

  const activeFilterCount = [
    dateFilter !== "전체",
    roundFilter !== "전체",
    areaFilter !== "전체",
  ].filter(Boolean).length;

  const filtered = POSTS.filter((p) => {
    if (MY_DISPATCH_APPLIED.some((d) => d.rawDate === p.rawDate && d.round === p.round)) return false;
    if (isFilled(p)) return false;
    if (dateFilter !== "전체" && p.rawDate !== dateFilter) return false;
    if (roundFilter === "1회차" && p.round !== 1) return false;
    if (roundFilter === "2회차" && p.round !== 2) return false;
    if (areaFilter !== "전체" && p.area !== areaFilter) return false;
    if (sectorFilter !== "전체" && p.sector !== sectorFilter) return false;
    return true;
  });

  const visible = [...filtered].sort((a, b) => {
    if (sortKey === "금액 높은 순") return b.totalPay - a.totalPay;
    if (sortKey === "수량 많은 순") return b.volume - a.volume;
    return a.rawDate.localeCompare(b.rawDate) || a.round - b.round;
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
          <span className="text-[17px] font-semibold text-[#1C1C1E] absolute left-1/2 -translate-x-1/2">잔여 배차 신청</span>
        </div>

        {/* 배너 */}
        <div className="mx-3 mt-3 bg-[#6262EE] rounded-2xl px-4 py-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
              🔥 잔여 배차 신청
            </span>
          </div>
          <p className="text-white text-[15px] font-bold">신청 가능한 배송 업무를 바로 배정받아요</p>
          <p className="text-white/75 text-[12px] mt-0.5">부족한 지역에 지금 합류해보세요</p>
        </div>

        {/* 필터 ① 날짜 스트립 */}
        <div className="bg-white mt-3 border-b border-[#E5E5EA] flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setDateFilter("전체")}
              className={`flex flex-col items-center justify-center px-3 py-2.5 gap-0.5 transition-all flex-shrink-0 ${
                dateFilter === "전체" ? "border-b-2 border-[#6262EE]" : ""
              }`}
            >
              <span className={`text-[10px] font-medium ${dateFilter === "전체" ? "text-[#6262EE]" : "text-[#8E8E93]"}`}>전체</span>
              <span className={`text-[15px] font-bold leading-none ${dateFilter === "전체" ? "text-[#6262EE]" : "text-[#C7C7CC]"}`}>—</span>
            </button>
            {WEEK_DATES.map((d) => {
              const active = dateFilter === d.rawDate;
              return (
                <button key={d.rawDate}
                  onClick={() => setDateFilter(active ? "전체" : d.rawDate)}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
                    active ? "border-b-2 border-[#6262EE]" : ""
                  }`}
                >
                  <span className={`text-[10px] font-medium ${active ? "text-[#6262EE]" : "text-[#8E8E93]"}`}>{d.day}</span>
                  <span className={`text-[16px] font-bold leading-none ${active ? "text-[#6262EE]" : "text-[#1C1C1E]"}`}>{d.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 필터 ② 회차 + 지역 */}
        <div className="bg-white border-b border-[#E5E5EA] flex-shrink-0">
          <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
            {(["1회차", "2회차"] as Exclude<RoundFilter, "전체">[]).map((f) => {
              const active = roundFilter === f;
              return (
                <button key={f}
                  onClick={() => setRoundFilter(active ? "전체" : f)}
                  className={`flex-shrink-0 h-8 px-3.5 rounded-full text-[13px] font-semibold border transition-all ${
                    active ? "bg-[#1C1C1E] text-white border-[#1C1C1E]" : "bg-white text-[#3C3C43] border-[#E5E5EA]"
                  }`}>
                  {f}
                </button>
              );
            })}

            <div className="w-px h-8 bg-[#E5E5EA] flex-shrink-0 self-center" />

            {/* 권역 select */}
            <div className="relative flex-shrink-0">
              <select
                value={areaFilter}
                onChange={(e) => handleAreaChange(e.target.value)}
                className={`appearance-none h-8 pl-3 pr-7 rounded-full text-[13px] font-semibold border transition-all focus:outline-none cursor-pointer ${
                  areaFilter !== "전체"
                    ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                    : "bg-white text-[#3C3C43] border-[#E5E5EA]"
                }`}
              >
                <option value="전체">권역</option>
                {Object.keys(AREAS).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="8" height="5" viewBox="0 0 8 5" fill="none">
                <path d="M1 1L4 4L7 1" stroke={areaFilter !== "전체" ? "#fff" : "#3C3C43"} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* 지역 select */}
            <div className="relative flex-shrink-0">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                disabled={areaFilter === "전체"}
                className={`appearance-none h-8 pl-3 pr-7 rounded-full text-[13px] font-semibold border transition-all focus:outline-none ${
                  areaFilter === "전체"
                    ? "bg-[#F2F2F7] text-[#C7C7CC] border-[#E5E5EA] cursor-not-allowed"
                    : sectorFilter !== "전체"
                    ? "bg-[#1C1C1E] text-white border-[#1C1C1E] cursor-pointer"
                    : "bg-white text-[#3C3C43] border-[#E5E5EA] cursor-pointer"
                }`}
              >
                <option value="전체">지역</option>
                {(areaFilter !== "전체" ? AREAS[areaFilter] ?? [] : []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="8" height="5" viewBox="0 0 8 5" fill="none">
                <path d="M1 1L4 4L7 1"
                  stroke={areaFilter === "전체" ? "#C7C7CC" : sectorFilter !== "전체" ? "#fff" : "#3C3C43"}
                  strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 목록 헤더 — 공고 수 + 정렬 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#8E8E93]">
              공고 <span className="font-bold text-[#1C1C1E]">{visible.length}</span>개
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setDateFilter("전체"); setRoundFilter("전체"); setAreaFilter("전체"); setSectorFilter("전체"); }}
                className="text-[12px] text-[#6262EE] font-semibold"
              >
                초기화
              </button>
            )}
          </div>

          {/* 정렬 드롭다운 */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="flex items-center gap-1 text-[13px] font-semibold text-[#3C3C43]"
            >
              {sortKey}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`}>
                <path d="M1 1L5 5L9 1" stroke="#3C3C43" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-7 bg-white rounded-2xl shadow-lg border border-[#E5E5EA] overflow-hidden z-30 w-[148px]">
                {SORT_OPTIONS.map((opt, i) => (
                  <button key={opt}
                    onClick={() => { setSortKey(opt); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-3 text-[14px] transition-colors ${
                      sortKey === opt ? "font-bold text-[#6262EE] bg-[#F5F5FF]" : "font-medium text-[#1C1C1E]"
                    } ${i < SORT_OPTIONS.length - 1 ? "border-b border-[#F2F2F7]" : ""}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-3 pt-1 pb-4 space-y-2.5">
          {visible.length === 0 && (
            <div className="bg-white rounded-2xl px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-[#8E8E93]">현재 진행 중인 구인 공고가 없습니다.</p>
            </div>
          )}

          {visible.map((post) => {
            const badge = POST_BADGE[post.postType];
            return (
              <button key={post.id}
                onClick={() => router.push(`/urgent-detail?id=${post.id}${post.id === "7" ? "&demo=full" : ""}`)}
                className="w-full text-left bg-white rounded-2xl px-4 py-4 shadow-sm transition-all active:scale-[0.98]"
              >
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#FFF3EC] rounded-xl px-3 py-1.5 flex items-baseline gap-1">
                      <span className="text-[11px] font-semibold text-[#FF6B00]">최대</span>
                      <span className="text-[18px] font-extrabold text-[#FF6B00] leading-none">
                        {post.totalPay.toLocaleString()}
                      </span>
                      <span className="text-[12px] font-bold text-[#FF6B00]">원</span>
                    </div>
                    <span className="text-[12px] text-[#8E8E93]">약 {post.volume}건</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#6262EE]">
                    <span className="text-[13px] font-semibold">
                      {post.postType === "수기공고" ? "자세히 보기" : "신청하기"}
                    </span>
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
