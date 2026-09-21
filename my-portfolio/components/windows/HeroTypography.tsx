"use client";

import React from "react";

export interface HeroTypographyProps {
  className?: string;
}

export function HeroTypography({ className = "" }: HeroTypographyProps) {
  return (
    <div
      className={`hero-typography relative flex flex-col items-center justify-center select-none pointer-events-none transition-all ${className}`}
      aria-label="Trần Trung Nguyên Portfolio"
    >
      {/* SVG Container for arched owner name */}
      <div className="w-85 xs:w-[400px] sm:w-135 md:w-170 lg:w-205 max-w-full overflow-visible">
        <svg
          viewBox="0 0 900 130"
          className="w-full h-auto overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Extended arch curve extending beyond viewBox so letters are never clipped */}
            <path
              id="hero-name-curve"
              d="M -100,140 Q 450,15 1000,140"
              fill="transparent"
            />
            <filter id="hero-shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>
          <text
            filter="url(#hero-shadow)"
            className="font-black tracking-[0.14em] text-[48px] sm:text-[60px] md:text-[68px] uppercase select-none"
            fill="#ffd000"
            stroke="#c88b00"
            strokeWidth="1.5"
            paintOrder="stroke fill"
          >
            <textPath
              href="#hero-name-curve"
              startOffset="50%"
              textAnchor="middle"
            >
              TRẦN TRUNG NGUYÊN
            </textPath>
          </text>
        </svg>
      </div>

      {/* Retro 70s Cursive Script "Portfolio" */}
      <div className="relative -mt-4 sm:-mt-8 md:-mt-12 -rotate-4 transform">
        <h1
          className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[140px] font-normal leading-none tracking-tight text-[#ffd000] drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
          style={{
            fontFamily: "'Pacifico', 'Brush Script MT', 'Shrikhand', cursive, sans-serif",
            textShadow:
              "3px 4px 0px #b45309, 5px 6px 0px #78350f, 7px 9px 12px rgba(0,0,0,0.4)",
          }}
        >
          Portfolio
        </h1>
      </div>

    </div>
  );
}
