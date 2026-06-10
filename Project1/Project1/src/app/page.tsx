"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

type BottomTab = "지도" | "박스 목록" | "배송 목록" | "계정 관리";

function MapIcon({ active }: { active: boolean }) {
  const c = active ? "#6262EE" : "#8E8E93";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={c} strokeWidth="1.7" fill={active ? "#EFEFFD" : "none"}/>
      <circle cx="12" cy="9" r="2.5" stroke={c} strokeWidth="1.7"/>
    </svg>
  );
}
function BoxIcon({ active }: { active: boolean }) {
  const c = active ? "#6262EE" : "#8E8E93";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"
        fill={active ? "#EFEFFD" : "none"}/>
      <path d="M12 3V21M3 8L12 13L21 8" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  );
}
function DeliveryIcon({ active }: { active: boolean }) {
  const c = active ? "#6262EE" : "#8E8E93";
  return (
    <svg width="26" height="24" viewBox="0 0 26 24" fill="none">
      <path d="M2 6h12v11H2z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"
        fill={active ? "#EFEFFD" : "none"}/>
      <path d="M14 9.5h4.5L22 13.5V17H14V9.5z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"
        fill={active ? "#EFEFFD" : "none"}/>
      <circle cx="6" cy="18" r="1.8" stroke={c} strokeWidth="1.5" fill={active ? "#EFEFFD" : "none"}/>
      <circle cx="18" cy="18" r="1.8" stroke={c} strokeWidth="1.5" fill={active ? "#EFEFFD" : "none"}/>
    </svg>
  );
}
function AccountIcon({ active }: { active: boolean }) {
  const c = active ? "#6262EE" : "#8E8E93";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="1.7" fill={active ? "#EFEFFD" : "none"}/>
      <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}

function InactivePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect x="2" y="2" width="40" height="40" rx="10" stroke="#E5E5EA" strokeWidth="2"/>
        <path d="M22 14v10M22 28h.01" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <p className="text-[14px] text-[#C7C7CC]">{label}</p>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="flex-shrink-0">
      <path d="M1 1L6 6L1 11" stroke="#C7C7CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AccountTab() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F2F2F7]">

      {/* 보라색 헤더 */}
      <div className="bg-[#6262EE] px-4 pt-2 pb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-[12px] font-medium mb-0.5">ID</p>
            <div className="flex items-center gap-2">
              <span className="text-white text-[20px] font-bold">김유정 님</span>
              <span className="text-white/80 text-[14px]">| 자동차</span>
            </div>
            <div className="mt-2.5">
              <span className="border border-white/60 text-white text-[12px] font-bold px-2.5 py-1 rounded">
                FLEX
              </span>
            </div>
          </div>
          <button className="mt-1 border border-white/50 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-white text-[13px] font-medium">알림함</span>
          </button>
        </div>
      </div>

      {/* 네비게이션 카드 영역 */}
      <div className="mx-3 -mt-5 space-y-2.5">

        {/* AI 배차 신청 */}
        <button
          onClick={() => router.push("/apply")}
          className="w-full bg-white rounded-2xl px-4 py-4 shadow-sm active:opacity-80 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="text-[16px] font-bold text-[#1C1C1E]">AI 배차 신청</p>
            <p className="text-[13px] text-[#8E8E93] mt-0.5">신청 후 15분 내 배차 결과를 알려드려요</p>
          </div>
          <ChevronRight />
        </button>

        {/* 긴급 구인 */}
        <button
          onClick={() => router.push("/urgent-list")}
          className="w-full bg-white rounded-2xl px-4 py-4 shadow-sm active:opacity-80 flex items-center justify-between border border-[#6262EE]/15"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EFEFFD] flex items-center justify-center flex-shrink-0">
              <span className="text-base leading-none">⚡</span>
            </div>
            <div className="text-left">
              <p className="text-[16px] font-bold text-[#6262EE]">긴급 구인</p>
              <p className="text-[13px] text-[#8E8E93] mt-0.5">추가 보상과 함께 바로 신청하세요</p>
            </div>
          </div>
          <ChevronRight />
        </button>

        {/* 신청 내역 */}
        <button
          onClick={() => router.push("/dispatch-list")}
          className="w-full bg-white rounded-2xl px-4 py-4 shadow-sm active:opacity-80 flex items-center justify-between"
        >
          <p className="text-[16px] font-bold text-[#1C1C1E]">신청 내역</p>
          <ChevronRight />
        </button>

        {/* 수신 설정 / 공지사항 */}
        <div className="grid grid-cols-2 gap-2.5">
          {["수신 설정", "공지사항"].map((label) => (
            <button key={label}
              className="bg-white rounded-2xl py-4 text-center shadow-sm active:opacity-70">
              <span className="text-[14px] font-semibold text-[#1C1C1E]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 필수 정보 */}
      <div className="mx-3 mt-5">
        <p className="text-[13px] font-semibold text-[#8E8E93] mb-2 px-1">필수 정보</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {[
            { label: "안전 보건 교육 수료", value: "미등록", valueColor: "#6262EE" },
            { label: "안전모 인증",         value: "미인증", valueColor: "#6262EE" },
          ].map((item, i) => (
            <div key={item.label}
              className={`flex items-center justify-between px-4 py-4 ${i > 0 ? "border-t border-[#F2F2F7]" : ""}`}>
              <div>
                <p className="text-[14px] text-[#1C1C1E]">{item.label}</p>
                <p className="text-[13px] mt-0.5" style={{ color: item.valueColor }}>{item.value}</p>
              </div>
              <ChevronRight />
            </div>
          ))}
        </div>
      </div>

      {/* 등록 정보 */}
      <div className="mx-3 mt-5 mb-8">
        <p className="text-[13px] font-semibold text-[#8E8E93] mb-2 px-1">등록 정보</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {[
            { label: "배송 수단",         value: "자동차",          valueColor: "#6262EE" },
            { label: "선호 지역",         value: "서울특별시 강남구", valueColor: "#6262EE" },
            { label: "정산 계좌",         value: "미등록",          valueColor: "#8E8E93" },
            { label: "지도 맵",           value: "미등록",          valueColor: "#8E8E93" },
            { label: "배송 및 앱 사용법", value: "",                valueColor: "#8E8E93" },
          ].map((item, i) => (
            <div key={item.label}
              className={`flex items-center justify-between px-4 py-4 ${i > 0 ? "border-t border-[#F2F2F7]" : ""}`}>
              <div>
                <p className="text-[14px] text-[#1C1C1E]">{item.label}</p>
                {item.value && (
                  <p className="text-[13px] mt-0.5" style={{ color: item.valueColor }}>{item.value}</p>
                )}
              </div>
              <ChevronRight />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<BottomTab>("계정 관리");

  const TABS: { id: BottomTab; icon: (a: boolean) => React.ReactNode; label: string }[] = [
    { id: "지도",     icon: (a) => <MapIcon active={a} />,       label: "지도" },
    { id: "박스 목록", icon: (a) => <BoxIcon active={a} />,      label: "박스 목록" },
    { id: "배송 목록", icon: (a) => <DeliveryIcon active={a} />, label: "배송 목록" },
    { id: "계정 관리", icon: (a) => <AccountIcon active={a} />,  label: "계정 관리" },
  ];

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#1a1a1a]">
      <div className="w-[375px] bg-white flex flex-col overflow-hidden relative" style={{ height: 812 }}>
        <StatusBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "지도"      && <InactivePlaceholder label="지도" />}
          {activeTab === "박스 목록" && <InactivePlaceholder label="박스 목록" />}
          {activeTab === "배송 목록" && <InactivePlaceholder label="배송 목록" />}
          {activeTab === "계정 관리" && <AccountTab />}
        </div>
        <div className="flex-shrink-0 bg-white border-t border-[#E5E5EA]">
          <div className="flex items-center">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 active:opacity-70">
                  {tab.icon(isActive)}
                  <span className={`text-[10px] font-medium ${isActive ? "text-[#6262EE]" : "text-[#8E8E93]"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          <HomeIndicator />
        </div>
      </div>
    </div>
  );
}
