export function FramerBadge() {
  return (
    <a
      href="https://www.framer.com"
      target="_blank"
      rel="noopener"
      aria-label="Made in Framer"
      className="fixed right-5 bottom-5 z-[2147480000] inline-flex min-h-9 w-max items-center gap-[7px] rounded-[10px] bg-elevated px-3 py-2 text-[12px] leading-[1.2] font-semibold tracking-[-0.02em] text-fg no-underline shadow-badge hover:text-fg focus-visible:outline-violet"
    >
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path d="M5 2.5h10v5h-5Zm0 5h5l5 5H5Zm5 5v5l-5-5Z" fill="currentColor" />
      </svg>
      <span>Made in Framer</span>
    </a>
  );
}
