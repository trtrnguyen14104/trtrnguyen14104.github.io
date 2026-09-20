"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { WindowId } from "@/hooks/useWindowManager";

export interface DesktopIconProps {
  id: WindowId | string;
  label: string;
  icon?: string;
  isSelected?: boolean;
  onSelect?: (id: WindowId | string) => void;
  onOpen?: (id: WindowId | string, e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => void;
  className?: string;
}

export function DesktopIcon({
  id,
  label,
  icon = "/icons/Windows-FOLDER.png",
  isSelected = false,
  onSelect,
  onOpen,
  className = "",
}: DesktopIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const triggerBounce = () => {
    if (iconRef.current) {
      gsap.timeline().to(iconRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerBounce();
    onSelect?.(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerBounce();
    onOpen?.(id, e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    // If double tapped within 350ms or already selected, open folder
    if (now - lastTapRef.current < 350 || isSelected) {
      triggerBounce();
      onOpen?.(id, e);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      triggerBounce();
      onSelect?.(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      triggerBounce();
      onOpen?.(id, e);
    }
  };

  return (
    <div
      ref={iconRef}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-selected={isSelected}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      className={`desktop-icon group flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-400 w-24 sm:w-28 ${
        isSelected
          ? "bg-blue-500/25 border border-blue-400/50 shadow-sm backdrop-blur-[2px]"
          : "border border-transparent hover:bg-white/10 hover:border-white/20"
      } ${className}`}
    >
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center pointer-events-none mb-1">
        <Image
          src={icon}
          alt={label}
          width={64}
          height={64}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-200 group-hover:scale-105 pointer-events-none select-none"
          draggable={false}
          priority
        />
      </div>
      <span className="text-white text-xs sm:text-sm font-medium text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-wide pointer-events-none px-1 rounded break-words line-clamp-2 max-w-[90px]">
        {label}
      </span>
    </div>
  );
}
