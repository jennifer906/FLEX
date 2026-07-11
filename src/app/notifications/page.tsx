"use client";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/StatusBar";
import HomeIndicator from "@/components/HomeIndicator";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "미배차 보상 안내",
    body: "최종 배차에 실패하였습니다. 보상금을 받아가세요.",
    date: "2026.06.11 12:44",
  },
  {
    id: 2,
    title: "배차 확정 알림",
    body: "6월 11일 2회차 서울특별시 서초구 배차가 확정되었습니다.",
    date: "2026.06.11 09:15",
  },
  {
    id: 3,
    title: "간선 유닛 도착 알림",
    body: "안양_동안구 유닛에 간선이 도착하였습니다.\n유닛에 방문하여 할당 받은 박스를 스캔하여 배송을 진행해 주세요.\n30분 결과 시 배차가 취소될 수 있습니다.",
    date: "2026.06.11 08:30",
  },
  {
    id: 4,
    title: "배차 후보 등록 안내",
    body: "6월 14일 1회차 서울특별시 용산구 배차 후보로 등록되었습니다. 당일 13시 이전까지 취소 가능합니다.",
    date: "2026.06.10 18:22",
  },
  {
    id: 5,
    title: "공지사항",
    body: "6월 배차 신청 참고 사항이 업데이트되었습니다. 확인 후 신청해 주세요.",
    date: "2026.06.10 10:00",
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#111]">
      <div className="w-[375px] min-h-[812px] bg-white flex flex-col">
        <StatusBar />

        {/* 헤더 */}
        <div className="relative flex items-center justify-center h-[44px] border-b border-[#E5E5EA] bg-white flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="absolute left-4 text-[#6262EE] text-[15px] font-medium"
          >
            뒤로
          </button>
          <span className="text-[17px] font-bold text-[#1C1C1E]">알림함</span>
        </div>

        {/* 알림 목록 */}
        <div className="flex-1 overflow-y-auto">
          {NOTIFICATIONS.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[#8E8E93]">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" opacity={0.3}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="#1C1C1E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#1C1C1E" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
              <span className="text-[15px] font-medium">내용이 없습니다</span>
            </div>
          ) : (
            NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-4 border-b border-[#F2F2F7]">
                {/* 삼각형 아이콘 */}
                <div className="flex-shrink-0 mt-[5px]"
                  style={{
                    width: 0, height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: "8px solid #6262EE",
                  }}
                />
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[#1C1C1E] mb-1">{n.title}</p>
                  <p className="text-[13px] font-medium text-[#3C3C43] leading-[1.55] whitespace-pre-line">
                    {n.body}
                  </p>
                  <p className="text-[11px] text-[#8E8E93] font-medium mt-2 text-right">{n.date}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <HomeIndicator />
      </div>
    </div>
  );
}
