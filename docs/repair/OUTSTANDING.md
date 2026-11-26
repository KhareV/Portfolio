# Outstanding items

## Needs the owner (facts were kept verbatim, not changed)

1. ~~Project count~~ — **resolved by owner (2026-11-26): 40+**, now used in both places.
2. ~~Walmart Sparkplug~~ — **resolved by owner (2026-11-26): internship completed**; page, fun fact, chat answers and assistant prompt updated (`profile.walmartRole`). Exact months were not given, so it is not yet an entry in the dated experience list.
3. **Project 5** — card says "Imaginify – AI photo manipulation app… credits-based system and payment integration", but its repository (`Nodejs-OpenAI-Image-Generator`) and captured video show an OpenAI image generator form. Confirm title/description or link the right repo.
4. **Experience dates and claims** (CodeChef Aug 2024–Present, iSpace Nov 2024–Present, hackathon ranks, "500+ registrations", Dandiya 500+ attendees) and the prompt's project list (SkillBridge, CryptoChat, Voyageur not shown on the page).
5. **Live demos** — none of the five projects has a verified live URL; the UI therefore only offers "Source". Add `demo` URLs in `site.js` to show a "Live demo" link.
6. **Music provenance** — `public/y2mate.com - Lil Peep  XXXTENTACION  Falling Down (1).mp3` appears to be a commercial recording downloaded from YouTube. **Owner decision (2026-11-26): keep it, opt-in only** (no prompt, loads only on press). The licensing risk remains; revisit in the visual phase.
7. **Watermarks** — project videos/posters carry clideo.com / flixier watermarks. Recapture clean screens (see the redesign shot list).
8. **Model attribution** — `public/desktop_pc/license.txt` and `public/planet/license.txt` name authors; keep credits visible if the licences require it.

## Engineering

9. **Field data** — no CrUX/RUM data was available; add Vercel Speed Insights (or web-vitals → analytics) and re-check LCP/INP/CLS at p75 after deploy.
10. **Real devices** — tested with emulation (Chromium/WebKit/Firefox engines on macOS, Apple M5 GPU). Not tested: physical iPhone Safari, Android Chrome, a screen reader by ear (accessibility tree was inspected programmatically).
11. **Live integrations** — Groq, EmailJS and GitHub were exercised with local doubles and unit stubs only; no live provider call or real email was made. After deploy: set `GROQ_API_KEY` (server), EmailJS public IDs, optional `GITHUB_TOKEN` (server), and send one real test message.
12. **Image optimizer** — the stall in #21 was removed by serving large art statically; only the five small project posters (16–99 KB WebP sources) still use the on-demand optimizer. Watch first-request latency after deploy.
13. **Unused source assets** still in `public/` (not referenced: `newimages/download (2–5).jpeg`, `megacity.png`, `shrine.png`, `footer-2.png`, `nightfoot-alt.png`, `hero-*.avif/png` variants, `image/WhatsApp Image…jpg`, the original hero/footer PNG sources now replaced by `public/media/`). ~25 MB on disk, zero transfer. Kept so the redesign can reuse or regenerate them; delete when the art direction is settled.
14. **Avatar weight** — full tier downloads 2.4 MB GLB + 2.4 MB FBX on approach to Experience. Converting the four clips into one GLB (and Draco/meshopt) would cut ~3 MB.
15. **Firefox intermittent** (#22) — watch in CI.
16. **CI** — tests exist (`npm test`, `npm run test:e2e`) but no workflow runs them; GitHub Actions showed zero runs.
