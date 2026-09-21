"use client";

import { useState, useCallback, useRef } from "react";

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

export type WindowState = WindowConfig;

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
  const highestZRef = useRef(20);

  const bringToFront = useCallback((id: WindowId) => {
    highestZRef.current += 1;
    const nextZ = highestZRef.current;
    setWindows((prevWindows) => ({
      ...prevWindows,
      [id]: {
        ...prevWindows[id],
        zIndex: nextZ,
        isMinimized: false,
      },
    }));
    setActiveWindowId(id);
  }, []);

  const openWindow = useCallback(
    (id: WindowId) => {
      highestZRef.current += 1;
      const nextZ = highestZRef.current;
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
