"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { ProjectItem } from "@/types/portfolio";
import { Code2, Sparkles, Layers } from "lucide-react";

export interface LaptopMockupProps {
  project: ProjectItem;
  className?: string;
  projectNumberScript?: string;
}

export function LaptopMockup({
  project,
  className = "",
  projectNumberScript,
}: LaptopMockupProps) {
  const [imgErrors, setImgErrors] = useState<{
    left?: boolean;
    main?: boolean;
    right?: boolean;
  }>({});

  // Reset errors when project changes
  const [currentProjectId, setCurrentProjectId] = useState(project.id);
  if (project.id !== currentProjectId) {
    setCurrentProjectId(project.id);
    setImgErrors({});
  }

  const handleImageError = (position: "left" | "main" | "right") => {
    setImgErrors((prev) => ({ ...prev, [position]: true }));
  };

  const projectNumInt = parseInt(project.number, 10);
  const scriptText =
    projectNumberScript || `project ${isNaN(projectNumInt) ? 1 : projectNumInt}`;

  return (
    <div
      data-testid="laptop-mockup"
      className={`relative w-full max-w-4xl mx-auto flex flex-col items-center select-none pt-4 pb-8 ${className}`}
    >
      {/* 3-Card Fan-out Container positioned behind & on laptop screen */}
      <div className="relative w-full flex justify-center items-center">
        {/* === LAPTOP LID & SCREEN === */}
        <div className="relative w-[82%] sm:w-[78%] md:w-[72%] max-w-155 z-10">
          {/* Outer Bezel (Dark metallic chassis) */}
          <div className="bg-[#121316] rounded-t-2xl sm:rounded-t-3xl p-2 sm:p-3 pb-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-t border-x border-[#2c2e35]">
            {/* Camera / Mic notch at top bezel */}
            <div className="w-full flex items-center justify-center mb-1.5 sm:mb-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#202229] border border-[#333742] flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-cyan-700/80" />
              </div>
            </div>

            {/* Inner Display Screen with Glass Glare */}
            <div
              data-testid="laptop-screen"
              className="relative w-full aspect-16/10 bg-[#0c0d10] overflow-visible rounded-t-md sm:rounded-t-lg flex items-center justify-center"
            >
              {/* Screen Ambient Glow */}
              <div className="absolute inset-0 bg-linear-to-tr from-black/40 via-transparent to-white/10 pointer-events-none z-30 rounded-t-md" />

              {/* === 3-CARD FAN-OUT SHOWCASE === */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* --- Left Perspective Card --- */}
                <div
                  data-testid="fan-card-left"
                  className="fan-card absolute -left-12 sm:-left-20 md:-left-28 top-8 sm:top-6 w-[55%] sm:w-[50%] h-[75%] sm:h-[80%] rounded-lg sm:rounded-xl shadow-[-16px_18px_35px_rgba(0,0,0,0.55)] border border-white/20 overflow-hidden transform rotate-14 -translate-y-2 hover:-translate-y-4 hover:-rotate-12 transition-all duration-300 z-10 bg-slate-900"
                >
                  {!imgErrors.left && project.mockImages.left ? (
                    <img
                      src={project.mockImages.left}
                      alt={`${project.title} - Left Preview`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError("left")}
                    />
                  ) : (
                    <div
                      data-testid="fallback-card-left"
                      className="w-full h-full flex flex-col p-3 sm:p-4 bg-linear-to-br from-slate-800 via-slate-900 to-indigo-950 text-white"
                    >
                      <div className="flex items-center gap-1.5 pb-2 border-b border-white/10">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-white/50 ml-1 font-mono">
                          left_view.tsx
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-center text-center p-2">
                        <Layers className="w-8 h-8 text-indigo-400 mb-2 opacity-80" />
                        <p className="text-xs font-semibold text-white/90">
                          {project.title}
                        </p>
                        <p className="text-[10px] text-white/60 mt-1">
                          {project.tags[0] || "Component View"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- Center / Main Perspective Card --- */}
                <div
                  data-testid="fan-card-main"
                  className="fan-card absolute top-2 sm:top-1 w-[70%] sm:w-[68%] h-[90%] sm:h-[94%] rounded-lg sm:rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.65)] border border-white/25 overflow-hidden transform -rotate-7 hover:rotate-0 hover:scale-105 transition-all duration-300 z-20 bg-slate-900"
                >
                  {!imgErrors.main && project.mockImages.main ? (
                    <img
                      src={project.mockImages.main}
                      alt={`${project.title} - Main Preview`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError("main")}
                    />
                  ) : (
                    <div
                      data-testid="fallback-card-main"
                      className="w-full h-full flex flex-col p-4 sm:p-5 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/15">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-xs text-white/70 font-mono font-medium">
                          {project.number}_{project.id}.app
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-center text-center p-3">
                        <Code2 className="w-12 h-12 text-yellow-400 mb-2 drop-shadow-md" />
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {project.title}
                        </h3>
                        <p className="text-xs text-white/70 mt-1 max-w-50 line-clamp-2">
                          {project.subtitle}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- Right Perspective Card --- */}
                <div
                  data-testid="fan-card-right"
                  className="fan-card absolute -right-12 sm:-right-20 md:-right-28 top-8 sm:top-6 w-[55%] sm:w-[50%] h-[75%] sm:h-[80%] rounded-lg sm:rounded-xl shadow-[16px_18px_35px_rgba(0,0,0,0.55)] border border-white/20 overflow-hidden transform rotate-14 -translate-y-2 hover:-translate-y-4 hover:rotate-12 transition-all duration-300 z-10 bg-slate-900"
                >
                  {!imgErrors.right && project.mockImages.right ? (
                    <img
                      src={project.mockImages.right}
                      alt={`${project.title} - Right Preview`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError("right")}
                    />
                  ) : (
                    <div
                      data-testid="fallback-card-right"
                      className="w-full h-full flex flex-col p-3 sm:p-4 bg-linear-to-br from-slate-800 via-slate-900 to-emerald-950 text-white"
                    >
                      <div className="flex items-center gap-1.5 pb-2 border-b border-white/10">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-white/50 ml-1 font-mono">
                          preview_art.jpg
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-center text-center p-2">
                        <Sparkles className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
                        <p className="text-xs font-semibold text-white/90">
                          {project.title}
                        </p>
                        <p className="text-[10px] text-white/60 mt-1">
                          {project.tags[1] || "Art & Showcase"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hinge Connection */}
          <div className="w-[102%] ml-[1%] h-2 sm:h-2.5 bg-[#1f2127] rounded-sm mx-auto shadow-inner" />
        </div>
      </div>

      {/* === LAPTOP BASE & KEYBOARD CHASSIS === */}
      <div
        data-testid="laptop-base"
        className="relative w-[92%] sm:w-[88%] md:w-[82%] max-w-175 z-30 -mt-1"
      >
        {/* Metallic Beveled Base */}
        <div className="relative h-4 sm:h-5 md:h-6 w-full rounded-b-xl sm:rounded-b-2xl bg-linear-to-b from-[#a3aab3] via-[#858c96] to-[#6d737c] shadow-[0_25px_50px_rgba(0,0,0,0.5)] border-t border-white/40 flex items-start justify-center overflow-hidden">
          {/* Center Lid / Trackpad Notch */}
          <div className="w-14 sm:w-20 md:w-24 h-1 sm:h-1.5 bg-[#4c5056] rounded-b-md shadow-inner" />

          {/* Metallic Edge Sheen Highlight */}
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/30" />
        </div>

        {/* Laptop Shadow on Desk */}
        <div className="w-[94%] mx-auto h-2 sm:h-3 bg-black/40 blur-md rounded-full -mt-0.5" />
      </div>

      {/* === FLOWING RETRO CURSIVE SCRIPT TITLE OVERLAY === */}
      {/* Positioned across the screen bottom & laptop base matching project-1/2/3.png */}
      <div className="absolute bottom-5 sm:bottom-6 md:bottom-7 z-40 pointer-events-none transform -rotate-7 sm:-rotate-8 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
        <span
          className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-normal leading-none tracking-tight text-white select-none whitespace-nowrap italic"
          style={{
            fontFamily:
              "'Pacifico', 'Caveat', 'Brush Script MT', 'Dancing Script', cursive",
            WebkitTextStroke: "1px rgba(255,255,255,0.2)",
            textShadow:
              "2px 3px 6px rgba(0,0,0,0.35), 4px 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {scriptText}
        </span>
      </div>
    </div>
  );
}
