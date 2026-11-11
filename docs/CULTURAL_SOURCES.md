# Cultural accuracy & sources

## Principles applied to every sentence

1. **Label the kind of claim.** Every note carries one of: *धार्मिक मान्यता / religious belief*, *सांस्कृतिक प्रतीक / cultural symbolism*, *प्रचलित परंपरा / common practice*, *क्षेत्रीय/पारिवारिक भिन्नता / regional or family variation*, *सावधानी / note of care*.
2. **No universals.** Practices are written as “कई परिवारों में / in many families” unless they are near-universal (e.g. offering arghya at sunset and sunrise).
3. **Nothing invented.** No made-up mythology, no “scientific benefits”, no historical dates. Popular press claims of health/science benefits (e.g. about kaddu-bhaat “preparing the body”) were **deliberately left out**.
4. **Regions are not interchangeable.** Bhojpuri, Magahi, Maithili, Angika and Nepali-speaking traditions are referred to separately; no single region’s practice is called “correct”.
5. **Gestures are minimal.** Animations use only: standing, sitting, folded hands, holding the soop toward the sun in both hands, pouring from a lota, carrying the daura on the head, bowing/touching feet, cooking/arranging. These are listed in `src/three/Devotee.tsx › POSES`.
6. **Fasting is never gamified.** A care note appears on Kharna and the journey page; there is no “challenge”, streak or reward tied to fasting.

## Facts verified (and where)

| Topic | Statement on site | Sources |
|---|---|---|
| Regions | Bihar, Jharkhand, eastern UP, Nepal Terai, diaspora | Wikipedia, Britannica, Sahapedia |
| Calendar | Kartik Shukla Chaturthi → Saptami; 2026: 13–16 Nov | Almanac summaries (India TV, ET, HinduTone citing Drik Panchang) |
| Deities | Surya and Chhathi Maiya; multiple beliefs about her identity | Sahapedia, Wikipedia |
| Day 1 | Bath, house cleaning, sattvic kaddu (bottle gourd) + chana dal + rice, no garlic/onion | Economic Times, Times of India, Times Bull |
| Day 2 | Day fast; evening rasiyaw (jaggery kheer) + roti/puri; prasad shared; ~36 h nirjala begins | ET vrat rules, HinduTone, Times of India |
| Day 3 | Thekua, soop/daura with seasonal fruit (banana, citron, water chestnut, sugarcane, coconut); evening arghya standing in water | HinduTone, Google Arts & Culture, Wikipedia |
| Day 4 | Dawn arghya, prasad distribution, paran | Wikipedia, Britannica, GAC |
| No priest required | “commonly described as” | Wikipedia |
| Sunrise/sunset times | ~06:00 / ~17:00 near Patna in mid-November (approximate, shown with a “confirm with local panchang” note) | Almanac summaries |

Full links: [`src/content/sources.ts`](../src/content/sources.ts) (also rendered on `/traditions#sources`).

## Items intentionally framed as variation

Water during Kharna-day fast · roti vs puri vs ghee-roti · kasar · number of soops · brass vs bamboo soop · kosi bharna (vow-related) · dandvat to the ghat · floating diyas · what is eaten first at paran · silence while the vrati eats · Ganga water in cooking.

## Review still needed before a public launch

* **Community review** by vratis and elders from at least Bhojpur, Magadh and Mithila regions (wording, attire, kitchen layout, ghat behaviour).
* Native-speaker proofreading of all Hindi; optional Bhojpuri/Maithili/Magahi phrases should be added only with a speaker from that region.
* Replace secondary/press sources with ethnographic or academic sources where possible (e.g. published folklore studies of Chhath songs).
* Regional names marked as such (`खजूरिया`, `सुपली`, `डाला/दौरा`, `हाँडी/बटलोही`) should be confirmed by speakers before expansion.

To report a correction, open an issue with the page, the sentence, and your source or family/region context.
