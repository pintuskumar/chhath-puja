/**
 * Content data model for छठ महापर्व.
 * Educational content lives here (src/content) and is fully separated from
 * presentation components. Every translatable field is a `L` (Hindi + English).
 */

export type Lang = "hi" | "en";

/** A localized string. Hindi is the default and source language. */
export interface L {
  hi: string;
  en: string;
}

/** A localized list of strings. */
export interface LList {
  hi: string[];
  en: string[];
}

/**
 * How a statement should be read. The site visibly distinguishes these so that
 * belief is never presented as fact and family practice is never presented as universal.
 */
export type NoteKind = "belief" | "symbolism" | "practice" | "variation" | "care";

export interface CulturalNote {
  kind: NoteKind;
  text: L;
  /** Optional region label, e.g. Mithila, Bhojpur, Magadh. */
  region?: L;
  sources?: SourceId[];
}

export type SourceId =
  | "wikipedia"
  | "britannica"
  | "sahapedia"
  | "pib"
  | "gac"
  | "et-nahaykhay"
  | "et-vrat-rules"
  | "hindutone-prasad"
  | "dates-2026"
  | "toi-kharna"
  | "ndtv-food";

export interface Source {
  id: SourceId;
  title: string;
  publisher: string;
  url: string;
  /** What this source was used to verify. */
  usedFor: L;
  /** Secondary/press sources are flagged so readers can weigh them. */
  type: "encyclopedia" | "government" | "cultural-archive" | "press" | "almanac-summary";
}

export type EnvironmentId = "courtyard" | "ghat";

/** Camera presets understood by the 3D environments. */
export type CameraPreset =
  | "courtyard-wide"
  | "courtyard-kitchen"
  | "courtyard-stove"
  | "courtyard-shrine"
  | "courtyard-night"
  | "ghat-hero"
  | "ghat-path"
  | "ghat-steps"
  | "ghat-water"
  | "ghat-closeup"
  | "ghat-wide";

/** Animation clips implemented procedurally in src/three/Devotee.tsx & environments. */
export type AnimationId =
  | "clean"
  | "bath"
  | "cook"
  | "meal"
  | "prepare-next"
  | "fast-rest"
  | "kharna-cook"
  | "evening-puja"
  | "prasad-receive"
  | "nirjala"
  | "arrange-soop"
  | "procession"
  | "ghat-arrange"
  | "stand-in-water"
  | "arghya"
  | "evening-close"
  | "dawn-gather"
  | "dawn-arrive"
  | "usha-arghya"
  | "blessing"
  | "paran";

/** Animation/visual staging — not translatable, used by presentation. */
export interface SceneStage {
  environment: EnvironmentId;
  /** Hour of day (24h decimal). Drives sun, sky, fog and lights. */
  timeOfDay: number;
  camera: CameraPreset;
  closeCamera?: CameraPreset;
  animation: AnimationId;
  /** Seconds for one loop of the scene's ritual animation. */
  duration: number;
}

export interface Scene {
  id: string;
  index: number;
  title: L;
  /** One-line caption shown during guided playback. */
  caption: L;
  stage: SceneStage;
  what: L;
  why: L;
  how: LList;
  when: L;
  /** RitualObject ids featured (hotspots + materials list). */
  objects: string[];
  regionalNotes: CulturalNote[];
  sources: SourceId[];
  /** Plain-text description of the visual, for screen readers and the 2D fallback. */
  visualDescription: L;
}

/**
 * A real photograph of a scene's moment (src/content/photos.ts). Shown in the stage's
 * close-up view and in the scene card; the 3D people stay for the wide shots.
 */
export interface ScenePhoto {
  /** Path under public/, e.g. "/photos/vratis-in-yamuna.webp" (WebP, ≤ 1280 px). */
  src: string;
  width: number;
  height: number;
  alt: L;
  caption: L;
  /** Family photos: author = who took it; license = "family" (shared with permission). */
  credit: { author: string; license: string; licenseUrl?: string; sourceUrl?: string };
  /** CSS object-position for the full-stage crop, e.g. "50% 40%". */
  focus?: string;
}

export interface TimeControl {
  kind: "slider" | "scroll";
  min: number;
  max: number;
  label: L;
}

export interface Day {
  id: 1 | 2 | 3 | 4;
  slug: "nahay-khay" | "kharna" | "sandhya-arghya" | "usha-arghya";
  title: L;
  subtitle: L;
  theme: L;
  tithi: L;
  /** ISO date for the current/next observance (verified against several almanac summaries). */
  date2026: string;
  description: L;
  accent: string;
  environment: EnvironmentId;
  scenes: Scene[];
  ritualObjects: string[];
  culturalNotes: CulturalNote[];
  timeControl?: TimeControl;
}

export type ObjectCategory = "vessel" | "offering" | "food" | "light" | "plant";

export type PropModel =
  | "soop"
  | "daura"
  | "thekua"
  | "coconut"
  | "sugarcane"
  | "diya"
  | "kalash"
  | "fruits"
  | "chulha"
  | "handi"
  | "lota"
  | "prasad"
  | "lauki"
  | "rice"
  | "dal"
  | "kheer"
  | "roti"
  | "banana"
  | "gur";

export interface RitualObject {
  id: string;
  hindiName: string;
  englishName: string;
  /** Only names attested in sources or widely used; otherwise omitted. */
  regionalNames?: { name: string; note: L }[];
  category: ObjectCategory;
  description: L;
  whenUsed: L;
  usage: L;
  significance: L;
  /** Kind of the significance statement (belief vs symbolism vs practice). */
  significanceKind: NoteKind;
  /** Procedural model id; a GLB path may be added later (see docs/ASSET_MANIFEST.md). */
  model: PropModel;
  modelPath?: string;
  /** Optional photo/raster (WebP/AVIF). The built-in 2D view is the SVG <ObjectIllustration/>. */
  imagePath?: string;
  days: Day["slug"][];
  sources: SourceId[];
}
