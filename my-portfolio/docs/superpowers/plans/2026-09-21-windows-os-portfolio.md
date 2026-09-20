# Windows OS Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an authentic, interactive Windows desktop OS-style portfolio website inspired by the designs in `public/samples/`, featuring GSAP-powered folder opening animations, window management (minimize, maximize, close, drag), desktop environment with taskbar & system tray, and dedicated window content for "About Me", "Projects" (with the signature 3-card laptop fan-out mockup and mockable image paths), and "Contact".

**Architecture:** Next.js App Router (React 19 + TypeScript + Tailwind CSS v4) with a centralized Windows window state manager (`useWindowManager`). Window animations, folder zoom-in transitions, and 3D card tilt effects are orchestrated with GSAP. Folder windows render authentic File Explorer shells hosting rich viewports matching the user's sample artboards.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, GSAP (GreenSock Animation Platform), Lucide React (for system icons), Vitest + React Testing Library (for unit and component verification).

**Spec:** Designed strictly according to `public/samples/` (`home.png`, `backgorund-home.png`, `about-me.png`, `contact.png`, `project-1.png`, `project-2.png`, `project-3.png`) and assets in `public/icons/` & `public/pictures/`.

## Global Constraints

- Must run smoothly on Next.js 16 + React 19 + Tailwind CSS v4.
- All animations must use `gsap` with robust cleanup (`gsap.context()` or `useGSAP` patterns) to prevent memory leaks and hydration mismatches.
- Window management must support dragging, z-index elevation on focus, minimizing to taskbar, maximizing to viewport, and smooth closing.
- Project images must use clear mock path defaults (e.g., `/mockups/project1-main.png`) with built-in fallback SVG visuals so the UI looks complete immediately while allowing the user to swap files later.
- Preserve existing assets in `public/` (`icons/`, `pictures/`, `samples/`).
- Mobile responsiveness: auto-fit windows to viewport bounds on small screens with clean touch interactions.

---

### Task 1: Environment Setup & Core Dependencies

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

**Interfaces:**

- Consumes: Node.js & npm package ecosystem.
- Produces: `gsap`, `lucide-react`, and `vitest` test harness configured for Next.js and React 19.

- [ ] **Step 1: Write test to verify test harness runs**

```typescript
// tests/sanity.test.ts
import { describe, it, expect } from "vitest";

describe("Sanity test", () => {
  it("verifies testing framework operates properly", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Add vitest and test scripts to package.json and create configuration**

Update `package.json` with dependencies: `gsap`, `lucide-react`, and devDependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

Create `tests/setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npm test` or `npx vitest run tests/sanity.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/sanity.test.ts
git commit -m "chore: setup dependencies for gsap, lucide-react, and vitest"
```

---

### Task 2: Portfolio Data Model & Project Mocking System

**Files:**

- Create: `types/portfolio.ts`
- Create: `data/portfolioData.ts`
- Test: `tests/portfolioData.test.ts`

**Interfaces:**

- Consumes: Nothing
- Produces:
  - `ProjectItem`: interface with `id, title, subtitle, tags, description, bgColor, mockImages: { left, main, right }, links: { github, demo }`
  - `portfolioData`: constant with user profile, skills, contact info, and 4 project definitions with easy-to-swap mock image paths.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/portfolioData.test.ts
import { describe, it, expect } from "vitest";
import { portfolioData } from "@/data/portfolioData";

describe("portfolioData", () => {
  it("contains valid owner profile and projects", () => {
    expect(portfolioData.profile.name).toBe("Trần Trung Nguyên");
    expect(portfolioData.projects.length).toBeGreaterThanOrEqual(3);
    const p1 = portfolioData.projects[0];
    expect(p1.mockImages.main).toBeDefined();
    expect(p1.mockImages.left).toBeDefined();
    expect(p1.mockImages.right).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/portfolioData.test.ts`
Expected: FAIL with "Cannot find module '@/data/portfolioData'"

- [ ] **Step 3: Implement `types/portfolio.ts` and `data/portfolioData.ts`**

```typescript
// types/portfolio.ts
export interface ProjectImages {
  left: string;
  main: string;
  right: string;
}

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tags: string[];
  description: string;
  bgColor: string;
  accentColor: string;
  mockImages: ProjectImages;
  links: {
    github?: string;
    demo?: string;
  };
}

export interface SkillItem {
  name: string;
  category: string;
  level: number;
  icon?: string;
}

export interface PortfolioData {
  profile: {
    name: string;
    role: string;
    tagline: string;
    location: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    status: string;
    avatar: string;
  };
  skills: SkillItem[];
  projects: ProjectItem[];
}
```

```typescript
// data/portfolioData.ts
import { PortfolioData } from "@/types/portfolio";

export const portfolioData: PortfolioData = {
  profile: {
    name: "Trần Trung Nguyên",
    role: "Full-Stack Developer",
    tagline:
      "Building clean, functional web applications with a focus on great user experience.",
    location: "Ho Chi Minh City, Vietnam 🇻🇳",
    email: "trtrnguyen14104@gmail.com",
    phone: "0354066043",
    github: "https://github.com/trtrnguyen14104",
    linkedin: "https://linkedin.com/in/trung-nguyên-trần-82b1403b8",
    status: "Open to work",
    avatar: "/pictures/me.png",
  },
  skills: [
    { name: "JavaScript", category: "Language", level: 90 },
    { name: "TypeScript", category: "Language", level: 80 },
    { name: "React", category: "Framework", level: 85 },
    { name: "Next.js", category: "Framework", level: 75 },
    { name: "Node.js", category: "Runtime", level: 75 },
    { name: "Express.js", category: "Framework", level: 75 },
    { name: "FastAPI", category: "Backend", level: 70 },
    { name: "PostgreSQL", category: "Database", level: 70 },
    { name: "Docker", category: "DevOps", level: 70 },
    { name: "Git & GitHub", category: "Tools", level: 85 },
  ],
  projects: [
    {
      id: "project-1",
      number: "01",
      title: "Quiz App",
      subtitle: "Solo Project | Fullstack Developer",
      tags: ["React", "Express", "Node.js", "TailwindCSS"],
      description:
        "A full-stack Quiz App featuring topic selection, timed quizzes, interactive score tracking, and performance analytics.",
      bgColor: "#a3d95b",
      accentColor: "#ffffff",
      mockImages: {
        left: "/samples/project-1.png",
        main: "/samples/project-1.png",
        right: "/samples/project-1.png",
      },
      links: {
        github: "https://github.com/trtrnguyen14104/Quiz_app",
      },
    },
    {
      id: "project-2",
      number: "02",
      title: "Social Media AloChat",
      subtitle: "Team Size: 3 | Fullstack Developer",
      tags: ["React", "Express", "Redis", "Socket.io"],
      description:
        "A real-time messaging and social application built with instant messaging, live presence, Redis caching, and WebSocket streams.",
      bgColor: "#4a69e2",
      accentColor: "#ffffff",
      mockImages: {
        left: "/samples/project-2.png",
        main: "/samples/project-2.png",
        right: "/samples/project-2.png",
      },
      links: {
        github: "https://github.com/trtrnguyen14104/Social-Media-AloChat",
      },
    },
    {
      id: "project-3",
      number: "03",
      title: "Research Data Management System",
      subtitle: "Team Size: 2 | Fullstack Developer",
      tags: ["Next.js", "FastAPI", "TypeScript", "PostgreSQL"],
      description:
        "A comprehensive management platform for scientific research publications featuring staging, peer review, approval pipelines, and search.",
      bgColor: "#f4c430",
      accentColor: "#ffffff",
      mockImages: {
        left: "/samples/project-3.png",
        main: "/samples/project-3.png",
        right: "/samples/project-3.png",
      },
      links: {
        github: "https://github.com/NTriCuong/Research-data-managerment-system",
      },
    },
  ],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/portfolioData.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add types/portfolio.ts data/portfolioData.ts tests/portfolioData.test.ts
git commit -m "feat: add portfolio data models and initial project configurations"
```

---

### Task 3: Windows Manager State Hook

**Files:**

- Create: `hooks/useWindowManager.ts`
- Test: `tests/useWindowManager.test.ts`

**Interfaces:**

- Consumes: React hooks (`useState`, `useCallback`)
- Produces:
  - `WindowState`: `{ id, title, icon, isOpen, isMinimized, isMaximized, zIndex, position, size }`
  - `useWindowManager`: hook returning `{ windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, bringToFront, activeWindowId }`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/useWindowManager.test.ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/useWindowManager.test.ts`
Expected: FAIL with "Cannot find module '@/hooks/useWindowManager'"

- [ ] **Step 3: Implement `hooks/useWindowManager.ts`**

```typescript
// hooks/useWindowManager.ts
"use client";

import { useState, useCallback } from "react";

export type WindowId = "about-me" | "projects" | "contact";

export interface WindowConfig {
  id: WindowId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const INITIAL_WINDOWS: Record<WindowId, WindowConfig> = {
  "about-me": {
    id: "about-me",
    title: "About Me - File Explorer",
    icon: "/icons/Windows-FOLDER.png",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 80, y: 50 },
    size: { width: 920, height: 600 },
  },
  projects: {
    id: "projects",
    title: "Projects - File Explorer",
    icon: "/icons/Windows-FOLDER.png",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 120, y: 70 },
    size: { width: 980, height: 640 },
  },
  contact: {
    id: "contact",
    title: "Contact - File Explorer",
    icon: "/icons/Windows-FOLDER.png",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 160, y: 90 },
    size: { width: 880, height: 560 },
  },
};

export function useWindowManager() {
  const [windows, setWindows] =
    useState<Record<WindowId, WindowConfig>>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>(null);
  const [highestZ, setHighestZ] = useState(20);

  const bringToFront = useCallback((id: WindowId) => {
    setHighestZ((prev) => {
      const nextZ = prev + 1;
      setWindows((prevWindows) => ({
        ...prevWindows,
        [id]: {
          ...prevWindows[id],
          zIndex: nextZ,
          isMinimized: false,
        },
      }));
      return nextZ;
    });
    setActiveWindowId(id);
  }, []);

  const openWindow = useCallback(
    (id: WindowId, origin?: { x: number; y: number }) => {
      setHighestZ((prev) => {
        const nextZ = prev + 1;
        setWindows((prevWindows) => {
          const target = prevWindows[id];
          return {
            ...prevWindows,
            [id]: {
              ...target,
              isOpen: true,
              isMinimized: false,
              zIndex: nextZ,
            },
          };
        });
        return nextZ;
      });
      setActiveWindowId(id);
    },
    [],
  );

  const closeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const maximizeWindow = useCallback(
    (id: WindowId) => {
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], isMaximized: !prev[id].isMaximized },
      }));
      bringToFront(id);
    },
    [bringToFront],
  );

  const updatePosition = useCallback(
    (id: WindowId, pos: { x: number; y: number }) => {
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], position: pos },
      }));
    },
    [],
  );

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    bringToFront,
    updatePosition,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/useWindowManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/useWindowManager.ts tests/useWindowManager.test.ts
git commit -m "feat: implement useWindowManager hook for window state handling"
```

---

### Task 4: GSAP Animation Orchestrator

**Files:**

- Create: `utils/gsapAnimations.ts`
- Test: `tests/gsapAnimations.test.ts`

**Interfaces:**

- Consumes: `gsap`
- Produces:
  - `animateFolderOpen(folderEl: HTMLElement, targetWindowEl: HTMLElement, onComplete?: () => void)`
  - `animateWindowMinimize(windowEl: HTMLElement, taskbarIconEl: HTMLElement | null, onComplete?: () => void)`
  - `animateWindowRestore(windowEl: HTMLElement, taskbarIconEl: HTMLElement | null, onComplete?: () => void)`
  - `animateWindowClose(windowEl: HTMLElement, onComplete?: () => void)`
  - `animateDesktopIntro(desktopEl: HTMLElement)`

- [ ] **Step 1: Write test for GSAP animation functions**

```typescript
// tests/gsapAnimations.test.ts
import { describe, it, expect } from "vitest";
import * as animations from "@/utils/gsapAnimations";

describe("gsapAnimations module", () => {
  it("exports all core animation handlers", () => {
    expect(typeof animations.animateFolderOpen).toBe("function");
    expect(typeof animations.animateWindowMinimize).toBe("function");
    expect(typeof animations.animateWindowRestore).toBe("function");
    expect(typeof animations.animateWindowClose).toBe("function");
    expect(typeof animations.animateDesktopIntro).toBe("function");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/gsapAnimations.test.ts`
Expected: FAIL with "Cannot find module '@/utils/gsapAnimations'"

- [ ] **Step 3: Implement `utils/gsapAnimations.ts`**

```typescript
// utils/gsapAnimations.ts
import gsap from "gsap";

export function animateFolderOpen(
  folderEl: HTMLElement,
  windowEl: HTMLElement,
  onComplete?: () => void,
) {
  const folderRect = folderEl.getBoundingClientRect();
  const windowRect = windowEl.getBoundingClientRect();

  // Subtle folder bounce click effect
  gsap
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

export function animateWindowMinimize(
  windowEl: HTMLElement,
  taskbarIconEl: HTMLElement | null,
  onComplete?: () => void,
) {
  let targetX = 0;
  let targetY = window.innerHeight - 40;

  if (taskbarIconEl) {
    const iconRect = taskbarIconEl.getBoundingClientRect();
    const winRect = windowEl.getBoundingClientRect();
    targetX =
      iconRect.left + iconRect.width / 2 - (winRect.left + winRect.width / 2);
    targetY = iconRect.top - winRect.top;
  }

  gsap.to(windowEl, {
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

export function animateWindowRestore(
  windowEl: HTMLElement,
  taskbarIconEl: HTMLElement | null,
  onComplete?: () => void,
) {
  gsap.set(windowEl, { display: "flex" });
  let fromX = 0;
  let fromY = window.innerHeight - 40;

  if (taskbarIconEl) {
    const iconRect = taskbarIconEl.getBoundingClientRect();
    const winRect = windowEl.getBoundingClientRect();
    fromX =
      iconRect.left + iconRect.width / 2 - (winRect.left + winRect.width / 2);
    fromY = iconRect.top - winRect.top;
  }

  gsap.fromTo(
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

export function animateWindowClose(
  windowEl: HTMLElement,
  onComplete?: () => void,
) {
  gsap.to(windowEl, {
    scale: 0.85,
    opacity: 0,
    duration: 0.22,
    ease: "power2.in",
    onComplete,
  });
}

export function animateDesktopIntro(desktopEl: HTMLElement) {
  const icons = desktopEl.querySelectorAll(".desktop-icon");
  const title = desktopEl.querySelector(".hero-typography");
  const taskbar = desktopEl.querySelector(".windows-taskbar");

  const tl = gsap.timeline();

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
      "-=0.4",
    );
  }

  if (taskbar) {
    tl.fromTo(
      taskbar,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
      "-=0.3",
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/gsapAnimations.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/gsapAnimations.ts tests/gsapAnimations.test.ts
git commit -m "feat: implement GSAP animation orchestrator for Windows OS transitions"
```

---

### Task 5: Windows Taskbar & System Tray

**Files:**

- Create: `components/windows/Taskbar.tsx`
- Create: `components/windows/StartMenu.tsx`
- Test: `tests/Taskbar.test.tsx`

**Interfaces:**

- Consumes: `WindowState`, `WindowId`, `useWindowManager` methods
- Produces:
  - `Taskbar`: React component fixed to the bottom of the viewport with Start menu toggle, search bar with mic icon, pinned folder icon, running window tabs, Wifi, Volume, Battery (`Windows_battery.png`), clock & 14/10/2004 date.
  - `StartMenu`: Quick access panel with shortcuts to folders, profile bio, and GitHub links.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/Taskbar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Taskbar } from '@/components/windows/Taskbar';

describe('Taskbar Component', () => {
  it('renders start button, search pill, and tray icons', () => {
    const mockOpenWindow = vi.fn();
    const mockMinimizeWindow = vi.fn();
    const mockBringToFront = vi.fn();

    render(
      <Taskbar
        windows={{
          'about-me': {
            id: 'about-me',
            title: 'About Me',
            icon: '/icons/Windows-FOLDER.png',
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: 10,
            position: { x: 0, y: 0 },
            size: { width: 500, height: 400 },
          },
          'projects': {
            id: 'projects',
            title: 'Projects',
            icon: '/icons/Windows-FOLDER.png',
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            zIndex: 10,
            position: { x: 0, y: 0 },
            size: { width: 500, height: 400 },
          },
          'contact': {
            id: 'contact',
            title: 'Contact',
            icon: '/icons/Windows-FOLDER.png',
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            zIndex: 10,
            position: { x: 0, y: 0 },
            size: { width: 500, height: 400 },
          },
        }}
        activeWindowId="about-me"
        onOpenWindow={mockOpenWindow}
        onMinimizeWindow={mockMinimizeWindow}
        onBringToFront={mockBringToFront}
      />
    );

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/about me/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/Taskbar.test.tsx`
Expected: FAIL with "Cannot find module '@/components/windows/Taskbar'"

- [ ] **Step 3: Implement `StartMenu.tsx` and `Taskbar.tsx`**

Create `components/windows/StartMenu.tsx`:

- Render profile card with avatar (`/pictures/me.png`), name "Trần Trung Nguyên", role "Full-Stack Developer".
- List navigation shortcuts to About Me, Projects, Contact folders.
- Power buttons (Lock, Restart portfolio with animation).

Create `components/windows/Taskbar.tsx`:

- Height 48px, semi-transparent frosted acrylic blur: `bg-[#0f172a]/60 backdrop-blur-md border-t border-white/10`.
- Left items: Start button (menu icon `☰`), Pill search input with `Search` icon & `Mic` icon.
- App badges for open windows (About Me, Projects, Contact) with active bottom indicator line and minimize toggle.
- System tray on right: Wifi icon, Volume icon, Battery icon (`/icons/Windows_battery.png`), Clock & Date formatted as "4:04 PM" and "14/10/2004" (toggleable to live date).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/Taskbar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/windows/Taskbar.tsx components/windows/StartMenu.tsx tests/Taskbar.test.tsx
git commit -m "feat: implement Windows taskbar, start menu, and system tray"
```

---

### Task 6: Desktop Environment & Desktop Folder Icons

**Files:**

- Create: `components/windows/DesktopIcon.tsx`
- Create: `components/windows/HeroTypography.tsx`
- Create: `components/windows/Desktop.tsx`
- Test: `tests/DesktopIcon.test.tsx`

**Interfaces:**

- Consumes: `useWindowManager`, `animateFolderOpen`, `/samples/backgorund-home.png`
- Produces:
  - `HeroTypography`: Arched "TRẦN TRUNG NGUYÊN" + groovy yellow script "Portfolio" matching `home.png`.
  - `DesktopIcon`: Selectable, double-clickable folder icon on the desktop with hover highlight, selection box, and GSAP trigger.
  - `Desktop`: Fullscreen container with wallpaper, hero text, desktop icons, and active windows layer.

- [ ] **Step 1: Write test for DesktopIcon component**

```typescript
// tests/DesktopIcon.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopIcon } from '@/components/windows/DesktopIcon';

describe('DesktopIcon Component', () => {
  it('handles click to select and double click to open', () => {
    const handleOpen = vi.fn();
    render(
      <DesktopIcon
        id="about-me"
        label="About Me"
        icon="/icons/Windows-FOLDER.png"
        isSelected={false}
        onSelect={vi.fn()}
        onOpen={handleOpen}
      />
    );

    const icon = screen.getByText('About Me');
    fireEvent.doubleClick(icon);
    expect(handleOpen).toHaveBeenCalledWith('about-me', expect.anything());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/DesktopIcon.test.tsx`
Expected: FAIL with "Cannot find module '@/components/windows/DesktopIcon'"

- [ ] **Step 3: Implement `HeroTypography.tsx`, `DesktopIcon.tsx`, and `Desktop.tsx`**

`HeroTypography.tsx`:

- Render arched bold text: "TRẦN TRUNG NGUYÊN" in vibrant yellow (#ffd000).
- Render large flowing retro script font: "Portfolio" with subtle warm shadow.

`DesktopIcon.tsx`:

- Desktop icon with folder image (`/icons/Windows-FOLDER.png` or clean vector folder from `home.png`), white text label with drop shadow.
- Selection box with blue semi-transparent highlight (`bg-blue-500/25 border border-blue-400/50`).
- Supports both single-click selection and double-click (or touch tap) to open.

`Desktop.tsx`:

- Background wallpaper: `/samples/backgorund-home.png`.
- Renders the 3 desktop icons arranged vertically on the left:
  - "About Me"
  - "Projects"
  - "Contact"
- Triggers `animateDesktopIntro` on mount.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/DesktopIcon.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/windows/DesktopIcon.tsx components/windows/HeroTypography.tsx components/windows/Desktop.tsx tests/DesktopIcon.test.tsx
git commit -m "feat: implement desktop environment with wallpaper, hero typography, and folder icons"
```

---

### Task 7: Windows Explorer Window Frame Shell

**Files:**

- Create: `components/windows/WindowFrame.tsx`
- Test: `tests/WindowFrame.test.tsx`

**Interfaces:**

- Consumes: `WindowConfig`, `useWindowManager`
- Produces:
  - `WindowFrame`: Reusable window container with:
    - Draggable title bar
    - Window controls: Minimize (`Windows-minimize.svg`), Maximize/Restore (`Windows-restore-symbolic.svg`), Close (`✕`)
    - File Explorer navigation ribbon (Back, Forward, Refresh, Address breadcrumb bar `📁 This PC > Portfolio > [Folder]`, Search in folder)
    - Scrollable viewport for window body content
    - Smooth GSAP minimize, restore, maximize, and close animations

- [ ] **Step 1: Write test for WindowFrame**

```typescript
// tests/WindowFrame.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowFrame } from '@/components/windows/WindowFrame';

describe('WindowFrame Component', () => {
  it('renders title bar and buttons, firing appropriate events', () => {
    const handleClose = vi.fn();
    const handleMinimize = vi.fn();
    const handleMaximize = vi.fn();

    render(
      <WindowFrame
        id="about-me"
        title="About Me - File Explorer"
        isOpen={true}
        isMinimized={false}
        isMaximized={false}
        zIndex={20}
        position={{ x: 50, y: 50 }}
        size={{ width: 600, height: 400 }}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onFocus={vi.fn()}
      >
        <div>Explorer Content</div>
      </WindowFrame>
    );

    expect(screen.getByText(/About Me - File Explorer/i)).toBeInTheDocument();
    expect(screen.getByText('Explorer Content')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/WindowFrame.test.tsx`
Expected: FAIL with "Cannot find module '@/components/windows/WindowFrame'"

- [ ] **Step 3: Implement `WindowFrame.tsx`**

- Build authentic Windows 11 / retro File Explorer frame with rounded borders, drop shadow, backdrop blur.
- Draggable header using pointer events or GSAP draggable to move freely on desktop.
- Window buttons with hover feedback:
  - Minimize: light gray hover
  - Maximize: light gray hover
  - Close: red hover (`bg-red-500 text-white`)
- Explorer toolbar:
  - Navigation arrows (`←`, `→`, `↑`)
  - Address bar input showing `This PC > Portfolio > [Title]`
  - Search input on right: `Search [Title]...`
- Status bar at bottom: `1 item selected | 3 items total`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/WindowFrame.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/windows/WindowFrame.tsx tests/WindowFrame.test.tsx
git commit -m "feat: implement File Explorer window frame with controls and address bar"
```

---

### Task 8: "About Me" Folder Window Content

**Files:**

- Create: `components/windows/AboutMeContent.tsx`
- Test: `tests/AboutMeContent.test.tsx`

**Interfaces:**

- Consumes: `portfolioData.profile`, `portfolioData.skills`, `/pictures/me.png`, `/icons/Windows_mouse.png`
- Produces:
  - `AboutMeContent`: Rendered inside the "About Me" window matching `public/samples/about-me.png`:
    - Vibrant sky blue background (`#5373e1` / `#4361ee`)
    - Groovy retro yellow script: `hi, its Nguyen!`
    - Green/yellow script subhead: `what i do` with pixel cursor `Windows_mouse.png`
    - Bio description with skills and background
    - Right side: Portrait picture (`/pictures/me.png`) with clean cut-out aesthetic
    - Interactive skill chips and quick contact links

- [ ] **Step 1: Write test for AboutMeContent**

```typescript
// tests/AboutMeContent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutMeContent } from '@/components/windows/AboutMeContent';

describe('AboutMeContent Component', () => {
  it('renders hero greeting, bio, and portrait image', () => {
    render(<AboutMeContent />);
    expect(screen.getByText(/hi, its Nguyen!/i)).toBeInTheDocument();
    expect(screen.getByText(/what i do/i)).toBeInTheDocument();
    const portrait = screen.getByAltText(/Trần Trung Nguyên/i);
    expect(portrait).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/AboutMeContent.test.tsx`
Expected: FAIL with "Cannot find module '@/components/windows/AboutMeContent'"

- [ ] **Step 3: Implement `AboutMeContent.tsx`**

Replicate the exact design from `about-me.png`:

- Blue background panel (#4969e6).
- Retro cursive yellow headline `hi, its Nguyen!` in thick groovy script.
- Subheading `what i do` in lime/yellow script with pixel cursor pointing to it.
- Bio text:
  - "I'm Trần Trung Nguyên, a Full-Stack Developer with a passion for building web applications from end-to-end..."
  - Highlighted skill chips (JavaScript, TypeScript, React, Next.js, Express, FastAPI, Docker).
- Right column: Portrait image `/pictures/me.png` with smooth drop shadow and rounded or framed styling.
- Download CV / LinkedIn button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/AboutMeContent.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/windows/AboutMeContent.tsx tests/AboutMeContent.test.tsx
git commit -m "feat: implement About Me window content matching about-me sample"
```

---

### Task 9: "Projects" Folder Window & Laptop Fan-Out Showcase

**Files:**

- Create: `components/windows/LaptopMockup.tsx`
- Create: `components/windows/ProjectsContent.tsx`
- Test: `tests/ProjectsContent.test.tsx`

**Interfaces:**

- Consumes: `portfolioData.projects`, `ProjectItem`, `gsap`
- Produces:
  - `LaptopMockup`: Realistic laptop chassis with 3 fan-out perspective cards (left card, center screen, right card) matching `project-1.png`, `project-2.png`, and `project-3.png`.
  - `ProjectsContent`: Projects viewer allowing browsing between projects, switching view modes (File Explorer list vs. 3D Laptop Showcase), and reading project tags and links.
  - Mock Image Paths: Clear default paths (`mockImages.left`, `mockImages.main`, `mockImages.right`) that fallback gracefully to stylized preview templates if custom screenshots are not yet added.

- [ ] **Step 1: Write test for ProjectsContent**

```typescript
// tests/ProjectsContent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectsContent } from '@/components/windows/ProjectsContent';

describe('ProjectsContent Component', () => {
  it('renders projects and switches between projects', () => {
    render(<ProjectsContent />);
    expect(screen.getByText(/Quiz App/i)).toBeInTheDocument();

    const nextBtn = screen.getByLabelText(/next project/i);
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Social Media AloChat/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ProjectsContent.test.tsx`
Expected: FAIL with "Cannot find module '@/components/windows/ProjectsContent'"

- [ ] **Step 3: Implement `LaptopMockup.tsx` and `ProjectsContent.tsx`**

`LaptopMockup.tsx`:

- Render central laptop body (slate grey metallic bezel, keyboard base with trackpad notch, reflective screen).
- Render 3 fan-out cards with GSAP 3D transform:
  - Left card: Angled perspective tilted -18deg with drop shadow.
  - Center card: Positioned directly on laptop screen.
  - Right card: Angled perspective tilted +18deg with drop shadow.
- Overlay signature script title across laptop base (`project 1`, `project 2`, `project 3`) matching the samples.
- Support mock images with fallback card UI if an image fails to load.

`ProjectsContent.tsx`:

- Background color dynamically transitions with GSAP based on active project:
  - Project 1: Light lime green `#c5e153`
  - Project 2: Periwinkle blue `#5373e1`
  - Project 3: Sunflower yellow `#f4c938`
- Next/Previous project switcher arrows and keyboard arrow support.
- Project details panel: Number, Title, Tags, Description, GitHub Link.
- File explorer folder tabs: `📁 01_Quiz_App`, `📁 02_AloChat`, `📁 03_Research_System` for quick jumping.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ProjectsContent.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/windows/LaptopMockup.tsx components/windows/ProjectsContent.tsx tests/ProjectsContent.test.tsx
git commit -m "feat: implement Projects window with 3-card laptop fan-out mockup showcase"
```

---

### Task 10: "Contact" Folder Window Content

**Files:**

- Create: `components/windows/ContactContent.tsx`
- Test: `tests/ContactContent.test.tsx`

**Interfaces:**

- Consumes: `portfolioData.profile`, `/icons/Windows_mouse.png`
- Produces:
  - `ContactContent`: Rendered inside the "Contact" window matching `public/samples/contact.png`:
    - Large yellow retro script headline: `Let's Work`
    - Cursive subtitle: `contact me` with pixel cursor `Windows_mouse.png`
    - Pill action buttons:
      - `FOLLOW ME @trtrnguyen14104` (GitHub blue pill button)
      - `trtrnguyen14104@gmail.com` (Email purple pill button)
      - LinkedIn pill button
      - Phone number pill button
    - Interactive "Send a Message" retro Windows Mail form

- [ ] **Step 1: Write test for ContactContent**

```typescript
// tests/ContactContent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactContent } from '@/components/windows/ContactContent';

describe('ContactContent Component', () => {
  it('renders Let\'s Work headline, contact me script, and action buttons', () => {
    render(<ContactContent />);
    expect(screen.getByText(/Let's Work/i)).toBeInTheDocument();
    expect(screen.getByText(/contact me/i)).toBeInTheDocument();
    expect(screen.getByText(/trtrnguyen14104@gmail.com/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ContactContent.test.tsx`
Expected: FAIL with "Cannot find module '@/components/windows/ContactContent'"

- [ ] **Step 3: Implement `ContactContent.tsx`**

- Background matching `contact.png` (green grass rolling hill under bright blue sky).
- Yellow retro typography: `Let's Work`, subtitle `contact me` with pixel cursor pointing to it.
- Pill buttons with hover micro-animations:
  - Blue pill: `FOLLOW ME @trtrnguyen14104` (links to GitHub)
  - Purple pill: `HELLO@REALLYGREATSITE.COM` / `trtrnguyen14104@gmail.com` (copies email to clipboard and prompts toast)
  - Additional pill buttons for LinkedIn and Phone.
- Optional expandable retro email composer: To, Subject, Message, Send.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ContactContent.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/windows/ContactContent.tsx tests/ContactContent.test.tsx
git commit -m "feat: implement Contact window content matching contact sample"
```

---

### Task 11: Main App Integration, Fonts & Sound Effects

**Files:**

- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `app/page.tsx`
- Test: `tests/page.test.tsx`

**Interfaces:**

- Consumes: Google Fonts (`Pacifico` or `Shrikhand`, `Plus Jakarta Sans`), `Desktop`, `Taskbar`, `WindowFrame`, `AboutMeContent`, `ProjectsContent`, `ContactContent`
- Produces: The complete, functional Windows OS desktop portfolio application.

- [ ] **Step 1: Write integration test for main page**

```typescript
// tests/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '@/app/page';

describe('Portfolio Home Page', () => {
  it('renders desktop, wallpaper, folder icons, and taskbar', () => {
    render(<Page />);
    expect(screen.getByText(/TRẦN TRUNG NGUYÊN/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText('About Me')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify current page fails test**

Run: `npx vitest run tests/page.test.tsx`
Expected: FAIL (current `page.tsx` is default Next.js template)

- [ ] **Step 3: Update `layout.tsx`, `globals.css`, and `page.tsx`**

`app/layout.tsx`:

- Configure Google Fonts for retro groovy headers (Pacifico / Shrikhand) and sans-serif for clean UI.
- Set title to `Trần Trung Nguyên — Windows OS Portfolio`.

`app/globals.css`:

- Define custom utility classes for Windows acrylic blur, retro cursive typography, and pixel cursor.
- Custom scrollbar styling matching Windows File Explorer.

`app/page.tsx`:

- Connect `useWindowManager` with `Desktop`, `Taskbar`, and the 3 active `WindowFrame` components hosting `AboutMeContent`, `ProjectsContent`, and `ContactContent`.
- Coordinate GSAP animations on folder click and window minimize/restore.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css app/page.tsx tests/page.test.tsx
git commit -m "feat: assemble full Windows OS portfolio with fonts, GSAP transitions, and window manager"
```

---

### Task 12: Verification & Project Mock Replacement Guide

**Files:**

- Create: `docs/MOCK_IMAGES_GUIDE.md`
- Test: All tests (`npx vitest run`) + Build check (`npm run build`)

**Interfaces:**

- Consumes: Entire application codebase
- Produces:
  - 100% passing test suite
  - Successful Next.js production build (`npm run build`)
  - Documentation explaining how the user can replace mockup images with their real screenshots.

- [ ] **Step 1: Create `docs/MOCK_IMAGES_GUIDE.md`**

Document clear steps for the user to:

- Place their project screenshot files in `public/mockups/`
- Update the image paths in `data/portfolioData.ts` (`mockImages.left`, `mockImages.main`, `mockImages.right`)
- Supported image formats and recommended aspect ratios.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: All test suites PASS.

- [ ] **Step 3: Run production build and linting**

Run: `npm run build` and `npm run lint`
Expected: Build succeeds with zero errors.

- [ ] **Step 4: Commit**

```bash
git add docs/MOCK_IMAGES_GUIDE.md
git commit -m "docs: add mock images replacement guide and verify build"
```
