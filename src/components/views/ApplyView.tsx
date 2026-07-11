"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const REGIONS = ["서울 전역", "경기 북부", "경기 남부", "경기 동부", "경기 서부"];

function getDates() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

export default function ApplyView() {
  const router = useRouter();
  const dates = getDates();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedRound, setSelectedRound] = useState<1 | 2 | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const toggleRegion = (r: string) =>
    setSelectedRegions((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r]);

  const canSubmit = selectedRound !== null && selectedRegions.length > 0;

  const handleSubmit = () => {
    const params = new URLSearchParams({
      date: dates[selectedDate].toLocaleDateString("ko-KR"),
      round: String(selectedRound),
      regions: selectedRegions.join(","),
    });
    router.push(`/apply-complete?${params}`);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      {/* 날짜 */}
      <section className="px-5 pt-5">
        <p className="text-[13px] font-semibold text-[#888] mb-3">날짜 선택</p>
        <div className="bg-[#F7F8FA] rounded-2xl px-2 py-3 flex gap-1">
          {dates.map((d, i) => {
            const isSel = i === selectedDate;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(i)}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${isSel ? "bg-[#6262EE]" : ""}`}
              >
                <span className={`text-[11px] font-medium ${isSel ? "text-white/80" : "text-[#888]"}`}>
                  {i === 0 ? "오늘" : DAYS[d.getDay()]}
                </span>
                <span className={`text-[15px] font-bold mt-1 ${isSel ? "text-white" : "text-[#1A1A1A]"}`}>
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 회차 */}
      <section className="px-5 pt-6">
        <p className="text-[13px] font-semibold text-[#888] mb-3">회차 선택</p>
        <div className="flex gap-3">
          {([1, 2] as const).map((round) => {
            const isSel = selectedRound === round;
            return (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${
                  isSel ? "border-[#6262EE] bg-[#EFEFFD]" : "border-[#E8E8E8] bg-white"
                }`}
              >
                <div className={`text-[12px] font-bold mb-0.5 ${isSel ? "text-[#6262EE]" : "text-[#888]"}`}>
                  {round}회차
                </div>
                <div className="text-[16px] font-bold text-[#1A1A1A]">
                  {round === 1 ? "주간" : "새벽"}
                </div>
                <div className={`text-[12px] mt-1 ${isSel ? "text-[#555]" : "text-[#888]"}`}>
                  {round === 1 ? "PM 19:00 ~ 24:00" : "AM 00:00 ~ 07:00"}
                </div>
                {isSel && (
                  <div className="mt-2 w-5 h-5 rounded-full bg-[#6262EE] flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 지역 */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-[#888]">희망 지역</p>
          <span className="text-[12px] text-[#888]">복수 선택 가능</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => {
            const isSel = selectedRegions.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRegion(r)}
                className={`px-4 h-10 rounded-full border text-[14px] font-medium transition-all ${
                  isSel ? "bg-[#6262EE] border-[#6262EE] text-white" : "bg-white border-[#E8E8E8] text-[#1A1A1A]"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </section>

      {/* 안내 */}
      <div className="mx-5 mt-6 p-4 bg-[#EFEFFD] rounded-2xl flex gap-2.5 items-start">
        <span className="text-[#6262EE] flex-shrink-0">ℹ️</span>
        <p className="text-[13px] text-[#555] leading-relaxed">
          신청 후 약 10분 이내에 배차 결과를 알려드립니다.
        </p>
      </div>

      {/* 신청하기 버튼 */}
      <div className="px-5 mt-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full h-[52px] rounded-[14px] text-[17px] font-semibold transition-all ${
            canSubmit
              ? "bg-[#6262EE] text-white active:opacity-80"
              : "bg-[#E8E8E8] text-[#888] cursor-not-allowed"
          }`}
        >
          신청하기
        </button>
      </div>
    </div>
  );
}
