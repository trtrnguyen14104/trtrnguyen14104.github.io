"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import {
  Briefcase,
  Building2,
  ChevronRight,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import type { EducationItem, ExperienceItem } from "@/types/portfolio";

const SCRIPT_FONT =
  "'Pacifico', 'Brush Script MT', 'Caveat', 'Shrikhand', cursive, sans-serif";

function SectionHeading({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="w-9 h-9 rounded-xl bg-black/25 border border-white/25 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <h2
        className="text-2xl sm:text-3xl text-[#b8ff52] font-semibold tracking-wide"
        style={{
          fontFamily: SCRIPT_FONT,
          textShadow: "2px 2px 0px #2d4a04, 3px 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        {label}
      </h2>
      <span className="px-2 py-0.5 rounded-full bg-black/30 border border-white/20 font-mono text-[11px] text-white/90">
        {count}
      </span>
    </div>
  );
}

function ExperienceCard({ item }: { item: ExperienceItem }) {
  return (
    <article
      data-testid={`experience-item-${item.id}`}
      className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
    >
      {/* Windows XP style title bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-linear-to-r from-[#0a66f0] via-[#1a6ff0] to-[#4f9bff] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Briefcase className="w-4 h-4 text-yellow-300 shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-white truncate">
            {item.role}
          </h3>
          {item.isCurrent && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/50 text-[10px] font-bold uppercase tracking-wider text-emerald-100 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Current
            </span>
          )}
        </div>
        <span className="px-2.5 py-1 rounded-md bg-black/25 border border-white/25 font-mono text-[11px] text-white whitespace-nowrap">
          {item.period}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5 text-slate-700">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-[13px]">
          <span className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            {item.company}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-600">
            {item.employmentType}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {item.location}
          </span>
          {item.teamSize && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {item.teamSize}
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed">{item.summary}</p>

        {/* Tech stack */}
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tech.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Highlights */}
        <ul className="space-y-2 pt-3 border-t border-slate-200">
          {item.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex gap-2 text-[13px] leading-relaxed"
            >
              <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function EducationCard({ item }: { item: EducationItem }) {
  return (
    <article
      data-testid={`education-item-${item.id}`}
      className="overflow-hidden rounded-xl border border-slate-300 bg-[#ece9d8] shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-linear-to-r from-[#1f7a3d] via-[#2b9c4f] to-[#4fbf6a] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <GraduationCap className="w-4 h-4 text-yellow-200 shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-white truncate">
            {item.institution}
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-black/25 border border-white/25 font-mono text-[11px] text-white whitespace-nowrap">
          {item.period}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-3 text-slate-800">
        <p className="text-sm font-semibold text-slate-900">{item.degree}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-[13px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {item.location}
          </span>
          {item.gpa && (
            <span className="px-2 py-0.5 rounded bg-white/70 border border-slate-300 font-mono text-[11px] font-semibold text-slate-700">
              {item.gpa}
            </span>
          )}
        </div>

        {item.highlights && item.highlights.length > 0 && (
          <ul className="space-y-1.5 pt-2 border-t border-slate-300/70">
            {item.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-2 text-[13px] leading-relaxed text-slate-700"
              >
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export interface ExperienceContentProps {
  className?: string;
}

export function ExperienceContent({ className = "" }: ExperienceContentProps) {
  const { profile, experience, education } = portfolioData;

  return (
    <div
      data-testid="experience-content"
      className={`relative min-h-full w-full overflow-y-auto select-none text-white ${className}`}
      style={{
        backgroundImage: "url('/samples/background-home-sky.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundAttachment: "local",
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col">
        {/* Retro Script Headline */}
        <div className="text-center mb-8 sm:mb-10">
          <h1
            className="text-5xl xs:text-6xl sm:text-7xl font-normal leading-none tracking-tight text-[#ffd000] select-none transform -rotate-1 inline-block"
            style={{
              fontFamily: SCRIPT_FONT,
              textShadow:
                "4px 5px 0px #b45309, 7px 8px 0px #78350f, 9px 12px 18px rgba(0,0,0,0.35)",
            }}
          >
            my journey
          </h1>

          <div className="flex items-center justify-center gap-3 mt-3">
            <h2
              className="text-2xl xs:text-3xl sm:text-4xl italic text-[#b8ff52] font-semibold tracking-wide"
              style={{
                fontFamily: SCRIPT_FONT,
                textShadow: "2px 3px 0px #2d4a04, 4px 6px 10px rgba(0,0,0,0.35)",
              }}
            >
              work &amp; education
            </h2>
            <img
              src="/icons/Windows_mouse.png"
              alt=""
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-lg select-none"
            />
          </div>
        </div>

        {/* Professional Experience */}
        <section aria-labelledby="experience-heading" className="mb-10">
          <div id="experience-heading">
            <SectionHeading
              icon={<Briefcase className="w-4 h-4 text-[#ffd000]" />}
              label="where i have worked"
              count={experience.length}
            />
          </div>

          <div className="relative pl-6 sm:pl-8">
            {/* Timeline rail */}
            <span
              aria-hidden="true"
              className="absolute left-1.5 sm:left-2 top-2 bottom-2 w-0.5 bg-white/40 rounded-full"
            />

            <div className="flex flex-col gap-6">
              {experience.map((item) => (
                <div key={item.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-6 sm:-left-8 top-5 w-3.5 h-3.5 rounded-full bg-[#ffd000] border-2 border-white shadow-md sm:w-4 sm:h-4"
                  />
                  <ExperienceCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Education */}
        <section aria-labelledby="education-heading" className="mb-10">
          <div id="education-heading">
            <SectionHeading
              icon={<GraduationCap className="w-4 h-4 text-[#b8ff52]" />}
              label="where i studied"
              count={education.length}
            />
          </div>

          <div className="relative pl-6 sm:pl-8">
            <span
              aria-hidden="true"
              className="absolute left-1.5 sm:left-2 top-2 bottom-2 w-0.5 bg-white/40 rounded-full"
            />

            <div className="flex flex-col gap-6">
              {education.map((item) => (
                <div key={item.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-6 sm:-left-8 top-5 w-3.5 h-3.5 rounded-full bg-[#b8ff52] border-2 border-white shadow-md sm:w-4 sm:h-4"
                  />
                  <EducationCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <div className="flex flex-col items-center gap-3 pb-6">
          <p
            className="text-xl sm:text-2xl text-[#ffd000] font-semibold tracking-wide text-center"
            style={{
              fontFamily: SCRIPT_FONT,
              textShadow: "2px 3px 0px #b45309, 4px 6px 10px rgba(0,0,0,0.35)",
            }}
          >
            got an opening on your team?
          </p>
          <a
            href={`mailto:${profile.email}`}
            aria-label={`Email ${profile.name} about a role`}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Mail className="w-4 h-4 text-[#ffd000]" />
            <span>drop me a line</span>
            <Sparkles className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </div>
  );
}