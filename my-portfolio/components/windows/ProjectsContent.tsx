"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  LayoutGrid,
  Laptop,
  ExternalLink,
  FileCode,
  FileText,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { portfolioData } from "@/data/portfolioData";
import { ProjectItem } from "@/types/portfolio";
import { LaptopMockup } from "@/components/windows/LaptopMockup";

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

// Background colors explicitly matching project-1/2/3.png samples
const PROJECT_BG_COLORS: Record<string, string> = {
  "project-1": "#c5e153", // Lime green matching sample 1
  "project-2": "#5373e1", // Periwinkle blue matching sample 2
  "project-3": "#f4c938", // Sunflower yellow matching sample 3
  "project-4": "#242730", // Sleek dark slate
};

export function getProjectBgColor(project: ProjectItem): string {
  return PROJECT_BG_COLORS[project.id] || project.bgColor || "#c5e153";
}

// Friendly folder names for File Explorer tabs matching task brief
const FOLDER_NAMES: Record<string, string> = {
  "project-1": "01_Quiz_App",
  "project-2": "02_AloChat",
  "project-3": "03_Research_System",
  "project-4": "04_Next_Project",
};

export function getFolderTabName(project: ProjectItem, index: number): string {
  if (FOLDER_NAMES[project.id]) {
    return FOLDER_NAMES[project.id];
  }
  const num = project.number || `0${index + 1}`;
  const slug = project.title
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `${num}_${slug}`;
}

export interface ProjectsContentProps {
  className?: string;
  initialProjectId?: string;
}

export function ProjectsContent({
  className = "",
  initialProjectId,
}: ProjectsContentProps) {
  const projects = portfolioData.projects;

  const initialIndex = initialProjectId
    ? projects.findIndex((p) => p.id === initialProjectId)
    : 0;

  const [activeIndex, setActiveIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );
  const [viewMode, setViewMode] = useState<"showcase" | "grid">("showcase");

  const containerRef = useRef<HTMLDivElement>(null);
  const showcaseBgRef = useRef<HTMLDivElement>(null);
  const currentProject = projects[activeIndex] || projects[0];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % projects.length);
  }, [projects.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, [projects.length]);

  // Keyboard navigation for Left and Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // GSAP Smooth Background Color & Card Reveal Animation
  useEffect(() => {
    if (!showcaseBgRef.current) return;
    const targetColor = getProjectBgColor(currentProject);

    try {
      gsap.to(showcaseBgRef.current, {
        backgroundColor: targetColor,
        duration: 0.45,
        ease: "power2.out",
      });

      const cards = showcaseBgRef.current.querySelectorAll(".fan-card");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0.6, scale: 0.94, y: 15 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: "back.out(1.1)",
          }
        );
      }
    } catch {
      // Fallback for non-browser or test runner environments
    }
  }, [activeIndex, currentProject]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-[#f0f2f5] text-slate-800 select-none overflow-y-auto ${className}`}
      tabIndex={0}
    >
      {/* ================= TOP CONTROLS & FOLDER TABS BAR ================= */}
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        {/* Left: Quick Folder Tabs (01_Quiz_App, 02_AloChat, 03_Research_System) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {projects.map((project, idx) => {
            const folderName = getFolderTabName(project, idx);
            const isActive = idx === activeIndex;
            return (
              <button
                key={project.id}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Open folder ${folderName}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#0078d4] text-white shadow-sm ring-1 ring-[#0078d4]"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                }`}
              >
                <Folder
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-yellow-300" : "text-amber-500"
                  }`}
                />
                <span>📁 {folderName}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Navigation Arrows & View Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Previous / Next Arrow Switcher */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
            <button
              onClick={handlePrev}
              aria-label="Previous project"
              title="Previous project (Left Arrow)"
              className="p-1 rounded hover:bg-white text-slate-700 hover:text-slate-900 transition-colors shadow-none hover:shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-500 font-semibold">
              {activeIndex + 1} / {projects.length}
            </span>
            <button
              onClick={handleNext}
              aria-label="Next project"
              title="Next project (Right Arrow)"
              className="p-1 rounded hover:bg-white text-slate-700 hover:text-slate-900 transition-colors shadow-none hover:shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle: 3D Showcase vs. Windows File Explorer Grid */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode("showcase")}
              aria-label="Showcase view"
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium ${
                viewMode === "showcase"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Showcase</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view (File Explorer)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Explorer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      {viewMode === "showcase" ? (
        /* ================= 3D LAPTOP SHOWCASE MODE ================= */
        <div className="flex-1 flex flex-col">
          {/* Vibrant Dynamic Showcase Container */}
          <div
            ref={showcaseBgRef}
            className="relative w-full pt-8 pb-12 px-4 sm:px-6 flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden min-h-95 sm:min-h-110"
            style={{ backgroundColor: getProjectBgColor(currentProject) }}
          >
            {/* Top decorative labels matching project-3.png */}
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs sm:text-sm font-bold tracking-wider text-black/60 uppercase mb-2 select-none px-4">
              <span className="tracking-widest">CREATIVE PORTFOLIO</span>
              <span className="tracking-widest">2026</span>
            </div>

            {/* Laptop Mockup with 3 Fan-Out Cards and Retro Script */}
            <LaptopMockup
              project={currentProject}
              projectNumberScript={`project ${parseInt(currentProject.number, 10) || activeIndex + 1}`}
            />
          </div>

          {/* Project Details / Metadata Card Panel */}
          <div className="bg-white border-t border-slate-200 p-6 sm:p-8">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left Details: Title, Subtitle, Tags, Description */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold tracking-wider uppercase">
                    PROJECT {currentProject.number}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentProject.title}
                  </h2>
                </div>

                <p className="text-sm font-medium text-slate-500">
                  {currentProject.subtitle}
                </p>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {currentProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl pt-1">
                  {currentProject.description}
                </p>
              </div>

              {/* Right Action Buttons & Quick Nav */}
              <div className="flex flex-col gap-3 min-w-50 w-full md:w-auto">
                {currentProject.links?.github && (
                  <a
                    href={currentProject.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View source code on GitHub"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View Source Code</span>
                  </a>
                )}

                {currentProject.links?.demo && (
                  <a
                    href={currentProject.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View live demo"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demo</span>
                  </a>
                )}

                {/* Direct Dot Indicators for Project Jumping */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {projects.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to project ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === activeIndex
                          ? "w-7 bg-blue-600 shadow-xs"
                          : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= WINDOWS FILE EXPLORER GRID MODE ================= */
        <div
          data-testid="explorer-grid-view"
          className="flex-1 p-6 bg-[#f8fafc] flex flex-col gap-6"
        >
          {/* Breadcrumb Info Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
            <span>This PC &gt; Documents &gt; Portfolio &gt; Projects</span>
            <span>{projects.length + 3} items</span>
          </div>

          {/* Grid Layout of Folders and Files */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {/* Project Folders */}
            {projects.map((project, idx) => {
              const folderName = getFolderTabName(project, idx);
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={project.id}
                  onClick={() => setActiveIndex(idx)}
                  onDoubleClick={() => {
                    setActiveIndex(idx);
                    setViewMode("showcase");
                  }}
                  className={`group flex flex-col items-center p-3 rounded-lg border text-center cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-400 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="relative mb-2">
                    <Folder className="w-12 h-12 text-amber-500 fill-amber-400 drop-shadow-sm group-hover:scale-105 transition-transform" />
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 break-all leading-snug">
                    {folderName}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    File folder
                  </span>
                </div>
              );
            })}

            {/* Additional Authentic Files */}
            <div className="flex flex-col items-center p-3 rounded-lg border border-slate-200 bg-white text-center">
              <FileText className="w-12 h-12 text-blue-500 mb-2" />
              <span className="text-xs font-semibold text-slate-800">
                README.md
              </span>
              <span className="text-[10px] text-slate-500 mt-1">2.4 KB</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg border border-slate-200 bg-white text-center">
              <FileCode className="w-12 h-12 text-emerald-500 mb-2" />
              <span className="text-xs font-semibold text-slate-800">
                package.json
              </span>
              <span className="text-[10px] text-slate-500 mt-1">1.1 KB</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg border border-slate-200 bg-white text-center">
              <FileCode className="w-12 h-12 text-purple-500 mb-2" />
              <span className="text-xs font-semibold text-slate-800">
                projects.json
              </span>
              <span className="text-[10px] text-slate-500 mt-1">4.8 KB</span>
            </div>
          </div>

          {/* Selected Item Preview Pane */}
          <div className="mt-auto bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-12 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-xs shadow-inner text-slate-900"
                style={{ backgroundColor: getProjectBgColor(currentProject) }}
              >
                {currentProject.number}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {currentProject.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {currentProject.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentProject.links?.github && (
                <a
                  href={currentProject.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              <button
                onClick={() => setViewMode("showcase")}
                aria-label="Open project in showcase view"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Open in 3D Showcase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
