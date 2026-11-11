import type { CulturalNote, L, SourceId } from "./types";

export interface TraditionSection {
  id: string;
  title: L;
  body: L;
  notes: CulturalNote[];
  sources: SourceId[];
}

export const traditionSections: TraditionSection[] = [
  {
    id: "what-is-chhath",
    title: { hi: "छठ क्या है?", en: "What is Chhath?" },
    body: {
      hi: "छठ सूर्य देव और छठी मइया की उपासना का चार दिवसीय पर्व है। यह मुख्यतः बिहार, झारखंड, पूर्वी उत्तर प्रदेश और नेपाल के तराई क्षेत्र में मनाया जाता है, और आज दिल्ली, मुंबई, कोलकाता से लेकर विदेशों तक बसे परिवार भी इसे मनाते हैं। मुख्य पर्व कार्तिक शुक्ल षष्ठी को होता है — इसीलिए नाम ‘छठ’ (षष्ठी)। चैत्र मास में भी एक छठ (चैती छठ) मनाई जाती है।",
      en: "Chhath is a four-day festival of worship of Surya and Chhathi Maiya. It is observed chiefly in Bihar, Jharkhand, eastern Uttar Pradesh and the Terai of Nepal, and today also by families settled from Delhi, Mumbai and Kolkata to abroad. The main day falls on Kartik Shukla Shashthi — hence ‘Chhath’ (sixth). A second Chhath, Chaiti Chhath, is observed in the month of Chaitra.",
    },
    notes: [
      {
        kind: "practice",
        text: {
          hi: "छठ में किसी पुरोहित की अनिवार्यता नहीं मानी जाती — व्रती और परिवार स्वयं पूजा करते हैं। यह इस पर्व की एक विशिष्ट पहचान के रूप में अक्सर बताया जाता है।",
          en: "Chhath is commonly described as not requiring a priest — the vrati and family perform the worship themselves. This is often cited as one of its distinctive features.",
        },
        sources: ["wikipedia"],
      },
    ],
    sources: ["britannica", "wikipedia", "sahapedia"],
  },
  {
    id: "four-kinds",
    title: { hi: "मान्यता, प्रतीक, परंपरा और भिन्नता", en: "Belief, symbolism, practice and variation" },
    body: {
      hi: "इस वेबसाइट पर हर टिप्पणी के साथ एक चिह्न है, ताकि आप जान सकें कि आप क्या पढ़ रहे हैं: किसी धार्मिक मान्यता का वर्णन, किसी परंपरा का सांस्कृतिक अर्थ, व्यापक रूप से प्रचलित रीति, या किसी क्षेत्र/परिवार विशेष की भिन्नता। हमने कोई वैज्ञानिक लाभ, ऐतिहासिक तिथि या पौराणिक कथा नहीं गढ़ी है।",
      en: "Every note on this site carries a label so you know what you are reading: a description of religious belief, the cultural meaning of a tradition, a widely followed practice, or a region- or family-specific variation. We have not invented scientific benefits, historical dates or myths.",
    },
    notes: [],
    sources: [],
  },
  {
    id: "chhathi-maiya",
    title: { hi: "छठी मइया और सूर्य देव", en: "Chhathi Maiya and Surya" },
    body: {
      hi: "छठ में सूर्य को प्रत्यक्ष देवता के रूप में अर्घ्य दिया जाता है। छठी मइया को संतान की रक्षक और कल्याण देने वाली देवी माना जाता है। उनके स्वरूप को लेकर कई मान्यताएँ हैं; इन पर अलग-अलग परिवार और विद्वान अलग विचार रखते हैं, और यहाँ हम किसी एक को अंतिम नहीं बताते।",
      en: "In Chhath, arghya is offered to the sun as a visible deity. Chhathi Maiya is believed to protect children and grant well-being. There are several beliefs about her form; families and scholars hold different views, and we do not present any one as final.",
    },
    notes: [
      {
        kind: "belief",
        text: {
          hi: "कई लोकगीतों और कथाओं में छठ से जुड़ी प्राचीन कथाएँ — रामायण और महाभारत के प्रसंगों सहित — सुनाई जाती हैं। ये श्रद्धा की परंपराएँ हैं, ऐतिहासिक प्रमाण नहीं।",
          en: "Many songs and tellings link Chhath to ancient stories — including episodes from the Ramayana and Mahabharata. These are traditions of faith, not historical evidence.",
        },
        sources: ["wikipedia"],
      },
    ],
    sources: ["sahapedia", "wikipedia", "britannica"],
  },
  {
    id: "regions",
    title: { hi: "क्षेत्रीय रंग", en: "Regional colours" },
    body: {
      hi: "छठ भोजपुर, मगध, मिथिला, अंग, झारखंड और नेपाल के तराई — हर क्षेत्र में अपने ढंग से मनाया जाता है। भाषाएँ (भोजपुरी, मगही, मैथिली, अंगिका, नेपाली आदि), गीत, प्रसाद की सूची और रीतियों का क्रम बदल सकता है। ये भाषाएँ और परंपराएँ एक-दूसरे की पर्याय नहीं हैं; इसलिए इस वेबसाइट पर हम किसी एक क्षेत्र की रीति को ‘सही’ नहीं बताते।",
      en: "Chhath is celebrated in its own way in Bhojpur, Magadh, Mithila, Ang, Jharkhand and the Nepal Terai. Languages (Bhojpuri, Magahi, Maithili, Angika, Nepali and others), songs, the list of offerings and the order of rites can differ. These languages and traditions are not interchangeable, so this site never presents one region's way as ‘correct’.",
    },
    notes: [
      {
        kind: "variation",
        region: { hi: "शहर और प्रवास", en: "Cities & diaspora" },
        text: {
          hi: "महानगरों और विदेशों में तालाब, कृत्रिम कुंड, छत पर बने टैंक या समुद्र-तट पर अर्घ्य दिया जाता है; सामुदायिक समितियाँ घाट तैयार करती हैं।",
          en: "In big cities and abroad, arghya is offered at ponds, artificial pools, rooftop tanks or beaches; community committees prepare the ghats.",
        },
      },
      {
        kind: "variation",
        region: { hi: "व्रत का स्वरूप", en: "Form of the vrat" },
        text: {
          hi: "दिन के उपवास में जल, प्रसाद की चीज़ें, कोसी भरना, दंडवत और पारण का तरीका — ये सब परिवार की परंपरा और मन्नत के अनुसार बदलते हैं।",
          en: "Water during the day's fast, the items of prasad, kosi bharna, dandvat and the manner of paran all vary with family tradition and vows.",
        },
      },
    ],
    sources: ["wikipedia", "britannica"],
  },
  {
    id: "songs",
    title: { hi: "छठ के गीत", en: "Songs of Chhath" },
    body: {
      hi: "छठ लोकगीतों के बिना अधूरा है। ‘काँच ही बाँस के बहँगिया’, ‘केलवा के पात पर उगेलन सुरुज मल’, ‘उग हो सुरुज देव’ जैसे पारंपरिक गीत पीढ़ियों से घरों और घाटों पर गाए जाते हैं। स्वर्गीय शारदा सिन्हा जैसे कलाकारों की रिकॉर्डिंग बहुत प्रिय हैं, पर वे कॉपीराइट के अधीन हैं — इसलिए यह वेबसाइट कोई रिकॉर्डिंग नहीं चलाती।",
      en: "Chhath is incomplete without its folk songs. Traditional songs such as ‘Kaanch hi baans ke bahangiya’, ‘Kelwa ke paat par ugelan suruj mal’ and ‘Ug ho suruj dev’ have been sung at homes and ghats for generations. Recordings by artists such as the late Sharda Sinha are much loved but are under copyright — so this site plays no recordings.",
    },
    notes: [],
    sources: ["wikipedia"],
  },
  {
    id: "care",
    title: { hi: "सम्मान और सावधानी", en: "Respect and care" },
    body: {
      hi: "छठ आस्था का पर्व है, खेल नहीं। इस वेबसाइट में व्रत को कभी ‘चुनौती’ या खेल की तरह नहीं दिखाया गया है। कृपया निर्जला उपवास की नकल न करें; जो व्रत रखते हैं, वे अपने स्वास्थ्य और परिवार की सलाह का ध्यान रखें। घाट पर भीड़ में बच्चों और बुज़ुर्गों का ध्यान रखें, और नदियों को साफ़ रखने में हाथ बँटाएँ।",
      en: "Chhath is a festival of faith, not a game. This site never presents the vrat as a ‘challenge’. Please do not imitate the waterless fast; those who observe it should mind their health and family advice. Look after children and elders in ghat crowds, and help keep rivers clean.",
    },
    notes: [],
    sources: [],
  },
];

export const glossary: { term: string; en: string; meaning: L }[] = [
  { term: "छठी मइया", en: "Chhathi Maiya", meaning: { hi: "छठ में पूजित देवी, संतान की रक्षक मानी जाती हैं।", en: "The goddess worshipped at Chhath, believed to protect children." } },
  { term: "व्रती / परवैतिन", en: "Vrati / Parvaitin", meaning: { hi: "व्रत रखने वाला व्यक्ति।", en: "The person observing the vrat." } },
  { term: "नहाय-खाय", en: "Nahay Khay", meaning: { hi: "पहला दिन — स्नान और सात्विक भोजन।", en: "Day one — bath and a sattvic meal." } },
  { term: "खरना", en: "Kharna", meaning: { hi: "दूसरा दिन — दिन भर उपवास, संध्या को रसियाव-रोटी का प्रसाद।", en: "Day two — fast by day, rasiyaw-roti prasad at dusk." } },
  { term: "संध्या अर्घ्य", en: "Sandhya Arghya", meaning: { hi: "तीसरे दिन डूबते सूर्य को अर्घ्य।", en: "Arghya to the setting sun on day three." } },
  { term: "उषा अर्घ्य", en: "Usha Arghya", meaning: { hi: "चौथे दिन उगते सूर्य को अर्घ्य।", en: "Arghya to the rising sun on day four." } },
  { term: "अर्घ्य", en: "Arghya", meaning: { hi: "श्रद्धा से अर्पित जल/दूध।", en: "Water or milk offered in reverence." } },
  { term: "सूप", en: "Soop", meaning: { hi: "बाँस का सूप — अर्घ्य की थाली।", en: "Bamboo winnowing tray — the arghya tray." } },
  { term: "दउरा", en: "Daura", meaning: { hi: "बाँस की बड़ी टोकरी।", en: "Large bamboo basket." } },
  { term: "बहँगी", en: "Bahangi", meaning: { hi: "कंधे पर रखा बाँस का डंडा, जिसके दोनों ओर टोकरियाँ लटकती हैं।", en: "A bamboo shoulder pole with baskets hung at each end." } },
  { term: "ठेकुआ", en: "Thekua", meaning: { hi: "आटे, गुड़, घी का प्रसाद।", en: "Prasad of flour, jaggery and ghee." } },
  { term: "रसियाव", en: "Rasiyaw", meaning: { hi: "गुड़ की खीर।", en: "Jaggery kheer." } },
  { term: "निर्जला", en: "Nirjala", meaning: { hi: "बिना जल का (उपवास)।", en: "Without water (of a fast)." } },
  { term: "पारण", en: "Paran", meaning: { hi: "व्रत तोड़ना।", en: "Breaking the fast." } },
  { term: "कोसी भरना", en: "Kosi bharna", meaning: { hi: "मन्नत पूरी होने पर गन्नों का मंडप बनाकर दीप जलाने की रीति (कुछ परिवारों में)।", en: "Lighting lamps under a sugarcane canopy after a fulfilled vow (some families)." } },
  { term: "प्रसाद", en: "Prasad", meaning: { hi: "पूजा में अर्पित और फिर बाँटा जाने वाला भोजन।", en: "Food offered in worship and then shared." } },
];
