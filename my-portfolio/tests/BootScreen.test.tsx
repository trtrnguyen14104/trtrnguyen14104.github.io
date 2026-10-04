import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, renderHook } from "@testing-library/react";
import gsap from "gsap";
import { BootScreen } from "@/components/windows/BootScreen";
import { useFirstLoadBoot, BOOT_SESSION_KEY } from "@/hooks/useFirstLoadBoot";
import * as animations from "@/utils/gsapAnimations";

const originalMatchMedia = window.matchMedia;

/** Pretends the visitor asked for reduced motion, or clears that setting. */
function mockReducedMotion(prefersReduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => ({
      matches: prefersReduced && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
    writable: true,
    configurable: true,
  });
}

describe("BootScreen Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gsap.killTweensOf("*");
    sessionStorage.clear();
  });

  afterEach(() => {
    gsap.killTweensOf("*");
    sessionStorage.clear();
    document.body.innerHTML = "";
    Object.defineProperty(window, "matchMedia", {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
  });

  it("renders the Windows XP logo lockup and a loading bar", () => {
    render(<BootScreen />);

    const overlay = screen.getByTestId("boot-screen");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("boot-screen");
    expect(overlay).toHaveAttribute("data-duration", "3.5");

    const logo = overlay.querySelector(".boot-logo");
    expect(logo?.textContent).toMatch(/Microsoft/);
    expect(logo?.textContent).toMatch(/Windows/);
    expect(logo?.textContent).toMatch(/XP/);
    expect(logo?.textContent).toMatch(/Professional/);
    expect(logo?.textContent).toMatch(/©/);

    // The XP suffix stays orange, like the original splash screen
    expect(screen.getByText("XP")).toHaveClass("text-[#FF6821]");

    expect(overlay.querySelector(".boot-bar")).toBeInTheDocument();
    expect(overlay.querySelector(".boot-bar-fill")).toBeInTheDocument();
    expect(overlay.querySelectorAll(".boot-bar-block")).toHaveLength(3);

    // The status line is a live region so the boot messages get announced
    const status = screen.getByRole("status");
    expect(status).toHaveClass("boot-status");
    expect(status).toHaveTextContent("Starting Windows");
  });

  it("starts the boot sequence through the shared GSAP helper", () => {
    const bootSpy = vi.spyOn(animations, "animateBootSequence");

    render(<BootScreen />);

    expect(bootSpy).toHaveBeenCalled();
  });

  it("runs the bar blocks on an endless loop and completes at the end", () => {
    const onComplete = vi.fn();
    const bootSpy = vi.spyOn(animations, "animateBootSequence");

    render(<BootScreen onComplete={onComplete} />);

    const block = screen
      .getByTestId("boot-screen")
      .querySelector(".boot-bar-block");
    const blockTweens = gsap.getTweensOf(block as Element);
    expect(blockTweens.length).toBeGreaterThan(0);
    expect(blockTweens[0].repeat()).toBe(-1);

    const tl = bootSpy.mock.results[0].value as gsap.core.Timeline;
    expect(tl.duration()).toBeCloseTo(animations.BOOT_SEQUENCE_DURATION, 5);

    act(() => {
      tl.progress(0.99);
    });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      tl.progress(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("only calls onComplete once even if the timeline is replayed", () => {
    const onComplete = vi.fn();
    const bootSpy = vi.spyOn(animations, "animateBootSequence");

    render(<BootScreen onComplete={onComplete} />);
    const tl = bootSpy.mock.results[0].value as gsap.core.Timeline;

    act(() => {
      tl.progress(1);
    });
    act(() => {
      tl.progress(0);
      tl.progress(1);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("speeds the remaining fade up when the overlay is clicked", () => {
    const onComplete = vi.fn();
    const bootSpy = vi.spyOn(animations, "animateBootSequence");

    render(<BootScreen onComplete={onComplete} />);
    const tl = bootSpy.mock.results[0].value as gsap.core.Timeline;

    expect(tl.timeScale()).toBe(1);

    fireEvent.pointerDown(screen.getByTestId("boot-screen"));

    // The tail fade is played at 4x instead of being cut away
    expect(tl.timeScale()).toBe(4);

    act(() => {
      tl.progress(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("speeds the remaining fade up from the keyboard", () => {
    const onComplete = vi.fn();
    const bootSpy = vi.spyOn(animations, "animateBootSequence");

    render(<BootScreen onComplete={onComplete} />);
    const tl = bootSpy.mock.results[0].value as gsap.core.Timeline;

    fireEvent.keyDown(screen.getByRole("button", { name: "Skip startup" }));

    expect(tl.timeScale()).toBe(4);

    act(() => {
      tl.progress(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("completes immediately without animating when the user prefers reduced motion", () => {
    mockReducedMotion(true);
    const onComplete = vi.fn();
    const bootSpy = vi.spyOn(animations, "animateBootSequence");

    render(<BootScreen onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(bootSpy).not.toHaveBeenCalled();
  });

  it("kills its tweens on unmount", () => {
    const { unmount } = render(<BootScreen />);
    const block = screen
      .getByTestId("boot-screen")
      .querySelector(".boot-bar-block");

    expect(gsap.getTweensOf(block as Element).length).toBeGreaterThan(0);

    unmount();

    expect(gsap.getTweensOf(block as Element)).toHaveLength(0);
  });
});

describe("useFirstLoadBoot hook", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("reports an unbooted session and marks it as booted", () => {
    const { result } = renderHook(() => useFirstLoadBoot());

    expect(result.current.hasBootedThisSession).toBe(false);
    expect(result.current.booted).toBe(false);

    act(() => {
      result.current.markBooted();
    });

    expect(result.current.booted).toBe(true);
    expect(sessionStorage.getItem(BOOT_SESSION_KEY)).toBe("1");
  });

  it("reports a session that already booted earlier", () => {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");

    const { result } = renderHook(() => useFirstLoadBoot());

    expect(result.current.hasBootedThisSession).toBe(true);
    expect(result.current.booted).toBe(true);
  });

  it("still completes the boot when storage is unavailable", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });

    const { result } = renderHook(() => useFirstLoadBoot());
    expect(result.current.hasBootedThisSession).toBe(false);

    act(() => {
      result.current.markBooted();
    });

    // Boot finishes, it just replays on the next load
    expect(result.current.booted).toBe(true);

    setItem.mockRestore();
    getItem.mockRestore();
  });
});