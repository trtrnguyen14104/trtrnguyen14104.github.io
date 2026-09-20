"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Minus,
  Square,
  Copy,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
} from "lucide-react";
import { WindowId } from "@/hooks/useWindowManager";
import {
  animateWindowMinimize,
  animateWindowRestore,
  animateWindowClose,
} from "@/utils/gsapAnimations";

export interface WindowFrameProps {
  id: WindowId | string;
  title: string;
  icon?: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex?: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  folderName?: string;
  statusText?: string;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onPositionChange?: (pos: { x: number; y: number }) => void;
  onBack?: () => void;
  onForward?: () => void;
  onRefresh?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WindowFrame({
  id,
  title,
  icon = "/icons/Windows-FOLDER.png",
  isOpen,
  isMinimized,
  isMaximized,
  zIndex = 20,
  position = { x: 80, y: 50 },
  size = { width: 800, height: 540 },
  folderName,
  statusText,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onBack,
  onForward,
  onRefresh,
  children,
  className = "",
}: WindowFrameProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(position);
  const [searchQuery, setSearchQuery] = useState("");
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, posX: 0, posY: 0 });
  const prevMinimizedRef = useRef(isMinimized);

  // Sync internal position with prop if changed from outside
  useEffect(() => {
    if (position) {
      setPos(position);
    }
  }, [position?.x, position?.y]);

  // Handle restore animation when transition from isMinimized=true to false
  useEffect(() => {
    if (prevMinimizedRef.current && !isMinimized && isOpen && windowRef.current) {
      const taskbarIcon = (document.querySelector(`[data-taskbar-id="${id}"]`) ||
        document.querySelector(`[aria-label="${title.replace(" - File Explorer", "")}"]`) ||
        document.querySelector(".windows-taskbar")) as HTMLElement | null;

      try {
        const tween = animateWindowRestore(windowRef.current, taskbarIcon);
        if (
          process.env.NODE_ENV === "test" &&
          tween &&
          typeof (tween as unknown as { progress?: (val: number) => void }).progress === "function"
        ) {
          (tween as unknown as { progress: (val: number) => void }).progress(1);
        }
      } catch {
        // Fallback for environments where GSAP is disabled
      }
    }
    prevMinimizedRef.current = isMinimized;
  }, [isMinimized, isOpen, id, title]);

  const resolvedFolderName =
    folderName ||
    title.replace(/\s*-\s*File Explorer.*$/i, "").trim() ||
    "Folder";

  const handleMinimize = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (windowRef.current) {
      try {
        const taskbarIcon = (document.querySelector(`[data-taskbar-id="${id}"]`) ||
          document.querySelector(`[aria-label="${title.replace(" - File Explorer", "")}"]`) ||
          document.querySelector(".windows-taskbar")) as HTMLElement | null;

        const tween = animateWindowMinimize(windowRef.current, taskbarIcon, () => {
          onMinimize?.();
        });

        if (
          process.env.NODE_ENV === "test" &&
          tween &&
          typeof (tween as unknown as { progress?: (val: number) => void }).progress === "function"
        ) {
          (tween as unknown as { progress: (val: number) => void }).progress(1);
        }
      } catch {
        onMinimize?.();
      }
    } else {
      onMinimize?.();
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (windowRef.current) {
      try {
        const tween = animateWindowClose(windowRef.current, () => {
          onClose();
        });

        if (
          process.env.NODE_ENV === "test" &&
          tween &&
          typeof (tween as unknown as { progress?: (val: number) => void }).progress === "function"
        ) {
          (tween as unknown as { progress: (val: number) => void }).progress(1);
        }
      } catch {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleMaximize = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onMaximize?.();
  };

  // Dragging handlers
  const handlePointerDownHeader = (e: React.PointerEvent<HTMLElement>) => {
    if (isMaximized) return;

    // Disallow drag when clicking buttons, inputs, links
    if ((e.target as HTMLElement).closest("button, input, a, [role='button']")) {
      return;
    }

    onFocus?.();

    isDraggingRef.current = true;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMoveHeader = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    const winWidth = size?.width || 800;
    const winHeight = size?.height || 540;
    const vpWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vpHeight = typeof window !== "undefined" ? window.innerHeight : 768;
    const taskbarHeight = 48;

    const maxX = Math.max(0, vpWidth - winWidth);
    const maxY = Math.max(0, vpHeight - taskbarHeight - winHeight);

    const clampedX = Math.max(0, Math.min(dragStartRef.current.posX + dx, maxX));
    const clampedY = Math.max(0, Math.min(dragStartRef.current.posY + dy, maxY));

    const newPos = { x: clampedX, y: clampedY };
    setPos(newPos);
    onPositionChange?.(newPos);
  };

  const handlePointerUpHeader = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  if (!isOpen) {
    return null;
  }

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 48,
        width: "100%",
        height: "calc(100vh - 48px)",
        zIndex,
        display: isMinimized ? "none" : "flex",
      }
    : {
        position: "fixed",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: size?.width ? `${size.width}px` : "800px",
        height: size?.height ? `${size.height}px` : "540px",
        maxWidth: "100vw",
        maxHeight: "calc(100vh - 48px)",
        zIndex,
        display: isMinimized ? "none" : "flex",
      };

  return (
    <div
      ref={windowRef}
      data-window-id={id}
      role="dialog"
      aria-label={title}
      aria-hidden={!isOpen || isMinimized}
      onPointerDown={() => onFocus?.()}
      style={windowStyle}
      className={`flex flex-col bg-[#1e293b]/95 backdrop-blur-xl text-white select-none transition-shadow ${
        isMaximized
          ? "rounded-none border-none shadow-none"
          : "rounded-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      } ${className}`}
    >
      {/* 1. Header Bar */}
      <header
        className={`window-header h-10 px-3 flex items-center justify-between border-b border-white/10 ${
          isMaximized ? "cursor-default" : "cursor-move"
        }`}
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest("button, input, a, [role='button']")) {
            handleMaximize();
          }
        }}
      >
        {/* Title and Icon */}
        <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
          <img
            src={icon}
            alt=""
            className="w-4 h-4 object-contain shrink-0"
          />
          <span className="text-xs font-medium text-white/90 truncate">
            {title}
          </span>
        </div>

        {/* Window Control Buttons */}
        <div className="flex items-center -mr-3 h-full shrink-0">
          {/* Minimize */}
          <button
            type="button"
            role="button"
            aria-label="Minimize"
            title="Minimize"
            onClick={handleMinimize}
            className="w-11 h-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            type="button"
            role="button"
            aria-label={isMaximized ? "Restore" : "Maximize"}
            title={isMaximized ? "Restore" : "Maximize"}
            onClick={handleMaximize}
            className="w-11 h-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-colors"
          >
            {isMaximized ? (
              <Copy className="w-3.5 h-3.5 rotate-90" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Close */}
          <button
            type="button"
            role="button"
            aria-label="Close"
            title="Close"
            onClick={handleClose}
            className={`w-11 h-full flex items-center justify-center text-white/80 hover:text-white hover:bg-red-500 transition-colors ${
              !isMaximized ? "rounded-tr-xl" : ""
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Explorer Toolbar */}
      <div className="toolbar px-3 py-1.5 flex items-center gap-2 border-b border-white/10 bg-black/15">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            aria-label="Back"
            title="Back"
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-white/10 active:scale-90 text-white/70 hover:text-white transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Forward"
            title="Forward"
            onClick={onForward}
            className="p-1.5 rounded-md hover:bg-white/10 active:scale-90 text-white/70 hover:text-white transition-all flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Refresh"
            title="Refresh"
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-white/10 active:scale-90 text-white/70 hover:text-white transition-all flex items-center justify-center"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Breadcrumb Bar */}
        <div
          className="flex items-center gap-1.5 text-xs text-white/85 bg-black/25 hover:bg-black/35 px-2.5 py-1.5 rounded-md border border-white/15 flex-1 min-w-0 transition-colors"
          title={`This PC > Portfolio > ${resolvedFolderName}`}
          aria-label={`Address: This PC > Portfolio > ${resolvedFolderName}`}
        >
          <img
            src={icon}
            alt=""
            className="w-3.5 h-3.5 object-contain shrink-0 opacity-90 mr-0.5"
          />
          <span className="hover:text-white cursor-pointer shrink-0">This PC</span>
          <span className="text-white/40 select-none">&gt;</span>
          <span className="hover:text-white cursor-pointer shrink-0">Portfolio</span>
          <span className="text-white/40 select-none">&gt;</span>
          <span className="font-medium text-white truncate">{resolvedFolderName}</span>
        </div>

        {/* Search Input Box */}
        <div className="relative flex items-center bg-black/25 hover:bg-black/35 focus-within:bg-black/45 border border-white/15 rounded-md px-2.5 py-1.5 w-36 sm:w-48 transition-all shrink-0">
          <Search className="w-3.5 h-3.5 text-white/50 shrink-0 mr-1.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${resolvedFolderName}...`}
            aria-label={`Search ${resolvedFolderName}`}
            className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/40 w-full"
          />
        </div>
      </div>

      {/* 3. Window Body Viewport */}
      <main className="relative flex-1 overflow-auto w-full h-full bg-[#0f172a]/50">
        {children}
      </main>

      {/* 4. Status Bar */}
      <footer className="h-6 px-3 border-t border-white/10 bg-black/25 text-[11px] text-white/60 flex items-center justify-between shrink-0 select-none">
        <span>{statusText || "1 item selected"}</span>
        <span className="hidden sm:inline">3 items total</span>
      </footer>
    </div>
  );
}
