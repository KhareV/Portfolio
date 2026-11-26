# Visual direction — proposal (not implemented)

Say **"Implement the visual phase"** to build it. Default: Direction A below, built
hero → first project end to end first, held to the budgets in `docs/repair/RESULTS.md`.

## What I actually looked at

| Source | Observed how | Notes |
|---|---|---|
| This site, repaired build | Rendered on hardware WebGL (Apple M5) at 390/768/1440/2560 px, all four IST phases, 200 % zoom | Screens in the session evidence (`shots/`, `layouts/`) |
| Bruno Simon's portfolio | Visited once in a GPU browser (bruno-simon.com, current version) | Drivable car in a toon-lit diorama; a persistent menu + map button lets you leave the game at any time |
| "The Last Boring Slide" (your artifact), Forged in Silence, iMac G3 in Motion, Jaguar | **Not observed** — the brief carried these as link text without URLs | Treated only as described in the brief; techniques below are attributed to the brief, not to my viewing |

Nothing from any reference (code, imagery, branding, copy) is reused.

## Influences → original translations

| Influence (source of knowledge) | Single technique | Purpose | Translation for Vedant | Phone / reduced motion | Cost |
|---|---|---|---|---|---|
| Last Boring Slide (brief) | A familiar object changes meaning | Surprise with zero instructions | The sleeping monitor on the desk *becomes* the first case-study image | Same frame, crossfade only | 1 R3F scene already exists |
| Forged in Silence (brief) | One subject, art budget on silhouette + reflection | Craft reads in a still | Spend polish on the monitor bezel, glass reflection and screen legibility, not on extra props | Pre-rendered poster of the lit desk | 1 baked HDR-free lighting rig (Lightformers, already local) |
| iMac G3 in Motion (brief) | Enclosure separates to explain parts | Explain structure | In a case study, peel one architecture layer off the screenshot (e.g. "Next.js → API → MongoDB") on a button press | Inline `<details>` diagram | SVG overlay, no WebGL |
| Jaguar (brief) | Detail baked; only a small element follows the pointer | Life without idle cost | Desk lamp highlight + sunflower respond to a fine pointer and settle to 0 frames | Static | Sunflower already at 0 rAF/s idle |
| Bruno Simon (observed) | Play is optional; a menu is always one click away | Delight without trapping the visitor | Optional "explore the desk" mode; HTML work index stays primary and is always visible | No explore mode | Reuse orbit controls |

## Existing visuals: keep or cut

| Asset | Verdict | Why |
|---|---|---|
| IST clock + day phases | **Keep, make it the lighting** | Personal, already reliable (`html[data-phase]`) |
| 3D monitor (`computer.glb`) | **Keep, hero object** | Shows real work; now isolated + preflighted |
| Sunflower | **Keep** on the desk | Playful, 0 idle cost |
| Phase plates (sunflowers, Petra, Las Vegas, Niagara) | **Replace** (keep morning sunflowers as reference) | Beautiful but they tell a world-landmarks story unrelated to Chennai or the work; Vegas signage is someone else's branding |
| About globe + Earth/stars block | **Cut both** | Two globes, no information beyond "Chennai, IST", 70 vh of dark interlude before Contact |
| Prism shader (Contact) | **Cut** | Separate visual language; full-viewport raymarch |
| Ready Player Me avatar + FBX | **Cut** (4.8 MB) | Generic avatar; competes with the work for attention |
| Cherry / coast / rooftop illustrations | Cut from About | Decorative; replace with one candid portrait |
| Time bands | Keep as a thin rule echoing the window light | Cheap, on-palette |

## Two directions

### A — "Chennai after hours" (recommended)
One illustrated studio corner in Chennai — window, desk, monitor, sunflower in a jar,
desk lamp — lit by the real IST phase. The monitor is the doorway into the work.

### B — "The build notebook"
Editorial spreads: candid portrait, name, a marked-up screenshot; margin notes peel a
layer to show the implementation diagram; paper texture + one ink accent throughout.

**Choice.** A wins today because the evidence that exists is *screens* (five real
captures) and the identity pieces (IST clock, monitor, sunflower) are already built and
reliable. B is stronger once each project has a diagram and a written decision, which
do not exist yet. A borrows B's best idea for case studies (the annotation layer).
Before building, prototype both at 1440×900: A's monitor handoff vs one B spread for
MedWe, and ask three people to explain the project after 15 seconds. Pick by that test.

## Storyboard — Direction A

Each beat: visitor action · focal point · engineering idea · resting frame · fast skip · budget.

1. **Arrival.** *Action:* none. *Focus:* "Vedant Khare — full-stack developer", then "View selected work". *Idea:* the site knows Chennai time (IST lighting, real clock on the wall). *Resting frame:* window light by phase, monitor asleep with a faint standby glow, flower in the jar — composed to work as a portfolio cover and a share card. *Skip:* the CTA and nav are real links in HTML. *Budget:* one AVIF plate ≤ 180 KB (720/1200 w), 0 JS before interaction beyond current 168 KB, LCP = the H1.
   *Phone:* vertical crop of the same plate with a reserved text-safe top third; no WebGL. *Reduced motion:* identical still.
2. **Wake (first scroll or "View work").** *Action:* scroll 1 screen or press the CTA. *Focus:* monitor. *Idea:* demand-loaded 3D on capable devices only. *Resting frame:* monitor on, showing the selected project's real capture; lamp brightens slightly. *Skip:* deep links (`#projects`, `#medwe`) jump straight to beat 3. *Budget:* monitor scene ≤ 550 KB (model + decoder + one clip), one canvas, renders only while visible.
   *Phone/RM:* the monitor plate crossfades (200 ms) to the capture.
3. **Handoff.** *Action:* keep scrolling. *Focus:* the screen. *Idea:* camera dollies until the bezel leaves frame and the screen *becomes* the flat case-study image (same aspect, same pixels — the 3D video texture and the HTML poster are the same capture). Reverse scroll lands on beat 2; interrupting mid-way snaps to the nearer state. *Resting frame:* full-width capture with title, role and stack. *Skip:* index of all projects is always beside/below. *Budget:* scroll-linked transform only, no layout per frame; 0 frames > 33 ms.
4. **Selected work (2–3 deep, rest in index).** *Action:* read, press "Show the layers". *Focus:* one interaction from the project (e.g. MedWe order tracking) as a short silent loop. *Idea:* the annotation layer peels the capture to show the architecture (B's idea). *Resting frame:* readable capture + 3 lines: problem, my part, one technical decision. *Skip:* Source / Demo buttons, keyboard next/prev, index. *Budget:* each loop ≤ 400 KB, poster first, plays only when visible and not reduced motion.
5. **Quiet desk (About).** *Action:* optional pointer over the flower. *Focus:* candid portrait. *Idea:* restraint — nothing moves unless invited. *Resting frame:* lamp light, portrait, short bio. *Skip:* — . *Budget:* 0 rAF idle.
6. **Contact.** *Action:* email or form. *Focus:* the address in real type. *Idea:* lighting echoes the opening (same window, later light). *Resting frame:* email, LinkedIn, GitHub, short form. *Budget:* no shader; one still.

**Optional "explore the desk"** (desktop, fine pointer): a button switches orbit controls on; Esc or the always-visible "Back to work" returns. Never on by default.

## Typography
- Display: keep the current SiteDefault serif for the name (it is the site's voice) at 64–88 px desktop / 44 px phone, tight leading.
- Text: a humanist sans for body and UI (e.g. a self-hosted variable WOFF2 ≤ 60 KB) — the current serif is tiring in long paragraphs and chat.
- Script ("Hello,"): one use only, subset to the glyphs used (Anime.otf is 133 KB for 6 letters → subset WOFF2 ≈ 4 KB).
- Convert IM Fell (180 KB TTF) to subset WOFF2 or drop it.

## Colour and material studies (per phase, from one scene)
| Phase | Window | Interior | Accent | Screen |
|---|---|---|---|---|
| Morning | pale sky `#cfe6f5` | warm wood `#c89a6a` | sunflower `#f4c430` | cool `#e8f1ff` |
| Afternoon | white-hot `#fff4dc` | `#b8865a` | `#f59e0b` | neutral |
| Evening | tamarind orange `#e9803a` | `#7a4a35` | lamp `#ffd08a` | warm |
| Night | sodium-lamp street `#f6b26b` over indigo `#14183a` | `#3a2a2a` | lamp | screen is the key light |
Materials: matte painted wall, satin desk, one glossy element (monitor glass) — reflections only there.

## Sound
Off by default, no prompt. One button in the nav. Replace the current track (provenance problem) with a licensed or original 60–90 s loop of room tone + ceiling fan + distant Chennai traffic, ≤ 600 KB AAC, loaded only on press. Never tied to scroll.

## Art and asset list
1. Studio corner plate — desktop 16:9 and phone 9:19.5 from the **same camera/scene**, 4 phase variants rendered from one source so architecture never jumps; text-safe zone fixed (left 45 % desktop, top 35 % phone). AVIF 720/1200/1600 w + WebP.
2. Monitor: keep `computer.glb`; add a slightly emissive standby frame.
3. Clean project captures (no watermarks): 2560×1440 PNG of each project's key screen + one 6–10 s silent loop per featured project (H.264 + AV1, poster first).
4. One architecture diagram per featured project (SVG, editable).
5. Candid portrait (natural light, desk), 3:4 and 1:1 crops.
6. Share card regenerated from plate 1 (night or evening).

## Shot list for generated stills / video
| # | Shot | Camera | Light | Must contain | Must not |
|---|---|---|---|---|---|
| S1 | Studio corner, wide | 35 mm eq., eye height, slight 3/4 | per phase | window with Chennai roofline/coconut palms, desk, monitor (screen blank), flower jar, lamp, wall clock | logos, readable fake text, people |
| S2 | Same, phone crop | same position, 26 mm eq., portrait | per phase | same objects; empty top third | anything in text zone |
| S3 | Monitor close-up | 50 mm, screen square to camera | evening | bezel, glass reflection of lamp | reflections over screen centre |
| V1 | Fan + curtain loop | locked-off, from S1 | evening | 6 s seamless loop, < 1 % frame change elsewhere | camera motion |
Generate S1 once per phase from a fixed seed/scene description; composite the real screen captures in code, never in the generated image.

## Implementation order and gates
1. Static first: new plates + layout + type, no WebGL — must meet budgets on phone.
2. Beat 2–3 handoff on desktop full tier; review on mobile, reduced motion, failure paths (same `resilience.spec` faults).
3. Featured case studies + annotation layer.
4. About/Contact; remove cut assets; regenerate share card.
5. After each step: `npm run lint && npm test && npm run test:e2e` and the RESULTS harness against these budgets. If an effect makes a task slower or text harder to read, change it and retest.
