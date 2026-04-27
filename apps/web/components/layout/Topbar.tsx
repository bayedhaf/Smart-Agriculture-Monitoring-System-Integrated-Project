"use client";

import { Menu, Bell, User } from "lucide-react";


interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#D6E4D6] flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-[#6B7280] hover:bg-[#F0F9F0] hover:text-[#1A5C2A]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-2 rounded-full text-[#6B7280] hover:bg-[#F0F9F0] hover:text-[#1A5C2A]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#A32D2D]"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#1A5C2A] flex items-center justify-center text-white text-sm font-medium">
            F
          </div>
          <span className="text-sm font-medium text-[#374151] hidden sm:inline-block">
            Farmer Demo
          </span>
        </div>
      </div>
    </header>
  );
}