"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Mic,
  Globe,
  Wifi,
  Volume2,
} from "lucide-react";
import { WindowConfig, WindowId } from "@/hooks/useWindowManager";
import { StartMenu } from "./StartMenu";
import { portfolioData } from "@/data/portfolioData";

export interface TaskbarProps {
  windows: Record<WindowId, WindowConfig>;
  activeWindowId: WindowId | null;
  onOpenWindow: (id: WindowId) => void;
  onMinimizeWindow: (id: WindowId) => void;
  onBringToFront: (id: WindowId) => void;
  onRestartPortfolio?: () => void;
  className?: string;
}

export function Taskbar({
  windows,
  activeWindowId,
  onOpenWindow,
  onMinimizeWindow,
  onBringToFront,
  onRestartPortfolio,
  className = "",
}: TaskbarProps) {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isLiveDate, setIsLiveDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const handleToggleLiveDate = () => {
    setIsLiveDate((prev) => {
      const next = !prev;
      if (next) {
        setCurrentTime(new Date());
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isLiveDate) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveDate]);

  const formatLiveTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatLiveDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const timeDisplay = isLiveDate && currentTime
    ? formatLiveTime(currentTime)
    : "4:04 PM";

  const dateDisplay = isLiveDate && currentTime
    ? formatLiveDate(currentTime)
    : "14/10/2004";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes("about") || query.includes("bio") || query.includes("skill")) {
      onOpenWindow("about-me");
      setSearchQuery("");
    } else if (query.includes("project") || query.includes("work") || query.includes("quiz")) {
      onOpenWindow("projects");
      setSearchQuery("");
    } else if (query.includes("contact") || query.includes("mail") || query.includes("hire")) {
      onOpenWindow("contact");
      setSearchQuery("");
    } else {
      // Default: open start menu to explore
      setIsStartMenuOpen(true);
    }
  };

  return (
    <>
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onOpenWindow={onOpenWindow}
        onRestartPortfolio={onRestartPortfolio}
      />

      <nav
        aria-label="Windows Taskbar"
        className={`fixed bottom-0 left-0 right-0 z-40 h-12 bg-[#0f172a]/60 backdrop-blur-md border-t border-white/10 windows-taskbar flex items-center justify-between px-3 select-none ${className}`}
      >
        {/* Left: Start, Search, Pinned Folder, Globe */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Start Menu Toggle */}
          <button
            type="button"
            role="button"
            aria-label="Start"
            data-start-button="true"
            title="Start"
            onClick={() => setIsStartMenuOpen((prev) => !prev)}
            className={`p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center ${
              isStartMenuOpen ? "bg-white/20 text-white shadow-inner" : ""
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Pill-shaped Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="h-8 px-2.5 rounded-full bg-black/30 hover:bg-black/40 focus-within:bg-black/50 border border-white/20 flex items-center gap-2 text-white/80 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/50 w-16 sm:w-28 md:w-36 focus:w-32 sm:focus:w-44 transition-all"
            />
            <button
              type="button"
              aria-label="Voice Search"
              className="hover:text-white transition-colors"
              onClick={() => setIsStartMenuOpen(true)}
            >
              <Mic className="w-3.5 h-3.5 text-white/60 hover:text-white/90 shrink-0" />
            </button>
          </form>

          {/* Pinned Folder Icon */}
          <button
            type="button"
            role="button"
            aria-label="Pinned Folder"
            title="File Explorer"
            onClick={() => onOpenWindow("projects")}
            className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/Windows-FOLDER.png"
              alt="Pinned folder"
              className="w-5 h-5 object-contain"
            />
          </button>

          {/* Browser Globe Icon */}
          <a
            href={portfolioData.profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="Browser (GitHub)"
            title="Browser (GitHub)"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white active:scale-95 transition-all flex items-center justify-center"
          >
            <Globe className="w-5 h-5" />
          </a>
        </div>

        {/* Center: Open Windows Badges */}
        <div className="flex items-center gap-1.5 px-2 overflow-x-auto no-scrollbar max-w-[50%]">
          {Object.values(windows)
            .filter((win) => win.isOpen)
            .map((win) => {
              const isActive = activeWindowId === win.id && !win.isMinimized;
              const cleanTitle = win.title.replace(" - File Explorer", "");

              return (
                <button
                  key={win.id}
                  type="button"
                  role="button"
                  aria-label={cleanTitle}
                  onClick={() => {
                    if (isActive) {
                      onMinimizeWindow(win.id);
                    } else {
                      onBringToFront(win.id);
                    }
                  }}
                  className={`relative h-8 px-3 rounded-lg flex items-center gap-2 text-xs font-medium transition-all shrink-0 active:scale-95 ${
                    isActive
                      ? "bg-white/20 text-white shadow-sm"
                      : win.isMinimized
                      ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                      : "bg-white/10 text-white/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={win.icon}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  <span className="truncate max-w-30">{cleanTitle}</span>

                  {/* Active bottom indicator line */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-full transition-all ${
                      isActive
                        ? "w-7 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                        : win.isMinimized
                        ? "w-2 bg-white/30"
                        : "w-4 bg-white/60"
                    }`}
                  />
                </button>
              );
            })}
        </div>

        {/* Right: System Tray */}
        <div className="flex items-center gap-2.5 text-white/80 shrink-0">
          {/* Wifi */}
          <button
            type="button"
            aria-label="Wifi"
            title="Wifi: Connected (1000 Mbps)"
            className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
          >
            <Wifi className="w-4 h-4" />
          </button>

          {/* Volume */}
          <button
            type="button"
            aria-label="Volume"
            title="Volume: 100%"
            className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Battery */}
          <div
            title="Battery: 100% Fully Charged"
            className="p-1 flex items-center justify-center cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/Windows_battery.png"
              alt="Battery: 100%"
              className="h-4 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </div>

          {/* Clock & Date (Toggleable to live date) */}
          <button
            type="button"
            role="button"
            aria-label="Clock and date"
            suppressHydrationWarning
            title={
              isLiveDate
                ? "Showing Live Time & Date (Click for 14/10/2004)"
                : "Showing 14/10/2004 (Click for Live Time & Date)"
            }
            onClick={handleToggleLiveDate}
            className="flex flex-col items-end text-[11px] leading-tight font-medium text-white/90 hover:bg-white/10 px-2 py-1 rounded-md transition-colors cursor-pointer group"
          >
            <span className="font-semibold text-white tracking-wide" suppressHydrationWarning>
              {timeDisplay}
            </span>
            <span className="text-[10px] text-white/70 group-hover:text-cyan-300 transition-colors" suppressHydrationWarning>
              {dateDisplay}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
