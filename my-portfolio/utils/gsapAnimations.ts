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
