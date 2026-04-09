import type React from "react";
import { Button } from "@/components/button";

interface QtyButtonProps {
  onClick?: () => void;
  icon: React.ReactNode;
  tooltip: string;
}

export function QtyButton({ onClick, icon, tooltip }: QtyButtonProps) {
  return (
    <div className="relative group">
      <Button
        type="button"
        onClick={onClick}
        className="w-7 h-7 rounded-full border border-pink-soft/60 bg-white flex items-center justify-center text-text-main/50 hover:border-pink-soft hover:bg-pink-soft/10 hover:text-text-main active:scale-95 transition-all cursor-pointer"
      >
        {icon}
      </Button>
      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-charcoal text-white text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        {tooltip}
      </span>
    </div>
  );
}
