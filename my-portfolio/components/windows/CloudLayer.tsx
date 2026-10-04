"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { animateCloudDrift } from "@/utils/gsapAnimations";

interface CloudLayerSpec {
  id: string;
  src: string;
  /** Intrinsic layer size in px, matching the wallpaper so `object-cover` lines up. */
  width: number;
  height: number;
  /** Seconds for the clouds to travel one screen width. */
  duration: number;
  /** Vertical bob amplitude, in px. */
  bob: number;
}

const LAYERS: CloudLayerSpec[] = [
  {
    id: "wallpaper-clouds",
    src: "/samples/cloud-layer.webp",
    width: 1920,
    height: 1080,
    duration: 70,
    bob: 6,
  },
];

/**
 * Copies of the seamless layer laid side by side. One screen width of travel
 * always leaves at least two copies covering the viewport, so the loop never
 * shows an edge.
 */
const TILE_COPIES = 3;

export interface CloudLayerProps {
  className?: string;
}

export function CloudLayer({ className = "" }: CloudLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layerEl = layerRef.current;

    if (!layerEl) {
      return;
    }

    let ctx: ReturnType<typeof gsap.context> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    // The travel distance is the viewport width, so rebuild on resize
    const buildDrift = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        animateCloudDrift(layerEl);
      }, layerEl);
    };

    buildDrift();

    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(buildDrift, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      window.removeEventListener("resize", handleResize);
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={layerRef}
      data-testid="cloud-layer"
      aria-hidden="true"
      className={`cloud-layer ${className}`}
    >
      {LAYERS.map((layer) => (
        <div key={layer.id} className="cloud-strip">
          <div
            className="cloud-drift"
            data-duration={layer.duration}
            data-bob={layer.bob}
          >
            {Array.from({ length: TILE_COPIES }, (_, copy) => (
              <Image
                key={copy}
                className="cloud-tile"
                src={layer.src}
                alt=""
                width={layer.width}
                height={layer.height}
                sizes="100vw"
                unoptimized
                priority
                style={{ left: `${copy * 100}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
