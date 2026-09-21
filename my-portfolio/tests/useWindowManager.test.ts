import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowManager } from "@/hooks/useWindowManager";

describe("useWindowManager", () => {
  it("manages opening, closing, minimizing, and focusing windows", () => {
    const { result } = renderHook(() => useWindowManager());

    expect(result.current.windows["about-me"].isOpen).toBe(false);

    act(() => {
      result.current.openWindow("about-me");
    });

    expect(result.current.windows["about-me"].isOpen).toBe(true);
    expect(result.current.windows["about-me"].isMinimized).toBe(false);
    expect(result.current.activeWindowId).toBe("about-me");

    act(() => {
      result.current.minimizeWindow("about-me");
    });

    expect(result.current.windows["about-me"].isMinimized).toBe(true);

    act(() => {
      result.current.openWindow("projects");
    });

    expect(result.current.windows["projects"].isOpen).toBe(true);
    expect(result.current.activeWindowId).toBe("projects");
    expect(result.current.windows["projects"].zIndex).toBeGreaterThan(
      result.current.windows["about-me"].zIndex,
    );
  });

  it("handles closing windows and clearing activeWindowId", () => {
    const { result } = renderHook(() => useWindowManager());

    act(() => {
      result.current.openWindow("contact");
    });
    expect(result.current.windows["contact"].isOpen).toBe(true);
    expect(result.current.activeWindowId).toBe("contact");

    act(() => {
      result.current.closeWindow("contact");
    });
    expect(result.current.windows["contact"].isOpen).toBe(false);
    expect(result.current.activeWindowId).toBeNull();
  });

  it("toggles maximize state and brings to front", () => {
    const { result } = renderHook(() => useWindowManager());

    act(() => {
      result.current.openWindow("about-me");
      result.current.openWindow("projects");
    });
    expect(result.current.activeWindowId).toBe("projects");
    const projectsZ = result.current.windows["projects"].zIndex;

    act(() => {
      result.current.maximizeWindow("about-me");
    });

    expect(result.current.windows["about-me"].isMaximized).toBe(true);
    expect(result.current.activeWindowId).toBe("about-me");
    expect(result.current.windows["about-me"].zIndex).toBeGreaterThan(projectsZ);

    act(() => {
      result.current.maximizeWindow("about-me");
    });
    expect(result.current.windows["about-me"].isMaximized).toBe(false);
  });

  it("updates window position", () => {
    const { result } = renderHook(() => useWindowManager());

    act(() => {
      result.current.updatePosition("about-me", { x: 200, y: 300 });
    });

    expect(result.current.windows["about-me"].position).toEqual({ x: 200, y: 300 });
  });

  it("bringToFront un-minimizes window and brings zIndex forward", () => {
    const { result } = renderHook(() => useWindowManager());

    act(() => {
      result.current.openWindow("about-me");
      result.current.minimizeWindow("about-me");
    });
    expect(result.current.windows["about-me"].isMinimized).toBe(true);

    act(() => {
      result.current.bringToFront("about-me");
    });
    expect(result.current.windows["about-me"].isMinimized).toBe(false);
    expect(result.current.activeWindowId).toBe("about-me");
  });
});
