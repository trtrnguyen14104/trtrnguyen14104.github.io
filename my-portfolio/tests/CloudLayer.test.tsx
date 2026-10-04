import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import gsap from "gsap";
import { CloudLayer } from "@/components/windows/CloudLayer";
import * as animations from "@/utils/gsapAnimations";

const TILE_COPIES = 3;

describe("CloudLayer Component", () => {
  // jsdom reports no layout, so the strip width has to be faked for GSAP
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 1280,
    });
  });

  afterAll(() => {
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", originalOffsetWidth);
    } else {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetWidth;
    }
  });

  afterEach(() => {
    gsap.killTweensOf("*");
    document.body.innerHTML = "";
  });

  it("renders a non-interactive layer with the wallpaper clouds", () => {
    render(<CloudLayer />);

    const layer = screen.getByTestId("cloud-layer");
    expect(layer).toBeInTheDocument();
    expect(layer).toHaveAttribute("aria-hidden", "true");
    // The hill layer trims the clouds at the horizon, so the layer is not masked
    expect(layer).toHaveClass("cloud-layer");

    const strip = layer.querySelector(".cloud-strip");
    const drift = strip?.querySelector(".cloud-drift");
    expect(drift).toBeInTheDocument();
    expect(drift).toHaveAttribute("data-duration");
    expect(drift).toHaveAttribute("data-bob");

    // Three copies side by side keep the screen covered for a whole screen of travel
    const tiles = Array.from(drift?.querySelectorAll("img.cloud-tile") ?? []);
    expect(tiles).toHaveLength(TILE_COPIES);
    tiles.forEach((tile, index) => {
      expect(tile.getAttribute("alt")).toBe("");
      expect(tile.getAttribute("src")).toContain("cloud-layer.webp");
      expect((tile as HTMLElement).style.left).toBe(`${index * 100}%`);
    });
  });

  it("starts the cloud drift through the shared GSAP helper", () => {
    const driftSpy = vi.spyOn(animations, "animateCloudDrift");

    render(<CloudLayer />);

    expect(driftSpy).toHaveBeenCalled();
  });

  it("kills its tweens on unmount", () => {
    const { unmount } = render(<CloudLayer />);
    const layer = screen.getByTestId("cloud-layer");
    const drift = layer.querySelector(".cloud-drift");

    expect(gsap.getTweensOf(drift as Element).length).toBeGreaterThan(0);

    unmount();

    expect(gsap.getTweensOf(drift as Element)).toHaveLength(0);
  });
});
