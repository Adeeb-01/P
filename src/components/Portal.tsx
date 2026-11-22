"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noopSubscribe = () => () => {};

/**
 * Renders children into document.body so fixed overlays (dialogs, palettes) escape any ancestor
 * stacking context — e.g. the route transition wrapper — and always layer above the navbar.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return mounted ? createPortal(children, document.body) : null;
}
