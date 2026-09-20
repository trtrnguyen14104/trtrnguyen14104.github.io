"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { DesktopIcon } from "./DesktopIcon";
import { HeroTypography } from "./HeroTypography";
import { animateDesktopIntro } from "@/utils/gsapAnimations";
import { WindowId } from "@/hooks/useWindowManager";

export interface DesktopFolder {
  id: WindowId;
  label: string;
  icon: string;
}

export const DEFAULT_DESKTOP_FOLDERS: DesktopFolder[] = [
  {
    id: "about-me",
    label: "About Me",
    icon: "/icons/Windows-FOLDER.png",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "/icons/Windows-FOLDER.png",
  },
  {
    id: "contact",
    label: "Contact",
    icon: "/icons/Windows-FOLDER.png",
  },
];

export interface DesktopProps {
  onOpenFolder?: (id: WindowId, e?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => void;
  selectedFolderId?: WindowId | null;
  onSelectFolder?: (id: WindowId | null) => void;
  folders?: DesktopFolder[];
  wallpaperSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Desktop({
  onOpenFolder,
  selectedFolderId,
  onSelectFolder,
  folders = DEFAULT_DESKTOP_FOLDERS,
  wallpaperSrc = "/samples/backgorund-home.png",
  children,
  className = "",
}: DesktopProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<WindowId | null>(null);

  const activeSelectedId = selectedFolderId !== undefined ? selectedFolderId : internalSelectedId;

  useEffect(() => {
    if (desktopRef.current) {
      animateDesktopIntro(desktopRef.current);
    }
  }, []);

  const handleSelect = (id: WindowId | string) => {
    const winId = id as WindowId;
    setInternalSelectedId(winId);
    onSelectFolder?.(winId);
  };

  const handleOpen = (id: WindowId | string, e: any) => {
    const winId = id as WindowId;
    onOpenFolder?.(winId, e);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only deselect when clicking on empty desktop space or background
    const target = e.target as HTMLElement;
    if (
      target === e.currentTarget ||
      target.classList.contains("desktop-background") ||
      target.tagName === "IMG"
    ) {
      setInternalSelectedId(null);
      onSelectFolder?.(null);
    }
  };

  return (
    <div
      ref={desktopRef}
      onClick={handleBackgroundClick}
      className={`relative w-full h-screen overflow-hidden select-none bg-[#4361ee] ${className}`}
    >
      {/* Wallpaper Layer */}
      <div
        className="desktop-background absolute inset-0 z-0 cursor-default"
        onClick={handleBackgroundClick}
      >
        <Image
          src={wallpaperSrc}
          alt="Desktop Wallpaper"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center pointer-events-none select-none"
        />
      </div>

      {/* Hero Typography Layer */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none pb-20 sm:pb-28 md:pb-36 px-4">
        <HeroTypography />
      </div>

      {/* Desktop Folder Icons (Arranged vertically on the left side) */}
      <div className="absolute top-8 left-4 sm:top-12 sm:left-8 z-10 flex flex-col gap-6 sm:gap-8 pointer-events-auto">
        {folders.map((folder) => (
          <DesktopIcon
            key={folder.id}
            id={folder.id}
            label={folder.label}
            icon={folder.icon}
            isSelected={activeSelectedId === folder.id}
            onSelect={handleSelect}
            onOpen={handleOpen}
          />
        ))}
      </div>

      {/* Active Windows Placeholder / Floating Content Layer */}
      <div
        data-testid="windows-layer"
        className="absolute inset-0 z-20 pointer-events-none [&>*]:pointer-events-auto"
      >
        {children}
      </div>
    </div>
  );
}
