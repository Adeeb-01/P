/** Tiny external store so any trigger (Works header, case study, dock, ⌘K) controls one global palette. */

type Listener = () => void;

let open = false;
const listeners = new Set<Listener>();

export const quickJump = {
  isOpen: () => open,
  set(value: boolean) {
    if (open === value) return;
    open = value;
    listeners.forEach((listener) => listener());
  },
  toggle() {
    quickJump.set(!open);
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
