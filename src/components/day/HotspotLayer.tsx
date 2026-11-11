"use client";

/**
 * DOM layer of 3D-scene hotspots. Buttons live in the main React tree (single
 * root, natural tab order); the canvas projector moves them each frame.
 */
import { registerHotspot } from "@/lib/hotspotRegistry";
import { RitualHotspot } from "../RitualHotspot";

export function HotspotLayer({ ids }: { ids: string[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {ids.map((id) => (
        <div
          key={id}
          ref={(el) => registerHotspot(id, el)}
          className="pointer-events-auto absolute left-0 top-0 will-change-transform"
          style={{ visibility: "hidden" }}
        >
          <RitualHotspot objectId={id} />
        </div>
      ))}
    </div>
  );
}
