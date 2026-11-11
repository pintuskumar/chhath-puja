"use client";

/**
 * ScrollStoryController — GSAP ScrollTrigger drives the guided story:
 *  - which scene is active (section crossing the middle of the viewport)
 *  - overall day progress (Day 4 sunrise follows scroll)
 *  - text reveal and the Day 3 2D→3D procession strip (scrubbed)
 * Triggers only read scroll; they never block pointer events, so controls stay clickable.
 */
import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useExperience } from "@/lib/store";

export function ScrollStoryController({ container, reduced }: { container: RefObject<HTMLElement | null>; reduced: boolean }) {
  const setActive = useExperience((s) => s.setActiveScene);
  const setDayScroll = useExperience((s) => s.setDayScroll);

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-scene-index]"));
      sections.forEach((el) => {
        const i = Number(el.dataset.sceneIndex);
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => self.isActive && setActive(i),
        });
        const card = el.querySelector("[data-reveal]");
        if (card && !reduced) {
          gsap.fromTo(
            card,
            { y: 48, autoAlpha: 0.001 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
            },
          );
        }
      });

      let last = -1;
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = Math.round(self.progress * 200) / 200;
          if (p !== last) {
            last = p;
            setDayScroll(p);
          }
        },
      });

      root.querySelectorAll<HTMLElement>("[data-strip]").forEach((strip) => {
        const section = strip.closest("[data-scene-index]");
        if (!section) return;
        if (reduced) return;
        gsap.fromTo(
          strip.querySelector("[data-strip-track]"),
          { xPercent: 30 },
          { xPercent: -45, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
        // 2D → 3D: the illustrated band dissolves as the 3D procession takes over
        gsap.fromTo(
          strip,
          { autoAlpha: 1 },
          { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: section, start: "center 45%", end: "bottom 40%", scrub: true } },
        );
      });
    }, root);
    // Images/fonts can shift layout after mount.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [container, reduced, setActive, setDayScroll]);

  return null;
}
