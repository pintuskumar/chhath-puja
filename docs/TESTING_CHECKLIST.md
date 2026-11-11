# Testing checklist

Automated in CI (`.github/workflows/ci.yml`): content integrity · TypeScript · production build · Lighthouse mobile on 5 pages (accessibility ≥ 90 and SEO ≥ 90 are hard assertions).

Manual checks below. Test at least: **Android Chrome (mid-range)**, **iOS Safari**, **desktop Chrome/Firefox**, plus one **keyboard-only** and one **screen-reader** pass (TalkBack or NVDA/VoiceOver).

## Core flow (vertical slice)
- [ ] `/` loads with the 2D ghat immediately; on a GPU device the 3D ghat replaces it and the sun rises over ~10 s.
- [ ] “यात्रा शुरू करें” plays the sunrise wipe and opens `/journey`; “चार दिनों को जानें” scrolls to the four-day cards.
- [ ] `/day/nahay-khay`: scrolling moves through 5 scenes; the stage changes camera, time of day and choreography for each.
- [ ] Clicking a hotspot (e.g. चूल्हा) opens the explanation panel; the scene pauses; Esc closes and focus returns to the hotspot.
- [ ] “पूरा विवरण” reveals क्यों / कैसे / कब / सामग्री / भिन्नताएँ / स्रोत for every scene.
- [ ] Next-day link at the end of each day; Day 4 ends with the blessing text and the full journey summary.

## Day-specific interactions
- [ ] Day 1, scene 3: cooking-stage slider and buttons step through washing → bhaat → dal & gourd → serving (steam, pots and plates change in 3D).
- [ ] Day 2: afternoon → evening slider changes light and lamps; “दृश्य के अनुसार” resets it. Scene 5 shows the ~36 h timeline.
- [ ] Day 3: sun-position slider; scene 2 shows the 2D procession strip that slides with scroll and dissolves into the 3D procession; scene 4 shows water ripples around vratis; scene 5 shows soop raised and the lota stream; overview ↔ close-up toggle; pause/replay.
- [ ] Day 3: daura panel shows a rotatable 3D basket (drag / touch).
- [ ] Day 4: the sun rises as you scroll; readout shows the time.
- [ ] Free mode: tabs switch scenes (arrow keys work); orbit camera with mouse and touch; camera flies to each scene first.

## Explorer & content
- [ ] `/explore`: filters by day; selecting an object shows a rotatable model and all five sections; works on mobile (scrolls to details).
- [ ] `/traditions`: every note has a kind badge; sources link out; glossary renders.
- [ ] Language switch: all UI, scenes, objects, notes and dates switch; `<html lang>` updates; choice survives reload.
- [ ] Progress: visited scenes light up in the header bar and on `/journey`; “प्रगति मिटाएँ” clears them.

## Performance & fallbacks
- [ ] Settings → 2D: every page works with illustrations and hotspots; the label “2D चित्रण …” is shown.
- [ ] Chrome flag `--disable-webgl` (or a blocked GPU): automatic 2D fallback, no console errors that break the page.
- [ ] Software renderer (e.g. VM without GPU): auto mode picks 2D; forcing 3D still works.
- [ ] On a low-end Android phone: if the 3D scene stutters, it first lowers resolution, then switches to 2D.
- [ ] Off-screen canvas stops rendering (DevTools → Performance: no frames after scrolling past the home hero).
- [ ] Tab hidden → rendering stops; audio stays as chosen.
- [ ] No horizontal scroll at 320 px width; touch targets ≥ 44 px; cards are scrollable within themselves on small screens.

## Accessibility
- [ ] Skip link appears on first Tab.
- [ ] All controls reachable by keyboard with a visible gold focus ring; no keyboard trap except inside open dialogs.
- [ ] Dialogs: focus moves in, Tab cycles inside, Esc closes, focus is restored.
- [ ] Reduced motion (OS or Settings): no camera flights, no auto-advancing ritual, no CSS animation; content complete.
- [ ] Screen reader announces scene changes (“दृश्य 2: पवित्र स्नान”) and the active sound layers.
- [ ] Every scene's meaning is available as text (visual description included); no information is only in animation.
- [ ] Contrast ≥ 4.5:1 for body text (Lighthouse colour-contrast passes).

## Audio
- [ ] No sound before clicking the speaker; reload → sound is off again.
- [ ] Layers change with scenes (river at ghat, birds at dawn, crickets at dusk, crackle at the stove, bells at puja); caption chip shows them.
- [ ] Volume slider in Settings works; mute works.

## Cultural review (before public launch)
- [ ] Practitioners from Bhojpur, Magadh and Mithila regions review text, attire, food, kitchen and ghat behaviour.
- [ ] Hindi proofread by a native speaker.
- [ ] Gestures in `POSES` approved; nothing reads as invented ritual.
