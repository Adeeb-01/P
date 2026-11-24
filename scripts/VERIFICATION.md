# Mobile and tablet verification — 2026-11-24

Verified against the production build using Chrome **157.0.8103.79**, with touch emulation and the **Intel UHD Graphics 630 / ANGLE Direct3D 11** renderer.

| Check | Result |
| --- | --- |
| `npm run build` | Passed |
| `npx tsc --noEmit` | Passed |
| `npm run lint -- --max-warnings=0` | Passed, zero warnings |
| Seven routes × four viewports × two themes | 56 cases passed |
| Scrolled layout checkpoints | 534 passed |
| Touch interaction sequences | 8 passed |
| Reduced-motion viewport cases | 4 passed |
| Simulated WebGL context recovery | Both shaders restored and rendered |
| Desktop regression, 1440×900 | Light and Dark passed |

Viewports: **375×812, 390×844, 768×1024, 1024×1366**. Routes: `/`, `/works`, all four case studies, and `/contact`.

No horizontal overflow, out-of-bounds text, floating-control collisions, broken images, browser errors, or shader compilation/render errors were found in the final matrix. The touch checks include deck swipes and navigation protection, gallery controls, theme morphing, audio unlock, search, dialogs, form access, back-to-top, statistics, rim lighting, ripple decay, shader controls and offscreen suspension.

Both shaders measured **60fps in all eight viewport/theme combinations**. In the responsive suite, frame-time p95 was **16.8–17.0ms**, with no sampled frames over 33ms. The separate longer hardware samples also measured 60fps. These are host-GPU measurements with mobile viewport emulation, not a universal performance guarantee for physical phones or tablets.

Raw reports and viewport captures:

- [Responsive matrix](C:/Users/Lenovo/AppData/Local/Temp/adeeb-responsive-verified/report.json)
- [Hardware, recovery and desktop checks](C:/Users/Lenovo/AppData/Local/Temp/adeeb-render-health/report.json)

See [README.md](README.md) for repeatable test commands. No contact submission or external deployment was performed.
