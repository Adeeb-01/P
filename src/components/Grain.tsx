/**
 * Editorial micro-grain. The texture is made of dark specks only, so it is visible on the light
 * sections and effectively disappears over the dark sections (whose own noise texture stays crisp).
 */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[40] bg-[url('/assets/grain.svg')] bg-[length:220px_220px] opacity-[0.05] dark:bg-[url('/assets/grain-light.svg')] dark:opacity-[0.035] motion-reduce:opacity-[0.035]"
    />
  );
}
