# Reliability repair: server-rendered sections, isolated 3D, measured performance

## Why
- An optional remote lighting file (`studio_small_03_1k.hdr`) failing to load crashed the whole site into Next's "Application error" screen.
- Links like `/#contact` never reached their section (sections were mounted by client timers).
- Hydration error #418 on every phone visit; hero warm-ups returned HTTP 400; ~430 animation callbacks per second kept running at an idle page.

## What changed
- Every section is server-rendered in order; navigation, project source links and email work without JavaScript or WebGL.
- Each 3D scene is optional, preflighted, isolated by an error boundary, mounted near the viewport, and paused offscreen / in background tabs. Local lighting (no HDR) and a self-hosted Draco decoder.
- One capability policy (no user-agent or automation sniffing); `?visuals=static|lite|full` to inspect.
- Real posters for all five projects, "Source on GitHub" labels, Work → `#projects`, Experience → `#experience`, old `#work` still works.
- Chat: bounded server call, plain-text contract, useful offline answers. GitHub stats via a server route (token stays server-side), honest charts. Contact: duplicate-submit guard, draft kept, prefilled email fallback.
- Owner-confirmed copy: 40+ projects; Walmart Sparkplug internship (Summer 2026) shown as completed. Music kept, opt-in only.
- Removed: blocking loader, custom cursor, Lenis, auto music prompt, `mobile.css`, `react-globe.gl` (leaked animation loops), 19 unused packages.
- Added: unit + Playwright regression tests, GitHub Actions CI, Vercel Speed Insights.

## Results (lab, same machine and settings; details in `docs/repair/RESULTS.md`)
| | Desktop before → after | Phone (1.6 Mbit/s, 4× CPU) before → after |
|---|---|---|
| LCP | 1,100 → 180 ms | 3,832 → 588 ms |
| CLS | 0.043 → 0.0001 | 0.12 → 0.0004 |
| Bytes before interaction | 6.68 → 0.73 MB | 3.79 → 0.61 MB |
| rAF callbacks/s idle at top | 431 → 0 | 76 → 0 |

## Check before merging
- Open the Vercel preview: `/`, `/#contact`, `/#projects`, a phone, and `/?visuals=static`.
- Set in Vercel (all optional): `GROQ_API_KEY`, `NEXT_PUBLIC_EMAILJS_*`, `GITHUB_TOKEN`; enable Speed Insights.
- CI must be green (`npm run lint`, `npm test`, `npm run build`, `npx playwright test`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
