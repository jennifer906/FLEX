"use client";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  backHref?: string;
  rightLabel?: string;
  rightHref?: string;
  onBack?: () => void;
  closeIcon?: boolean;
}

export default function NavBar({ title, backHref, rightLabel, rightHref, onBack, closeIcon }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backHref) { router.push(backHref); return; }
    router.back();
  };

  return (
    <div className="nav-bar flex-shrink-0 px-4" style={{ height: 44 }}>
      {(backHref !== undefined || onBack !== undefined || closeIcon !== undefined) && (
        <button
          onClick={handleBack}
          className="absolute left-4 flex items-center justify-center w-8 h-8"
        >
          {closeIcon ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      )}
      <span className="text-[17px] font-semibold text-[#1A1A1A]">{title}</span>
      {rightLabel && rightHref && (
        <button
          onClick={() => router.push(rightHref)}
          className="absolute right-4 text-[15px] text-primary font-medium"
        >
          {rightLabel}
        </button>
      )}
    </div>
  );
}
