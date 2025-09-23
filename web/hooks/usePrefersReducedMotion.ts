"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

type MediaQueryChangeHandler = (event: MediaQueryListEvent) => void;
type LegacyMediaQueryListener = (this: MediaQueryList, event: MediaQueryListEvent) => void;

const isMatchMediaSupported = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

const getPreference = () => {
  if (!isMatchMediaSupported()) return false;
  return window.matchMedia(QUERY).matches;
};

const addMediaQueryListener = (
  mediaQuery: MediaQueryList,
  handler: MediaQueryChangeHandler,
) => {
  if (typeof mediaQuery.addEventListener === "function") {
    const listener = handler as unknown as EventListener;
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  const legacyListener: LegacyMediaQueryListener = function legacyListener(event) {
    handler(event);
  };

  mediaQuery.addListener(legacyListener);
  return () => mediaQuery.removeListener(legacyListener);
};

export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(getPreference);

  useEffect(() => {
    if (!isMatchMediaSupported()) return;
    const mediaQuery = window.matchMedia(QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefers(event.matches);
    };

    setPrefers(mediaQuery.matches);

    return addMediaQueryListener(mediaQuery, handleChange);
  }, []);

  return prefers;
}

let currentClientSnapshot = false;

const getServerSnapshot = () => false;

const getClientSnapshot = () => {
  currentClientSnapshot = getPreference();
  return currentClientSnapshot;
};

const subscribeToPreference = (onStoreChange: () => void) => {
  if (!isMatchMediaSupported()) return () => {};
  const mediaQuery = window.matchMedia(QUERY);
  currentClientSnapshot = mediaQuery.matches;

  const handleChange = (event: MediaQueryListEvent) => {
    currentClientSnapshot = event.matches;
    onStoreChange();
  };

  return addMediaQueryListener(mediaQuery, handleChange);
};

export function usePrefersReducedMotionSync(): boolean {
  return useSyncExternalStore(
    subscribeToPreference,
    getClientSnapshot,
    getServerSnapshot,
  );
}
