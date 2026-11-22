/**
 * Opening preloader state.
 *
 * The overlay is part of the server HTML (so nothing flashes before it); this inline <head> script
 * marks <html data-preloaded> before first paint on repeat visits within the session and for
 * reduced motion, which hides the overlay instantly via CSS.
 */
export const PRELOADER_STORAGE_KEY = "mc-preloaded";

export const PRELOADER_INIT_SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("${PRELOADER_STORAGE_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.preloaded="1";}catch(e){d.dataset.preloaded="1";}})();`;

type Listener = () => void;
let done = false;
const listeners = new Set<Listener>();

export const preloaderStore = {
  isDone: () => done,
  markDone() {
    if (done) return;
    done = true;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
