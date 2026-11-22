import clsx from "clsx";

/**
 * Light sweep for buttons. Place inside an element with `group/btn relative overflow-hidden isolate`.
 * The band travels across on hover via `transform` only.
 */
export function Shine({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden rounded-[inherit]">
      <span
        className={clsx(
          "absolute inset-y-0 -left-1/2 w-1/2 [transform:translateX(-120%)_skewX(-12deg)] transition-none motion-reduce:hidden",
          "hover-fine:group-hover/btn:[transform:translateX(420%)_skewX(-12deg)] hover-fine:group-hover/btn:transition-transform hover-fine:group-hover/btn:duration-[900ms] hover-fine:group-hover/btn:ease-luzia",
          tone === "light"
            ? "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)]"
            : "bg-[linear-gradient(90deg,transparent,rgba(116,48,247,0.18),transparent)]",
        )}
      />
    </span>
  );
}
