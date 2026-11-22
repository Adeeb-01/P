"use client";

import { createContext, useContext, useRef, type RefObject } from "react";

const StageContext = createContext<RefObject<HTMLElement | null> | null>(null);

/** The closing section element, so the shader object can react to the pointer anywhere inside it. */
export function useClosingStage() {
  return useContext(StageContext);
}

export function ClosingStage({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <StageContext.Provider value={ref}>
      <section ref={ref} className={className}>
        {children}
      </section>
    </StageContext.Provider>
  );
}
