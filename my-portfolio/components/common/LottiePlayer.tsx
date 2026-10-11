"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

export interface LottiePlayerProps {
  /**
   * Public URL or path to the Lottie JSON file (e.g. "/animations/Cat_playing_with_ball_animation.json")
   */
  src?: string;
  /**
   * Direct animation JSON data object
   */
  animationData?: Record<string, unknown>;
  /**
   * Whether to loop the animation continuously (default: true)
   */
  loop?: boolean;
  /**
   * Whether to autoplay the animation upon load (default: true)
   */
  autoplay?: boolean;
  /**
   * Playback speed multiplier (default: 1)
   */
  speed?: number;
  /**
   * Optional custom CSS classes for the container
   */
  className?: string;
  /**
   * Accessible description for screen readers
   */
  ariaLabel?: string;
  /**
   * Custom test ID for unit tests
   */
  testId?: string;
  /**
   * Crop/zoom the animation canvas. Format: "x y width height" (SVG viewBox units).
   * Uses the original animation coordinate space (1070x456 for cat animations).
   * Example: "400 200 500 256" — zooms into a 500×256 region starting at (400, 200).
   */
  viewBoxSize?: string;
}

export function LottiePlayer({
  src,
  animationData,
  loop = true,
  autoplay = true,
  speed = 1,
  className = "",
  ariaLabel = "Cat animation",
  testId = "lottie-player",
  viewBoxSize,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstanceRef = useRef<AnimationItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const croppedAspectRatio = React.useMemo(() => {
    if (!viewBoxSize) return undefined;

    const [, , width, height] = viewBoxSize
      .trim()
      .split(/\s+/)
      .map(Number);

    if (!width || !height) return undefined;

    return `${width} / ${height}`;
  }, [viewBoxSize]);

  useEffect(() => {
    let isCancelled = false;

    if (!containerRef.current) return;

    // Clean up any existing animation instance
    if (animInstanceRef.current) {
      animInstanceRef.current.destroy();
      animInstanceRef.current = null;
    }

    const initLottie = async () => {
      try {
        const lottieModule = await import("lottie-web");
        const lottie = lottieModule.default || lottieModule;

        if (isCancelled || !containerRef.current) return;

        let resolvedData = animationData;

        // If a src URL path is provided and no animationData, fetch the JSON
        if (!resolvedData && src) {
          const res = await fetch(src);
          if (!res.ok) throw new Error(`Failed to load Lottie animation from ${src}`);
          resolvedData = await res.json();
        }

        if (isCancelled || !containerRef.current || !resolvedData) return;

        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          animationData: resolvedData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
            // Crop/zoom into a specific region of the animation canvas
            ...(viewBoxSize ? { viewBoxOnly: true, viewBoxSize } : {}),
          },
        });

        if (speed !== 1) {
          anim.setSpeed(speed);
        }

        animInstanceRef.current = anim;
        setIsLoaded(true);
      } catch (err) {
        // Handle fetch/render gracefully in test or offline environments
        if (process.env.NODE_ENV !== "production") {
          console.warn("[LottiePlayer] Unable to initialize animation:", err);
        }
      }
    };

    initLottie();

    return () => {
      isCancelled = true;
      if (animInstanceRef.current) {
        animInstanceRef.current.destroy();
        animInstanceRef.current = null;
      }
    };
  }, [src, animationData, loop, autoplay, speed, viewBoxSize]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      data-testid={testId}
      data-loaded={isLoaded}
      style={croppedAspectRatio ? { aspectRatio: croppedAspectRatio } : undefined}
      className={`relative select-none pointer-events-none [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`}
    />
  );
}
