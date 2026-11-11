/**
 * Bridge between the 3D projector (inside the canvas) and the DOM hotspot layer
 * (outside it). The layer registers its button wrappers; the projector moves
 * them every frame by writing `transform` directly — no React renders, no
 * secondary React roots.
 */
const els = new Map<string, HTMLElement>();

export function registerHotspot(id: string, el: HTMLElement | null) {
  if (el) els.set(id, el);
  else els.delete(id);
}

export function hotspotElement(id: string) {
  return els.get(id);
}
