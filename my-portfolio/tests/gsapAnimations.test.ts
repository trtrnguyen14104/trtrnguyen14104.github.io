import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as animations from "@/utils/gsapAnimations";
import gsap from "gsap";

describe("gsapAnimations module", () => {
  beforeEach(() => {
    // Reset any active GSAP tweens between tests
    gsap.killTweensOf("*");
  });

  afterEach(() => {
    gsap.killTweensOf("*");
    document.body.innerHTML = "";
  });

  it("exports all core animation handlers", () => {
    expect(typeof animations.animateFolderOpen).toBe("function");
    expect(typeof animations.animateWindowMinimize).toBe("function");
    expect(typeof animations.animateWindowRestore).toBe("function");
    expect(typeof animations.animateWindowClose).toBe("function");
    expect(typeof animations.animateDesktopIntro).toBe("function");
  });

  describe("animateFolderOpen", () => {
    it("animates folder bounce and window expansion, invoking onComplete", () => {
      const folderEl = document.createElement("div");
      const windowEl = document.createElement("div");
      document.body.appendChild(folderEl);
      document.body.appendChild(windowEl);

      vi.spyOn(folderEl, "getBoundingClientRect").mockReturnValue({
        left: 50,
        top: 100,
        width: 60,
        height: 60,
        right: 110,
        bottom: 160,
        x: 50,
        y: 100,
        toJSON: () => {},
      });

      vi.spyOn(windowEl, "getBoundingClientRect").mockReturnValue({
        left: 200,
        top: 150,
        width: 800,
        height: 600,
        right: 1000,
        bottom: 750,
        x: 200,
        y: 150,
        toJSON: () => {},
      });

      const onComplete = vi.fn();
      const tl = animations.animateFolderOpen(folderEl, windowEl, onComplete);

      expect(tl).toBeDefined();
      // Fast-forward timeline to trigger onComplete
      if (tl && typeof tl.progress === "function") {
        tl.progress(1);
      }
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("animateWindowMinimize", () => {
    it("animates minimize into taskbar icon and hides window", () => {
      const windowEl = document.createElement("div");
      const taskbarIconEl = document.createElement("div");
      document.body.appendChild(windowEl);
      document.body.appendChild(taskbarIconEl);

      vi.spyOn(taskbarIconEl, "getBoundingClientRect").mockReturnValue({
        left: 300,
        top: 700,
        width: 40,
        height: 40,
        right: 340,
        bottom: 740,
        x: 300,
        y: 700,
        toJSON: () => {},
      });

      vi.spyOn(windowEl, "getBoundingClientRect").mockReturnValue({
        left: 100,
        top: 100,
        width: 600,
        height: 400,
        right: 700,
        bottom: 500,
        x: 100,
        y: 100,
        toJSON: () => {},
      });

      const onComplete = vi.fn();
      const tween = animations.animateWindowMinimize(windowEl, taskbarIconEl, onComplete);

      expect(tween).toBeDefined();
      if (tween && typeof tween.progress === "function") {
        tween.progress(1);
      }
      expect(windowEl.style.display).toBe("none");
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("handles null taskbarIconEl gracefully and falls back to window bottom", () => {
      const windowEl = document.createElement("div");
      document.body.appendChild(windowEl);

      const onComplete = vi.fn();
      const tween = animations.animateWindowMinimize(windowEl, null, onComplete);

      expect(tween).toBeDefined();
      if (tween && typeof tween.progress === "function") {
        tween.progress(1);
      }
      expect(windowEl.style.display).toBe("none");
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("animateWindowRestore", () => {
    it("sets display to flex and expands window from taskbar icon", () => {
      const windowEl = document.createElement("div");
      windowEl.style.display = "none";
      const taskbarIconEl = document.createElement("div");
      document.body.appendChild(windowEl);
      document.body.appendChild(taskbarIconEl);

      vi.spyOn(taskbarIconEl, "getBoundingClientRect").mockReturnValue({
        left: 300,
        top: 700,
        width: 40,
        height: 40,
        right: 340,
        bottom: 740,
        x: 300,
        y: 700,
        toJSON: () => {},
      });

      vi.spyOn(windowEl, "getBoundingClientRect").mockReturnValue({
        left: 100,
        top: 100,
        width: 600,
        height: 400,
        right: 700,
        bottom: 500,
        x: 100,
        y: 100,
        toJSON: () => {},
      });

      const onComplete = vi.fn();
      const tween = animations.animateWindowRestore(windowEl, taskbarIconEl, onComplete);

      expect(windowEl.style.display).toBe("flex");
      expect(tween).toBeDefined();
      if (tween && typeof tween.progress === "function") {
        tween.progress(1);
      }
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("handles null taskbarIconEl gracefully during restore", () => {
      const windowEl = document.createElement("div");
      document.body.appendChild(windowEl);

      const onComplete = vi.fn();
      const tween = animations.animateWindowRestore(windowEl, null, onComplete);

      expect(windowEl.style.display).toBe("flex");
      expect(tween).toBeDefined();
      if (tween && typeof tween.progress === "function") {
        tween.progress(1);
      }
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("animateWindowClose", () => {
    it("animates scale down and fade out, calling onComplete", () => {
      const windowEl = document.createElement("div");
      document.body.appendChild(windowEl);

      const onComplete = vi.fn();
      const tween = animations.animateWindowClose(windowEl, onComplete);

      expect(tween).toBeDefined();
      if (tween && typeof tween.progress === "function") {
        tween.progress(1);
      }
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("animateDesktopIntro", () => {
    it("animates title, desktop icons, and taskbar when present", () => {
      const desktopEl = document.createElement("div");
      desktopEl.innerHTML = `
        <div class="hero-typography">Hero Title</div>
        <div class="desktop-icon">Icon 1</div>
        <div class="desktop-icon">Icon 2</div>
        <div class="windows-taskbar">Taskbar</div>
      `;
      document.body.appendChild(desktopEl);

      const tl = animations.animateDesktopIntro(desktopEl);
      expect(tl).toBeDefined();
    });

    it("handles empty desktop container without throwing error", () => {
      const emptyDesktopEl = document.createElement("div");
      document.body.appendChild(emptyDesktopEl);

      expect(() => {
        animations.animateDesktopIntro(emptyDesktopEl);
      }).not.toThrow();
    });
  });
});
