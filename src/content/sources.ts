import type { Source, SourceId } from "./types";

/**
 * Reference list. Content on this site was written from these sources and
 * cross-checked between them. Press articles are secondary sources: where they
 * disagreed or made unverifiable claims (e.g. "scientific benefits"), those claims
 * were left out. See docs/CULTURAL_SOURCES.md for the review process.
 */
export const sources: Record<SourceId, Source> = {
  wikipedia: {
    id: "wikipedia",
    title: "Chhath",
    publisher: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Chhath",
    usedFor: {
      hi: "क्षेत्र, चार दिनों का क्रम, व्रत की सामान्य संरचना",
      en: "Regions of observance, order of the four days, general structure of the vrat",
    },
    type: "encyclopedia",
  },
  britannica: {
    id: "britannica",
    title: "Chhath Puja",
    publisher: "Encyclopædia Britannica",
    url: "https://www.britannica.com/topic/Chhath-Puja",
    usedFor: {
      hi: "सूर्य उपासना के पर्व के रूप में छठ; बिहार, उत्तर प्रदेश, झारखंड, नेपाल और प्रवासी समुदाय",
      en: "Chhath as a four-day solar festival; Bihar, UP, Jharkhand, Nepal and diaspora observance",
    },
    type: "encyclopedia",
  },
  sahapedia: {
    id: "sahapedia",
    title: "Chhath Puja",
    publisher: "Sahapedia",
    url: "https://www.sahapedia.org/chhath-puja",
    usedFor: {
      hi: "कार्तिक मास में सूर्य और छठी मइया की उपासना; सांस्कृतिक संदर्भ",
      en: "Worship of Surya and Chhathi Maiya in Kartik; cultural context",
    },
    type: "cultural-archive",
  },
  pib: {
    id: "pib",
    title: "Chhath Puja — background note (Oct 2025)",
    publisher: "Press Information Bureau, Government of India",
    url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/oct/doc20251027678001.pdf",
    usedFor: {
      hi: "पर्व की पृष्ठभूमि और चारों दिनों का सार्वजनिक विवरण",
      en: "Public background on the festival and its four days",
    },
    type: "government",
  },
  gac: {
    id: "gac",
    title: "How Chhath Puja is Celebrated",
    publisher: "Google Arts & Culture",
    url: "https://artsandculture.google.com/story/9QXxQ8xSNXhwjw",
    usedFor: {
      hi: "घाट, सूप-दउरा, प्रसाद और पारिवारिक भागीदारी के दृश्य संदर्भ",
      en: "Visual reference for ghats, soop and daura, prasad and family participation",
    },
    type: "cultural-archive",
  },
  "et-nahaykhay": {
    id: "et-nahaykhay",
    title: "Nahay Khay 2026: Kaddu Bhaat and traditional food rules",
    publisher: "The Economic Times",
    url: "https://m.economictimes.com/astrology/others/nahay-khay-2026-date-kaddu-bhaat-recipe-traditional-food-rules-and-chhath-puja-rituals/amp_articleshow/135685650.cms",
    usedFor: {
      hi: "नहाय-खाय: स्नान, घर की सफ़ाई, कद्दू (लौकी), चना दाल और भात",
      en: "Nahay Khay: bath, house cleaning, kaddu (bottle gourd), chana dal and rice",
    },
    type: "press",
  },
  "et-vrat-rules": {
    id: "et-vrat-rules",
    title: "Chhath Puja vrat rules 2026",
    publisher: "The Economic Times",
    url: "https://economictimes.indiatimes.com/astrology/others/chhath-puja-vrat-rules-2026-what-can-parvaitins-eat-and-what-should-they-avoid-during-the-fast/articleshow/135703359.cms",
    usedFor: {
      hi: "गुड़ की खीर (खरना) और लगभग 36 घंटे का निर्जला व्रत",
      en: "Jaggery kheer on Kharna and the approximately 36-hour nirjala fast",
    },
    type: "press",
  },
  "hindutone-prasad": {
    id: "hindutone-prasad",
    title: "Chhath Puja 2026 prasad: Thekua, Kharna kheer & Kasar",
    publisher: "HinduTone",
    url: "https://hindutone.com/festivals/chhath-puja-2026-prasad-recipes-thekua-fruits/",
    usedFor: {
      hi: "ठेकुआ, रसियाव-रोटी, कसार और मौसमी फल (गन्ना, केला, नारियल, डाभ नींबू, सिंघाड़ा)",
      en: "Thekua, rasiyaw and roti, kasar, seasonal fruit (sugarcane, banana, coconut, citron, water chestnut)",
    },
    type: "press",
  },
  "dates-2026": {
    id: "dates-2026",
    title: "Chhath Puja 2026 calendar (summaries of Drik Panchang)",
    publisher: "India TV / The Economic Times / HinduTone",
    url: "https://www.indiatvnews.com/lifestyle/spirituality/chhath-puja-2026-calendar-when-are-nahay-khay-kharna-sandhya-arghya-and-usha-arghya-2026-11-10-1059127",
    usedFor: {
      hi: "2026 की तिथियाँ: 13–16 नवंबर",
      en: "2026 dates: 13–16 November",
    },
    type: "almanac-summary",
  },
  "toi-kharna": {
    id: "toi-kharna",
    title: "Importance of Kaddu Bhaat and Kharna in the 4-day festival",
    publisher: "The Times of India",
    url: "https://timesofindia.indiatimes.com/life-style/food-news/chhath-puja-2024-importance-of-kaddu-bhaat-and-kharna-in-the-4-day-festival/articleshow/114974264.cms",
    usedFor: {
      hi: "खरना प्रसाद में रोटी/पूरी और खीर; परिवारों के बीच भिन्नता",
      en: "Kharna prasad of roti/puri and kheer; variation between families",
    },
    type: "press",
  },
  "ndtv-food": {
    id: "ndtv-food",
    title: "Chhath Puja 2026: Complete festival calendar and traditional recipes",
    publisher: "NDTV Food",
    url: "https://food.ndtv.com/festivals/chhath-puja-2026-complete-festival-calendar-and-traditional-recipes-12252774",
    usedFor: {
      hi: "पारंपरिक व्यंजन और सूर्य देव व छठी मइया की उपासना",
      en: "Traditional dishes; worship of Surya and Chhathi Maiya",
    },
    type: "press",
  },
};

export const sourceList = Object.values(sources);
