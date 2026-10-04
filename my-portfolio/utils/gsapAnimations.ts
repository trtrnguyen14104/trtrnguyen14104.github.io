import gsap from "gsap";

/**
 * Animates a folder click with a subtle bounce, then zooms and expands the target window
 * from the folder's position into its normal desktop position.
 */
export function animateFolderOpen(
  folderEl: HTMLElement,
  windowEl: HTMLElement,
  onComplete?: () => void,
) {
  if (!folderEl || !windowEl) {
    onComplete?.();
    return;
  }

  const folderRect = folderEl.getBoundingClientRect();
  const windowRect = windowEl.getBoundingClientRect();

  // Subtle folder bounce click effect, followed by window expanding
  return gsap
    .timeline()
    .to(folderEl, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    })
    .fromTo(
      windowEl,
      {
        opacity: 0,
        scale: 0.2,
        x:
          folderRect.left +
          folderRect.width / 2 -
          (windowRect.left + windowRect.width / 2),
        y:
          folderRect.top +
          folderRect.height / 2 -
          (windowRect.top + windowRect.height / 2),
        transformOrigin: "center center",
      },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.2)",
        clearProps: "transformOrigin",
        onComplete,
      },
    );
}

/**
 * Animates a window shrinking and sliding down into its corresponding taskbar icon.
 * Hides the window once the animation completes.
 */
export function animateWindowMinimize(
  windowEl: HTMLElement,
  taskbarIconEl: HTMLElement | null,
  onComplete?: () => void,
) {
  if (!windowEl) {
    onComplete?.();
    return;
  }

  let targetX = 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;
  let targetY = viewportHeight - 40;

  if (taskbarIconEl) {
    const iconRect = taskbarIconEl.getBoundingClientRect();
    const winRect = windowEl.getBoundingClientRect();
    targetX =
      iconRect.left + iconRect.width / 2 - (winRect.left + winRect.width / 2);
    targetY = iconRect.top - winRect.top;
  }

  return gsap.to(windowEl, {
    scale: 0.1,
    opacity: 0,
    x: targetX,
    y: targetY,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      gsap.set(windowEl, { display: "none" });
      onComplete?.();
    },
  });
}

/**
 * Restores a minimized window by making it visible and animating it from the
 * taskbar icon position back to its open desktop coordinates.
 */
export function animateWindowRestore(
  windowEl: HTMLElement,
  taskbarIconEl: HTMLElement | null,
  onComplete?: () => void,
) {
  if (!windowEl) {
    onComplete?.();
    return;
  }

  gsap.set(windowEl, { display: "flex" });
  let fromX = 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;
  let fromY = viewportHeight - 40;

  if (taskbarIconEl) {
    const iconRect = taskbarIconEl.getBoundingClientRect();
    const winRect = windowEl.getBoundingClientRect();
    fromX =
      iconRect.left + iconRect.width / 2 - (winRect.left + winRect.width / 2);
    fromY = iconRect.top - winRect.top;
  }

  return gsap.fromTo(
    windowEl,
    { scale: 0.1, opacity: 0, x: fromX, y: fromY },
    {
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.35,
      ease: "back.out(1.1)",
      onComplete,
    },
  );
}

/**
 * Animates a window closing by fading out and scaling down.
 */
export function animateWindowClose(
  windowEl: HTMLElement,
  onComplete?: () => void,
) {
  if (!windowEl) {
    onComplete?.();
    return;
  }

  return gsap.to(windowEl, {
    scale: 0.85,
    opacity: 0,
    duration: 0.22,
    ease: "power2.in",
    onComplete,
  });
}

/**
 * Starts the endless left-to-right drift of every `.cloud-drift` strip inside the
 * given layer. Each strip holds three copies of the same horizontally seamless
 * layer, so travelling exactly one screen width to the right wraps the loop
 * without ever showing an edge. A slow vertical bob keeps the clouds alive.
 * Honours `prefers-reduced-motion` by leaving the clouds in their static layout.
 */
export function animateCloudDrift(cloudLayerEl: HTMLElement) {
  if (!cloudLayerEl) {
    return [];
  }

  const strips = Array.from(
    cloudLayerEl.querySelectorAll<HTMLElement>(".cloud-drift"),
  );

  if (!strips.length) {
    return [];
  }

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return [];
  }

  const tweens: gsap.core.Tween[] = [];

  strips.forEach((strip, index) => {
    // The strip fills the desktop, so one screen width is one full copy
    const travel = strip.offsetWidth || window.innerWidth || 1920;
    const duration = Number(strip.dataset.duration) || 70;
    const bob = Number(strip.dataset.bob) || 0;

    // One screen width to the right, so the strip re-enters exactly where it started
    tweens.push(
      gsap.fromTo(
        strip,
        { x: -travel },
        {
          x: 0,
          duration,
          repeat: -1,
          ease: "none",
        },
      ),
    );

    if (bob) {
      tweens.push(
        gsap.to(strip, {
          y: bob,
          duration: 16 + index * 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }),
      );
    }
  });

  return tweens;
}

/** Duration of the whole boot screen timeline, in seconds. */
export const BOOT_SEQUENCE_DURATION = 3.5;

/**
 * Number of boot status messages swapped while the bar fills. Each entry is
 * paired with the timeline time (in seconds) it appears at.
 */
const BOOT_STATUS_STEPS: { at: number; text: string }[] = [
  { at: 1, text: "Loading personal portfolio" },
  { at: 2, text: "Preparing desktop" },
];

/**
 * Animates the Windows XP style first-load boot screen: the logo fades in, the
 * loading bar fills while its highlight blocks stream endlessly, the status line
 * swaps through a few messages, then the whole overlay fades out to reveal the
 * desktop. Calls `onComplete` right after the fade so the caller can unmount the
 * overlay and play the desktop intro.
 *
 * Call `timeline.timeScale(4)` on the returned timeline to fast-forward the tail
 * fade, which is how the "tap to skip" affordance is wired up.
 */
export function animateBootSequence(
  rootEl: HTMLElement,
  onComplete?: () => void,
) {
  const tl = gsap.timeline();

  if (!rootEl) {
    onComplete?.();
    return tl;
  }

  const logo = rootEl.querySelector(".boot-logo");
  const bar = rootEl.querySelector(".boot-bar");
  const fill = rootEl.querySelector(".boot-bar-fill");
  const blocks = rootEl.querySelectorAll(".boot-bar-block");
  const status = rootEl.querySelector(".boot-status");

  const fadeOutAt = BOOT_SEQUENCE_DURATION - 0.5;

  if (logo) {
    tl.fromTo(
      logo,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
      0,
    );
  }

  if (bar) {
    tl.fromTo(
      bar,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power1.out" },
      0.3,
    );
  }

  // The highlight blocks loop forever, like the original splash screen, so they
  // are independent of the one-shot fill and keep moving through the fade out
  if (blocks.length) {
    blocks.forEach((block) => {
      gsap.fromTo(
        block,
        { x: -30 },
        {
          x: 150,
          duration: 2,
          repeat: -1,
          ease: "none",
          delay: -0.66,
        },
      );
    });
  }

  if (fill) {
    tl.fromTo(
      fill,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: fadeOutAt - 0.3,
        ease: "power1.inOut",
      },
      0.3,
    );
  }

  if (status) {
    BOOT_STATUS_STEPS.forEach(({ at, text }) => {
      tl.call(
        () => {
          status.textContent = text;
        },
        undefined,
        at,
      );
    });
  }

  tl.to(
    rootEl,
    {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete,
    },
    fadeOutAt,
  );

  return tl;
}

/**
 * Animates the initial desktop reveal: typography, desktop folder icons, and taskbar.
 */
export function animateDesktopIntro(desktopEl: HTMLElement) {
  const tl = gsap.timeline();

  if (!desktopEl) {
    return tl;
  }

  const icons = desktopEl.querySelectorAll(".desktop-icon");
  const title = desktopEl.querySelector(".hero-typography");
  const taskbar = desktopEl.querySelector(".windows-taskbar");

  if (title) {
    tl.fromTo(
      title,
      { opacity: 0, y: -20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
    );
  }

  if (icons.length) {
    tl.fromTo(
      icons,
      { opacity: 0, scale: 0.5, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: "back.out(1.5)",
      },
      title ? "-=0.4" : 0,
    );
  }

  if (taskbar) {
    tl.fromTo(
      taskbar,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
      icons.length || title ? "-=0.3" : 0,
    );
  }

  return tl;
}
