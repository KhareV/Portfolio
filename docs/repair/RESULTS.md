# Repair pass — measured results (2026-11-26)

Baseline = audited `main` @ `ad7d86a` (identical to the local checkout apart from CRLF
line endings and the two missing dotfiles). Repaired = branch `repair/reliability`.
Both built with `npm ci && npm run build`, served with `next start`, measured with the
same harness, same machine, same settings.

## Method (identical for both builds)

| Setting | Value |
|---|---|
| Machine | Apple M5, 16 GB, macOS 27.2.1 |
| Browser | Playwright Chromium 1.65.1 (headless) with `--use-angle=metal` → **hardware WebGL** ("ANGLE Metal Renderer: Apple M5") |
| Node / npm | 26.5.0 / 11.17.0 (audit used Node 24.22.3) |
| Clock | page `Date` shifted to 14:30 IST (afternoon plate for both builds) |
| Desktop tier | 1440×900, DPR 1, 10 Mbit/s, 40 ms RTT, CPU 1× |
| Phone tier | 390×844, DPR 3, iPhone UA, touch, **1.6 Mbit/s, 150 ms RTT, CPU 4×** |
| Doubles | GitHub API, Draco CDN, studio HDR (tiny valid Radiance file), analytics: fulfilled locally via CDP `Fetch` (keeps HTTP cache on). Nothing left the machine. |
| Old-build override | `navigator.webdriver=false` + desktop UA so the **old** build takes its full visual branch (it suppressed visuals for automation). The repaired build has no automation detection; the same init script is applied to both. |
| Journey | load → 6 s settle → 3 s hero idle → wheel scroll 30 down / 10 fast up / 20 down (frame timing) → `#projects` (4 s) → Next ×3 (interaction timing) → `#contact` (4 s) → top (5 s idle) |
| Trials | 3 cold (new context each) + 1 warm revisit; medians and ranges below |
| Traces | `trace-{baseline,final}-{desktop,phone}.json` (Chrome timeline; kept outside the repo, see README) |

These are **lab** numbers on emulated devices. No field (CrUX/RUM) data was available for
kharevedant.is-a.dev, so the LCP ≤ 2.5 s / INP ≤ 200 ms / CLS ≤ 0.1 field-p75 targets are
not claimed; the lab results are diagnostics.

## Before / after (medians of 3 cold runs)

| Metric | Desktop before | Desktop after | Phone before | Phone after |
|---|---|---|---|---|
| LCP (lab) | 1,100 ms (1,100–1,104) | **172 ms** (172–200) | 3,832 ms (3,824–6,536) | **584 ms** (576–600) |
| LCP element | H2 "Articulate, Poised…" | H1 "I'm Vedant Khare." | typed H1 (empty in HTML) | hero summary paragraph |
| CLS (per run) | 0.043 ×3 | 0.0001 ×3 | 0.122 / 0.122 / 0.120 | 0.0004 ×3 |
| Long tasks / ≈TBT | 1 / 16 ms | 2 / 76 ms¹ | 0 / 0 | 0 / 0 |
| JS transferred before interaction | 817 KB | **168 KB** | 292 KB | **168 KB** |
| All bytes before interaction | 6.68 MB | **0.73 MB** | 3.79 MB | **0.61 MB** |
| All bytes, full journey | 12.15 MB | 8.68 MB² | 4.37 MB | **1.19 MB** |
| Warm revisit LCP / bytes | 808 ms / 256 KB | 140 ms / 1.2 KB | 3,900 ms / 2.68 MB | 376 ms / 1.2 KB |
| Scroll frames p50 / p95 | 16.7 / 16.8 ms | 16.7 / 16.7 ms | 16.7 / 16.8 ms | 16.7 / 16.8 ms |
| Frames > 33 ms / > 50 ms | 1 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Next-project click → next frame | 48.9 ms | 54.3 ms | 47 ms | 29.6 ms |
| rAF callbacks/s at hero idle | 197 | **0** | 77 | **0** |
| … at Projects | 455 | 54 | 93 | 0.3 |
| … at Contact | 516 | 106 | 73 | 0 |
| … back at top, idle | **431** | **0** | 76 | **0** |
| Page errors | 0 (desktop) / React #418 on every phone run | 0 | 1 per run | 0 |
| Music prompt covering the page | yes (blocked clicks) | removed | — | — |

¹ Shader compile when the 3D monitor mounts on approach to Projects (full tier only).
² Full tier only: 3D monitor + avatar (2.4 MB GLB + 2.4 MB FBX clips) + planet, all
loaded on approach. The phone/lite tier loads none of them.

## Reproductions re-run on the final production build

| Reproduction | Before | After |
|---|---|---|
| Abort **only** `studio_small_03_1k.hdr`, full desktop path | Next "Application error", 0 sections, 0 mailto, uncaught `Could not load studio_small_03_1k.hdr` | All sections, 6 mailto links, 0 page errors; the HDR is **never requested** (local Lightformer lighting) — `hdr-final-gpu.json` |
| Same, plus forced WebGL context loss | — | canvas removed, poster shown, 0 errors |
| Cold `/#contact`, 1440×900, after 8 s | scrollY 0, Contact top **7,501 px** | Contact top **86 px** (header is 88 px), heading focused, in HTML at ~50 ms |
| Cold `/#contact`, 390×844 | scrollY 0, Contact top **10,332 px** | top **88 px**, heading focused |
| Every other fragment (`#projects #experience #work #about #github #hero`) | all missed except `#hero` | all land under the header with focus (Chromium + WebKit) |

## Other verified behaviour

| Check | Result |
|---|---|
| Day phase at 04:59/05:00/11:59/12:00/16:59/17:00/20:59/21:00/00:00 IST, browser in America/Los_Angeles, 390 and 1440 px | correct phase each time; exactly **one** hero request (preload = CSS choice); 0 4xx; midnight shows "12:00 AM" |
| Hero bytes | afternoon 235 KB AVIF (was 381 KB at w=1920 + a failing 400 warm-up); night 81 KB; phone 720 px variants 44–122 KB |
| Sunflower (966 cells) | 0 rAF/s resting, 0 with pointer resting on it, ~60/s only while the pointer moves, 0 after leaving, 0 offscreen (baseline page: 180–220/s throughout) |
| Background tab (emulated `visibilitychange`; headless keeps pages "visible") | project scene 60 → 0 rAF/s while hidden, resumes on return (baseline: 220/s while hidden) |
| Reduced motion switched on while open | tier → static, all canvases removed, 0 rAF/s (baseline: 137 rAF/s continued) |
| Contact with EmailJS configured (captured send, separate build) | 3 rapid submits → 1 request; success clears; provider 500 keeps draft + offers prefilled mailto |
| Contact with EmailJS unconfigured (default build) | no network send; draft kept (also across reload); prefilled mailto offered |
| Chat route contract (unit, stubbed provider) | blank/oversize/non-JSON → 400; no key → offline answer; success → plain text; 150 ms timeout → offline + notice; 500/empty → offline |
| Layout | 0 px horizontal overflow at 390, 768, 844×390 landscape, 1440, 2560 and 200 % zoom |
| Accessibility tree | one H1, one `main`, named navs (Primary / All projects / Elsewhere), labelled sections, 0 images without alt, 0 unnamed buttons |
| Lint | 0 errors / 0 warnings (was 1 error / 4 warnings) |
| Tests | `npm test` 10/10; `npm run test:e2e` 88 passed / 18 skipped by design (full-tier fault tests on phone profiles) across Chromium + WebKit desktop & phone, Firefox smoke |

## Budgets for the visual phase (hold new work to these)

| Budget | Desktop | Phone |
|---|---|---|
| JS before interaction | ≤ 200 KB | ≤ 180 KB |
| Bytes before interaction | ≤ 900 KB | ≤ 700 KB |
| Lab LCP (this harness) | ≤ 400 ms | ≤ 1,000 ms |
| CLS | ≤ 0.01 | ≤ 0.01 |
| rAF at idle (any section, after settling) | 0 | 0 |
| Live loops | only the one visible scene | none unless user-initiated |
| Frames > 50 ms during the scroll sequence | 0 | 0 |
