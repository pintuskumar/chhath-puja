"use client";

import { useEffect } from "react";
import { usePrefs } from "@/lib/store";
import { useReducedMotion } from "@/lib/device";

/** Rehydrates saved preferences after first paint and keeps <html> attributes in sync. */
export function ClientBoot() {
  const lang = usePrefs((s) => s.lang);
  const reduced = useReducedMotion();
  useEffect(() => {
    void usePrefs.persist.rehydrate();
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  return null;
}
