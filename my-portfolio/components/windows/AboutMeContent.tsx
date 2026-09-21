"use client";

import React, { useState } from "react";
import {
  MapPin,
  Briefcase,
  Sparkles,
  ExternalLink,
  Mail,
  CheckCircle2,
  Code2,
} from "lucide-react";
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

export interface AboutMeContentProps {
  className?: string;
}

export function AboutMeContent({ className = "" }: AboutMeContentProps) {
  const { profile, skills } = portfolioData;
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const handleSkillClick = (skillName: string) => {
    setSelectedSkill((prev) => (prev === skillName ? null : skillName));
  };

  const activeSkillObj = skills.find((s) => s.name === selectedSkill);

  return (
    <div
      className={`min-h-full w-full bg-linear-to-br from-[#4a69e2] via-[#4361ee] to-[#3953cf] text-white p-6 sm:p-8 md:p-10 select-none overflow-x-hidden ${className}`}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headlines, Bio, Skills & Links */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Hero Titles matching about-me.png */}
          <div className="space-y-1">
            {/* Groovy Retro Yellow Cursive Title */}
            <div className="relative inline-block transform -rotate-2 origin-left">
              <h1
                className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl font-normal leading-none tracking-tight text-[#ffd000] select-none"
                style={{
                  fontFamily:
                    "'Pacifico', 'Brush Script MT', 'Shrikhand', cursive, sans-serif",
                  textShadow:
                    "3px 4px 0px #b45309, 5px 6px 0px #78350f, 7px 9px 14px rgba(0,0,0,0.35)",
                }}
              >
                hi, its Nguyen!
              </h1>
            </div>

            {/* Subtitle with Pixel Mouse Cursor */}
            <div className="flex items-center gap-3 mt-2 pl-2 sm:pl-4">
              <h2
                className="text-2xl xs:text-3xl sm:text-4xl italic text-[#b8ff52] font-semibold tracking-wide"
                style={{
                  fontFamily:
                    "'Pacifico', 'Brush Script MT', 'Caveat', cursive, sans-serif",
                  textShadow:
                    "2px 2px 0px #2d4a04, 3px 4px 8px rgba(0,0,0,0.3)",
                }}
              >
                what i do
              </h2>
              <div className="relative inline-flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/Windows_mouse.png"
                  alt="Pixel cursor pointing to what i do"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md select-none transform hover:scale-110 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Quick Badges: Role, Location, Status */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
              <Briefcase className="w-3.5 h-3.5 text-[#ffd000]" />
              <span>{profile.role}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-red-300" />
              <span>{profile.location}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/25 backdrop-blur-md border border-emerald-400/40 text-emerald-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{profile.status}</span>
            </div>
          </div>

          {/* Bio Introduction */}
          <div className="space-y-3.5 text-white/95 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            <p>
              I&apos;m{" "}
              <strong className="font-semibold text-white">
                {profile.name}
              </strong>
              , a passionate{" "}
              <span className="text-[#ffd000] font-semibold">
                {profile.role}
              </span>{" "}
              dedicated to creating clean, interactive, and reliable web
              applications. I love bridging captivating user interfaces with
              robust, scalable backend architectures.
            </p>
            <p>
              Specializing in modern full-stack development with{" "}
              <span className="text-[#b8ff52] font-semibold">
                JavaScript & TypeScript
              </span>
              ,{" "}
              <span className="text-[#b8ff52] font-semibold">
                React & Express
              </span>
              ,{" "}
              <span className="text-white font-medium">Next.js</span>,{" "}
              <span className="text-white font-medium">FastAPI</span>,{" "}
              <span className="text-white font-medium">PostgreSQL</span>, and{" "}
              <span className="text-white font-medium">Docker</span>. I enjoy
              crafting polished design details and solving complex full-stack
              engineering challenges.
            </p>
          </div>

          {/* Interactive Skills Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                <Code2 className="w-4 h-4 text-[#ffd000]" />
                <span>Core Technologies & Skills</span>
              </div>
              {activeSkillObj && (
                <span className="text-xs text-[#b8ff52] font-medium bg-black/20 px-2 py-0.5 rounded-md border border-white/10">
                  {activeSkillObj.category} • Proficiency: {activeSkillObj.level}%
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isSelected = selectedSkill === skill.name;
                return (
                  <button
                    key={skill.name}
                    type="button"
                    role="button"
                    aria-label={`Skill ${skill.name}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSkillClick(skill.name)}
                    className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-all transform active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#ffd000] text-slate-900 font-semibold shadow-lg scale-105 border-2 border-white ring-2 ring-[#ffd000]/50"
                        : "bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40"
                    }`}
                  >
                    <span>{skill.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: LinkedIn, GitHub, Email */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-medium text-sm border border-white/20 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white font-medium text-sm border border-white/20 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <LinkedinIcon className="w-4 h-4" />
              <span>LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </a>

            <a
              href={`mailto:${profile.email}`}
              aria-label="Email Trần Trung Nguyên"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm border border-white/25 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Mail className="w-4 h-4 text-[#ffd000]" />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Right Column: Portrait Photo with Sticker Card Styling */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative group max-w-[320px] sm:max-w-90 md:max-w-95 w-full">
            {/* Sticker / Card Framing */}
            <div className="p-3 sm:p-3.5 bg-white/95 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.4)] transform rotate-[1.5deg] group-hover:rotate-0 transition-transform duration-300">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-3/4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar}
                  alt={`Trần Trung Nguyên - ${profile.role}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle gradient vignette overlay at the bottom */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Sticker Pill on Photo */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-white/20 shadow-lg flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {profile.name}
                    </span>
                    <span className="text-[11px] text-[#ffd000] font-medium truncate">
                      {profile.role}
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#ffd000] shrink-0 ml-2 animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Decorative retro sticker badge floating at top right */}
            <div className="absolute -top-3 -right-2 bg-[#ffd000] text-slate-950 font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border-2 border-white transform rotate-10 group-hover:rotate-[5deg] transition-transform">
              🇻🇳 Vietnam
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
