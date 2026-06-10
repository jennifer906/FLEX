"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

const POSTS: Record<string, {
  sector: string; round: number; date: string; deadline: string;
  hub: string; volume: number; basePrice: number;
  promoType: "total" | "perUnit";
  promoPrice: number;
  total: number; filled: number;
}> = {
  "1": { sector: "강남구", round: 1, date: "2026년 6월 3일 (화)", deadline: "18:00", hub: "성수 유닛", volume: 45, basePrice: 2500, promoType: "total",   promoPrice: 3000, total: 5, filled: 2 },
  "2": { sector: "서초구", round: 1, date: "2026년 6월 3일 (화)", deadline: "18:00", hub: "성수 유닛", volume: 38, basePrice: 2500, promoType: "perUnit", promoPrice: 500,  total: 3, filled: 1 },
  "3": { sector: "송파구", round: 2, date: "2026년 6월 3일 (화)", deadline: "21:30", hub: "성수 유닛", volume: 52, basePrice: 2800, promoType: "total",   promoPrice: 8000, total: 4, filled: 3 },
};

// 배송 구역 핀 데이터 (x, y: 지도 내 위치 %)
const DELIVERY_ZONES: Record<string, { area: string; x: number; y: number }[]> = {
  "1": [
    { area: "강남구 역삼동",   x: 28, y: 28 },
    { area: "강남구 논현동",   x: 52, y: 48 },
    { area: "강남구 청담동",   x: 72, y: 22 },
    { area: "강남구 삼성동",   x: 78, y: 58 },
  ],
  "2": [
    { area: "서초구 방배동",   x: 24, y: 55 },
    { area: "서초구 잠원동",   x: 50, y: 28 },
    { area: "서초구 서초동",   x: 70, y: 52 },
  ],
  "3": [
    { area: "송파구 잠실동",   x: 30, y: 35 },
    { area: "송파구 가락동",   x: 60, y: 55 },
    { area: "송파구 거여동",   x: 80, y: 30 },
    { area: "송파구 방이동",   x: 48, y: 68 },
    { area: "송파구 문정동",   x: 72, y: 72 },
  ],
};

function UrgentDetailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || "1";
  const post = POSTS[id] || POSTS["1"];

  const [applying, setApplying] = useState(false);
  const [showPenalty, setShowPenalty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFull, setShowFull] = useState(false);

  // 회차별 유닛 도착 기준 시각
  const unitArrivalTime = post.round === 1 ? "PM 19:00" : "AM 01:00";

  const remain = post.total - post.filled;
  const baseEarning = post.basePrice * post.volume;
  const estimatedEarning =
    post.promoType === "perUnit"
      ? (post.basePrice + post.promoPrice) * post.volume
      : baseEarning + post.promoPrice;

  const handleApply = () => {
    setShowConfirm(false);
    if (remain <= 0) {
      setShowFull(true);
      return;
    }
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setShowSuccess(true);
    }, 800);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#111]">
      <div className="w-[375px] bg-white flex flex-col" style={{ height: 812 }}>
        <StatusBar />
        {/* Nav Bar */}
        <div className="bg-white border-b border-[#E5E5EA] flex items-center px-4 relative flex-shrink-0" style={{ height: 44 }}>
          <button onClick={() => router.push("/urgent-list")}
            className="text-[#6262EE] text-[15px] font-medium flex items-center gap-1">
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
              <path d="M7 1L1.5 6.5L7 12" stroke="#6262EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            뒤로
          </button>
          <span className="text-[17px] font-semibold text-[#1C1C1E] absolute left-1/2 -translate-x-1/2">
            긴급 구인 상세
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {/* 헤더 */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                style={post.round === 1
                  ? { backgroundColor: "#EEF2FF", color: "#4F6BEE" }
                  : { backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
                {post.round === 1 ? "1회차" : "2회차"}
              </span>
              <span className="text-[12px] text-text-caption">{post.date}</span>
            </div>
            <h1 className="text-[24px] font-bold text-text-primary">{post.sector}</h1>
          </div>

          {/* 배송 정보 */}
          <div className="px-5 pt-5">
            <p className="text-[13px] font-semibold text-text-caption mb-3">배송 정보</p>
            <div className="bg-surface rounded-2xl divide-y divide-border">
              {[
                { label: "배송 날짜",  value: post.date },
                { label: "배송 시간대", value: post.round === 1 ? "PM 19:00 ~ 24:00" : "AM 00:00 ~ 07:00" },
                { label: "예상 물량",  value: `약 ${post.volume}건` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-3.5">
                  <span className="text-[14px] text-text-caption">{label}</span>
                  <span className="text-[14px] font-semibold text-text-primary">{value}</span>
                </div>
              ))}

              {/* 픽업 유닛 — 펼치기 */}
              <div>
                <button
                  onClick={() => setShowMap((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <span className="text-[14px] text-text-caption">픽업 유닛</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-primary">{post.hub}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                      className={`transition-transform flex-shrink-0 ${showMap ? "rotate-180" : ""}`}>
                      <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </button>

                {showMap && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* 도착 시간 안내 */}
                    <div className="bg-[#FFF4E5] rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <span className="text-base flex-shrink-0">⏰</span>
                      <p className="text-[13px] font-semibold text-[#FF9500]">
                        {unitArrivalTime}까지 유닛에 도착해주세요
                      </p>
                    </div>

                    {/* 지도 영역 */}
                    <div className="rounded-2xl overflow-hidden border border-[#E5E5EA]">
                      {/* 지도 플레이스홀더 */}
                      <div className="bg-[#E8EEF4] h-[150px] relative flex items-center justify-center">
                        <div className="absolute inset-0 opacity-25"
                          style={{
                            backgroundImage:
                              "linear-gradient(#B0BEC5 1px, transparent 1px), linear-gradient(90deg, #B0BEC5 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                          }}
                        />
                        {/* 도로 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-6 bg-white/50" />
                          <div className="absolute w-6 h-full bg-white/50" />
                        </div>
                        {/* 핀 마커 */}
                        <div className="relative z-10 flex flex-col items-center gap-1">
                          <div className="w-11 h-11 rounded-full bg-[#6262EE] flex items-center justify-center shadow-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-1 shadow-md">
                            <p className="text-[12px] font-bold text-[#1C1C1E]">{post.hub}</p>
                          </div>
                        </div>
                      </div>

                      {/* 주소 + 도착 기준 */}
                      <div className="bg-white px-4 py-3">
                        <p className="text-[14px] font-semibold text-[#1C1C1E]">{post.hub}</p>
                        <p className="text-[12px] text-[#8E8E93] mt-0.5">서울특별시 성동구 성수일로 8길 32</p>
                        <p className="text-[12px] text-[#6262EE] font-semibold mt-1.5">
                          {post.round === 1 ? "1회차" : "2회차"} · {unitArrivalTime}까지 도착 필수
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 배송 구역 지도 */}
          {(() => {
            const zones = DELIVERY_ZONES[id] ?? DELIVERY_ZONES["1"];
            return (
              <div className="px-5 pt-5">
                <p className="text-[13px] font-semibold text-text-caption mb-3">배송 구역</p>
                <div className="rounded-2xl overflow-hidden border border-[#E5E5EA]">

                  {/* 지도 영역 */}
                  <div className="relative bg-[#EBF0F6] h-[200px]">
                    {/* 격자 배경 */}
                    <div className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          "linear-gradient(#B8C8D8 1px, transparent 1px), linear-gradient(90deg, #B8C8D8 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                      }}
                    />
                    {/* 도로 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute h-[3px] w-full bg-white/70" style={{ top: "38%" }} />
                      <div className="absolute h-[3px] w-full bg-white/70" style={{ top: "68%" }} />
                      <div className="absolute w-[3px] h-full bg-white/70" style={{ left: "33%" }} />
                      <div className="absolute w-[3px] h-full bg-white/70" style={{ left: "66%" }} />
                    </div>

                    {/* 배송 구역 핀 */}
                    {zones.map((z, i) => (
                      <div key={i}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${z.x}%`, top: `${z.y}%`, transform: "translate(-50%, -100%)" }}>
                        {/* 핀 헤드 */}
                        <div className="w-6 h-6 rounded-full bg-[#6262EE] border-2 border-white shadow-md flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold leading-none">{i + 1}</span>
                        </div>
                        {/* 핀 줄기 */}
                        <div className="w-0.5 h-2 bg-[#6262EE]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6262EE]" />
                      </div>
                    ))}

                    {/* 구역 라벨 (지도 우하단) */}
                    <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1">
                      <p className="text-[11px] font-bold text-[#1C1C1E]">{post.sector} 일대</p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* 보상 조건 */}
          <div className="px-5 pt-5">
            <p className="text-[13px] font-semibold text-text-caption mb-3">보상 조건</p>

            {post.promoType === "total" ? (
              /* ── 전체 프로모션 타입 ── */
              <div className="bg-surface rounded-2xl overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[14px] text-text-caption">기본 단가</span>
                    <span className="text-[14px] font-semibold text-text-primary">{post.basePrice.toLocaleString()}원/건</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[14px] text-text-caption">예상 기본 수입</span>
                    <span className="text-[14px] font-semibold text-text-primary">약 {baseEarning.toLocaleString()}원</span>
                  </div>
                </div>

                {/* 프로모션 강조 행 */}
                <div className="mx-4 mb-4 bg-[#FFF4ED] border border-[#FFD4B2] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white bg-[#FF6B00] px-1.5 py-0.5 rounded-full leading-none">긴급</span>
                    <span className="text-[14px] text-[#FF6B00] font-medium">프로모션</span>
                    <span className="text-[11px] text-[#FF6B00]/70 font-medium">전체 지급</span>
                  </div>
                  <span className="text-[15px] font-bold text-[#FF6B00]">+{post.promoPrice.toLocaleString()}원</span>
                </div>

                {/* 합계 */}
                <div className="border-t border-border mx-4" />
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-[13px] font-medium text-primary">예상 총 보상</span>
                  <span className="text-[15px] font-bold text-primary">약 {estimatedEarning.toLocaleString()}원</span>
                </div>
              </div>
            ) : (
              /* ── 건당 프로모션 타입 ── */
              <div className="bg-surface rounded-2xl overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[14px] text-text-caption">기본 단가</span>
                    <span className="text-[14px] font-semibold text-text-primary">{post.basePrice.toLocaleString()}원/건</span>
                  </div>

                  {/* 건당 프로모션 강조 행 */}
                  <div className="bg-[#FFF4ED] border border-[#FFD4B2] rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-white bg-[#FF6B00] px-1.5 py-0.5 rounded-full leading-none">긴급</span>
                      <span className="text-[14px] text-[#FF6B00] font-medium">프로모션 단가</span>
                    </div>
                    <span className="text-[15px] font-bold text-[#FF6B00]">+{post.promoPrice.toLocaleString()}원/건</span>
                  </div>

                  {/* 적용 단가 */}
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-text-caption">적용 단가</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[13px] text-text-caption">{post.basePrice.toLocaleString()} + {post.promoPrice.toLocaleString()} =</span>
                      <span className="text-[14px] font-bold text-text-primary">{(post.basePrice + post.promoPrice).toLocaleString()}원/건</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[14px] text-text-caption">예상 물량</span>
                    <span className="text-[14px] font-semibold text-text-primary">약 {post.volume}건</span>
                  </div>
                </div>

                {/* 합계 */}
                <div className="border-t border-border mx-4" />
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-[13px] font-medium text-primary">예상 총 보상</span>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[15px] font-bold text-primary">약 {estimatedEarning.toLocaleString()}원</span>
                    <span className="text-[11px] text-text-caption">{(post.basePrice + post.promoPrice).toLocaleString()}원 × {post.volume}건</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 주의사항 */}
          <div className="px-5 pt-5">
            <button
              onClick={() => setShowPenalty(!showPenalty)}
              className="w-full flex items-center justify-between py-2"
            >
              <p className="text-[13px] font-semibold text-text-caption">주의사항</p>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                className={`transition-transform ${showPenalty ? "rotate-180" : ""}`}>
                <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {showPenalty && (
              <div className="bg-[#FFF8E7] rounded-2xl p-4 mt-2 space-y-2">
                {[
                  "급건 확정 후 취소 시 페널티가 부과될 수 있어요",
                  "배차 확정 즉시 알림톡이 발송돼요",
                  "선착순으로 자동 확정되며 마감 시 신청이 불가해요",
                ].map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0 text-sm">⚠️</span>
                    <p className="text-[13px] text-text-secondary">{t}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 bg-white border-t border-[#E5E5EA] px-5 pt-3 pb-1">
          <button
            onClick={() => !applying && remain > 0 && setShowConfirm(true)}
            disabled={applying || remain === 0}
            className={`w-full h-[52px] rounded-[14px] text-[17px] font-semibold transition-all ${
              remain === 0
                ? "bg-[#E8E8E8] text-[#8E8E93] cursor-not-allowed"
                : applying
                ? "bg-[#6262EE]/70 text-white"
                : "bg-[#6262EE] text-white active:opacity-80"
            }`}
          >
            {applying ? "신청 중..." : remain === 0 ? "모집 마감" : "신청하기"}
          </button>
          <HomeIndicator />
        </div>
      </div>

      {/* 신청 확인 모달 */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-[375px] bg-white rounded-t-3xl px-5 pt-6 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mb-5" />

            <h3 className="text-[18px] font-bold text-[#1C1C1E] text-center mb-1">
              긴급 구인에 신청할까요?
            </h3>
            <p className="text-[13px] text-[#8E8E93] text-center mb-5">
              아래 내용을 확인해주세요
            </p>

            {/* 신청 정보 요약 */}
            <div className="bg-[#F2F2F7] rounded-2xl divide-y divide-white">
              {[
                { label: "날짜",     value: post.date },
                { label: "시간",     value: post.round === 1 ? "PM 19:00 ~ 24:00" : "AM 00:00 ~ 07:00" },
                { label: "지역",     value: post.sector },
                { label: "픽업 유닛", value: `${post.hub} (${unitArrivalTime}까지)` },
                { label: "예상 물량", value: `약 ${post.volume}건` },
                { label: "예상 보상", value: `약 ${estimatedEarning.toLocaleString()}원` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-3">
                  <span className="text-[14px] text-[#8E8E93]">{label}</span>
                  <span className={`text-[14px] font-semibold ${label === "예상 보상" ? "text-[#6262EE]" : "text-[#1C1C1E]"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[12px] text-[#FF3B30] text-center mt-3 mb-5">
              ⚠️ 배차 확정 후에는 취소가 불가합니다
            </p>

            <div className="flex gap-3 mb-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-[52px] rounded-[14px] bg-[#F2F2F7] text-[#3C3C43] text-[16px] font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleApply}
                className="flex-1 h-[52px] rounded-[14px] bg-[#6262EE] text-white text-[16px] font-semibold active:opacity-80"
              >
                신청할게요
              </button>
            </div>
            <HomeIndicator />
          </div>
        </div>
      )}

      {/* ── 구인 완료 팝업 ── */}
      {showFull && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-[323px] bg-white rounded-3xl px-6 py-8 flex flex-col items-center text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#FFF0EE] flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 8v8M16 22v1" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="13" stroke="#FF3B30" strokeWidth="2.5"/>
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#1C1C1E] mb-2">이미 구인이 완료되었습니다</h3>
            <p className="text-[14px] text-[#8E8E93] leading-relaxed mb-7">
              신청하는 사이 자리가 마감됐어요.<br/>다른 급건을 확인해보세요.
            </p>
            <button
              onClick={() => { setShowFull(false); router.push("/urgent-list"); }}
              className="w-full h-[52px] rounded-[14px] bg-[#6262EE] text-white text-[17px] font-semibold active:opacity-80"
            >
              다른 급건 보기
            </button>
          </div>
        </div>
      )}

      {/* ── 배차 확정 완료 팝업 ── */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-[323px] bg-white rounded-3xl px-6 py-8 flex flex-col items-center text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#E8F9ED] flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16L13 23L26 9" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#1C1C1E] mb-2">배차가 확정됐어요!</h3>
            <p className="text-[14px] text-[#8E8E93] leading-relaxed mb-7">
              {post.sector} 지역 급건 배차가 확정되었습니다.<br/>알림톡으로도 결과를 확인할 수 있어요.
            </p>
            <button
              onClick={() => router.push("/dispatch-list")}
              className="w-full h-[52px] rounded-[14px] bg-[#6262EE] text-white text-[17px] font-semibold active:opacity-80"
            >
              신청 내역 확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UrgentDetailPage() {
  return <Suspense><UrgentDetailContent /></Suspense>;
}
