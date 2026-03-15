"use client";

import { useSyncExternalStore } from "react";

type ClientOnlyProps = {
  children: React.ReactNode;
};

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ClientOnly({ children }: ClientOnlyProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) return null;
  return <>{children}</>;
}

