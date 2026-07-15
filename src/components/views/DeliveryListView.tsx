"use client";
import { useState, useEffect, useRef } from "react";
import AccessHistoryCard from "@/components/AccessHistoryCard";
import {
  ACCESS_HISTORY,
  isWithinLast3Months,
  byRecency,
  type AccessHistoryEntry,
} from "@/lib/accessHistory";

type AccessOption = "자유 출입" | "공용 공동현관 비밀번호" | "경비실 호출";
// 이력/검색은 "같은 데이터를 다르게 보는 것"일 뿐이라 탭을 나누지 않고 하나(lookup)로 합친다.
// 등록/수정은 별개 작업(입력)이라 별도 탭으로 유지한다.
type AccessTab = "lookup" | "edit";

interface DeliveryBox {
  id: string;
  code: string;
  tracking: string;
}

interface DeliveryItem {
  id: string;
  addressTitle: string;
  unit: string;
  subAddress: string;
  customerName: string;
  customerPhone: string;
  requestMemo: string;
  // 수령 희망 장소는 "문앞" · "택배함" · "경비실" · "기타"(자유 텍스트, 10자 이내) 4가지뿐이다.
  deliveryLocation: string;
  boxes: DeliveryBox[];
  initialAccessValue: string;
  complexId: string;
  dong: string;
}

const DELIVERIES: DeliveryItem[] = [
  {
    id: "d1",
    addressTitle: "서울특별시 양천구 목동동로 53 동문굿모닝탑I",
    unit: "9동 2506호",
    subAddress: "서울특별시 양천구 신정동 324-10 동문굿모닝탑I",
    customerName: "손진현",
    customerPhone: "01083585830",
    requestMemo: "MEMO",
    deliveryLocation: "문앞",
    boxes: [
      { id: "b1", code: "양천318-D22", tracking: "20260624890141" },
      { id: "b2", code: "양천318-D23", tracking: "20260624890142" },
    ],
    initialAccessValue: "정보 없음",
    complexId: "dongmoon-mokdong",
    dong: "9동",
  },
  {
    id: "d2",
    addressTitle: "서울특별시 강서구 화곡로 12 대성빌라",
    unit: "3동 1102호",
    subAddress: "서울특별시 강서구 화곡동 123-4 대성빌라",
    customerName: "김민수",
    customerPhone: "01022334455",
    requestMemo: "부재 시 경비실에 맡겨주세요",
    deliveryLocation: "경비실",
    boxes: [{ id: "b3", code: "강서204-A11", tracking: "20260624890258" }],
    initialAccessValue: "공용 공동현관 비밀번호 #1234",
    complexId: "daesung-hwagok",
    dong: "3동",
  },
  {
    id: "d3",
    addressTitle: "서울특별시 마포구 성지길 28 웰빙프라자",
    unit: "5동 803호",
    subAddress: "서울특별시 마포구 서교동 45-2 웰빙프라자",
    customerName: "이수진",
    customerPhone: "01055512233",
    requestMemo: "빠른 배송 부탁드려요",
    deliveryLocation: "택배함",
    boxes: [{ id: "b4", code: "마포512-B03", tracking: "20260624890301" }],
    initialAccessValue: "자유 출입",
    complexId: "wellbeing-sangam",
    dong: "5동",
  },
  {
    id: "d4",
    addressTitle: "서울특별시 송파구 올림픽로 300 시그니처타워",
    unit: "2동 1904호",
    subAddress: "서울특별시 송파구 신천동 12-9 시그니처타워",
    customerName: "박현우",
    customerPhone: "01066677788",
    requestMemo: "요청사항 없음",
    deliveryLocation: "경비실",
    boxes: [{ id: "b5", code: "송파118-C07", tracking: "20260624890417" }],
    initialAccessValue: "경비실 호출",
    complexId: "signature-jamsil",
    dong: "2동",
  },
  {
    id: "d5",
    addressTitle: "서울특별시 성동구 왕십리로 66 리버파크",
    unit: "1동 305호",
    subAddress: "서울특별시 성동구 성수동1가 88-3 리버파크",
    customerName: "정유나",
    customerPhone: "01099911122",
    requestMemo: "문 앞에 놔주세요",
    deliveryLocation: "기타(창고앞)",
    boxes: [{ id: "b6", code: "성동207-A19", tracking: "20260624890522" }],
    initialAccessValue: "공용 공동현관 비밀번호",
    complexId: "riverpark-seongsu",
    dong: "1동",
  },
];

// 고객이 알림톡으로 남긴 정보가 있는지 판단한다 - "정보 없음"이거나 비밀번호 방식인데 코드가 없으면 고객 정보가 없는 것으로 본다.
function hasCustomerAccessInfo(value: string): boolean {
  if (value === "정보 없음") return false;
  if (value.startsWith("공용 공동현관 비밀번호") && !value.includes("#")) return false;
  return true;
}

// 이력 코드를 카드 스타일이 인식하는 형태로 맞춘다 - 자유 출입/경비실 호출은 그대로, 숫자 코드는 "공용 공동현관 비밀번호 #"로 감싸 파란 카드가 뜨게 한다.
function normalizeHistoryValue(code: string): string {
  if (code.startsWith("자유 출입") || code.startsWith("경비실 호출")) return code;
  const digits = code.replace(/#/g, "").trim();
  return digits ? `공용 공동현관 비밀번호 #${digits}` : "정보 없음";
}

// 고객 입력 정보가 없을 때만 쓰는 대체값 - 같은 동 이력 중 가장 최신 이력, 이력 자체가 없으면 정보 없음.
// 다른 동 이력은 비밀번호가 다를 수 있어 카드 자동완성에는 절대 쓰지 않는다 - 바텀시트의 "같은 단지 다른 동" 섹션에서 동 번호를 밝히고 참고용으로만 노출한다.
function getBestHistoryValue(item: DeliveryItem): string {
  const entries = ACCESS_HISTORY.filter((h) => h.complexId === item.complexId && h.dong === item.dong && isWithinLast3Months(h.date));
  if (entries.length === 0) return "정보 없음";
  const best = entries.sort(byRecency)[0];
  return normalizeHistoryValue(best.code);
}

// 출입 정보 표시값의 우선순위: 고객이 입력한 정보 > 같은 동 이력 중 최신 > 정보 없음.
function resolveAccessValue(item: DeliveryItem): string {
  return hasCustomerAccessInfo(item.initialAccessValue) ? item.initialAccessValue : getBestHistoryValue(item);
}

const ACCESS_OPTIONS: { value: AccessOption; needsInput?: boolean; placeholder?: string }[] = [
  { value: "공용 공동현관 비밀번호", needsInput: true, placeholder: "예) 103# 2506" },
  { value: "경비실 호출" },
  { value: "자유 출입" },
];

type AccessIconKind = "warning" | "unlock" | "lock" | "bell";

interface AccessCardStyle {
  bg: string;
  border: string | null;
  dashed: boolean;
  color: string;
  statusLabel: string;
  icon: AccessIconKind;
  filled: boolean;
  // 라이더에게 실제로 쓸 수 있는 코드가 없는 경우 "정보 없음"으로 통일해서 보여준다(값 텍스트 오버라이드).
  valueOverride: string | null;
}

// 출입 방법은 "공용 공동현관 비밀번호" · "경비실 호출" · "자유 출입" 3가지뿐이다.
// 색 규칙: 비밀번호 필요한데 미등록 = 노란색 / 등록됨 = 파란색 / 비밀번호 자체가 불필요 = 초록색.
// 비밀번호 필요 유형은 "공용 공동현관 비밀번호"뿐이고, 불필요 유형은 "자유 출입"·"경비실 호출"이다.
// 유형 자체를 모르는 "정보 없음"도 라이더 입장에선 미등록과 할 수 있는 게 똑같아서(검색/등록 대기)
// 같은 노란색 + 느낌표 아이콘으로 묶어서 보여준다.
function getAccessCardStyle(accessValue: string): AccessCardStyle {
  if (accessValue === "정보 없음") {
    return { bg: "#FFF6DC", border: null, dashed: false, color: "#9A6B0A", statusLabel: "확인이 필요해요", icon: "warning", filled: true, valueOverride: null };
  }
  // 비밀번호 불필요 그룹 — 자유 출입 / 경비실 호출은 같은 초록색·같은 느낌으로 노출
  if (accessValue.startsWith("자유 출입")) {
    return { bg: "#E8F9ED", border: null, dashed: false, color: "#1A9F5C", statusLabel: "비밀번호 불필요", icon: "unlock", filled: true, valueOverride: null };
  }
  if (accessValue.startsWith("경비실 호출")) {
    return { bg: "#E8F9ED", border: null, dashed: false, color: "#1A9F5C", statusLabel: "비밀번호 불필요", icon: "bell", filled: true, valueOverride: null };
  }
  // 비밀번호 필요 그룹 — 공용 공동현관 비밀번호
  if (accessValue.startsWith("공용 공동현관 비밀번호")) {
    const hasCode = accessValue.includes("#");
    if (hasCode) {
      return { bg: "#E7F1FF", border: null, dashed: false, color: "#1B6FE0", statusLabel: "비밀번호 등록됨", icon: "lock", filled: true, valueOverride: null };
    }
    // 코드 미등록 = 정보 없음과 동일하게 취급 (노란색 + 느낌표)
    return { bg: "#FFF6DC", border: null, dashed: false, color: "#9A6B0A", statusLabel: "비밀번호 미등록", icon: "warning", filled: true, valueOverride: "정보 없음" };
  }
  return { bg: "#F2F2FA", border: null, dashed: false, color: "#5457E6", statusLabel: "", icon: "lock", filled: true, valueOverride: null };
}

// 카드에는 "공용 공동현관 비밀번호"라는 방식 설명 없이 비밀번호(코드)만 보여준다 - 아이콘과 색으로 이미 방식이 구분되기 때문.
function getAccessDisplayText(accessStyle: AccessCardStyle, accessValue: string): string {
  const raw = accessStyle.valueOverride ?? accessValue;
  return raw.startsWith("공용 공동현관 비밀번호") ? raw.replace("공용 공동현관 비밀번호", "").trim() : raw;
}

function AccessIcon({ kind, color, filled }: { kind: AccessIconKind; color: string; filled: boolean }) {
  const fill = filled ? color : "none";
  const fillOpacity = filled ? 0.16 : 1;
  if (kind === "warning") {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
        <path
          d="M8.6 3.4c.6-1 2.2-1 2.8 0l6.5 11.2c.6 1-.2 2.4-1.4 2.4H3.5c-1.2 0-2-1.3-1.4-2.4L8.6 3.4z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 8v3.2M10 14h.01" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "unlock") {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
        <rect x="4" y="9" width="10" height="7" rx="2" stroke={color} strokeWidth="1.5" fill={fill} fillOpacity={fillOpacity} />
        <path d="M6.5 9V6.5A3 3 0 0 1 12.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "bell") {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
        <path
          d="M10 3a4 4 0 0 0-4 4c0 4-2 5-2 5h12s-2-1-2-5a4 4 0 0 0-4-4z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={fill}
          fillOpacity={fillOpacity}
        />
        <path d="M8.4 15a1.6 1.6 0 0 0 3.2 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
      <rect x="3" y="8.5" width="14" height="8" rx="2" stroke={color} strokeWidth="1.5" fill={fill} fillOpacity={fillOpacity} />
      <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

const TAB_LABEL: Record<AccessTab, string> = {
  lookup: "비밀번호 확인",
  edit: "등록/수정",
};

// 같은 동 이력은 5건까지 먼저 보여주고, 더보기를 누를 때마다 5건씩 추가로 불러온다.
const CODE_PAGE_SIZE = 5;

export default function DeliveryListView() {
  const [accessValues, setAccessValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(DELIVERIES.map((d) => [d.id, resolveAccessValue(d)]))
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<AccessTab>("lookup");
  const [selectedOption, setSelectedOption] = useState<AccessOption>("자유 출입");
  const [optionInput, setOptionInput] = useState("");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  // 배송 대기가 수십 건일 때 스크롤 부담을 줄이기 위해 상세 정보는 기본적으로 접어둔다.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set(DELIVERIES.map((d) => d.id)));
  // 물품별 체크박스 - 한 주소에 물품이 여러 개일 때, 지금 처리할 물품만 선택해서 상태 변경(특히 완료)을 적용한다.
  // 기본값은 전체 체크(보통은 다 같이 배송하니까), 일부만 있는 경우 라이더가 직접 해제한다.
  const [checkedBoxes, setCheckedBoxes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DELIVERIES.flatMap((d) => d.boxes.map((b) => [b.id, true])))
  );
  // 등록된 비밀번호가 많을 수 있어(최신 3개월 전체) 처음엔 추천순 상위 몇 개만 보여주고, 더보기를 누를 때마다 5건씩 추가로 불러온다.
  const [visibleCount, setVisibleCount] = useState(CODE_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sheetScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  // "같은 단지 다른 동 비밀번호 보기"는 별도 페이지가 아니라 같은 바텀시트 안에서 화면만 전환한다.
  const [showOtherDong, setShowOtherDong] = useState(false);
  const [otherDongQuery, setOtherDongQuery] = useState("");
  const [otherDongVisibleCount, setOtherDongVisibleCount] = useState(CODE_PAGE_SIZE);
  const [isLoadingMoreOtherDong, setIsLoadingMoreOtherDong] = useState(false);
  const otherDongLoadMoreRef = useRef<HTMLDivElement>(null);

  function toggleCollapse(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleBox(id: string) {
    setCheckedBoxes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleComplete(item: DeliveryItem) {
    const checkedCount = item.boxes.filter((b) => checkedBoxes[b.id]).length;
    if (checkedCount === 0) {
      fireToast("완료 처리할 물품을 선택해주세요");
      return;
    }
    fireToast(`물품 ${checkedCount}개가 문앞배송 완료 처리되었습니다`);
  }

  const activeItem = DELIVERIES.find((d) => d.id === activeId) ?? null;
  const activeAccessValue = activeId ? accessValues[activeId] : "";
  const isAccessMissing = activeAccessValue ? getAccessCardStyle(activeAccessValue).icon === "warning" : false;

  function fireToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function openAccessSheet(id: string) {
    setSelectedOption("자유 출입");
    setOptionInput("");
    setQuery("");
    setVisibleCount(CODE_PAGE_SIZE);
    setIsLoadingMore(false);
    setShowOtherDong(false);
    setOtherDongQuery("");
    setOtherDongVisibleCount(CODE_PAGE_SIZE);
    setIsLoadingMoreOtherDong(false);
    const needsAction = getAccessCardStyle(accessValues[id]).icon === "warning";
    setTab(needsAction ? "edit" : "lookup");
    setActiveId(id);
  }

  function saveAccessInfo() {
    if (!activeId) return;
    const opt = ACCESS_OPTIONS.find((o) => o.value === selectedOption)!;
    const codeTokens = optionInput
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => `#${part.replace(/#/g, "")}`)
      .join(" ");
    const value = opt.needsInput && codeTokens ? `${opt.value} ${codeTokens}` : opt.value;
    setAccessValues((prev) => ({ ...prev, [activeId]: value }));
    setActiveId(null);
    fireToast("출입 정보가 수정되었습니다");
  }

  function applyHistory(entry: AccessHistoryEntry) {
    if (!activeId) return;
    setAccessValues((prev) => ({ ...prev, [activeId]: entry.code }));
    setActiveId(null);
    fireToast("출입 정보가 적용되었습니다");
  }

  // 동+비밀번호 조합으로 합쳐 같은 동의 같은 비밀번호는 하나로 묶되, 다른 동은 코드가 같아도 따로 남긴다.
  const dedupeByDongCode = (entries: AccessHistoryEntry[]) =>
    Array.from(
      [...entries]
        .sort(byRecency)
        .reduce((map, h) => {
          const key = `${h.dong}__${h.code}`;
          if (!map.has(key)) map.set(key, h);
          return map;
        }, new Map<string, AccessHistoryEntry>())
        .values()
    );

  // 검색 전엔 배송지와 동일한 동만 보여주지만, 동 번호로 검색하면 그 동을 포함해 단지 전체에서 찾는다.
  const complexPool = activeItem
    ? ACCESS_HISTORY.filter((h) => h.complexId === activeItem.complexId && isWithinLast3Months(h.date))
    : [];

  const q = query.trim().toLowerCase();
  const sameDongAll = dedupeByDongCode(
    q ? complexPool.filter((h) => h.dong.toLowerCase().includes(q)) : complexPool.filter((h) => h.dong === activeItem?.dong)
  );
  const sameDongCodes = sameDongAll.slice(0, visibleCount);

  // 같은 단지 다른 동 이력: 기본값은 배송지 동을 뺀 목록이지만, 이 화면의 검색창으로 동 번호를 검색하면
  // 배송지 동도 포함해 단지 전체에서 찾는다(메인 검색과는 독립적인 상태값을 쓴다).
  const otherDongBase = dedupeByDongCode(complexPool.filter((h) => h.dong !== activeItem?.dong));
  const otherDongCount = otherDongBase.length;
  const otherDongQueryLower = otherDongQuery.trim().toLowerCase();
  const otherDongAll = otherDongQueryLower
    ? dedupeByDongCode(complexPool.filter((h) => h.dong.toLowerCase().includes(otherDongQueryLower)))
    : otherDongBase;
  const otherDongVisible = otherDongAll.slice(0, otherDongVisibleCount);

  // 같은 동 이력 목록의 무한 스크롤 - 시트 스크롤 컨테이너 안에서 하단 감지용 요소가 보이면 다음 페이지를 불러온다.
  useEffect(() => {
    if (tab !== "lookup" || showOtherDong) return;
    const root = sheetScrollRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && visibleCount < sameDongAll.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((v) => Math.min(v + CODE_PAGE_SIZE, sameDongAll.length));
            setIsLoadingMore(false);
          }, 400);
        }
      },
      { root, rootMargin: "80px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [tab, showOtherDong, visibleCount, isLoadingMore, sameDongAll.length]);

  // 다른 동 이력 목록의 무한 스크롤 (바텀시트 내부 화면 전환 상태에서만 동작)
  useEffect(() => {
    if (!showOtherDong) return;
    const root = sheetScrollRef.current;
    const sentinel = otherDongLoadMoreRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMoreOtherDong && otherDongVisibleCount < otherDongAll.length) {
          setIsLoadingMoreOtherDong(true);
          setTimeout(() => {
            setOtherDongVisibleCount((v) => Math.min(v + CODE_PAGE_SIZE, otherDongAll.length));
            setIsLoadingMoreOtherDong(false);
          }, 400);
        }
      },
      { root, rootMargin: "80px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showOtherDong, otherDongVisibleCount, isLoadingMoreOtherDong, otherDongAll.length]);

  // 다른 동 화면 검색어가 바뀌면 페이지를 처음부터 다시 센다.
  useEffect(() => {
    setOtherDongVisibleCount(CODE_PAGE_SIZE);
  }, [otherDongQueryLower]);

  return (
    <div className="flex-1 relative bg-[#F2F2F7]">
      <div className="absolute inset-0 overflow-y-auto">
      {/* 상태 탭 */}
      <div className="flex gap-2 px-3 pt-3 pb-2">
        {[
          { label: "대기", count: DELIVERIES.length, active: true },
          { label: "완료", count: 3, active: false },
          { label: "재진행", count: 0, active: false },
        ].map((t) => (
          <div
            key={t.label}
            className={`flex-1 h-[38px] rounded-[9px] border-[1.4px] bg-white flex items-center justify-center gap-1.5 text-[13.5px] font-bold ${
              t.active ? "border-primary" : "border-[#E5E5EA]"
            }`}
          >
            <span
              className={`w-[15px] h-[15px] rounded-[4px] flex-shrink-0 relative ${
                t.active ? "bg-primary" : "border-[1.6px] border-[#C7C9D1]"
              }`}
            >
              {t.active && (
                <svg className="absolute inset-0" viewBox="0 0 15 15" fill="none">
                  <path d="M3.5 7.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-text-secondary">{t.label}</span>
            <span className={t.active ? "text-primary" : "text-text-secondary"}>{t.count}</span>
          </div>
        ))}
      </div>

      {/* 검색 / 정렬 */}
      <div className="flex gap-2 px-3 pb-3">
        <div className="flex-1 h-10 rounded-lg bg-white border border-[#E5E5EA] flex items-center px-3 text-[13px] text-[#A7A9B1]">
          주소 및 물품 별칭 검색
        </div>
        <button className="w-[52px] h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6.2" stroke="#fff" strokeWidth="1.8" />
            <line x1="13.6" y1="13.6" x2="18" y2="18" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="h-10 px-3 rounded-lg bg-white border border-[#E5E5EA] flex items-center gap-1.5 text-[12.5px] font-semibold text-text-secondary whitespace-nowrap">
          정렬 순서
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="#3C3C43" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 배송 카드 목록 */}
      <div className="flex flex-col gap-3 pb-2">
        {DELIVERIES.map((item) => {
          const accessValue = accessValues[item.id];
          const accessStyle = getAccessCardStyle(accessValue);
          const isCollapsed = collapsedIds.has(item.id);
          return (
            <div key={item.id} className="mx-3 bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="flex gap-2.5 px-4 pt-4">
                <div className="w-[26px] h-[26px] rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2a5.5 5.5 0 0 0-5.5 5.5C4.5 11.6 10 18 10 18s5.5-6.4 5.5-10.5A5.5 5.5 0 0 0 10 2z" fill="#fff" />
                    <circle cx="10" cy="7.6" r="2" fill="#6262EE" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-[17px] font-extrabold leading-snug text-text-primary">{item.addressTitle}</h2>
                  <span className="inline-block mt-1.5 text-[13px] font-bold text-text-caption bg-[#F2F2F7] px-2.5 py-1 rounded-md">
                    {item.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 pt-1.5 pb-2 gap-2">
                <span className="text-[13.5px] text-text-caption">{item.subAddress}</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 opacity-60">
                  <rect x="6.5" y="6.5" width="10" height="10" rx="1.6" stroke="#8E8E93" strokeWidth="1.4" />
                  <path d="M4 12.5V4.6A1.6 1.6 0 0 1 5.6 3h7.9" stroke="#8E8E93" strokeWidth="1.4" />
                </svg>
              </div>

              {/* 배송 위치 - 출입 정보와 별개 항목이라 배지 밖에 독립된 줄로 노출 (기타는 10자 이내) */}
              <div className="px-4 pb-2 flex items-center gap-1.5">
                <p className="text-[12px] font-bold text-text-caption">배송 위치</p>
                <p className="text-[13.5px] font-bold text-text-primary">{item.deliveryLocation}</p>
              </div>

              {/* 출입 정보 - 주소 단위 정보라 카드 상단에 배치, 탭하면 이력/수정/검색이 합쳐진 바텀시트가 뜸 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => openAccessSheet(item.id)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left active:opacity-80"
                  style={{
                    background: accessStyle.bg,
                    borderWidth: accessStyle.border ? 1.5 : 0,
                    borderStyle: accessStyle.dashed ? "dashed" : "solid",
                    borderColor: accessStyle.border ?? "transparent",
                  }}
                >
                  <AccessIcon kind={accessStyle.icon} color={accessStyle.color} filled={accessStyle.filled} />
                  <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug break-words" style={{ color: accessStyle.color }}>
                    {getAccessDisplayText(accessStyle, accessValue)}
                  </p>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="flex-shrink-0">
                    <path
                      d="M1.5 1.5L6.5 7l-5 5.5"
                      stroke={accessStyle.color}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* 40건씩 스크롤하는 상황을 고려해 액션/물품목록/고객정보를 전부 접을 수 있게 하고,
                  펼치기 라벨 자체에 배송 대기 건수(물품 수)를 노출해서 몇 건 접혀있는지 바로 보이게 한다. */}
              <button
                onClick={() => toggleCollapse(item.id)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 active:bg-[#F2F2F7] border-b border-[#E5E5EA]"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="bg-[#141416] text-white font-extrabold text-[13px] px-2.5 py-1 rounded-[6px] truncate">
                    {item.boxes[0].code}
                  </span>
                  {item.boxes.length > 1 && (
                    <span className="text-[12px] font-bold text-text-caption flex-shrink-0">외 {item.boxes.length - 1}건</span>
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-[13.5px] font-bold text-primary flex-shrink-0">
                  배송 대기 {item.boxes.length}건
                  <svg
                    width="12"
                    height="7"
                    viewBox="0 0 10 6"
                    fill="none"
                    className="transition-transform"
                    style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <path d="M1 5l4-4 4 4" stroke="#5457E6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              {!isCollapsed && (
                <>
                  {/* 문앞배송 완료는 체크된 물품에만 적용되므로, 하나도 선택 안 됐을 때는 버튼을 막는 대신
                      탭 시 안내 토스트로 이유를 알려준다(이유 없이 잠긴 버튼은 더 나쁜 UX라서). */}
                  {(() => {
                    const checkedCount = item.boxes.filter((b) => checkedBoxes[b.id]).length;
                    return (
                      <div className="flex border-b border-[#E5E5EA]">
                        {["미배송", "장소 변경"].map((label, i) => (
                          <button
                            key={label}
                            onClick={() => fireToast(`"${label}" 처리되었습니다`)}
                            className={`flex-1 text-center py-3 text-[13.5px] font-bold text-primary active:bg-[#F7F7FA] ${
                              i > 0 ? "border-l border-[#E5E5EA]" : ""
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                        <button
                          onClick={() => handleComplete(item)}
                          className={`flex-1 text-center py-3 text-[13.5px] font-bold border-l border-[#E5E5EA] active:bg-[#F7F7FA] ${
                            checkedCount === 0 ? "text-[#C7C9D1]" : "text-primary"
                          }`}
                        >
                          문앞배송 완료
                        </button>
                      </div>
                    );
                  })()}

                  <div className="px-4 pt-3.5 pb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[16.5px] font-extrabold text-text-primary">
                        {item.customerName} <span className="font-medium text-[14.5px]">({item.customerPhone})</span>
                      </p>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M2.5 4A1.5 1.5 0 0 1 4 2.5h12A1.5 1.5 0 0 1 17.5 4v8A1.5 1.5 0 0 1 16 13.5H8l-4 3.3v-3.3H4A1.5 1.5 0 0 1 2.5 12V4z"
                            stroke="#26272B"
                            strokeWidth="1.4"
                          />
                        </svg>
                        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M4.4 3.2l2.6.5 1 2.7-1.6 1.6a9 9 0 0 0 4.6 4.6l1.6-1.6 2.7 1 .5 2.6c.1.6-.4 1.1-1 1.1C8.9 15.7 4.3 11.1 3.3 4.2c-.1-.6.4-1.1 1.1-1z"
                            stroke="#26272B"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-[12px] font-bold text-text-caption">고객 요청사항</p>
                      <p className="text-[14.5px] font-bold text-text-primary mt-0.5">{item.requestMemo}</p>
                    </div>
                  </div>

                  {/* 물품이 1개뿐이면 고를 게 없으니 체크박스 없이 배지 한 줄로 압축.
                      2개 이상일 때만 개별 체크가 의미 있으므로 그때만 전체 체크리스트를 보여준다. */}
                  {item.boxes.length === 1 ? (
                    <div className="flex items-center gap-2.5 px-4 py-2.5 border-t border-[#E5E5EA]">
                      <span className="bg-[#141416] text-white font-extrabold text-[13px] px-2.5 py-1 rounded-[6px]">
                        {item.boxes[0].code}
                      </span>
                      <span className="text-[12.5px] text-text-secondary tabular-nums">{item.boxes[0].tracking}</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2.5 border-t border-[#E5E5EA]">
                      <p className="text-[12px] font-bold text-text-caption mb-1.5">
                        물품 {item.boxes.length}개 · {item.boxes.filter((b) => checkedBoxes[b.id]).length}개 선택됨
                      </p>
                      <div className="space-y-1">
                        {item.boxes.map((box) => {
                          const checked = !!checkedBoxes[box.id];
                          return (
                            <button
                              key={box.id}
                              onClick={() => toggleBox(box.id)}
                              className="w-full flex items-center gap-2.5 py-0.5 active:opacity-70"
                            >
                              <span
                                className={`w-[18px] h-[18px] rounded-[5px] relative flex-shrink-0 ${
                                  checked ? "bg-primary" : "border-[1.6px] border-[#C7C9D1]"
                                }`}
                              >
                                {checked && (
                                  <svg className="absolute inset-0" viewBox="0 0 18 18" fill="none">
                                    <path d="M5 9.5l2.8 2.8 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </span>
                              <span
                                className={`font-extrabold text-[13px] px-2.5 py-1 rounded-[6px] ${
                                  checked ? "bg-[#141416] text-white" : "bg-[#F2F2F7] text-text-caption"
                                }`}
                              >
                                {box.code}
                              </span>
                              <span className="text-[12.5px] text-text-secondary tabular-nums">{box.tracking}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      </div>

      {/* 출입 정보 통합 바텀시트: 이력 / 수정 / 검색 */}
      {activeItem && (
        <div className="absolute inset-0 bg-black/45 z-50 flex items-end" onClick={() => setActiveId(null)}>
          <div
            ref={sheetScrollRef}
            className="w-full bg-[#F2F2F7] rounded-t-[20px] pt-2.5 pb-8 h-[85%] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-[4.5px] bg-[#D3D4DA] rounded-full mx-auto mb-3.5 flex-shrink-0" />

            <div className="px-5 flex-shrink-0">
              {showOtherDong ? (
                // 별도 페이지가 아니라 같은 바텀시트 안에서 화면만 전환 - 뒤로가기로 비밀번호 확인 화면으로 복귀한다.
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setShowOtherDong(false)} className="p-1 -ml-1 flex-shrink-0 active:opacity-60">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                      <path d="M7 1L1 7l6 6" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <h3 className="text-[17px] font-extrabold text-text-primary">같은 단지 다른 동 비밀번호</h3>
                </div>
              ) : (
                <>
                  <h3 className="text-[19px] font-extrabold text-text-primary mb-1">출입 정보</h3>
                  <p className="text-[13px] text-text-caption mb-3.5">{activeItem.addressTitle}</p>

                  <div className="flex bg-white rounded-lg p-1 gap-1 mb-4">
                    {(["lookup", "edit"] as AccessTab[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 h-9 rounded-md text-[13.5px] font-bold transition-colors ${
                          tab === t ? "bg-primary text-white" : "text-text-secondary"
                        }`}
                      >
                        {TAB_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-5">
              {showOtherDong && (
                <div>
                  <input
                    value={otherDongQuery}
                    onChange={(e) => setOtherDongQuery(e.target.value)}
                    placeholder="동 번호로 좁혀보기 (예) 101동"
                    className="w-full h-[44px] rounded-[10px] border-[1.4px] border-[#D8DAE0] bg-white px-3.5 text-[14px] mb-4 outline-none focus:border-primary"
                  />

                  {otherDongAll.length === 0 && (
                    <p className="text-center text-[13.5px] text-[#A4A6AE] py-8">
                      {otherDongQueryLower ? "검색 결과가 없습니다." : "등록된 다른 동 이력이 없어요."}
                    </p>
                  )}

                  {otherDongAll.length > 0 && (
                    <div>
                      <p className="text-[12.5px] font-bold text-text-secondary mb-2">
                        {otherDongQueryLower ? `검색 결과 ${otherDongAll.length}건` : `같은 단지 다른 동 ${otherDongAll.length}건`}
                      </p>
                      {otherDongVisible.map((h) => (
                        <AccessHistoryCard
                          key={h.id}
                          entry={h}
                          dongLabel={h.dong}
                          onApply={applyHistory}
                        />
                      ))}
                      {otherDongVisibleCount < otherDongAll.length && (
                        <div ref={otherDongLoadMoreRef} className="py-3 flex justify-center">
                          {isLoadingMoreOtherDong && <span className="text-[12.5px] text-text-secondary">불러오는 중...</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!showOtherDong && tab === "lookup" && (
                <div>
                  {/* 이력 조회와 검색은 같은 데이터를 보는 동일한 작업이라 탭을 나누지 않고,
                      검색창을 항상 보이는 실시간 필터로 얹어 목록 위에서 바로 좁혀볼 수 있게 한다. */}
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="동 번호로 좁혀보기 (예) 101동"
                    className="w-full h-[44px] rounded-[10px] border-[1.4px] border-[#D8DAE0] bg-white px-3.5 text-[14px] mb-4 outline-none focus:border-primary"
                  />

                  {sameDongAll.length === 0 && otherDongCount === 0 && (
                    <p className="text-center text-[13.5px] text-[#A4A6AE] py-8">
                      {q ? (
                        "검색 결과가 없습니다."
                      ) : (
                        <>
                          검색된 이력이 없어요.
                          <br />
                          "등록/수정" 탭에서 직접 등록해주세요.
                        </>
                      )}
                    </p>
                  )}

                  {(sameDongAll.length > 0 || otherDongCount > 0) && (
                    <div>
                      <p className="text-[12.5px] font-bold text-text-secondary mb-2">
                        {q ? `검색 결과 ${sameDongAll.length}건` : `같은 단지 같은 동 ${sameDongAll.length}건`}
                      </p>
                      {sameDongAll.length === 0 && (
                        <p className="text-[13px] text-[#A4A6AE] mb-4">
                          {q ? "검색 결과가 없습니다." : "같은 동에 등록된 이력이 없어요."}
                        </p>
                      )}
                      {sameDongAll.length > 0 && (
                        <div>
                          {sameDongCodes.map((h) => (
                            <AccessHistoryCard
                              key={h.id}
                              entry={h}
                              dongLabel={h.dong !== activeItem?.dong ? h.dong : undefined}
                              onApply={applyHistory}
                            />
                          ))}
                          {visibleCount < sameDongAll.length && (
                            <div ref={loadMoreRef} className="py-3 flex justify-center">
                              {isLoadingMore && <span className="text-[12.5px] text-text-secondary">불러오는 중...</span>}
                            </div>
                          )}
                        </div>
                      )}

                      {otherDongCount > 0 && (
                        <button
                          onClick={() => setShowOtherDong(true)}
                          className="w-full flex items-center justify-between mt-5 py-3 px-4 bg-white rounded-xl border border-[#E5E5EA] active:opacity-70"
                        >
                          <span className="text-[13.5px] font-bold text-text-primary">같은 단지 다른 동 비밀번호 보기</span>
                          <span className="flex items-center gap-1 text-[12.5px] font-semibold text-text-secondary">
                            {otherDongCount}건
                            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                              <path d="M1 1L6 6L1 11" stroke="#C7C7CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!showOtherDong && tab === "edit" && (
                <div>
                  <p className="text-[13px] text-text-caption leading-relaxed mb-4">
                    {isAccessMissing
                      ? "등록된 출입 정보가 없습니다. 정보를 등록해주시면 다음 배송 시에 많은 분들께 도움이 됩니다."
                      : "등록된 출입 정보를 수정할 수 있어요."}
                  </p>
                  <div className="mb-1">
                    {ACCESS_OPTIONS.map((opt) => (
                      <div key={opt.value}>
                        <div onClick={() => setSelectedOption(opt.value)} className="flex items-center gap-3 py-2.5 cursor-pointer">
                          <span
                            className={`w-[19px] h-[19px] rounded-full border-[1.8px] flex-shrink-0 relative ${
                              selectedOption === opt.value ? "border-primary" : "border-[#C7C9D1]"
                            }`}
                          >
                            {selectedOption === opt.value && <span className="absolute inset-[3px] rounded-full bg-primary" />}
                          </span>
                          <span className="text-text-primary text-[15px] font-medium">{opt.value}</span>
                        </div>
                        {opt.needsInput && selectedOption === opt.value && (
                          <div className="pl-8 pb-3">
                            <input
                              value={optionInput}
                              onChange={(e) => setOptionInput(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={opt.placeholder}
                              className="w-full h-[42px] rounded-lg border-[1.4px] border-[#D8DAE0] bg-white px-3 text-[13.5px] outline-none focus:border-primary"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={saveAccessInfo} className="w-full h-12 rounded-xl bg-primary text-white text-[15px] font-bold mt-2">
                    정보 저장
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-[#1C1C1E] text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-[10px] z-[60] whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
