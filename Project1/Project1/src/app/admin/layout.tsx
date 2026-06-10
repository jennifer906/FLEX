"use client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[#E5E5EA] px-8 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#6262EE] flex items-center justify-center">
            <span className="text-white text-[12px] font-bold">D</span>
          </div>
          <span className="text-[15px] font-bold text-[#1C1C1E]">Delivus 운영 백오피스</span>
          <span className="text-[12px] text-[#8E8E93] border border-[#E5E5EA] rounded-full px-2 py-0.5">긴급 구인 관리</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#8E8E93]">운영 관리자</span>
          <div className="w-7 h-7 rounded-full bg-[#6262EE] flex items-center justify-center text-white text-[12px] font-bold">
            A
          </div>
        </div>
      </header>

      {/* 페이지 콘텐츠 */}
      <main className="px-8 py-6">
        {children}
      </main>
    </div>
  );
}
