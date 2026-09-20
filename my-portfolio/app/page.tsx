"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useWindowManager, WindowId } from "@/hooks/useWindowManager";
import { Desktop } from "@/components/windows/Desktop";
import { Taskbar } from "@/components/windows/Taskbar";
import { WindowFrame } from "@/components/windows/WindowFrame";
import { AboutMeContent } from "@/components/windows/AboutMeContent";
import { ProjectsContent } from "@/components/windows/ProjectsContent";
import { ContactContent } from "@/components/windows/ContactContent";
import { animateFolderOpen, animateWindowMinimize } from "@/utils/gsapAnimations";

export default function Home() {
  const {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    bringToFront,
    updatePosition,
  } = useWindowManager();

  const [selectedFolderId, setSelectedFolderId] = useState<WindowId | null>(null);

  // Track previous open state of each window to trigger GSAP zoom animation from folder icon on open
  const prevOpenRef = useRef<Record<WindowId, boolean>>({
    "about-me": false,
    projects: false,
    contact: false,
  });

  useEffect(() => {
    (Object.keys(windows) as WindowId[]).forEach((id) => {
      const wasOpen = prevOpenRef.current[id];
      const isOpen = windows[id].isOpen;

      if (!wasOpen && isOpen) {
        const folderLabelMap: Record<WindowId, string> = {
          "about-me": "About Me",
          projects: "Projects",
          contact: "Contact",
        };

        const folderEl = document.querySelector(
          `[aria-label="${folderLabelMap[id]}"]`
        ) as HTMLElement | null;
        const windowEl = document.querySelector(
          `[data-window-id="${id}"]`
        ) as HTMLElement | null;

        if (folderEl && windowEl) {
          try {
            const tween = animateFolderOpen(folderEl, windowEl);
            if (
              process.env.NODE_ENV === "test" &&
              tween &&
              typeof (tween as unknown as { progress?: (val: number) => void }).progress === "function"
            ) {
              (tween as unknown as { progress: (val: number) => void }).progress(1);
            }
          } catch {
            // Fallback for non-GSAP environments
          }
        }
      }

      prevOpenRef.current[id] = isOpen;
    });
  }, [windows]);

  // Handle minimize triggered specifically from Taskbar badge clicks
  const handleMinimizeFromTaskbar = useCallback(
    (id: WindowId) => {
      const windowEl = document.querySelector(
        `[data-window-id="${id}"]`
      ) as HTMLElement | null;
      const taskbarIcon = (document.querySelector(`[data-taskbar-id="${id}"]`) ||
        document.querySelector(
          `[aria-label="${windows[id]?.title.replace(" - File Explorer", "")}"]`
        ) ||
        document.querySelector(".windows-taskbar")) as HTMLElement | null;

      if (windowEl && !windows[id]?.isMinimized) {
        try {
          const tween = animateWindowMinimize(windowEl, taskbarIcon, () => {
            minimizeWindow(id);
          });
          if (
            process.env.NODE_ENV === "test" &&
            tween &&
            typeof (tween as unknown as { progress?: (val: number) => void }).progress === "function"
          ) {
            (tween as unknown as { progress: (val: number) => void }).progress(1);
          }
        } catch {
          minimizeWindow(id);
        }
      } else {
        minimizeWindow(id);
      }
    },
    [minimizeWindow, windows],
  );

  // Restart / Reset portfolio handler: closes all open windows
  const handleRestartPortfolio = useCallback(() => {
    (Object.keys(windows) as WindowId[]).forEach((id) => {
      if (windows[id].isOpen) {
        closeWindow(id);
      }
    });
    setSelectedFolderId(null);
  }, [windows, closeWindow]);

  const handleOpenFolder = useCallback(
    (id: WindowId) => {
      setSelectedFolderId(id);
      openWindow(id);
    },
    [openWindow],
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#4361ee]">
      {/* Desktop Environment with Wallpaper, Hero Typography, and Folder Icons */}
      <Desktop
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onOpenFolder={handleOpenFolder}
      >
        {/* About Me Window Frame */}
        <WindowFrame
          id="about-me"
          title={windows["about-me"].title}
          icon={windows["about-me"].icon}
          isOpen={windows["about-me"].isOpen}
          isMinimized={windows["about-me"].isMinimized}
          isMaximized={windows["about-me"].isMaximized}
          zIndex={windows["about-me"].zIndex}
          position={windows["about-me"].position}
          size={windows["about-me"].size}
          folderName="About Me"
          statusText="1 item selected | Software Engineer"
          onClose={() => closeWindow("about-me")}
          onMinimize={() => minimizeWindow("about-me")}
          onMaximize={() => maximizeWindow("about-me")}
          onFocus={() => bringToFront("about-me")}
          onPositionChange={(pos) => updatePosition("about-me", pos)}
        >
          <AboutMeContent />
        </WindowFrame>

        {/* Projects Window Frame */}
        <WindowFrame
          id="projects"
          title={windows["projects"].title}
          icon={windows["projects"].icon}
          isOpen={windows["projects"].isOpen}
          isMinimized={windows["projects"].isMinimized}
          isMaximized={windows["projects"].isMaximized}
          zIndex={windows["projects"].zIndex}
          position={windows["projects"].position}
          size={windows["projects"].size}
          folderName="Projects"
          statusText="3 items total | Featured Projects"
          onClose={() => closeWindow("projects")}
          onMinimize={() => minimizeWindow("projects")}
          onMaximize={() => maximizeWindow("projects")}
          onFocus={() => bringToFront("projects")}
          onPositionChange={(pos) => updatePosition("projects", pos)}
        >
          <ProjectsContent />
        </WindowFrame>

        {/* Contact Window Frame */}
        <WindowFrame
          id="contact"
          title={windows["contact"].title}
          icon={windows["contact"].icon}
          isOpen={windows["contact"].isOpen}
          isMinimized={windows["contact"].isMinimized}
          isMaximized={windows["contact"].isMaximized}
          zIndex={windows["contact"].zIndex}
          position={windows["contact"].position}
          size={windows["contact"].size}
          folderName="Contact"
          statusText="Ready to connect | 4 contact methods"
          onClose={() => closeWindow("contact")}
          onMinimize={() => minimizeWindow("contact")}
          onMaximize={() => maximizeWindow("contact")}
          onFocus={() => bringToFront("contact")}
          onPositionChange={(pos) => updatePosition("contact", pos)}
        >
          <ContactContent />
        </WindowFrame>
      </Desktop>

      {/* Windows Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenWindow={openWindow}
        onMinimizeWindow={handleMinimizeFromTaskbar}
        onBringToFront={bringToFront}
        onRestartPortfolio={handleRestartPortfolio}
      />
    </main>
  );
}
