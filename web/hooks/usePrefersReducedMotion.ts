"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

type MediaQueryLike = MediaQueryList | null;
type MediaQueryChangeTarget = MediaQueryListEvent | MediaQueryList | null;

const isMatchMediaSupported = (): boolean =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

let cachedMediaQuery: MediaQueryList | null = null;

const getMediaQuery = (): MediaQueryLike => {
  if (!isMatchMediaSupported()) return null;
  if (!cachedMediaQuery) {
    cachedMediaQuery = window.matchMedia(QUERY);
  }
  return cachedMediaQuery;
};

const readMatches = (): boolean => {
  const mediaQuery = getMediaQuery();
  return mediaQuery ? mediaQuery.matches : false;
};

const addMediaQueryListener = (
  mediaQuery: MediaQueryList,
  callback: (matches: boolean) => void,
): (() => void) => {
  const notify = (target: MediaQueryChangeTarget) => {
    if (target && "matches" in target) {
      callback(Boolean(target.matches));
      return;
    }
    callback(mediaQuery.matches);
  };

  if (typeof mediaQuery.addEventListener === "function") {
    const listener: EventListener = (event) => notify(event as MediaQueryListEvent);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  if (typeof mediaQuery.addListener === "function") {
    const legacyListener = (event: MediaQueryListEvent) => notify(event);
    mediaQuery.addListener(legacyListener);
    return () => mediaQuery.removeListener(legacyListener);
  }

  const fallbackListener = (event: MediaQueryListEvent | null) => notify(event);
  mediaQuery.onchange = fallbackListener;
  return () => {
    if (mediaQuery.onchange === fallbackListener) {
      mediaQuery.onchange = null;
    }
  };
};

const observePreference = (onMatches: (matches: boolean) => void): (() => void) => {
  const mediaQuery = getMediaQuery();
  if (!mediaQuery) return () => {};

  onMatches(mediaQuery.matches);
  return addMediaQueryListener(mediaQuery, (matches) => onMatches(matches));
};

export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(readMatches);

  useEffect(() => observePreference(setPrefers), []);

  return prefers;
}

const subscribeToPreference = (onStoreChange: () => void): (() => void) => {
  const mediaQuery = getMediaQuery();
  if (!mediaQuery) return () => {};

  return addMediaQueryListener(mediaQuery, () => onStoreChange());
};

const getServerSnapshot = () => false;

export function usePrefersReducedMotionSync(): boolean {
  return useSyncExternalStore(subscribeToPreference, readMatches, getServerSnapshot);
}
