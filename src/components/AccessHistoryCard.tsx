"use client";
import { formatHistoryDate, formatMaskedPhone, type AccessHistoryEntry } from "@/lib/accessHistory";

// 등록일·등록자(마스킹)를 함께 보여줘 라이더가 "이 비밀번호를 믿을 수 있는지" 스스로 판단할 수 있게 한다.
// 다른 동 이력은 동 번호가 비밀번호 신뢰도를 판단하는 핵심 단서라 dongLabel로 밝혀서 보여준다.
export default function AccessHistoryCard({
  entry,
  dongLabel,
  onApply,
}: {
  entry: AccessHistoryEntry;
  dongLabel?: string;
  onApply: (entry: AccessHistoryEntry) => void;
}) {
  return (
    <div className="w-full bg-white rounded-xl mb-2 border border-[#E5E5EA] pl-4 pr-2.5 py-2.5 flex items-center gap-2">
      <button onClick={() => onApply(entry)} className="flex-1 min-w-0 text-left active:opacity-70">
        <div className="flex items-center gap-2">
          {dongLabel && (
            <span className="flex-shrink-0 text-[12px] font-bold text-primary bg-[#EFEFFD] rounded-md px-1.5 py-0.5">{dongLabel}</span>
          )}
          <p className="text-[17px] font-extrabold text-text-primary truncate">{entry.code}</p>
        </div>
        <p className="text-[11.5px] text-text-caption mt-0.5 truncate">
          {formatHistoryDate(entry.date)} 등록 · {formatMaskedPhone(entry.phone)}
        </p>
      </button>
    </div>
  );
}
