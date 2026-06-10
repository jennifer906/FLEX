"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PhoneShell({ children, className = "" }: Props) {
  return (
    <div className="flex justify-center items-start min-h-screen bg-[#1a1a1a] py-8">
      <div className={`phone-shell flex flex-col shadow-2xl rounded-[40px] overflow-hidden ${className}`}
           style={{ width: 375, minHeight: 812 }}>
        {children}
      </div>
    </div>
  );
}
