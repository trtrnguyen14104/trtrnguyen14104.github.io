"use client";

import React, { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { animateBootSequence, BOOT_SEQUENCE_DURATION } from "@/utils/gsapAnimations";

/** Number of highlight blocks streaming across the loading bar. */
const BAR_BLOCKS = 3;

/** How much faster the tail fade plays when the visitor skips the boot. */
const SKIP_TIME_SCALE = 4;

export interface BootScreenProps {
  /** Called once the overlay has faded out, or immediately when the boot is skipped. */
  onComplete?: () => void;
  className?: string;
}

export function BootScreen({ onComplete, className = "" }: BootScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const completedRef = useRef(false);

  const complete = useCallback(() => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const rootEl = rootRef.current;

    if (!rootEl) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion skips the sequence outright rather than playing a fast cut
    if (prefersReducedMotion) {
      complete();
      return;
    }

    const ctx = gsap.context(() => {
      timelineRef.current = animateBootSequence(rootEl, complete);
    }, rootEl);

    return () => {
      ctx.revert();
      timelineRef.current = null;
    };
  }, [complete]);

  const handleSkip = useCallback(() => {
    // Fast-forward so the tail fade still plays instead of cutting to black
    if (timelineRef.current) {
      timelineRef.current.timeScale(SKIP_TIME_SCALE);
    }
  }, []);

  return (
    <div
      ref={rootRef}
      data-testid="boot-screen"
      data-duration={BOOT_SEQUENCE_DURATION}
      onPointerDown={handleSkip}
      onKeyDown={handleSkip}
      className={`boot-screen group fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black font-xp text-white select-none ${className}`}
    >
      {/* Logo lockup: ported from public/samples/windows-xp-loading */}
      <div className="boot-logo mb-14 w-[220px] text-center">
        <p className="m-0 text-base leading-4 font-light">
          Microsoft
          <sup className="relative -top-1.25 left-0.5 ml-0.5 text-[10px]">
            ©
          </sup>
        </p>
        <p className="m-0 text-[46px] leading-[36px] font-bold">
          Windows
          <span className="mt-[-8px] ml-1 inline-block align-top text-[22px] text-[#FF6821]">
            XP
          </span>
        </p>
        <p className="m-0 ml-1.25 text-[30px] leading-[30px] font-light">
          Professional
        </p>
      </div>

      {/* Loading bar: the fill reports real progress, the blocks stream forever */}
      <div className="boot-bar relative h-[18px] w-[158px] overflow-hidden rounded-[7px] border-2 border-[#b2b2b2] px-px py-0.5">
        <div className="boot-bar-fill absolute inset-0 origin-left bg-[#1c2ea8]/70" />
        <div className="relative flex h-full gap-0.5">
          {Array.from({ length: BAR_BLOCKS }, (_, index) => (
            <div
              key={index}
              className="boot-bar-block h-full w-[9px] shrink-0 bg-[linear-gradient(to_bottom,#2838c7_0%,#5979ef_17%,#869ef3_32%,#869ef3_45%,#5979ef_59%,#2838c7_100%)]"
            />
          ))}
        </div>
      </div>

      {/* Live region, so the swapped boot messages are announced */}
      <p className="boot-status mt-6 text-xs text-white/55" role="status">
        Starting Windows
      </p>

      {/* Reachable by keyboard; pointer users can just click anywhere */}
      <button
        type="button"
        aria-label="Skip startup"
        onClick={handleSkip}
        className="absolute bottom-6 right-6 cursor-pointer rounded border border-white/15 px-3 py-1.5 text-[11px] text-white/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/60"
      >
        Skip
      </button>
    </div>
  );
}