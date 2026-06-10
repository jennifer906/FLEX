"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

const REGION_DATA: Record<string, { districts: string[] }> = {
  "서울": {
    districts: ["강남구", "서초구", "송파구", "강동구", "성동구", "중구", "마포구", "용산구", "광진구"],
  },
  "경기": {
    districts: ["수원시", "성남시", "고양시", "화성시", "용인시"],
  },
};

const QUANTITY_OPTIONS = ["20~40건", "40~60건", "60건 이상"] as const;
type Quantity = typeof QUANTITY_OPTIONS[number];

interface SelectedRegion {
  key: string;
  region: string;
  district: string;
  round: "1회차" | "2회차" | null;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getMaxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

export default function ApplyPage() {
  const router = useRouter();

  const [date, setDate]       = useState(getTodayStr());
  const [round, setRound]     = useState<"1회차" | "2회차" | null>(null);
  const [quantity, setQuantity] = useState<Quantity | null>(null);
  const [areaKey, setAreaKey] = useState<string>("");
  const [selectedRegions, setSelectedRegions] = useState<SelectedRegion[]>([]);
  const [showRegionSheet, setShowRegionSheet] = useState(false);
  const [showDistrictSheet, setShowDistrictSheet] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const districts = areaKey ? REGION_DATA[areaKey]?.districts ?? [] : [];

  const addRegion = (districtName: string) => {
    if (!areaKey || !districtName) return;
    const key = `${areaKey} ${districtName}`;
    setSelectedRegions([{ key, region: areaKey, district: districtName, round }]);
  };

  const removeRegion = (key: string) =>
    setSelectedRegions((prev) => prev.filter((s) => s.key !== key));

  const canSubmit = !!date && !!round && !!quantity && selectedRegions.length > 0;

  // 신청하기 → 확인 바텀시트 오픈
  const handleSubmit = () => setShowConfirmSheet(true);

  // 확인 바텀시트에서 "이대로 신청" → 완료 팝업
  const handleConfirm = () => {
    setShowConfirmSheet(false);
    setShowSuccess(true);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#1a1a1a]">
      <div className="w-[375px] bg-[#F2F2F7] flex flex-col" style={{ height: 812 }}>
        <StatusBar />

        {/* Nav Bar */}
        <div className="bg-white border-b border-[#E5E5EA] flex items-center px-4 relative flex-shrink-0"
             style={{ height: 44 }}>
          <button onClick={() => router.back()}
            className="text-[#6262EE] text-[15px] font-medium flex items-center gap-1">
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
              <path d="M7 1L1.5 6.5L7 12" stroke="#6262EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            뒤로
          </button>
          <span className="text-[17px] font-semibold text-[#1C1C1E] absolute left-1/2 -translate-x-1/2">
            배차 신청
          </span>
          <button onClick={() => router.push("/")}
            className="ml-auto text-[#6262EE] text-[15px] font-medium">
            다음에
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-6">

          {/* 배차 신청 날짜 */}
          <div>
            <p className="text-[13px] font-semibold text-[#1C1C1E] mb-2">배차 신청 날짜</p>
            <div className="bg-white rounded-xl border border-[#E5E5EA] px-4 py-3.5">
              <input
                type="date"
                value={date}
                min={getTodayStr()}
                max={getMaxDateStr()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-[15px] text-[#1C1C1E] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* 신청 회차 */}
          <div>
            <p className="text-[13px] font-semibold text-[#1C1C1E] mb-2">신청 회차</p>
            <div className="flex gap-2">
              {([
                { id: "1회차", label: "1회차", sub: "주간 PM 19:00~24:00" },
                { id: "2회차", label: "2회차", sub: "야간 AM 00:00~07:00" },
              ] as const).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRound(r.id);
                    setSelectedRegions([]);
                  }}
                  className={`flex-1 py-3 rounded-xl border transition-colors ${
                    round === r.id
                      ? "bg-[#6262EE] text-white border-[#6262EE]"
                      : "bg-white border-[#E5E5EA] text-[#8E8E93]"
                  }`}
                >
                  <p className="text-[15px] font-semibold">{r.label}</p>
                  <p className={`text-[12px] mt-0.5 ${round === r.id ? "text-white/75" : "text-[#C7C7CC]"}`}>
                    {r.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 업무 유형 */}
          <div>
            <p className="text-[13px] font-semibold text-[#1C1C1E] mb-2">업무 유형</p>
            <button className="w-full h-[52px] rounded-xl text-[15px] font-semibold bg-[#6262EE] text-white">
              배송/반품
            </button>
          </div>

          {/* 희망 수량 */}
          <div>
            <p className="text-[13px] font-semibold text-[#1C1C1E] mb-2">희망 수량</p>
            <div className="flex gap-2">
              {QUANTITY_OPTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`flex-1 py-3 rounded-xl text-[14px] font-semibold border transition-colors ${
                    quantity === q
                      ? "bg-[#6262EE] text-white border-[#6262EE]"
                      : "bg-white text-[#3C3C43] border-[#E5E5EA]"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 신청 지역 선택 */}
          <div>
            <p className="text-[13px] font-semibold text-[#1C1C1E] mb-2">신청 지역 선택</p>

            <div className="space-y-2">
              {/* 배송 권역 */}
              <button
                onClick={() => setShowRegionSheet(true)}
                className="w-full bg-white rounded-xl border border-[#E5E5EA] px-4 py-3.5 flex items-center justify-between"
              >
                <span className={`text-[15px] ${areaKey ? "text-[#1C1C1E]" : "text-[#C7C7CC]"}`}>
                  {areaKey || "배송 권역"}
                </span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* 신청 지역 (권역 선택 후 활성화) */}
              <button
                onClick={() => { if (areaKey) setShowDistrictSheet(true); }}
                disabled={!areaKey}
                className={`w-full bg-white rounded-xl border border-[#E5E5EA] px-4 py-3.5 flex items-center justify-between ${!areaKey ? "opacity-50" : ""}`}
              >
                <span className="text-[15px] text-[#C7C7CC]">
                  {selectedRegions.length > 0
                    ? `${selectedRegions.length}개 지역 선택됨`
                    : "신청 지역"}
                </span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 등록된 선택지역 */}
          {selectedRegions.length > 0 && (
            <div>
              <p className="text-[13px] font-semibold text-[#1C1C1E] mb-2">선택 지역</p>
              <div className="bg-white rounded-xl border border-[#E5E5EA] divide-y divide-[#F2F2F7]">
                {selectedRegions.map((s) => (
                  <div key={s.key} className="flex items-center px-4 py-3.5 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-[#1C1C1E]">
                        {s.region === "서울" ? "서울특별시" : "경기도"} {s.district}
                      </span>
                      {s.round && (
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={s.round === "1회차"
                            ? { backgroundColor: "#EEF2FF", color: "#4F6BEE" }
                            : { backgroundColor: "#F5F3FF", color: "#7C3AED" }}
                        >
                          {s.round}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeRegion(s.key)}
                      className="w-6 h-6 rounded-full bg-[#F2F2F7] flex items-center justify-center"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 배송 안내 사항 */}
          <div className="bg-white rounded-xl border border-[#E5E5EA] px-4 py-4 space-y-2.5">
            <p className="text-[13px] font-semibold text-[#1C1C1E]">배송 안내 사항</p>
            {[
              { text: "1회차 PM 19:00 / 2회차 AM 01:00까지 픽업 유닛 도착 필수입니다.", emphasis: true },
              { text: "배차 확정 후 취소 시 페널티가 부과될 수 있습니다. 취소 시 당일 13시 이전에 해주세요.", emphasis: true },
              { text: "희망 수량은 참고용이며, 실제 배송 물량은 배차 확정 시 안내드립니다.", emphasis: false },
              { text: "배차 결과는 신청 후 15분 내 push 알림으로 발송됩니다.", emphasis: false },
            ].map(({ text, emphasis }, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-[13px] leading-relaxed flex-shrink-0 ${emphasis ? "text-[#FF3B30]" : "text-[#8E8E93]"}`}>·</span>
                <p className={`text-[13px] leading-relaxed ${emphasis ? "text-[#FF3B30] font-medium" : "text-[#8E8E93]"}`}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — 폰 프레임 하단 고정 */}
        <div className="flex-shrink-0 bg-white border-t border-[#E5E5EA] px-4 pt-3 pb-1">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full h-[52px] rounded-[14px] text-[17px] font-semibold transition-colors ${
              canSubmit
                ? "bg-[#6262EE] text-white active:opacity-80"
                : "bg-[#E8E8E8] text-[#C7C7CC] cursor-not-allowed"
            }`}
          >
            배차 신청 완료
          </button>
          <HomeIndicator />
        </div>
      </div>

      {/* ── 신청 확인 바텀시트 ── */}
      {showConfirmSheet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-[375px] bg-white rounded-t-3xl px-5 pt-3 pb-2">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mb-5" />
            <h3 className="text-[18px] font-bold text-[#1C1C1E] mb-1">이대로 신청할까요?</h3>
            <p className="text-[13px] text-[#8E8E93] mb-5">입력하신 내용을 확인해주세요.</p>

            <div className="bg-[#F2F2F7] rounded-2xl divide-y divide-white mb-5">
              {[
                { label: "신청 날짜", value: date },
                { label: "신청 회차", value: round === "1회차" ? "1회차 (PM 19:00~24:00)" : round === "2회차" ? "2회차 (AM 00:00~07:00)" : "-" },
                { label: "업무 유형", value: "배송/반품" },
                { label: "희망 수량", value: quantity ?? "-" },
                {
                  label: "신청 지역",
                  value: selectedRegions.length > 0
                    ? selectedRegions.map((r) => `${r.region === "서울" ? "서울특별시" : "경기도"} ${r.district}`).join(", ")
                    : "-",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-3 gap-3">
                  <span className="text-[14px] text-[#8E8E93] flex-shrink-0">{label}</span>
                  <span className="text-[14px] font-semibold text-[#1C1C1E] text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-1">
              <button
                onClick={() => setShowConfirmSheet(false)}
                className="flex-1 h-[52px] rounded-[14px] bg-[#F2F2F7] text-[#3C3C43] text-[16px] font-semibold"
              >
                수정할게요
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 h-[52px] rounded-[14px] bg-[#6262EE] text-white text-[16px] font-semibold active:opacity-80"
              >
                이대로 신청
              </button>
            </div>
            <HomeIndicator />
          </div>
        </div>
      )}

      {/* ── 신청 완료 팝업 ── */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-[323px] bg-white rounded-3xl px-6 py-8 flex flex-col items-center text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#E8F9ED] flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16L13 23L26 9" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#1C1C1E] mb-2">배차 신청이 완료되었습니다.</h3>
            <p className="text-[14px] text-[#8E8E93] leading-relaxed mb-7">
              15분 내로 AI가 배차를 확정하여<br/>알림톡으로 알려드릴게요.
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

      {/* ── 배송 권역 바텀시트 ── */}
      {showRegionSheet && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowRegionSheet(false)}
        >
          <div
            className="w-[375px] bg-white rounded-t-3xl pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mt-3 mb-2" />
            <p className="text-[16px] font-bold text-[#1C1C1E] px-5 py-3">배송 권역</p>
            <div className="divide-y divide-[#F2F2F7]">
              {Object.keys(REGION_DATA).map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    setAreaKey(region);
                    setSelectedRegions([]);
                    setShowRegionSheet(false);
                    setShowDistrictSheet(true);
                  }}
                  className={`w-full px-5 py-4 text-left text-[16px] flex items-center justify-between ${
                    areaKey === region ? "text-[#6262EE] font-semibold" : "text-[#1C1C1E]"
                  }`}
                >
                  {region}
                  {areaKey === region && (
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                      <path d="M1 6L6 11L15 1" stroke="#6262EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <HomeIndicator />
          </div>
        </div>
      )}

      {/* ── 신청 지역 바텀시트 ── */}
      {showDistrictSheet && areaKey && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowDistrictSheet(false)}
        >
          <div
            className="w-[375px] bg-white rounded-t-3xl flex flex-col"
            style={{ maxHeight: "72%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
            <p className="text-[16px] font-bold text-[#1C1C1E] px-5 py-3 flex-shrink-0">신청 지역</p>
            <div className="overflow-y-auto flex-1 divide-y divide-[#F2F2F7]">
              {districts.map((name) => {
                const isSelected = !!selectedRegions.find((s) => s.district === name);
                const prefix = areaKey === "서울" ? "서울특별시" : "경기도";
                return (
                  <button
                    key={name}
                    onClick={() => isSelected ? removeRegion(`${areaKey} ${name}`) : addRegion(name)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between"
                  >
                    <span className={`text-[16px] ${isSelected ? "text-[#6262EE] font-semibold" : "text-[#1C1C1E]"}`}>
                      {prefix} {name}
                    </span>
                    {isSelected && (
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M1 6L6 11L15 1" stroke="#6262EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex-shrink-0 px-5 pt-3 pb-1 border-t border-[#F2F2F7]">
              <button
                onClick={() => setShowDistrictSheet(false)}
                className="w-full h-[52px] rounded-[14px] bg-[#6262EE] text-white text-[17px] font-semibold active:opacity-80"
              >
                확인
              </button>
              <HomeIndicator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
