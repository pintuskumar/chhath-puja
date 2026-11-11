/**
 * Real photographs for scene close-ups (keyed by Scene.id).
 *
 * The 3D devotees carry the wide shots; where a real face matters (the close-up
 * button on the stage), a photograph of that moment is shown instead.
 *
 * Current photos: Wikimedia Commons, licences that allow reuse with attribution
 * (fetched by .github/workflows/photos.yml). Credit is shown under every photo.
 *
 * ── Adding your own family photos ────────────────────────────────────────────
 *  1. Put a landscape WebP/JPEG (about 1280 px wide) in public/photos/family/.
 *  2. Add an entry below, e.g.
 *       "sandhya-arghya": [
 *         { src: "/photos/family/maa-arghya-2025.webp", width: 1280, height: 853,
 *           alt: { hi: "…", en: "…" }, caption: { hi: "…", en: "…" },
 *           credit: { author: "Kumar family", license: "family" } },
 *         ...existing photos
 *       ]
 *  The first photo of a scene is the one shown in the close-up view.
 *  Only add photos of people who are happy to appear on a public website.
 */
import type { ScenePhoto } from "./types";

const BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0/";
const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const scenePhotos: Record<string, ScenePhoto[]> = {
  // Day 3 · home: thekua for the soop
  "soop-ki-taiyari": [
    {
      src: "/photos/thekua-kolkata.webp",
      width: 1280,
      height: 851,
      alt: { hi: "पत्ते पर रखे ठेकुआ, ऊपर सिंदूर", en: "Thekua on a leaf, marked with sindoor" },
      caption: { hi: "सूप के लिए ठेकुआ — गेहूँ के आटे, गुड़ और घी से बना प्रसाद।", en: "Thekua for the soop — prasad of wheat flour, jaggery and ghee." },
      credit: {
        author: "Biswarup Ganguly",
        license: "CC BY 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
        sourceUrl: commons("Thekua_-_Chhath_Festival_-_Kolkata_2013-11-09_4316.JPG"),
      },
    },
  ],
  // Day 3 · ghat: arranging the soop and daura on the steps
  "ghat-par-taiyari": [
    {
      src: "/photos/soop-on-ghat-steps.webp",
      width: 1280,
      height: 853,
      alt: {
        hi: "घाट की सीढ़ियों पर फल-ठेकुआ से भरे सूप और दौरे सजाती व्रती महिलाएँ",
        en: "Women arranging soops and dauras of fruit and thekua on the ghat steps",
      },
      caption: { hi: "घाट की सीढ़ियों पर सूप-दौरा सजाना।", en: "Arranging the soop and daura on the ghat steps." },
      credit: { author: "Goutam1962", license: "CC BY-SA 4.0", licenseUrl: BY_SA_4, sourceUrl: commons("Sacred_Offerings_to_the_Setting_Sun.jpg") },
      focus: "40% 55%",
    },
  ],
  // Day 3 · vratis standing in the river
  "jal-me-vrati": [
    {
      src: "/photos/vratis-in-yamuna.webp",
      width: 1280,
      height: 849,
      alt: {
        hi: "नदी में खड़ी साड़ी पहने व्रती महिलाएँ, हाथ में प्रसाद, पानी में परछाईं",
        en: "Vratis in sarees standing in the river with offerings, reflected in the water",
      },
      caption: { hi: "डूबते सूर्य की प्रतीक्षा में जल में खड़ी व्रती — यमुना नदी।", en: "Vratis standing in the river, waiting for the setting sun — Yamuna river." },
      credit: { author: "Manishjaisi", license: "CC BY-SA 4.0", licenseUrl: BY_SA_4, sourceUrl: commons("Celebrating_Chhath_Puja.jpg") },
      focus: "50% 45%",
    },
  ],
  // Day 3 · sandhya arghya
  "sandhya-arghya": [
    {
      src: "/photos/arghya-soop-yamuna.webp",
      width: 1280,
      height: 826,
      alt: {
        hi: "जल में खड़ी लाल साड़ी में व्रती, नारियल-फल से भरा सूप थामे",
        en: "A vrati in a red saree standing in the water, holding a soop of coconut and fruit",
      },
      caption: { hi: "सूप थामे संध्या अर्घ्य — यमुना तट।", en: "Sandhya arghya with the soop — on the Yamuna." },
      credit: { author: "Goutam1962", license: "CC BY-SA 4.0", licenseUrl: BY_SA_4, sourceUrl: commons("Women_Offering_Arghya_at_Yamuna.jpg") },
      focus: "55% 40%",
    },
    {
      src: "/photos/sandhya-bagmati.webp",
      width: 1280,
      height: 896,
      alt: { hi: "लाल साड़ी में व्रती धूप दिखाती हुई, पीछे दीयों की रोशनी", en: "A vrati in red offering incense, lamps glowing behind" },
      caption: { hi: "डूबते सूर्य को धूप — बागमती तट, काठमांडू।", en: "Incense to the setting sun — Bagmati riverbank, Kathmandu." },
      credit: { author: "Skandagautam", license: "CC BY-SA 4.0", licenseUrl: BY_SA_4, sourceUrl: commons("Chhath_Festival_in_Nepal.jpg") },
    },
  ],
  // Day 4 · usha arghya
  "usha-arghya": [
    {
      src: "/photos/usha-misty-pond.webp",
      width: 1280,
      height: 960,
      alt: {
        hi: "कोहरे भरी भोर, पोखर पर उगता सूर्य, किनारे सूप-दौरा और व्रती",
        en: "A misty dawn, the sun rising over a pond, soops and vratis on the bank",
      },
      caption: { hi: "उगते सूर्य की प्रतीक्षा — चौधरी पोखर, बसुकी बिहारी (बिहार)।", en: "Waiting for the rising sun — Chaudhary Pokhar, Basuki Bihari (Bihar)." },
      credit: { author: "Sntshkumar750", license: "CC BY-SA 4.0", licenseUrl: BY_SA_4, sourceUrl: commons("Chhath_Puja_(Morning).jpg") },
      focus: "40% 50%",
    },
  ],
};
