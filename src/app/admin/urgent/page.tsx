"use client";
import { useState } from "react";

// ─── 타입 ────────────────────────────────────────────────────────────

interface Applicant {
  id: string;
  name: string;
  rank: string;
  appliedAt: string;
  status: "대기" | "확정" | "취소";
}

interface UrgentPost {
  id: string;
  region: string;
  round: "1회차" | "2회차";
  date: string;
  total: number;
  filled: number;
  deadline: string;
  pickupUnit: string;     // 픽업 유닛
  basePrice: number;      // 기본 단가 (원/건)
  promoPrice: number;     // 프로모션 (전체 금액, 건당 아님)
  status: "모집중" | "마감임박" | "마감";
  createdAt: string;
}

// ─── 샘플 데이터 ─────────────────────────────────────────────────────

const APPLICANTS: Record<string, Applicant[]> = {
  "1": [
    { id:"a1", name:"김유정", rank:"A", appliedAt:"08:12", status:"확정" },
    { id:"a2", name:"이준호", rank:"B", appliedAt:"08:35", status:"대기" },
  ],
  "2": [
    { id:"b1", name:"박민지", rank:"S", appliedAt:"07:55", status:"확정" },
    { id:"b2", name:"최동현", rank:"C", appliedAt:"09:01", status:"대기" },
    { id:"b3", name:"정수빈", rank:"A", appliedAt:"09:12", status:"대기" },
  ],
  "3": [
    { id:"c1", name:"한승우", rank:"B", appliedAt:"19:30", status:"확정" },
    { id:"c2", name:"윤지호", rank:"D", appliedAt:"19:45", status:"확정" },
    { id:"c3", name:"오수연", rank:"S", appliedAt:"19:50", status:"확정" },
    { id:"c4", name:"강태양", rank:"Z", appliedAt:"20:00", status:"취소" },
  ],
  "4": [
    { id:"d1", name:"신다인", rank:"A", appliedAt:"10:05", status:"확정" },
  ],
};

const INITIAL_POSTS: UrgentPost[] = [
  { id:"1", region:"서울특별시 강남구", round:"1회차", date:"2026-06-05", total:5, filled:2,
    deadline:"18:00", pickupUnit:"성수 유닛", basePrice:2500, promoPrice:30000,
    status:"모집중", createdAt:"2026-06-05 08:00" },
  { id:"2", region:"서울특별시 서초구", round:"1회차", date:"2026-06-05", total:3, filled:2,
    deadline:"18:00", pickupUnit:"성수 유닛", basePrice:2500, promoPrice:20000,
    status:"마감임박", createdAt:"2026-06-05 08:30" },
  { id:"3", region:"서울특별시 송파구", round:"2회차", date:"2026-06-05", total:4, filled:4,
    deadline:"21:30", pickupUnit:"성수 유닛", basePrice:2800, promoPrice:40000,
    status:"마감", createdAt:"2026-06-04 20:00" },
  { id:"4", region:"경기도 성남시",     round:"1회차", date:"2026-06-06", total:6, filled:1,
    deadline:"18:00", pickupUnit:"성수 유닛", basePrice:2500, promoPrice:25000,
    status:"모집중", createdAt:"2026-06-05 10:00" },
];

const DEFAULT_FORM = {
  region: "", round: "1회차" as "1회차"|"2회차", date: "",
  total: 3, deadline: "18:00", pickupUnit: "성수 유닛",
  basePrice: 2500, promoPrice: 20000,
};

// ─── 날짜 범위 피커 ───────────────────────────────────────────────────

const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DAY_NAMES   = ["일","월","화","수","목","금","토"];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function DateRangePicker({ startDate, endDate, onChange }:
  { startDate: string; endDate: string; onChange: (s: string, e: string) => void }) {
  const today = new Date();
  const [open, setOpen]           = useState(false);
  const [picking, setPicking]     = useState<"start"|"end">("start");
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth  = (y: number, m: number) => new Date(y, m+1, 0).getDate();
  const firstDayOf   = (y: number, m: number) => new Date(y, m, 1).getDay();

  const openPicking = (field: "start"|"end") => {
    if (field === "end" && !startDate) return;
    setPicking(field); setOpen(true);
  };

  const handleDay = (ds: string) => {
    if (picking === "start") {
      onChange(ds, endDate && ds > endDate ? "" : endDate);
      setPicking("end");
    } else {
      if (startDate && ds < startDate) return;
      onChange(startDate, ds);
      setOpen(false);
    }
  };

  const prevMonth = () => viewMonth===0?(setViewYear(y=>y-1),setViewMonth(11)):setViewMonth(m=>m-1);
  const nextMonth = () => viewMonth===11?(setViewYear(y=>y+1),setViewMonth(0)):setViewMonth(m=>m+1);

  const isStart = (d:string) => d===startDate;
  const isEnd   = (d:string) => d===endDate;
  const inRange = (d:string) => !!startDate&&!!endDate&&d>startDate&&d<endDate;
  const isDisabled = (d:string) => picking==="end"&&!!startDate&&d<startDate;

  return (
    <div className="relative inline-flex items-center gap-2">
      <button onClick={()=>openPicking("start")}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[13px] font-medium transition-colors ${
          open&&picking==="start"?"border-[#6262EE] bg-[#EFEFFD] text-[#6262EE]":"border-[#E5E5EA] bg-white text-[#1C1C1E]"
        }`}>
        <span className="text-[11px] text-[#8E8E93] font-semibold">시작일</span>
        <span className={startDate?"text-[#1C1C1E]":"text-[#C7C7CC]"}>
          {startDate?startDate.slice(5).replace("-","/"):"선택"}
        </span>
      </button>
      <span className="text-[#C7C7CC] text-[13px]">~</span>
      <button onClick={()=>openPicking("end")} disabled={!startDate}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[13px] font-medium transition-colors ${
          !startDate?"border-[#E5E5EA] bg-[#F2F2F7] text-[#C7C7CC] cursor-not-allowed":
          open&&picking==="end"?"border-[#6262EE] bg-[#EFEFFD] text-[#6262EE]":"border-[#E5E5EA] bg-white text-[#1C1C1E]"
        }`}>
        <span className="text-[11px] text-[#8E8E93] font-semibold">마감일</span>
        <span className={endDate?"text-[#1C1C1E]":"text-[#C7C7CC]"}>
          {endDate?endDate.slice(5).replace("-","/"):"선택"}
        </span>
      </button>
      {(startDate||endDate)&&(
        <button onClick={()=>{onChange("","");setOpen(false);}}
          className="text-[12px] text-[#8E8E93] hover:text-[#FF3B30] transition-colors px-1">
          초기화
        </button>
      )}
      {open&&(
        <>
          <div className="fixed inset-0 z-40" onClick={()=>setOpen(false)}/>
          <div className="absolute top-11 left-0 z-50 bg-white rounded-2xl border border-[#E5E5EA] shadow-xl p-4 w-[272px]">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth}
                className="w-7 h-7 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] text-[16px]">‹</button>
              <span className="text-[14px] font-bold text-[#1C1C1E]">{viewYear}년 {MONTH_NAMES[viewMonth]}</span>
              <button onClick={nextMonth}
                className="w-7 h-7 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] text-[16px]">›</button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map((d,i)=>(
                <div key={d} className={`text-center text-[11px] font-semibold py-1 ${
                  i===0?"text-[#FF3B30]":i===6?"text-[#007AFF]":"text-[#C7C7CC]"}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {Array.from({length:firstDayOf(viewYear,viewMonth)}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:daysInMonth(viewYear,viewMonth)},(_,i)=>i+1).map(day=>{
                const ds=toDateStr(viewYear,viewMonth,day);
                const disabled=isDisabled(ds);
                const s=isStart(ds); const e=isEnd(ds); const r=inRange(ds);
                const isToday=ds===toDateStr(today.getFullYear(),today.getMonth(),today.getDate());
                return(
                  <button key={day} onClick={()=>!disabled&&handleDay(ds)} disabled={disabled}
                    className={`h-8 w-full text-[13px] font-medium rounded-lg transition-all relative
                      ${disabled?"text-[#E5E5EA] cursor-not-allowed":""}
                      ${s||e?"bg-[#6262EE] text-white":""}
                      ${r?"bg-[#EFEFFD] text-[#6262EE] rounded-none":""}
                      ${!s&&!e&&!r&&!disabled?"hover:bg-[#F2F2F7] text-[#1C1C1E]":""}
                    `}>
                    {day}
                    {isToday&&!s&&!e&&(
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6262EE]"/>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#8E8E93] text-center mt-3 pt-3 border-t border-[#F2F2F7]">
              {picking==="start"?"시작일을 선택하세요":`시작일(${startDate?.slice(5).replace("-","/")}) 이후만 선택 가능`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── 보조 상수 ───────────────────────────────────────────────────────

const RANK_COLOR: Record<string,string> = {
  S:"bg-yellow-100 text-yellow-700", A:"bg-green-100 text-green-700",
  B:"bg-blue-100 text-blue-700",    C:"bg-gray-100 text-gray-600",
  D:"bg-red-100 text-red-500",      Z:"bg-red-100 text-red-500",
};

const APPLICANT_STATUS_STYLE: Record<string,string> = {
  "확정":"bg-[#EAF4FF] text-[#007AFF]",
  "대기":"bg-[#FFF4E5] text-[#FF9500]",
  "취소":"bg-[#F2F2F7] text-[#8E8E93]",
};

const STATUS_STYLE: Record<string,string> = {
  "모집중": "bg-[#E8F9ED] text-[#34C759]",
  "마감임박":"bg-[#FFF0EE] text-[#FF3B30]",
  "마감":   "bg-[#F2F2F7] text-[#8E8E93]",
};

// ─── 메인 페이지 ─────────────────────────────────────────────────────

export default function UrgentPage() {
  const [posts, setPosts]                 = useState(INITIAL_POSTS);
  const [showCreate, setShowCreate]       = useState(false);
  const [form, setForm]                   = useState(DEFAULT_FORM);
  const [statusFilter, setStatusFilter]   = useState<"전체"|"모집중"|"마감임박"|"마감">("전체");
  const [startDate, setStartDate]         = useState("");
  const [endDate, setEndDate]             = useState("");
  const [closeConfirm, setCloseConfirm]   = useState<string|null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string|null>(null);

  const filtered = posts.filter(p => {
    const matchStatus = statusFilter==="전체" || p.status===statusFilter;
    const matchStart  = !startDate || p.date>=startDate;
    const matchEnd    = !endDate   || p.date<=endDate;
    return matchStatus && matchStart && matchEnd;
  });

  const handleCreate = () => {
    if (!form.region || !form.date) return;
    const newPost: UrgentPost = {
      id: String(Date.now()), region: form.region, round: form.round,
      date: form.date, total: form.total, filled: 0,
      deadline: form.deadline, pickupUnit: form.pickupUnit,
      basePrice: form.basePrice, promoPrice: form.promoPrice,
      status: "모집중", createdAt: new Date().toLocaleString("ko-KR").slice(0,-3),
    };
    setPosts(prev=>[newPost,...prev]);
    setForm(DEFAULT_FORM);
    setShowCreate(false);
  };

  const closePost = (id: string) => {
    setPosts(prev=>prev.map(p=>p.id===id?{...p,status:"마감" as const}:p));
    setCloseConfirm(null);
  };

  return (
    <div className="space-y-5">

      {/* 상단 — 상태 필터 + 등록 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(["전체","모집중","마감임박","마감"] as const).map(f=>(
            <button key={f} onClick={()=>setStatusFilter(f)}
              className={`px-4 h-8 rounded-xl text-[13px] font-semibold border transition-all ${
                statusFilter===f?"bg-[#1C1C1E] text-white border-[#1C1C1E]":"bg-white text-[#8E8E93] border-[#E5E5EA]"
              }`}>{f}</button>
          ))}
        </div>
        <button onClick={()=>setShowCreate(true)}
          className="h-9 px-4 rounded-xl bg-[#6262EE] text-white text-[13px] font-semibold hover:opacity-90 flex items-center gap-2">
          ⚡ 긴급 구인 등록
        </button>
      </div>

      {/* 날짜 범위 필터 */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#8E8E93]">날짜</span>
        <DateRangePicker
          startDate={startDate} endDate={endDate}
          onChange={(s,e)=>{setStartDate(s);setEndDate(e);}}
        />
        <span className="text-[12px] text-[#C7C7CC] ml-1">{filtered.length}건</span>
      </div>

      {/* 공고 카드 목록 */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.length===0&&(
          <div className="col-span-2 bg-white rounded-2xl border border-[#E5E5EA] p-10 text-center text-[14px] text-[#8E8E93]">
            해당 공고가 없습니다.
          </div>
        )}
        {filtered.map(p=>{
          const remain = p.total - p.filled;
          const pct = (p.filled/p.total)*100;
          return(
            <div key={p.id}
              onClick={()=>setSelectedPostId(p.id)}
              className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-shadow ${
                p.status==="마감"?"border-[#E5E5EA] opacity-60":"border-[#E5E5EA]"
              }`}>

              {/* 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      p.round==="1회차"?"bg-blue-50 text-blue-600":"bg-purple-50 text-purple-600"
                    }`}>{p.round}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[17px] font-bold text-[#1C1C1E]">{p.region}</p>
                  <p className="text-[12px] text-[#8E8E93] mt-0.5">{p.date} · 마감 {p.deadline}</p>
                </div>
                {p.status!=="마감"&&(
                  <button onClick={e=>{e.stopPropagation();setCloseConfirm(p.id);}}
                    className="px-3 h-7 rounded-lg border border-[#FF3B30]/40 text-[#FF3B30] text-[11px] font-semibold hover:bg-[#FFF0EE]">
                    마감
                  </button>
                )}
              </div>

              {/* 픽업 유닛 */}
              <div className="text-[12px] text-[#8E8E93] mb-2.5 flex items-center gap-1">
                <span>📍</span>
                <span>{p.pickupUnit} · {p.round==="1회차"?"PM 19:00":"AM 01:00"}까지 도착</span>
              </div>

              {/* 진행률 */}
              <div className="mb-3">
                <div className="flex justify-between text-[12px] text-[#8E8E93] mb-1.5">
                  <span>{p.filled}명 신청</span>
                  <span className="font-semibold text-[#FF3B30]">{remain}자리 남음</span>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF3B30] rounded-full transition-all" style={{width:`${pct}%`}}/>
                </div>
                <div className="flex justify-between text-[11px] text-[#C7C7CC] mt-1">
                  <span>0</span><span>목표 {p.total}명</span>
                </div>
              </div>

              {/* 보상 */}
              <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#8E8E93]">기본 단가</span>
                  <span className="font-semibold text-[#1C1C1E]">{p.basePrice.toLocaleString()}원/건</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#8E8E93]">프로모션 (전체)</span>
                  <span className="font-bold text-[#FF6B00]">+{p.promoPrice.toLocaleString()}원</span>
                </div>
              </div>
              <p className="text-[11px] text-[#C7C7CC] mt-2 text-right">등록: {p.createdAt}</p>
            </div>
          );
        })}
      </div>

      {/* ── 지원자 목록 모달 ── */}
      {selectedPostId&&(()=>{
        const post = posts.find(p=>p.id===selectedPostId)!;
        const applicants = APPLICANTS[selectedPostId]??[];
        return(
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
               onClick={()=>setSelectedPostId(null)}>
            <div className="bg-white rounded-2xl w-[480px] shadow-xl overflow-hidden"
                 onClick={e=>e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-[#F2F2F7]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        post.round==="1회차"?"bg-blue-50 text-blue-600":"bg-purple-50 text-purple-600"
                      }`}>{post.round}</span>
                      <span className="text-[12px] text-[#8E8E93]">{post.date} · 마감 {post.deadline}</span>
                    </div>
                    <p className="text-[18px] font-bold text-[#1C1C1E]">{post.region}</p>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">
                      {post.filled}/{post.total}명 · {post.pickupUnit} ({post.round==="1회차"?"PM 19:00":"AM 01:00"}까지) · 기본 {post.basePrice.toLocaleString()}원/건 + 프로모션 {post.promoPrice.toLocaleString()}원
                    </p>
                  </div>
                  <button onClick={()=>setSelectedPostId(null)}
                    className="text-[#8E8E93] hover:text-[#1C1C1E] text-[20px] leading-none">×</button>
                </div>
              </div>
              <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
                <p className="text-[13px] font-semibold text-[#8E8E93] mb-3">지원자 목록 ({applicants.length}명)</p>
                {applicants.length===0?(
                  <p className="text-[14px] text-[#C7C7CC] text-center py-8">아직 지원자가 없습니다.</p>
                ):(
                  <div className="divide-y divide-[#F2F2F7]">
                    {applicants.map(a=>(
                      <div key={a.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[13px] font-bold text-[#1C1C1E]">
                            {a.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold text-[#1C1C1E]">{a.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${RANK_COLOR[a.rank]}`}>{a.rank}</span>
                            </div>
                            <p className="text-[12px] text-[#8E8E93]">신청 {a.appliedAt}</p>
                          </div>
                        </div>
                        <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${APPLICANT_STATUS_STYLE[a.status]}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-[#F2F2F7] flex gap-3">
                <button onClick={()=>setSelectedPostId(null)}
                  className="flex-1 h-10 rounded-xl bg-[#F2F2F7] text-[#3C3C43] font-semibold text-[14px]">
                  닫기
                </button>
                {post.status!=="마감"&&(
                  <button onClick={()=>{setSelectedPostId(null);setCloseConfirm(post.id);}}
                    className="px-5 h-10 rounded-xl border border-[#FF3B30]/40 text-[#FF3B30] font-semibold text-[14px] hover:bg-[#FFF0EE]">
                    공고 마감
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 긴급 구인 등록 모달 ── */}
      {showCreate&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-[460px] shadow-xl">
            <h3 className="text-[18px] font-bold text-[#1C1C1E] mb-5">긴급 구인 등록</h3>
            <div className="space-y-3">
              {[
                {label:"배송 지역",     key:"region",     type:"text", placeholder:"예: 서울특별시 강남구"},
                {label:"배차 날짜",     key:"date",       type:"date", placeholder:""},
                {label:"마감 시각",     key:"deadline",   type:"time", placeholder:""},
                {label:"픽업 유닛",     key:"pickupUnit", type:"text", placeholder:"예: 성수 유닛"},
              ].map(({label,key,type,placeholder})=>(
                <div key={key}>
                  <label className="text-[13px] font-semibold text-[#1C1C1E] block mb-1">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(form as Record<string,string|number>)[key] as string}
                    onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    className="w-full h-10 border border-[#E5E5EA] rounded-xl px-3 text-[14px] outline-none focus:border-[#6262EE]"/>
                </div>
              ))}
              <div>
                <label className="text-[13px] font-semibold text-[#1C1C1E] block mb-1">신청 회차</label>
                <div className="flex gap-2">
                  {(["1회차","2회차"] as const).map(r=>(
                    <button key={r} onClick={()=>setForm(f=>({...f,round:r}))}
                      className={`flex-1 h-10 rounded-xl border text-[14px] font-semibold transition-colors ${
                        form.round===r?"bg-[#6262EE] text-white border-[#6262EE]":"bg-white text-[#8E8E93] border-[#E5E5EA]"
                      }`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {label:"모집 인원",          key:"total",      min:1,    max:20},
                  {label:"기본 단가 (원/건)",   key:"basePrice",  min:1000, max:10000},
                  {label:"프로모션 (총액, 원)", key:"promoPrice", min:0,    max:1000000},
                ].map(({label,key,min,max})=>(
                  <div key={key}>
                    <label className="text-[13px] font-semibold text-[#1C1C1E] block mb-1">{label}</label>
                    <input type="number" min={min} max={max}
                      value={(form as unknown as Record<string,number>)[key]}
                      onChange={e=>setForm(f=>({...f,[key]:Number(e.target.value)}))}
                      className="w-full h-10 border border-[#E5E5EA] rounded-xl px-3 text-[14px] outline-none focus:border-[#6262EE]"/>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>{setShowCreate(false);setForm(DEFAULT_FORM);}}
                className="flex-1 h-11 rounded-xl bg-[#F2F2F7] text-[#3C3C43] font-semibold">취소</button>
              <button onClick={handleCreate}
                className="flex-1 h-11 rounded-xl bg-[#6262EE] text-white font-semibold">등록하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 마감 확인 모달 ── */}
      {closeConfirm&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-[360px] shadow-xl">
            <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-2">공고를 마감할까요?</h3>
            <p className="text-[13px] text-[#8E8E93] mb-5">마감 후에는 추가 신청이 불가합니다.</p>
            <div className="flex gap-3">
              <button onClick={()=>setCloseConfirm(null)}
                className="flex-1 h-10 rounded-xl bg-[#F2F2F7] text-[#3C3C43] font-semibold text-[14px]">취소</button>
              <button onClick={()=>closePost(closeConfirm)}
                className="flex-1 h-10 rounded-xl bg-[#FF3B30] text-white font-semibold text-[14px]">마감</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
