"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

function UrgentCompleteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sector = params.get("sector") || "강남구";
  const round = params.get("round") || "1";
  const success = params.get("success") !== "false";

  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);

  const roundLabel = round === "2" ? "새벽 · 00:00~07:00" : "주간 · 19:00~24:00";

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#111]">
      <div className="w-[375px] min-h-[812px] bg-white flex flex-col items-center">
        <StatusBar />
        <div style={{ height: 44 }} />

        <div className="flex-1 flex flex-col items-center justify-center px-5 w-full">
          {/* 아이콘 */}
          <div className={`transition-all duration-500 ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6
              ${success ? "bg-[#E8FAF2]" : "bg-[#FFF0EE]"}`}>
              <span className="text-5xl">{success ? "🎉" : "😢"}</span>
            </div>
          </div>

          <h2 className={`text-[22px] font-bold text-center mb-2
            ${success ? "text-text-primary" : "text-text-primary"}`}>
            {success ? "배차 확정!\n신청이 완료됐어요" : "아쉽게도\n자리가 마감됐어요"}
          </h2>
          <p className="text-[14px] text-text-caption text-center mb-8 whitespace-pre-line">
            {success
              ? "알림톡으로도 결과를 확인할 수 있어요"
              : "다른 지역의 급건 공고를 확인해보세요"}
          </p>

          {success ? (
            <div className="w-full bg-[#E8FAF2] rounded-2xl p-5 mb-6 space-y-3">
              {[
                { label: "배정 지역", value: sector },
                { label: "회차", value: roundLabel },
                { label: "픽업 장소", value: "성수 허브" },
                { label: "알림", value: "알림톡 발송 완료 ✓" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[14px] text-[#00875A]">{label}</span>
                  <span className="text-[14px] font-semibold text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full bg-surface rounded-2xl p-5 mb-6">
              <p className="text-[14px] text-text-secondary text-center leading-relaxed">
                선착순 마감으로 이번엔 신청이 되지 않았어요.<br/>
                다른 지역 공고에 신청해보세요!
              </p>
            </div>
          )}
        </div>

        <div className="w-full px-5 pb-1 space-y-2">
          {success ? (
            <button
              onClick={() => router.push("/dispatch-list")}
              className="w-full h-[52px] rounded-[14px] bg-primary text-white text-[17px] font-semibold active:opacity-80"
            >
              내 배차 현황 확인하기
            </button>
          ) : (
            <button
              onClick={() => router.push("/urgent-list")}
              className="w-full h-[52px] rounded-[14px] bg-primary text-white text-[17px] font-semibold active:opacity-80"
            >
              다른 급건 보러가기
            </button>
          )}
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

export default function UrgentCompletePage() {
  return <Suspense><UrgentCompleteContent /></Suspense>;
}
