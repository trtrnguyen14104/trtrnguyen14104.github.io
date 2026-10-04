"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

export const BOOT_SESSION_KEY = "ttn-portfolio:boot-seen";

/**
 * The flag never changes while the tab is alive, so there is nothing to
 * subscribe to. `useSyncExternalStore` is used purely for its hydration contract:
 * the client snapshot is read while React hydrates, i.e. before paint, so the
 * overlay is never mounted for a returning visitor and never absent for a new
 * one. Reading `sessionStorage` inside `useState` instead would either break
 * hydration (initialiser runs on the server) or flash the overlay (effect runs
 * after paint).
 */
function subscribeToBootFlag() {
  return () => {};
}

/** Server has no storage, so it always renders the boot screen. */
function getServerBootFlag() {
  return false;
}

function getClientBootFlag() {
  try {
    return sessionStorage.getItem(BOOT_SESSION_KEY) !== null;
  } catch {
    // Storage can throw in private mode or when cookies are blocked
    return false;
  }
}

function writeBootFlag() {
  try {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
  } catch {
    // Without storage the screen simply plays again on the next load
  }
}

export interface FirstLoadBoot {
  /** True once the boot screen has finished, been skipped, or already ran earlier in this session. Gates the desktop intro. */
  booted: boolean;
  /** True when this tab has already played the boot screen. Controls whether `<BootScreen>` mounts. */
  hasBootedThisSession: boolean;
  /** Marks the session as booted. Wire this to the boot screen's `onComplete`. */
  markBooted: () => void;
}

export function useFirstLoadBoot(): FirstLoadBoot {
  const hasBootedThisSession = useSyncExternalStore(
    subscribeToBootFlag,
    getClientBootFlag,
    getServerBootFlag,
  );

  const [bootedThisVisit, setBootedThisVisit] = useState(false);

  // Derived during render rather than synced in an effect: either the session was
  // already flagged before this visit, or the boot screen has since finished
  const booted = hasBootedThisSession || bootedThisVisit;

  const markBooted = useCallback(() => {
    writeBootFlag();
    setBootedThisVisit(true);
  }, []);

  return { booted, hasBootedThisSession, markBooted };
}