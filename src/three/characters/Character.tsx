"use client";

/**
 * Chooses the realistic rigged character when the manifest provides one for this
 * role, otherwise the stylised procedural Devotee. Any GLB load error falls back
 * to the procedural figure, so the scene never breaks.
 */
import { Component, Suspense, type ReactNode } from "react";
import { Devotee } from "../Devotee";
import { RiggedDevotee } from "./RiggedDevotee";
import { useModelManifest } from "./manifest";
import type { ActorState } from "../choreography";

class RigBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.warn("[Character] rigged model failed, using procedural figure:", e);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Character({
  get,
  reduced,
  quality,
}: {
  get: () => ActorState | undefined;
  reduced?: boolean;
  quality: "low" | "medium" | "high";
}) {
  const manifest = useModelManifest();
  const look = get()?.look;
  const spec = look ? manifest?.characters[look] : undefined;
  const procedural = <Devotee get={get} reduced={reduced} />;
  if (!manifest?.clips || !spec) return procedural;
  return (
    <RigBoundary fallback={procedural}>
      <Suspense fallback={procedural}>
        <RiggedDevotee get={get} spec={spec} manifest={manifest} reduced={reduced} quality={quality} />
      </Suspense>
    </RigBoundary>
  );
}
