# Responsive verification

Run against a production preview, after `npm run build` and `npm run start`.
The scripts use Playwright and an installed Chrome executable without adding runtime dependencies to the app.

PowerShell setup (adjust the module location for your machine):

```powershell
$env:PLAYWRIGHT_MODULE = 'C:/path/to/node_modules/playwright'
$env:CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:AUDIT_URL = 'http://127.0.0.1:3000'
$env:AUDIT_OUTPUT = Join-Path $env:TEMP 'adeeb-responsive-verification'
$env:AUDIT_GPU = 'hardware'
node scripts/verify-responsive.mjs
```

Omit `AUDIT_GPU` to use SwiftShader. Hardware mode requests Windows Direct3D 11.

The responsive suite covers all seven routes at 375×812, 390×844, 768×1024 and 1024×1366 in both themes. It checks document/text bounds, floating-control collisions, images, browser errors, shader compilation and resolution, native touch swipes, navigation, theme transitions, audio activation, search, dialogs, touch targets, form access, shader controls, statistics, rim lighting, ripple decay, offscreen suspension and reduced-motion fallbacks. It saves viewport screenshots and a JSON report. No contact form is submitted.

For hardware-renderer identification, longer frame samples, simulated WebGL context recovery, settled footer captures and desktop regression checks:

```powershell
$env:AUDIT_OUTPUT = Join-Path $env:TEMP 'adeeb-render-health'
node scripts/verify-render-health.mjs
```

Frame measurements describe the tested host GPU and emulated viewports. They are not a guarantee of 60fps on every physical mobile device. Real iOS/Android checks are still needed for device thermals, browser chrome and virtual-keyboard behavior.
