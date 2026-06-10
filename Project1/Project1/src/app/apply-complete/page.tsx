"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

function ApplyCompleteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const date = params.get("date") || "2026년 6월 3일";
  const round = params.get("round") || "1";
  const regions = params.get("regions") || "서울 전역";

  const [seconds, setSeconds] = useState(600);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const progress = seconds / 600;
  const r = 52, circ = 2 * Math.PI * r;

  const roundLabel = round === "2" ? "새벽" : "주간";

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#111]">
      <div className="w-[375px] min-h-[812px] bg-white flex flex-col items-center">
        <StatusBar />

        {/* 빈 NavBar */}
        <div style={{ height: 44 }} />

        <div className="flex-1 flex flex-col items-center justify-center px-5 w-full">
          {/* 체크 아이콘 */}
          <div className={`transition-all duration-500 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
            <div className="w-20 h-20 bg-confirmed/10 rounded-full flex items-center justify-center mb-5">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#00C471" fillOpacity="0.15"/>
                <path d={checked ? "M11 20L17 26L29 14" : "M20 20L20 20"}
                  stroke="#00C471" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  className="transition-all duration-700"/>
              </svg>
            </div>
          </div>

          <h2 className="text-[22px] font-bold text-text-primary text-center mb-1">
            배송 신청이 완료됐어요!
          </h2>
          <p className="text-[14px] text-text-caption text-center mb-8">
            잠시 후 배차 결과를 알려드릴게요
          </p>

          {/* 요약 카드 */}
          <div className="w-full bg-surface rounded-2xl p-5 mb-6 space-y-3">
            {[
              { icon: "📅", label: "날짜", value: date },
              { icon: "⏰", label: "회차", value: roundLabel },
              { icon: "📍", label: "희망 지역", value: regions.split(",").join(", ") },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-[14px] text-text-caption">{label}</span>
                </div>
                <span className="text-[14px] font-semibold text-text-primary">{value}</span>
              </div>
            ))}
          </div>

          {/* 카운트다운 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#F0F0F0" strokeWidth="8"/>
                <circle
                  cx="60" cy="60" r={r}
                  fill="none" stroke="#6262EE" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - progress)}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold text-text-primary font-mono">{mm}:{ss}</span>
                <span className="text-[11px] text-text-caption">남음</span>
              </div>
            </div>
            <div className="bg-[#FFF8E7] rounded-2xl px-4 py-3 flex gap-2 items-start w-full max-w-[280px]">
              <span className="text-yellow-500 text-base flex-shrink-0">🔔</span>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                약 10분 후 알림톡과 앱 푸시로<br/>배차 결과를 받을 수 있어요
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="w-full px-5 pb-1">
          <button
            onClick={() => router.push("/dispatch-list?filter=신청 완료")}
            className="w-full h-[52px] rounded-[14px] bg-primary text-white text-[17px] font-semibold mb-3 active:opacity-80"
          >
            배차 결과 보러가기
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full h-[48px] rounded-[14px] text-text-secondary text-[15px] font-medium active:opacity-70"
          >
            홈으로 돌아가기
          </button>
          <HomeIndicator />
        </div>
      </div>
    </div>
  );
}

export default function ApplyCompletePage() {
  return (
    <Suspense>
      <ApplyCompleteContent />
    </Suspense>
  );
}
