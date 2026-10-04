import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
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
    expect(typeof animations.animateCloudDrift).toBe("function");
    expect(typeof animations.animateBootSequence).toBe("function");
    expect(animations.BOOT_SEQUENCE_DURATION).toBe(3.5);
  });

  describe("animateBootSequence", () => {
    const buildBootScreen = () => {
      const rootEl = document.createElement("div");
      rootEl.innerHTML = `
        <div class="boot-logo">Windows</div>
        <div class="boot-bar">
          <div class="boot-bar-fill"></div>
          <div class="boot-bar-block"></div>
          <div class="boot-bar-block"></div>
          <div class="boot-bar-block"></div>
        </div>
        <div class="boot-status">Starting Windows</div>
      `;
      document.body.appendChild(rootEl);
      return rootEl;
    };

    it("fades in the logo, streams the blocks and fills the bar", () => {
      const rootEl = buildBootScreen();
      const logo = rootEl.querySelector<HTMLElement>(".boot-logo");
      const block = rootEl.querySelector<HTMLElement>(".boot-bar-block");
      const fill = rootEl.querySelector<HTMLElement>(".boot-bar-fill");

      const tl = animations.animateBootSequence(rootEl);
      tl.progress(0);

      // Three looping highlight blocks, each travelling past the bar width
      expect(gsap.getTweensOf(block as Element)).toHaveLength(1);
      expect(gsap.getTweensOf(block as Element)[0].repeat()).toBe(-1);
      expect(gsap.getTweensOf(block as Element)[0].duration()).toBe(2);

      // The logo and the bar both start hidden, and the bar fill starts empty
      expect(gsap.getProperty(logo as Element, "opacity")).toBe(0);
      expect(gsap.getProperty(rootEl, "opacity")).not.toBe(0);
      expect(gsap.getProperty(fill as Element, "scaleX")).toBe(0);

      // Part way through, progress has been reported on the fill
      tl.progress(0.5);
      const midScale = Number(gsap.getProperty(fill as Element, "scaleX"));
      expect(midScale).toBeGreaterThan(0);
      expect(midScale).toBeLessThan(1);
    });

    it("runs the status messages and then fades the overlay out", () => {
      const rootEl = buildBootScreen();
      const status = rootEl.querySelector<HTMLElement>(".boot-status");

      const onComplete = vi.fn();
      const tl = animations.animateBootSequence(rootEl, onComplete);

      // seek() suppresses callbacks unless told otherwise
      tl.seek(0.9, false);
      expect(status?.textContent).toBe("Starting Windows");

      tl.seek(1.1, false);
      expect(status?.textContent).toBe("Loading personal portfolio");

      tl.seek(2.1, false);
      expect(status?.textContent).toBe("Preparing desktop");

      // Full length ends exactly when the overlay has faded out
      expect(tl.duration()).toBeCloseTo(animations.BOOT_SEQUENCE_DURATION, 5);
      tl.progress(1);
      expect(gsap.getProperty(rootEl, "opacity")).toBe(0);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("replays the tail fade faster when the timeline is scaled up", () => {
      const rootEl = buildBootScreen();

      const tl = animations.animateBootSequence(rootEl);
      tl.timeScale(4);

      expect(tl.timeScale()).toBe(4);
    });

    it("handles a missing root element by completing immediately", () => {
      const onComplete = vi.fn();

      const tl = animations.animateBootSequence(
        null as unknown as HTMLElement,
        onComplete,
      );

      expect(tl).toBeDefined();
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("survives a boot screen that is missing every optional part", () => {
      const bareEl = document.createElement("div");
      document.body.appendChild(bareEl);

      let completed = false;
      expect(() => {
        animations.animateBootSequence(bareEl, () => {
          completed = true;
        }).progress(1);
      }).not.toThrow();
      expect(completed).toBe(true);
    });
  });

  describe("animateCloudDrift", () => {
    // jsdom has no layout, so the sprite width has to be faked for GSAP
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
        Object.defineProperty(
          HTMLElement.prototype,
          "offsetWidth",
          originalOffsetWidth,
        );
      } else {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>)
          .offsetWidth;
      }
    });

    const buildLayer = () => {
      const layerEl = document.createElement("div");
      layerEl.innerHTML = `
        <div class="cloud-drift" data-duration="200" data-bob="12"><span></span></div>
        <div class="cloud-drift" data-duration="260" data-bob="8"><span></span></div>
      `;
      document.body.appendChild(layerEl);
      return layerEl;
    };

    it("creates a looping drift and bob tween for every strip", () => {
      const layerEl = buildLayer();

      const tweens = animations.animateCloudDrift(layerEl);

      expect(tweens).toHaveLength(4);
      tweens.forEach((tween) => {
        expect(tween.paused()).toBe(false);
      });
      // Seamless loop: one tile width, repeated forever
      expect(tweens[0].repeat()).toBe(-1);
      expect(tweens[0].duration()).toBe(200);
    });

    it("moves the strips from left to right by exactly one tile width", () => {
      const layerEl = buildLayer();
      const strip = layerEl.querySelector<HTMLElement>(".cloud-drift");

      const [drift] = animations.animateCloudDrift(layerEl);

      expect(strip).not.toBeNull();
      drift.progress(0);
      expect(gsap.getProperty(strip as Element, "x")).toBe(-1280);

      drift.progress(1);
      expect(gsap.getProperty(strip as Element, "x")).toBe(0);
    });

    it("skips the drift when the user prefers reduced motion", () => {
      const layerEl = buildLayer();
      const original = window.matchMedia;
      Object.defineProperty(window, "matchMedia", {
        value: () => ({ matches: true }),
        writable: true,
        configurable: true,
      });

      expect(animations.animateCloudDrift(layerEl)).toEqual([]);

      if (original) {
        Object.defineProperty(window, "matchMedia", {
          value: original,
          writable: true,
          configurable: true,
        });
      } else {
        delete (window as unknown as Record<string, unknown>).matchMedia;
      }
    });

    it("returns an empty list when there is nothing to animate", () => {
      const emptyLayer = document.createElement("div");
      document.body.appendChild(emptyLayer);

      expect(animations.animateCloudDrift(emptyLayer)).toEqual([]);
      expect(animations.animateCloudDrift(null as unknown as HTMLElement)).toEqual(
        [],
      );
    });
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
