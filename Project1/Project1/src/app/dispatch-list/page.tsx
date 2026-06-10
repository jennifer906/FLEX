"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

// ─── 타입 ────────────────────────────────────────────────────────────
type ItemStatus = "신청 완료" | "배차 후보" | "배차 확정" | "추가 배차" | "미배차";
type AdditionalType = "urgent" | "zrank";

interface DispatchItem {
  id: string;
  date: string;
  rawDate: string;
  round: "1회차" | "2회차";
  region: string;
  jobType: string;
  quantity: string;
  status: ItemStatus;
  cutoffPassed?: boolean; // 데모용: true면 13시 이후 시나리오 강제
  additionalType?: AdditionalType; // 추가 배차 세부 유형
}

// ─── 샘플 데이터 (20개) ───────────────────────────────────────────────
const ALL_ITEMS: DispatchItem[] = [
  { id: "23", date: "2026년 6월 14일(일)", rawDate: "2026-06-14", round: "1회차", region: "서울특별시 용산구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "배차 후보", cutoffPassed: true  },
  { id: "22", date: "2026년 6월 13일(토)", rawDate: "2026-06-13", round: "2회차", region: "서울특별시 종로구",  jobType: "배송/반품", quantity: "40 ~ 60건", status: "배차 후보", cutoffPassed: false },
  { id:  "1", date: "2026년 6월 12일(금)", rawDate: "2026-06-12", round: "1회차", region: "서울특별시 강남구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "신청 완료" },
  { id: "21", date: "2026년 6월 11일(목)", rawDate: "2026-06-11", round: "2회차", region: "서울특별시 서초구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "배차 확정" },
  { id:  "2", date: "2026년 6월 11일(목)", rawDate: "2026-06-11", round: "2회차", region: "서울특별시 마포구",  jobType: "배송/반품", quantity: "40 ~ 60건", status: "배차 후보" },
  { id:  "3", date: "2026년 6월 10일(수)", rawDate: "2026-06-10", round: "1회차", region: "서울특별시 서초구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "배차 확정" },
  { id:  "4", date: "2026년 6월 9일(화)",  rawDate: "2026-06-09", round: "1회차", region: "서울특별시 송파구",  jobType: "배송/반품", quantity: "60건 이상",  status: "미배차"   },
  { id:  "5", date: "2026년 6월 8일(월)",  rawDate: "2026-06-08", round: "2회차", region: "서울특별시 강동구",  jobType: "배송/반품", quantity: "40 ~ 60건", status: "추가 배차", additionalType: "urgent" },
  { id:  "6", date: "2026년 6월 7일(일)",  rawDate: "2026-06-07", round: "1회차", region: "서울특별시 용산구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "신청 완료" },
  { id:  "7", date: "2026년 6월 6일(토)",  rawDate: "2026-06-06", round: "1회차", region: "서울특별시 종로구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "배차 후보" },
  { id:  "8", date: "2026년 6월 5일(금)",  rawDate: "2026-06-05", round: "2회차", region: "서울특별시 강남구",  jobType: "배송/반품", quantity: "40 ~ 60건", status: "배차 확정" },
  { id:  "9", date: "2026년 6월 4일(목)",  rawDate: "2026-06-04", round: "1회차", region: "서울특별시 서초구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "배차 후보" },
  { id: "10", date: "2026년 6월 3일(수)",  rawDate: "2026-06-03", round: "2회차", region: "서울특별시 송파구",  jobType: "배송/반품", quantity: "60건 이상",  status: "미배차"   },
  { id: "11", date: "2026년 6월 2일(화)",  rawDate: "2026-06-02", round: "1회차", region: "서울특별시 강동구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "추가 배차", additionalType: "zrank" },
  { id: "12", date: "2026년 6월 1일(월)",  rawDate: "2026-06-01", round: "1회차", region: "서울특별시 마포구",  jobType: "배송/반품", quantity: "40 ~ 60건", status: "배차 확정" },
  { id: "13", date: "2026년 5월 31일(일)", rawDate: "2026-05-31", round: "2회차", region: "서울특별시 용산구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "미배차"   },
  { id: "14", date: "2026년 5월 30일(토)", rawDate: "2026-05-30", round: "1회차", region: "경기도 성남시",      jobType: "배송/반품", quantity: "20 ~ 40건", status: "배차 확정" },
  { id: "15", date: "2026년 5월 29일(금)", rawDate: "2026-05-29", round: "2회차", region: "경기도 수원시",      jobType: "배송/반품", quantity: "40 ~ 60건", status: "신청 완료" },
  { id: "16", date: "2026년 5월 28일(목)", rawDate: "2026-05-28", round: "1회차", region: "서울특별시 강남구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "미배차"   },
  { id: "17", date: "2026년 5월 27일(수)", rawDate: "2026-05-27", round: "1회차", region: "서울특별시 서초구",  jobType: "배송/반품", quantity: "60건 이상",  status: "배차 확정" },
  { id: "18", date: "2026년 5월 26일(화)", rawDate: "2026-05-26", round: "2회차", region: "서울특별시 마포구",  jobType: "배송/반품", quantity: "40 ~ 60건", status: "추가 배차", additionalType: "urgent" },
  { id: "19", date: "2026년 5월 25일(월)", rawDate: "2026-05-25", round: "1회차", region: "경기도 성남시",      jobType: "배송/반품", quantity: "20 ~ 40건", status: "미배차"   },
  { id: "20", date: "2026년 5월 24일(일)", rawDate: "2026-05-24", round: "2회차", region: "서울특별시 강동구",  jobType: "배송/반품", quantity: "20 ~ 40건", status: "배차 확정" },
];

// ─── 상태 스타일 ──────────────────────────────────────────────────────
const STATUS_STYLE: Record<ItemStatus, { color: string; bg: string }> = {
  "신청 완료": { color: "#34C759", bg: "#E8F9ED" },
  "배차 후보": { color: "#FF9500", bg: "#FFF4E5" },
  "배차 확정": { color: "#007AFF", bg: "#EAF4FF" },
  "추가 배차": { color: "#6262EE", bg: "#EFEFFD" },
  "미배차":    { color: "#FF3B30", bg: "#FFF0EE" },
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const PAGE_SIZE = 10;
const TODAY = new Date().toISOString().split("T")[0];
const MAX_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
})();

function resolveStatus(item: DispatchItem, allItems: DispatchItem[]): ItemStatus {
  if (item.status === "배차 후보") {
    if (item.rawDate < TODAY) return "미배차";
    const hasConfirmed = allItems.some(
      (other) =>
        other.id !== item.id &&
        other.rawDate === item.rawDate &&
        other.round === item.round &&
        (other.status === "배차 확정" || other.status === "추가 배차")
    );
    if (hasConfirmed) return "미배차";
  }
  return item.status;
}

function toRawDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(raw: string): string {
  const d = new Date(raw + "T00:00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${DAY_NAMES[d.getDay()]})`;
}

// ─── 미니 캘린더 ─────────────────────────────────────────────────────
function MiniCalendar({
  year, month, selectedDate, markedDates, todayRaw, onSelect, onPrev, onNext,
}: {
  year: number; month: number;
  selectedDate: string | null;
  markedDates: Set<string>;
  todayRaw: string;
  onSelect: (d: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);

  return (
    <div className="bg-white px-3 pt-2.5 pb-2">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={onPrev} className="p-1 text-[#8E8E93]">
          <svg width="7" height="12" viewBox="0 0 8 13" fill="none">
            <path d="M7 1L1.5 6.5L7 12" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[14px] font-semibold text-[#1C1C1E]">{year}년 {month + 1}월</span>
        <button onClick={onNext} className="p-1 text-[#8E8E93]">
          <svg width="7" height="12" viewBox="0 0 8 13" fill="none">
            <path d="M1 1L6.5 6.5L1 12" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-medium py-0.5 ${
            i === 0 ? "text-[#FF3B30]" : i === 6 ? "text-[#007AFF]" : "text-[#8E8E93]"
          }`}>{d}</div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className="h-8" />;
          const raw = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === raw;
          const isToday = raw === todayRaw;
          const hasDot = markedDates.has(raw);
          const dow = idx % 7;

          const isDisabled = raw > MAX_DATE;

          return (
            <button
              key={raw}
              onClick={() => !isDisabled && onSelect(raw)}
              disabled={isDisabled}
              className="flex flex-col items-center justify-center h-8 gap-[2px]"
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-medium transition-all ${
                isDisabled
                  ? "text-[#C7C7CC]"
                  : isSelected
                  ? "bg-[#6262EE] text-white"
                  : isToday
                  ? "bg-[#EDEDFD] text-[#6262EE] font-bold"
                  : dow === 0 ? "text-[#FF3B30]"
                  : dow === 6 ? "text-[#007AFF]"
                  : "text-[#1C1C1E]"
              }`}>
                {day}
              </span>
              <div className={`w-1 h-1 rounded-full transition-all ${
                !isDisabled && hasDot ? (isSelected ? "bg-white/70" : "bg-[#6262EE]") : "bg-transparent"
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────
function DispatchListContent() {
  const router = useRouter();
  const today = new Date();

  const [calYear, setCalYear]       = useState(today.getFullYear());
  const [calMonth, setCalMonth]     = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [cancelId, setCancelId]     = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showCutoffPopup, setShowCutoffPopup] = useState(false);
  const [additionalPopup, setAdditionalPopup] = useState<AdditionalType | null>(null);
  const [toast, setToast]           = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // 날짜 선택 시 visible count 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedDate]);

  const markedDates = new Set(ALL_ITEMS.map((i) => i.rawDate));

  const filtered = selectedDate
    ? ALL_ITEMS.filter((i) => i.rawDate === selectedDate)
    : ALL_ITEMS;

  const displayed = selectedDate ? filtered : filtered.slice(0, visibleCount);
  const hasMore   = !selectedDate && visibleCount < filtered.length;

  // 무한 스크롤 감지
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount((v) => v + PAGE_SIZE); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  function handleSelectDate(raw: string) {
    setSelectedDate((prev) => (prev === raw ? null : raw));
  }

  function handlePrevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }
  function handleNextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  const cancelTarget = ALL_ITEMS.find((i) => i.id === cancelId);

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#1a1a1a]">
      <div className="w-[375px] bg-[#F2F2F7] flex flex-col overflow-hidden relative" style={{ height: 812 }}>
        <StatusBar />

        {/* Nav Bar */}
        <div className="bg-white border-b border-[#E5E5EA] flex items-center px-4 relative flex-shrink-0" style={{ height: 44 }}>
          <button onClick={() => router.back()} className="text-[#6262EE] text-[15px] font-medium flex items-center gap-1">
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
              <path d="M7 1L1.5 6.5L7 12" stroke="#6262EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            뒤로
          </button>
          <span className="text-[17px] font-semibold text-[#1C1C1E] absolute left-1/2 -translate-x-1/2">배차 신청 내역</span>
          <button onClick={() => router.push("/apply")} className="ml-auto text-[#6262EE] text-[15px] font-medium">신청</button>
        </div>

        {/* 미니 캘린더 */}
        <div className="flex-shrink-0 border-b border-[#E5E5EA]">
          <MiniCalendar
            year={calYear} month={calMonth}
            selectedDate={selectedDate}
            markedDates={markedDates}
            todayRaw={TODAY}
            onSelect={handleSelectDate}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-2.5">

          {/* 정책 안내 — 컴팩트 */}
          <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2">
            <p className="text-[11.5px] text-[#3C3C43] leading-relaxed flex-1">
              한 회차에 한 지역만 근무할 수 있으며, 확정 업무가 있을 경우 추가 신청이 불가합니다.
            </p>
            <button className="text-[11.5px] font-semibold text-[#6262EE] flex-shrink-0">정책 확인</button>
          </div>

          {/* 선택 날짜 표시 */}
          {selectedDate && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-semibold text-[#1C1C1E]">
                {formatDisplayDate(selectedDate)} 내역
              </span>
              <button onClick={() => setSelectedDate(null)} className="text-[12px] text-[#6262EE] font-medium">
                전체 보기
              </button>
            </div>
          )}

          {/* 빈 상태 */}
          {displayed.length === 0 && (
            <div className="bg-white rounded-2xl px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-[#8E8E93]">해당 내역이 없습니다.</p>
            </div>
          )}

          {/* 배차 카드 */}
          {displayed.map((item) => {
            const status = resolveStatus(item, ALL_ITEMS);
            const st = STATUS_STYLE[status];
            return (
              <div key={item.id} className="bg-white rounded-2xl px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[15px] font-bold text-[#1C1C1E]">{item.date}</span>
                  {status === "추가 배차" && item.additionalType ? (
                    <button
                      onClick={() => setAdditionalPopup(item.additionalType!)}
                      className="text-[12px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ color: st.color, backgroundColor: st.bg }}
                    >
                      {status}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="4.5" stroke="currentColor"/>
                        <path d="M5 4v3M5 3h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  ) : (
                    <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>
                      {status}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "등록 지역", value: item.region },
                    { label: "희망 업무", value: item.jobType },
                    { label: "희망 수량", value: item.quantity },
                    { label: "신청 회차", value: item.round === "1회차" ? "1회차 (PM 19:00~24:00)" : "2회차 (AM 00:00~07:00)" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-1">
                      <span className="text-[13px] text-[#8E8E93] w-[60px] flex-shrink-0">{label}</span>
                      <span className="text-[13px] text-[#8E8E93]">:</span>
                      <span className="text-[13px] text-[#1C1C1E]">{value}</span>
                    </div>
                  ))}
                </div>
                {status === "배차 후보" && (
                  <div className="mt-3 pt-3 border-t border-[#F2F2F7] text-center">
                    <button
                      onClick={() => {
                        const isPastCutoff = item.cutoffPassed ?? (new Date().getHours() >= 13);
                        if (isPastCutoff) {
                          setShowCutoffPopup(true);
                        } else {
                          setCancelId(item.id);
                        }
                      }}
                      className="text-[14px] font-semibold text-[#FF3B30]"
                    >
                      신청취소
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* 무한 스크롤 센티넬 */}
          {hasMore && <div ref={sentinelRef} className="h-6" />}
          {!hasMore && !selectedDate && displayed.length > 0 && (
            <p className="text-center text-[12px] text-[#C7C7CC] py-1">모든 내역을 확인했습니다.</p>
          )}
        </div>

        <HomeIndicator />

        {/* 신청 취소 확인 바텀시트 */}
        {cancelId && cancelTarget && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end" onClick={() => setCancelId(null)}>
            <div className="w-full bg-white rounded-t-3xl px-5 pt-4 pb-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 bg-[#D1D1D6] rounded-full mx-auto mb-5" />
              <h3 className="text-[18px] font-bold text-[#1C1C1E] text-center mb-2">신청을 취소할까요?</h3>
              <p className="text-[13px] text-[#8E8E93] text-center leading-relaxed mb-5">
                취소 후에는 동일 날짜·지역에<br/>재신청이 어려울 수 있습니다.<br/>
                <span className="text-[#FF9500]">당일 13시 이전 취소는 페널티가 없습니다.</span>
              </p>
              <div className="bg-[#F2F2F7] rounded-2xl divide-y divide-white mb-5">
                {[
                  { label: "날짜", value: cancelTarget.date },
                  { label: "지역", value: cancelTarget.region },
                  { label: "회차", value: cancelTarget.round === "1회차" ? "1회차 (PM 19:00~24:00)" : "2회차 (AM 00:00~07:00)" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between px-4 py-3">
                    <span className="text-[13px] text-[#8E8E93]">{label}</span>
                    <span className="text-[13px] font-semibold text-[#1C1C1E]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setCancelId(null)} className="flex-1 h-[48px] rounded-2xl bg-[#F2F2F7] text-[#3C3C43] text-[15px] font-semibold">
                  돌아가기
                </button>
                <button onClick={() => { setCancelId(null); setCancelSuccess(true); }} className="flex-1 h-[48px] rounded-2xl bg-[#FF3B30] text-white text-[15px] font-semibold">
                  취소할게요
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 13시 이후 취소 시도 센터 팝업 */}
        {showCutoffPopup && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
            <div className="w-full max-w-[295px] bg-white rounded-3xl px-6 py-7 shadow-xl text-center">
              <div className="w-14 h-14 rounded-full bg-[#FFF0EE] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 9v6M14 19h.01" stroke="#FF3B30" strokeWidth="2.2" strokeLinecap="round"/>
                  <circle cx="14" cy="14" r="11" stroke="#FF3B30" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-2">취소가 불가능해요</h3>
              <p className="text-[13px] text-[#8E8E93] mb-6 leading-relaxed">
                13시 이후에는 직접 취소가 어렵습니다.<br/>운영센터로 연락해주세요.
              </p>
              <button
                onClick={() => setShowCutoffPopup(false)}
                className="w-full h-[48px] rounded-2xl bg-[#6262EE] text-white text-[15px] font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 추가 배차 안내 팝업 */}
        {additionalPopup && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center px-6" onClick={() => setAdditionalPopup(null)}>
            <div className="w-full max-w-[295px] bg-white rounded-3xl px-6 py-7 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
              {additionalPopup === "urgent" ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-[#EFEFFD] flex items-center justify-center mx-auto mb-4 text-2xl">⚡</div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-2">긴급 구인으로 즉시 확정</h3>
                  <p className="text-[13px] text-[#8E8E93] mb-6 leading-relaxed">
                    이 배차는 긴급 구인 신청을 통해<br/>즉시 확정되었습니다.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-[#FFF4E5] flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 9v6M14 19h.01" stroke="#FF9500" strokeWidth="2.2" strokeLinecap="round"/>
                      <circle cx="14" cy="14" r="11" stroke="#FF9500" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-2">운영센터 연락 필요</h3>
                  <p className="text-[13px] text-[#8E8E93] mb-6 leading-relaxed">
                    Z랭크 기사님의 추가 배차는<br/>자동 확정되지 않습니다.<br/>
                    <span className="text-[#FF9500] font-semibold">운영센터로 직접 연락해주세요.</span>
                  </p>
                </>
              )}
              <button
                onClick={() => setAdditionalPopup(null)}
                className="w-full h-[48px] rounded-2xl bg-[#6262EE] text-white text-[15px] font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 취소 완료 센터 팝업 */}
        {cancelSuccess && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
            <div className="w-full max-w-[295px] bg-white rounded-3xl px-6 py-7 shadow-xl text-center">
              <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-2">취소되었습니다.</h3>
              <p className="text-[13px] text-[#8E8E93] mb-6 leading-relaxed">신청이 정상적으로 취소되었습니다.</p>
              <button onClick={() => setCancelSuccess(false)} className="w-full h-[48px] rounded-2xl bg-[#6262EE] text-white text-[15px] font-semibold">
                확인
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[343px] bg-[#1C1C1E] text-white text-[13px] rounded-2xl px-4 py-3.5 text-center shadow-lg leading-relaxed">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function DispatchListPage() {
  return (
    <Suspense>
      <DispatchListContent />
    </Suspense>
  );
}
