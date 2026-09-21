"use client";

import React, { useEffect, useRef } from "react";
import {
  RotateCcw,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { WindowId } from "@/hooks/useWindowManager";
import { portfolioData } from "@/data/portfolioData";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWindow: (id: WindowId) => void;
  onRestartPortfolio?: () => void;
}

export function StartMenu({
  isOpen,
  onClose,
  onOpenWindow,
  onRestartPortfolio,
}: StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Prevent immediate close if click was on the start button itself
        const target = e.target as HTMLElement;
        if (target.closest('[data-start-button="true"]')) {
          return;
        }
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleShortcutClick = (id: WindowId) => {
    onOpenWindow(id);
    onClose();
  };

  const handleRestart = () => {
    if (onRestartPortfolio) {
      onRestartPortfolio();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-label="Start Menu"
      className="fixed bottom-14 left-2 sm:left-4 z-50 w-90 sm:w-100 max-w-[calc(100vw-16px)] rounded-2xl bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden text-white flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {/* User Profile Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3.5">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-md shrink-0 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portfolioData.profile.avatar || "/pictures/me.png"}
            alt="Profile avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-white truncate">
            {portfolioData.profile.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30">
              {portfolioData.profile.role}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {portfolioData.profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tagline / Bio snippet */}
      <div className="px-4 py-2 bg-black/25 text-[11px] text-slate-300 border-b border-white/5 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        <span className="truncate">{portfolioData.profile.tagline}</span>
      </div>

      {/* Pinned Folder Shortcuts */}
      <div className="p-3">
        <div className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Pinned Folders
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            role="button"
            aria-label="Open About Me"
            onClick={() => handleShortcutClick("about-me")}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/Windows-FOLDER.png"
                alt=""
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                About Me
              </div>
              <div className="text-xs text-slate-400 truncate">
                Bio, skills, tech stack & background
              </div>
            </div>
          </button>

          <button
            type="button"
            role="button"
            aria-label="Open Projects"
            onClick={() => handleShortcutClick("projects")}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/Windows-FOLDER.png"
                alt=""
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                Projects
              </div>
              <div className="text-xs text-slate-400 truncate">
                Interactive showcase, GitHub repos & live demos
              </div>
            </div>
          </button>

          <button
            type="button"
            role="button"
            aria-label="Open Contact"
            onClick={() => handleShortcutClick("contact")}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/Windows-FOLDER.png"
                alt=""
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                Contact
              </div>
              <div className="text-xs text-slate-400 truncate">
                Email, socials & quick contact form
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Links / Socials */}
      <div className="px-4 py-2.5 bg-black/20 border-t border-white/5 flex items-center justify-around gap-2 text-xs">
        <a
          href={portfolioData.profile.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <GithubIcon className="w-3.5 h-3.5 text-white" />
          <span>GitHub</span>
        </a>
        <a
          href={portfolioData.profile.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>LinkedIn</span>
        </a>
        <a
          href={`mailto:${portfolioData.profile.email}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-yellow-400" />
          <span>Email</span>
        </a>
      </div>

      {/* Footer Bar: Location & Restart */}
      <div className="px-4 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="truncate">{portfolioData.profile.location}</span>
        </div>

        <button
          type="button"
          role="button"
          aria-label="Restart Portfolio"
          onClick={handleRestart}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors active:scale-95"
          title="Restart Portfolio"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
}
