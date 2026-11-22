export type Theme = "light" | "dark";

const STORAGE_KEY = "mc-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs inline in <head> before first paint: stored choice → otherwise the OS preference.
 * Prevents a flash of the wrong theme.
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;try{var s=localStorage.getItem("${STORAGE_KEY}");d.dataset.theme=(s==="light"||s==="dark")?s:(matchMedia("${DARK_QUERY}").matches?"dark":"light");}catch(e){d.dataset.theme="light";}})();`;

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Store subscription: reacts to attribute changes and, while no explicit choice exists, to the OS setting. */
export function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia(DARK_QUERY);
  const onSystem = () => {
    if (!readStored()) document.documentElement.dataset.theme = media.matches ? "dark" : "light";
  };
  media.addEventListener("change", onSystem);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onSystem);
  };
}

/**
 * Switch theme. Uses the View Transitions API to reveal the new theme with a circular clip-path
 * expanding from `origin`; falls back to an instant swap (unsupported browsers / reduced motion).
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  const apply = () => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable: the switch still applies for this session */
    }
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduced) {
    apply();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(apply);
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {
      /* transition skipped (e.g. another one started) — theme is already applied */
    });
}
