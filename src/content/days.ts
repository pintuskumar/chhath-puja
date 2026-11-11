import type { Day } from "./types";

/**
 * The four days of Chhath Mahaparv.
 * 2026: 13 Nov (Nahay Khay) · 14 Nov (Kharna) · 15 Nov (Sandhya Arghya) · 16 Nov (Usha Arghya),
 * cross-checked across several almanac summaries (source "dates-2026").
 *
 * Writing conventions: see src/content/objects.ts. Practices are described as
 * "common"/"in many families" unless near-universal (e.g. the two arghyas).
 */
export const days: Day[] = [
  // ───────────────────────────── DAY 1 ─────────────────────────────
  {
    id: 1,
    slug: "nahay-khay",
    title: { hi: "नहाय-खाय", en: "Nahay Khay" },
    subtitle: { hi: "पहला दिन", en: "Day one" },
    theme: { hi: "शुद्धता और शुरुआत", en: "Purity and beginning" },
    tithi: { hi: "कार्तिक शुक्ल चतुर्थी", en: "Kartik Shukla Chaturthi" },
    date2026: "2026-11-13",
    accent: "#276C80",
    environment: "courtyard",
    description: {
      hi: "‘नहाय’ यानी स्नान, ‘खाय’ यानी भोजन। घर की सफ़ाई और पवित्र स्नान के बाद व्रती सादा सात्विक भोजन — कद्दू-भात — ग्रहण करते हैं, और चार दिनों का व्रत आरंभ होता है।",
      en: "‘Nahay’ means to bathe and ‘khay’ to eat. After cleaning the home and a ritual bath, the vrati eats a simple sattvic meal — kaddu-bhaat — and the four-day vrat begins.",
    },
    ritualObjects: ["chulha", "handi", "lauki", "chana-dal", "arwa-chawal", "lota", "gehun"],
    culturalNotes: [
      {
        kind: "practice",
        text: {
          hi: "व्रत करने वाले को ‘व्रती’ या ‘परवैतिन’ कहते हैं। अधिकतर महिलाएँ व्रत रखती हैं, पर पुरुष व्रती भी कम नहीं हैं।",
          en: "The person observing the vrat is called a ‘vrati’ or ‘parvaitin’. Most are women, but many men also observe it.",
        },
        sources: ["wikipedia", "et-vrat-rules"],
      },
      {
        kind: "practice",
        text: {
          hi: "इस दिन से घर में लहसुन-प्याज़ और मांसाहार नहीं बनता — कई परिवारों में यह नियम दिवाली के बाद से ही लागू हो जाता है।",
          en: "From this day no garlic, onion or non-vegetarian food is cooked at home — in many families the rule starts right after Diwali.",
        },
        sources: ["et-nahaykhay"],
      },
    ],
    scenes: [
      {
        id: "ghar-ki-taiyari",
        index: 0,
        title: { hi: "घर की तैयारी", en: "Preparing the home" },
        caption: { hi: "आँगन बुहारा जाता है, रसोई लीपी जाती है।", en: "The courtyard is swept, the kitchen freshly plastered." },
        stage: { environment: "courtyard", timeOfDay: 6.9, camera: "courtyard-wide", closeCamera: "courtyard-kitchen", animation: "clean", duration: 10 },
        what: {
          hi: "परिवार आँगन, रसोई और पूजा का स्थान साफ़ कर रहा है। मिट्टी के फ़र्श और चूल्हे को गोबर-मिट्टी से लीपा जा रहा है, बरतन माँजे जा रहे हैं।",
          en: "The family is cleaning the courtyard, kitchen and place of worship. Earthen floors and the stove are freshly plastered with clay and cow-dung, and vessels are scoured.",
        },
        why: {
          hi: "छठ में शुद्धता का विशेष महत्व है। व्रत का भोजन और प्रसाद पूरी स्वच्छता से बने, इसलिए पर्व की शुरुआत ही घर की सफ़ाई से होती है।",
          en: "Purity matters deeply in Chhath. So that the vrat's food and prasad are made in complete cleanliness, the festival begins by cleaning the home.",
        },
        how: {
          hi: [
            "पूरे घर, विशेषकर रसोई और पूजा स्थल की सफ़ाई।",
            "मिट्टी के चूल्हे और फ़र्श की लिपाई; शहरों में धुलाई।",
            "व्रत के लिए बरतन अलग किए जाते हैं — कई घर नए मिट्टी के बरतन लाते हैं।",
          ],
          en: [
            "The whole house, especially the kitchen and shrine, is cleaned.",
            "Clay stoves and floors are re-plastered; in cities they are washed.",
            "Vessels are set apart for the vrat — many homes buy new clay pots.",
          ],
        },
        when: { hi: "नहाय-खाय की सुबह, अक्सर एक-दो दिन पहले से।", en: "On the morning of Nahay Khay, often starting a day or two earlier." },
        objects: ["chulha", "handi"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "गाँवों में गोबर-मिट्टी की लिपाई आम है; शहरी फ़्लैटों में वही भाव धुलाई और अलग रसोई-कोने से निभाया जाता है।",
              en: "Clay and cow-dung plastering is common in villages; in city flats the same intent is kept through washing and a separate cooking corner.",
            },
          },
        ],
        sources: ["et-nahaykhay", "wikipedia"],
        visualDescription: {
          hi: "सुबह की हल्की धूप में मिट्टी का आँगन। एक महिला झाड़ू लगा रही है, दूसरा व्यक्ति चूल्हे के पास बरतन रख रहा है। दीवारों पर मधुबनी-शैली के चित्र हैं।",
          en: "An earthen courtyard in soft morning light. A woman sweeps; another person arranges vessels near the clay stove. The walls carry Madhubani-style paintings.",
        },
      },
      {
        id: "pavitra-snan",
        index: 1,
        title: { hi: "पवित्र स्नान", en: "The ritual bath" },
        caption: { hi: "स्नान से व्रत की शुरुआत।", en: "The vrat begins with a bath." },
        stage: { environment: "courtyard", timeOfDay: 7.6, camera: "courtyard-wide", animation: "bath", duration: 9 },
        what: {
          hi: "व्रती नदी, तालाब या घर पर स्नान करके नए या धुले वस्त्र पहनते हैं। (इस दृश्य को दूर से, प्रतीकात्मक रूप में दिखाया गया है — जल-पात्र से जल भरते हुए।)",
          en: "The vrati bathes — in a river, pond or at home — and puts on new or freshly washed clothes. (Shown here from a distance, symbolically, as water being drawn from a vessel.)",
        },
        why: {
          hi: "पर्व के नाम में ही ‘नहाय’ है: स्नान को तन-मन की शुद्धि और व्रत के संकल्प का आरंभ माना जाता है।",
          en: "‘Nahay’ is in the day's very name: the bath is regarded as purifying body and mind and as the start of the vow.",
        },
        how: {
          hi: [
            "जहाँ संभव हो, नदी या तालाब में स्नान; गंगा-तट के इलाक़ों में कई लोग गंगा स्नान करते हैं।",
            "स्नान के बाद नए या स्वच्छ वस्त्र — महिलाएँ प्रायः साड़ी पहनती हैं।",
            "भोजन बनाने के लिए स्वच्छ जल भरकर लाया जाता है।",
          ],
          en: [
            "Where possible, a bath in a river or pond; in areas near the Ganga many bathe there.",
            "New or clean clothes after bathing — women usually wear a saree.",
            "Clean water is fetched for cooking.",
          ],
        },
        when: { hi: "नहाय-खाय की सुबह, भोजन बनाने से पहले।", en: "Nahay Khay morning, before cooking." },
        objects: ["lota"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "कई परिवार इस दिन नदी से लाए गंगाजल को भोजन बनाने के जल में मिलाते हैं; यह घर की रीति पर निर्भर है।",
              en: "Some families add river (Ganga) water brought home that day to the cooking water; this depends on household custom.",
            },
          },
        ],
        sources: ["et-nahaykhay", "wikipedia"],
        visualDescription: {
          hi: "आँगन के कोने में पानी के घड़े और पीतल का लोटा। साड़ी पहने व्रती दूर से लोटे में जल भरती दिखती हैं।",
          en: "Water pots and a brass lota in a corner of the courtyard. A vrati in a saree is seen from afar filling the lota.",
        },
      },
      {
        id: "bhojan-ki-taiyari",
        index: 2,
        title: { hi: "भोजन की तैयारी", en: "Cooking the meal" },
        caption: { hi: "मिट्टी के चूल्हे पर कद्दू-भात।", en: "Kaddu-bhaat on the clay stove." },
        stage: { environment: "courtyard", timeOfDay: 10.5, camera: "courtyard-stove", animation: "cook", duration: 16 },
        what: {
          hi: "चूल्हे पर तीन चीज़ें पक रही हैं: लौकी (बिहार में ‘कद्दू’) की सब्ज़ी, चना दाल और अरवा चावल का भात।",
          en: "Three things cook on the stove: bottle gourd (called ‘kaddu’ in Bihar), chana dal and bhaat of arwa rice.",
        },
        why: {
          hi: "भोजन सात्विक — बिना लहसुन-प्याज़ — और सादा रखा जाता है। व्रती आगे के कठिन व्रत से पहले यही शुद्ध भोजन ग्रहण करते हैं।",
          en: "The food is kept sattvic — without garlic or onion — and simple. This is the pure meal the vrati eats before the demanding days ahead.",
        },
        how: {
          hi: [
            "चावल को अच्छी तरह धोकर अलग हाँडी में भात बनाया जाता है।",
            "चना दाल उबाली जाती है — कई घरों में लौकी के साथ।",
            "लौकी काटकर सादी सब्ज़ी बनती है; कई घर सेंधा नमक प्रयोग करते हैं।",
            "जलावन में अक्सर आम की लकड़ी।",
          ],
          en: [
            "Rice is washed well and cooked as bhaat in a separate pot.",
            "Chana dal is boiled — in many homes together with the gourd.",
            "The gourd is chopped and cooked simply; many homes use rock salt.",
            "Mango wood is often used as fuel.",
          ],
        },
        when: { hi: "स्नान के बाद, दोपहर से पहले।", en: "After the bath, before midday." },
        objects: ["chulha", "handi", "lauki", "chana-dal", "arwa-chawal"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "कुछ परिवार इसमें आँवले की चटनी, साग या पकौड़ी जैसे व्यंजन भी जोड़ते हैं; थाली की बनावट क्षेत्र और घर के अनुसार बदलती है।",
              en: "Some families add dishes like amla chutney, greens or fritters; the plate varies by region and household.",
            },
          },
          {
            kind: "variation",
            text: {
              hi: "भोजन प्रायः व्रती स्वयं या घर की बड़ी महिलाएँ बनाती हैं; कई घरों में व्रती के अलावा कोई रसोई नहीं छूता।",
              en: "The vrati or senior women usually cook; in many homes nobody but the vrati touches this kitchen.",
            },
          },
        ],
        sources: ["et-nahaykhay", "toi-kharna"],
        visualDescription: {
          hi: "चूल्हे में लकड़ी जल रही है, मिट्टी की हाँडी से भाप उठ रही है। पास में लौकी, दाल और चावल रखे हैं।",
          en: "Wood burns in the clay stove and steam rises from a clay pot. Gourd, dal and rice lie nearby.",
        },
      },
      {
        id: "prasad-aur-bhojan",
        index: 3,
        title: { hi: "प्रसाद और भोजन", en: "The meal as prasad" },
        caption: { hi: "व्रती पहले, फिर पूरा परिवार।", en: "The vrati first, then the family." },
        stage: { environment: "courtyard", timeOfDay: 12.8, camera: "courtyard-kitchen", animation: "meal", duration: 10 },
        what: {
          hi: "भोजन को पहले भगवान को अर्पित कर, व्रती ग्रहण करते हैं। इसके बाद परिवार के अन्य लोग इसे प्रसाद की तरह खाते हैं।",
          en: "The food is first offered in prayer, then eaten by the vrati. After that the rest of the family eats it as prasad.",
        },
        why: {
          hi: "यह भोजन साधारण नहीं, व्रत का पहला प्रसाद माना जाता है। परिवार का साथ बैठना दिखाता है कि छठ पूरे घर का पर्व है।",
          en: "This meal is regarded not as ordinary food but as the vrat's first prasad. The family eating together shows that Chhath belongs to the whole household.",
        },
        how: {
          hi: [
            "थाली या केले के पत्ते पर भात, दाल और लौकी।",
            "व्रती पहले भोजन करते हैं।",
            "शेष परिवार और कभी-कभी पड़ोसी भी यही भोजन ग्रहण करते हैं।",
          ],
          en: [
            "Bhaat, dal and gourd on a plate or banana leaf.",
            "The vrati eats first.",
            "The rest of the family, and sometimes neighbours, eat the same food.",
          ],
        },
        when: { hi: "नहाय-खाय की दोपहर; कई व्रती इस दिन एक ही बार भोजन करते हैं।", en: "Nahay Khay afternoon; many vratis eat only once on this day." },
        objects: ["lauki", "arwa-chawal", "chana-dal"],
        regionalNotes: [],
        sources: ["et-nahaykhay"],
        visualDescription: {
          hi: "व्रती आसन पर बैठकर केले के पत्ते पर भोजन कर रही हैं; परिवार पास बैठा है।",
          en: "The vrati sits on a mat eating from a banana leaf; the family sits nearby.",
        },
      },
      {
        id: "agle-din-ki-taiyari",
        index: 4,
        title: { hi: "अगले दिन की तैयारी", en: "Preparing for Kharna" },
        caption: { hi: "गेहूँ सूखता है, जलावन जुटता है।", en: "Wheat dries, firewood is gathered." },
        stage: { environment: "courtyard", timeOfDay: 15.8, camera: "courtyard-wide", animation: "prepare-next", duration: 10 },
        what: {
          hi: "प्रसाद के लिए गेहूँ धोकर आँगन में सुखाया जा रहा है और कोई उसकी रखवाली कर रहा है। आम की लकड़ी, गुड़ और खरना की सामग्री जुटाई जा रही है।",
          en: "Wheat for the prasad has been washed and is drying in the courtyard while someone watches over it. Mango wood, jaggery and the Kharna ingredients are being gathered.",
        },
        why: {
          hi: "ठेकुआ और खरना का प्रसाद घर में ही, शुद्ध सामग्री से बनता है। इसलिए अनाज तैयार करना भी व्रत का हिस्सा है।",
          en: "Thekua and the Kharna prasad are made at home from pure ingredients, so preparing the grain is itself part of the vrat.",
        },
        how: {
          hi: [
            "गेहूँ धोकर धूप में फैलाना, पक्षियों से बचाना।",
            "सूखने पर पिसवाना — कई जगह अलग से साफ़ की गई चक्की में।",
            "खरना के लिए गुड़, दूध और अरवा चावल की व्यवस्था।",
          ],
          en: [
            "Washing the wheat, spreading it in the sun, keeping birds away.",
            "Milling it once dry — in many places at a separately cleaned mill.",
            "Arranging jaggery, milk and arwa rice for Kharna.",
          ],
        },
        when: { hi: "नहाय-खाय की दोपहर से खरना तक।", en: "From Nahay Khay afternoon until Kharna." },
        objects: ["gehun", "chulha"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "शहरों में कई परिवार पिसा आटा या तैयार सामग्री लेते हैं; पर घर पर सुखाकर पिसवाने की रीति अब भी व्यापक है।",
              en: "In cities many families buy flour or ready ingredients, but drying and milling at home is still widespread.",
            },
          },
        ],
        sources: ["gac"],
        visualDescription: {
          hi: "दोपहर की धूप में चटाई पर गेहूँ फैला है, एक बच्चा पक्षियों को उड़ा रहा है, दीवार से आम की लकड़ी टिकी है।",
          en: "Wheat is spread on a mat in the afternoon sun, a child shoos birds away, and mango wood leans against the wall.",
        },
      },
    ],
  },

  // ───────────────────────────── DAY 2 ─────────────────────────────
  {
    id: 2,
    slug: "kharna",
    title: { hi: "खरना", en: "Kharna" },
    subtitle: { hi: "दूसरा दिन", en: "Day two" },
    theme: { hi: "संयम और समर्पण", en: "Restraint and devotion" },
    tithi: { hi: "कार्तिक शुक्ल पंचमी", en: "Kartik Shukla Panchami" },
    date2026: "2026-11-14",
    accent: "#681C29",
    environment: "courtyard",
    description: {
      hi: "व्रती दिन भर उपवास रखते हैं। संध्या को मिट्टी के चूल्हे पर गुड़ की खीर (रसियाव) और रोटी बनती है, छठी मइया को अर्पित होती है, और प्रसाद ग्रहण के साथ लगभग 36 घंटे का निर्जला व्रत शुरू होता है।",
      en: "The vrati fasts all day. In the evening, jaggery kheer (rasiyaw) and roti are cooked on the clay stove and offered to Chhathi Maiya; with the prasad begins the roughly 36-hour waterless fast.",
    },
    timeControl: { kind: "slider", min: 12, max: 20.5, label: { hi: "दोपहर से संध्या तक", en: "Afternoon to evening" } },
    ritualObjects: ["rasiyaw", "roti", "gur", "arwa-chawal", "chulha", "diya", "kalash", "banana"],
    culturalNotes: [
      {
        kind: "care",
        text: {
          hi: "यह वेबसाइट व्रत को समझाने के लिए है। कृपया लंबे निर्जला उपवास की नकल न करें; जिन्हें स्वास्थ्य संबंधी कठिनाई है, उनके लिए परिवारों में अक्सर छूट भी दी जाती है।",
          en: "This website explains the vrat. Please do not imitate long waterless fasting; families often make allowances for people with health concerns.",
        },
      },
    ],
    scenes: [
      {
        id: "din-ka-upvas",
        index: 0,
        title: { hi: "दिन का उपवास", en: "The day's fast" },
        caption: { hi: "शांत, संयमित दिन।", en: "A quiet, restrained day." },
        stage: { environment: "courtyard", timeOfDay: 12.5, camera: "courtyard-wide", animation: "fast-rest", duration: 10 },
        what: {
          hi: "व्रती पूरे दिन बिना भोजन के रहते हैं — कई व्रती दिन भर जल भी नहीं लेते। वे शांत रहकर पूजा की तैयारी देखते हैं, जबकि परिवार बाक़ी काम सँभालता है।",
          en: "The vrati spends the day without food — many without water as well. They stay calm and oversee puja preparations while the family handles other work.",
        },
        why: {
          hi: "खरना ‘संयम’ का दिन है। संध्या का प्रसाद इसी उपवास के बाद ग्रहण किया जाता है।",
          en: "Kharna is a day of restraint. The evening prasad is received only after this fast.",
        },
        how: {
          hi: ["सूर्योदय से संध्या पूजा तक उपवास।", "घर का वातावरण शांत रखा जाता है।", "परिवार सामग्री जुटाने और सफ़ाई में मदद करता है।"],
          en: ["Fasting from sunrise until the evening puja.", "The house is kept peaceful.", "The family helps gather materials and clean."],
        },
        when: { hi: "खरना का पूरा दिन।", en: "The whole of Kharna day." },
        objects: ["kalash"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "दिन के उपवास में जल लेना या न लेना परिवार की परंपरा और व्रती के स्वास्थ्य पर निर्भर है।",
              en: "Whether water is taken during the day's fast depends on family tradition and the vrati's health.",
            },
          },
        ],
        sources: ["et-vrat-rules", "wikipedia"],
        visualDescription: {
          hi: "दोपहर का आँगन। व्रती तुलसी चौरे के पास चुपचाप बैठी हैं, परिवारजन धीरे-धीरे काम कर रहे हैं।",
          en: "The courtyard at midday. The vrati sits quietly near the tulsi altar while family members work softly around her.",
        },
      },
      {
        id: "kharna-prasad",
        index: 1,
        title: { hi: "खरना प्रसाद की तैयारी", en: "Cooking the Kharna prasad" },
        caption: { hi: "गुड़, दूध और अरवा चावल — रसियाव।", en: "Jaggery, milk and arwa rice — rasiyaw." },
        stage: { environment: "courtyard", timeOfDay: 16.3, camera: "courtyard-stove", animation: "kharna-cook", duration: 14 },
        what: {
          hi: "व्रती मिट्टी के चूल्हे पर आम की लकड़ी से रसियाव — अरवा चावल, दूध और गुड़ की खीर — और गेहूँ की रोटी बना रहे हैं।",
          en: "On the clay stove, with mango wood, the vrati cooks rasiyaw — kheer of arwa rice, milk and jaggery — and wheat roti.",
        },
        why: {
          hi: "यह प्रसाद छठी मइया को अर्पित होगा और इसके बाद ही निर्जला व्रत शुरू होगा, इसलिए इसे बड़ी शुद्धता से बनाया जाता है।",
          en: "This prasad will be offered to Chhathi Maiya and the nirjala fast begins only after it, so it is made with great care for purity.",
        },
        how: {
          hi: [
            "दूध उबालकर उसमें धुला अरवा चावल पकाया जाता है।",
            "पकने पर गुड़ मिलाया जाता है — चीनी नहीं।",
            "उसी चूल्हे पर रोटी या पूरी बनती है।",
            "कई घरों में चूल्हा नया होता है और पकाते समय मौन या शांति रखी जाती है।",
          ],
          en: [
            "Milk is boiled and washed arwa rice is cooked in it.",
            "Jaggery — not sugar — is stirred in once cooked.",
            "Roti or puri is made on the same stove.",
            "In many homes the stove is new and cooking happens in silence or quiet.",
          ],
        },
        when: { hi: "खरना की दोपहर बाद से संध्या तक।", en: "From late afternoon into the evening of Kharna." },
        objects: ["rasiyaw", "roti", "gur", "arwa-chawal", "chulha", "handi"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "कुछ परिवार रोटी की जगह पूरी बनाते हैं, कुछ घी लगी रोटी; केला और अन्य फल भी प्रसाद में रखे जाते हैं।",
              en: "Some families make puri instead of roti, others ghee-smeared roti; bananas and other fruit are also offered.",
            },
            sources: ["toi-kharna"],
          },
        ],
        sources: ["hindutone-prasad", "et-vrat-rules", "toi-kharna"],
        visualDescription: {
          hi: "ढलती धूप में चूल्हे की आँच तेज़ है। पीतल की कड़ाही में खीर उबल रही है, पास में गुड़ की भेली और आटे की लोई रखी है।",
          en: "In the fading light the stove burns bright. Kheer bubbles in a brass pot; a lump of jaggery and dough balls sit nearby.",
        },
      },
      {
        id: "sandhya-puja",
        index: 2,
        title: { hi: "संध्या पूजा", en: "The evening puja" },
        caption: { hi: "दीये जलते हैं, प्रसाद अर्पित होता है।", en: "Diyas are lit, prasad is offered." },
        stage: { environment: "courtyard", timeOfDay: 18.4, camera: "courtyard-shrine", animation: "evening-puja", duration: 12 },
        what: {
          hi: "अँधेरा होते ही व्रती पूजा स्थल पर दीया जलाकर केले के पत्ते पर रसियाव, रोटी और फल छठी मइया को अर्पित करते हैं।",
          en: "As darkness falls the vrati lights a diya at the place of worship and offers rasiyaw, roti and fruit on a banana leaf to Chhathi Maiya.",
        },
        why: {
          hi: "मान्यता है कि छठी मइया इस अर्पण को स्वीकार करती हैं; यह अगले दो दिनों के अर्घ्य की तैयारी और संकल्प का क्षण है।",
          en: "It is believed that Chhathi Maiya accepts this offering; it is a moment of resolve before the two arghyas to come.",
        },
        how: {
          hi: ["पूजा स्थान पर दीया और कलश।", "केले के पत्ते पर प्रसाद सजाना।", "प्रार्थना और प्रणाम।"],
          en: ["A diya and kalash at the place of worship.", "Prasad arranged on a banana leaf.", "Prayer and obeisance."],
        },
        when: { hi: "खरना की संध्या, सूर्यास्त के बाद।", en: "Kharna evening, after sunset." },
        objects: ["diya", "kalash", "rasiyaw", "roti", "banana"],
        regionalNotes: [],
        sources: ["et-vrat-rules", "sahapedia"],
        visualDescription: {
          hi: "नीली संध्या में घर का पूजा कोना दीयों की रोशनी से गर्म दिखता है। केले के पत्ते पर खीर, रोटी और केले रखे हैं।",
          en: "In the blue evening the household shrine glows with diyas. Kheer, roti and bananas sit on a banana leaf.",
        },
      },
      {
        id: "prasad-grahan",
        index: 3,
        title: { hi: "प्रसाद ग्रहण", en: "Receiving the prasad" },
        caption: { hi: "व्रती प्रसाद लेते हैं, फिर सब में बँटता है।", en: "The vrati eats, then it is shared." },
        stage: { environment: "courtyard", timeOfDay: 19.1, camera: "courtyard-shrine", animation: "prasad-receive", duration: 10 },
        what: {
          hi: "पूजा के बाद व्रती प्रसाद ग्रहण करते हैं — कई परिवारों में शांत, एकांत वातावरण में, ताकि कोई शोर न हो। फिर परिवार, पड़ोसी और मित्र खरना का प्रसाद लेने आते हैं।",
          en: "After the puja the vrati eats the prasad — in many families in a quiet, secluded setting, free from noise. Family, neighbours and friends then come to receive the Kharna prasad.",
        },
        why: {
          hi: "यही व्रती का अंतिम भोजन है; इसके बाद उषा अर्घ्य तक जल भी ग्रहण नहीं किया जाता। प्रसाद बाँटना समुदाय को व्रत से जोड़ता है।",
          en: "This is the vrati's last meal; after it not even water is taken until Usha Arghya. Sharing the prasad connects the community to the vrat.",
        },
        how: {
          hi: ["व्रती प्रसाद ग्रहण करते हैं।", "परिवारजन और पड़ोसी श्रद्धा से प्रसाद लेते हैं।", "कई लोग व्रती के पैर छूकर आशीर्वाद लेते हैं।"],
          en: ["The vrati partakes of the prasad.", "Family and neighbours receive it with reverence.", "Many touch the vrati's feet to seek blessings."],
        },
        when: { hi: "खरना की रात।", en: "Kharna night." },
        objects: ["rasiyaw", "roti"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "प्रसाद ग्रहण के समय घर में पूरी चुप्पी रखने की रीति कुछ परिवारों में बहुत सख़्त है, कुछ में सामान्य शांति पर्याप्त मानी जाती है।",
              en: "Some families keep strict silence while the vrati eats; in others ordinary quiet is considered enough.",
            },
          },
        ],
        sources: ["et-vrat-rules", "toi-kharna"],
        visualDescription: {
          hi: "दीये के प्रकाश में व्रती अकेले बैठकर प्रसाद ले रही हैं; दरवाज़े पर परिवार धैर्य से प्रतीक्षा कर रहा है।",
          en: "By lamplight the vrati sits alone with the prasad; the family waits patiently at the doorway.",
        },
      },
      {
        id: "nirjala-vrat",
        index: 4,
        title: { hi: "निर्जला व्रत", en: "The waterless fast" },
        caption: { hi: "लगभग 36 घंटे — बिना अन्न, बिना जल।", en: "About 36 hours — no food, no water." },
        stage: { environment: "courtyard", timeOfDay: 20.4, camera: "courtyard-night", animation: "nirjala", duration: 12 },
        what: {
          hi: "खरना प्रसाद के बाद अधिकांश व्रती लगभग 36 घंटे का निर्जला व्रत रखते हैं, जो चौथे दिन उषा अर्घ्य के बाद पारण से टूटता है।",
          en: "After the Kharna prasad most vratis keep a roughly 36-hour waterless fast, broken only at paran after Usha Arghya on day four.",
        },
        why: {
          hi: "इसे छठ के सबसे कठिन और पूजनीय पक्ष के रूप में देखा जाता है — व्रती के संकल्प और आस्था का रूप।",
          en: "It is regarded as Chhath's most demanding and revered aspect — the form taken by the vrati's resolve and faith.",
        },
        how: {
          hi: [
            "खरना की रात से उषा अर्घ्य की सुबह तक न अन्न, न जल।",
            "इस बीच तीसरे दिन ठेकुआ बनाना और संध्या अर्घ्य होता है।",
            "परिवार व्रती के आराम और ज़रूरतों का ध्यान रखता है।",
          ],
          en: [
            "No food or water from Kharna night to Usha Arghya morning.",
            "In between come the thekua-making and Sandhya Arghya of day three.",
            "The family looks after the vrati's rest and needs.",
          ],
        },
        when: { hi: "खरना की रात → तीसरा दिन → चौथे दिन की सुबह।", en: "Kharna night → day three → morning of day four." },
        objects: [],
        regionalNotes: [
          {
            kind: "care",
            text: {
              hi: "अवधि लगभग है; यह सूर्योदय-समय और परिवार की रीति से बदलती है। वृद्ध, बीमार या गर्भवती व्रतियों के लिए कई परिवार नियमों में छूट देते हैं।",
              en: "The duration is approximate and shifts with sunrise times and family practice. Many families relax the rules for elderly, unwell or pregnant vratis.",
            },
          },
        ],
        sources: ["et-vrat-rules", "wikipedia"],
        visualDescription: {
          hi: "रात का आँगन, एक दीया जल रहा है। ऊपर एक चित्रित समय-रेखा खरना की रात से उषा अर्घ्य तक के 36 घंटे दिखाती है।",
          en: "The courtyard at night with a single diya. An illustrated timeline shows the 36 hours from Kharna night to Usha Arghya.",
        },
      },
    ],
  },

  // ───────────────────────────── DAY 3 ─────────────────────────────
  {
    id: 3,
    slug: "sandhya-arghya",
    title: { hi: "संध्या अर्घ्य", en: "Sandhya Arghya" },
    subtitle: { hi: "तीसरा दिन", en: "Day three" },
    theme: { hi: "अस्त होते सूर्य को अर्घ्य", en: "Offering to the setting sun" },
    tithi: { hi: "कार्तिक शुक्ल षष्ठी", en: "Kartik Shukla Shashthi" },
    date2026: "2026-11-15",
    accent: "#E97824",
    environment: "ghat",
    description: {
      hi: "छठ का मुख्य दिन। दिन में ठेकुआ बनता है, सूप-दउरा सजते हैं, और संध्या को परिवार घाट पर जाकर डूबते सूर्य को अर्घ्य देता है — ऐसा पर्व, जिसमें अस्त होते सूर्य की भी उपासना होती है।",
      en: "The main day. Thekua is made, soops and dauras are arranged, and at dusk the family goes to the ghat to offer arghya to the setting sun — a festival in which even the setting sun is worshipped.",
    },
    timeControl: { kind: "slider", min: 14, max: 18.3, label: { hi: "सूर्य की स्थिति", en: "Sun position" } },
    ritualObjects: ["soop", "daura", "thekua", "coconut", "fruits", "banana", "sugarcane", "diya", "kalash", "arghya", "ghat"],
    culturalNotes: [
      {
        kind: "symbolism",
        text: {
          hi: "उगते सूर्य की पूजा कई परंपराओं में होती है; छठ में डूबते सूर्य को भी अर्घ्य दिया जाता है। कई लोग इसे जीवन के हर पड़ाव के प्रति कृतज्ञता के रूप में देखते हैं।",
          en: "Many traditions honour the rising sun; Chhath also offers arghya to the setting sun. Many people see this as gratitude for every phase of life.",
        },
      },
      {
        kind: "belief",
        text: {
          hi: "छठी मइया को संतान की रक्षा करने वाली और सुख-समृद्धि देने वाली देवी माना जाता है। उनकी पहचान को लेकर अलग-अलग मान्यताएँ प्रचलित हैं — जैसे षष्ठी देवी के रूप में, या सूर्य से जुड़ी देवी के रूप में।",
          en: "Chhathi Maiya is believed to protect children and grant well-being. Different beliefs about her identity are current — for example as Shashthi Devi, or as a goddess associated with Surya.",
        },
        sources: ["sahapedia", "wikipedia"],
      },
    ],
    scenes: [
      {
        id: "soop-ki-taiyari",
        index: 0,
        title: { hi: "प्रसाद और सूप की तैयारी", en: "Preparing prasad and soop" },
        caption: { hi: "ठेकुआ, फल, नारियल — सूप सजता है।", en: "Thekua, fruit, coconut — the soop is arranged." },
        stage: { environment: "courtyard", timeOfDay: 13.4, camera: "courtyard-kitchen", closeCamera: "courtyard-stove", animation: "arrange-soop", duration: 14 },
        what: {
          hi: "सुबह से ठेकुआ बन रहे हैं। दोपहर में बाँस के सूप और दउरे में ठेकुआ, नारियल, केले, डाभ नींबू, सिंघाड़ा, गन्ना और अन्य मौसमी फल सजाए जा रहे हैं।",
          en: "Thekua have been fried since morning. In the afternoon bamboo soops and dauras are filled with thekua, coconut, bananas, citron, water chestnut, sugarcane and other seasonal produce.",
        },
        why: {
          hi: "सूप ही अर्घ्य की थाली है। मौसमी उपज और घर में बना प्रसाद अर्पित करना छठ की पहचान है।",
          en: "The soop is the arghya tray. Offering seasonal produce and home-made prasad is the hallmark of Chhath.",
        },
        how: {
          hi: [
            "ठेकुआ: आटा, गुड़, घी — साँचे पर छापकर तलना।",
            "फल पूरे, बिना काटे रखे जाते हैं।",
            "हर सूप में एक दीया; कई घरों में सिंदूर और पीला/लाल कपड़ा।",
            "सारे सूप दउरे में रखकर ढके जाते हैं।",
          ],
          en: [
            "Thekua: flour, jaggery, ghee — pressed on a mould and fried.",
            "Fruit is kept whole, never cut.",
            "A diya in each soop; in many homes sindoor and a yellow/red cloth.",
            "All soops are placed in the daura and covered.",
          ],
        },
        when: { hi: "तीसरे दिन सुबह से दोपहर तक।", en: "Day three, morning to afternoon." },
        objects: ["thekua", "soop", "daura", "coconut", "fruits", "banana", "sugarcane"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "कसार (चावल के आटे और गुड़ के लड्डू) कई परिवारों में बनते हैं, कई में नहीं। सूपों की संख्या भी अक्सर परिवार की मन्नत से तय होती है।",
              en: "Kasar (rice-flour and jaggery laddoos) is made in many families but not all. The number of soops is often set by a family's vow.",
            },
            sources: ["hindutone-prasad"],
          },
        ],
        sources: ["hindutone-prasad", "gac"],
        visualDescription: {
          hi: "आँगन में चटाई पर कई सूप सजे हैं: ठेकुआ, नारियल, केले, बड़े नींबू, गन्ने के टुकड़े, और बीच में दीया।",
          en: "Several soops are laid out on a mat in the courtyard: thekua, coconut, bananas, large citrons, sugarcane pieces and a diya in the middle.",
        },
      },
      {
        id: "ghat-ki-or",
        index: 1,
        title: { hi: "घाट की ओर प्रस्थान", en: "Setting out for the ghat" },
        caption: { hi: "सिर पर दउरा, होंठों पर छठ गीत।", en: "Daura on the head, Chhath songs on the lips." },
        stage: { environment: "ghat", timeOfDay: 15.2, camera: "ghat-path", animation: "procession", duration: 14 },
        what: {
          hi: "परिवार दउरा, गन्ने और कलश लेकर घाट की ओर चलता है। आगे व्रती, साथ में पूरा परिवार; महिलाएँ छठ के लोकगीत गाती हैं।",
          en: "The family walks to the ghat with the daura, sugarcane and kalash. The vrati leads, the family follows; women sing Chhath folk songs.",
        },
        why: {
          hi: "प्रसाद को घर से घाट तक श्रद्धा से ले जाना स्वयं एक पूजा है — इसमें परिवार का हर सदस्य सहभागी बनता है।",
          en: "Carrying the prasad from home to ghat is itself an act of worship — every family member takes part.",
        },
        how: {
          hi: [
            "कई परिवारों में पुरुष दउरा सिर पर उठाते हैं।",
            "कई व्रती नंगे पाँव चलते हैं।",
            "कुछ व्रती मन्नत के अनुसार दंडवत (लेट-लेटकर प्रणाम करते हुए) घाट तक जाते हैं।",
          ],
          en: [
            "In many families the men carry the daura on their heads.",
            "Many vratis walk barefoot.",
            "Some vratis, fulfilling a vow, go to the ghat by repeated full prostrations (dandvat).",
          ],
        },
        when: { hi: "तीसरे दिन दोपहर बाद, सूर्यास्त से पहले।", en: "Afternoon of day three, before sunset." },
        objects: ["daura", "sugarcane", "kalash"],
        regionalNotes: [
          {
            kind: "practice",
            text: {
              hi: "‘काँच ही बाँस के बहँगिया’ और ‘केलवा के पात पर’ जैसे पारंपरिक गीत इस यात्रा के साथ गाए जाते हैं। ये लोकगीत भोजपुरी, मगही और मैथिली क्षेत्रों में अपने-अपने रूपों में गाए जाते हैं।",
              en: "Traditional songs such as ‘Kaanch hi baans ke bahangiya’ and ‘Kelwa ke paat par’ accompany this walk, sung in their own forms across Bhojpuri, Magahi and Maithili regions.",
            },
          },
        ],
        sources: ["gac", "wikipedia"],
        visualDescription: {
          hi: "दोपहर की सुनहरी रोशनी में एक परिवार गाँव के रास्ते से घाट की ओर जा रहा है; एक पुरुष के सिर पर ढका हुआ दउरा है, एक व्यक्ति गन्ने लिए है।",
          en: "In golden afternoon light a family walks a village path to the ghat; a man carries a covered daura on his head, another holds sugarcane.",
        },
      },
      {
        id: "ghat-par-taiyari",
        index: 2,
        title: { hi: "घाट पर तैयारी", en: "Preparing at the ghat" },
        caption: { hi: "अपनी जगह, अपनी वेदी।", en: "A family spot, a small altar." },
        stage: { environment: "ghat", timeOfDay: 16.0, camera: "ghat-steps", animation: "ghat-arrange", duration: 12 },
        what: {
          hi: "घाट पर परिवार अपनी जगह पर दउरा उतारता है, सूप सजाता है, दीये जलाता है और गन्ने खड़े करता है।",
          en: "At the ghat the family sets down the daura at its spot, arranges the soops, lights diyas and stands sugarcane upright.",
        },
        why: {
          hi: "घाट सामूहिक पूजा का स्थान है; हर परिवार की छोटी-सी वेदी मिलकर पूरे तट को दीयों और प्रसाद से सजा देती है।",
          en: "The ghat is a shared place of worship; every family's small altar together dresses the whole bank in lamps and offerings.",
        },
        how: {
          hi: ["घाट पहले से समुदाय द्वारा साफ़ और सजाया गया होता है।", "मिट्टी की छोटी वेदी या चिह्नित स्थान।", "सूप सजाकर दीये जलाना।"],
          en: ["The ghat has been cleaned and decorated by the community beforehand.", "A small clay altar or marked spot.", "Arranging soops and lighting diyas."],
        },
        when: { hi: "सूर्यास्त से लगभग एक-डेढ़ घंटा पहले।", en: "About an hour or so before sunset." },
        objects: ["ghat", "soop", "diya", "sugarcane", "kalash"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "जहाँ नदी दूर है, वहाँ तालाब, बनाए गए कुंड या घर की छत पर पानी भरकर अर्घ्य दिया जाता है — विदेशों में बसे परिवार भी यही करते हैं।",
              en: "Where no river is near, ponds, purpose-built pools or water tanks on rooftops are used — as do families settled abroad.",
            },
          },
        ],
        sources: ["gac", "britannica"],
        visualDescription: {
          hi: "घाट की सीढ़ियों पर कई परिवारों के सूप और दउरे, बीच-बीच में दीये और खड़े गन्ने। पीछे नदी पर सूरज नीचे उतर रहा है।",
          en: "On the ghat steps are many families' soops and dauras, with diyas and standing sugarcane among them. Behind, the sun descends over the river.",
        },
      },
      {
        id: "jal-me-vrati",
        index: 3,
        title: { hi: "जल में खड़े व्रती", en: "Vratis standing in water" },
        caption: { hi: "सूर्य की ओर मुख, जल में खड़े।", en: "Standing in water, facing the sun." },
        stage: { environment: "ghat", timeOfDay: 16.6, camera: "ghat-water", closeCamera: "ghat-closeup", animation: "stand-in-water", duration: 12 },
        what: {
          hi: "व्रती नदी में उतरकर, कमर तक या उससे कम पानी में, डूबते सूर्य की ओर मुख करके खड़े होते हैं और प्रार्थना करते हैं।",
          en: "The vrati steps into the river, in water up to the waist or less, faces the setting sun and prays.",
        },
        why: {
          hi: "जल और सूर्य — दोनों प्रकृति के आधार — छठ के केंद्र में हैं। जल में खड़े होकर अर्घ्य देना इस पर्व की सबसे पहचानी जाने वाली छवि है।",
          en: "Water and sun — two foundations of nature — are at the centre of Chhath. Offering arghya while standing in water is the festival's most recognised image.",
        },
        how: {
          hi: ["स्नान कर जल में प्रवेश।", "सूर्य की ओर मुख करके हाथ जोड़कर प्रार्थना।", "कई व्रती जल में कुछ देर खड़े रहकर सूर्य के अस्त होने की प्रतीक्षा करते हैं।"],
          en: ["Entering the water after bathing.", "Facing the sun with folded hands in prayer.", "Many vratis wait in the water for some time as the sun sets."],
        },
        when: { hi: "सूर्यास्त से कुछ पहले।", en: "Shortly before sunset." },
        objects: ["arghya", "ghat"],
        regionalNotes: [],
        sources: ["wikipedia", "britannica"],
        visualDescription: {
          hi: "नदी में कई व्रती, पीली-नारंगी साड़ियों में, सूर्य की ओर मुख किए खड़े हैं। उनके चारों ओर पानी में हल्की लहरें फैल रही हैं।",
          en: "Several vratis in yellow and saffron sarees stand in the river facing the sun. Gentle ripples spread around them.",
        },
      },
      {
        id: "sandhya-arghya",
        index: 4,
        title: { hi: "संध्या अर्घ्य", en: "The evening arghya" },
        caption: { hi: "सूप थामे व्रती, लोटे से जल-दूध की धार।", en: "The vrati holds the soop; water and milk flow from the lota." },
        stage: { environment: "ghat", timeOfDay: 16.92, camera: "ghat-closeup", closeCamera: "ghat-closeup", animation: "arghya", duration: 14 },
        what: {
          hi: "व्रती प्रसाद से भरा सूप दोनों हाथों में थामकर डूबते सूर्य की ओर करते हैं। परिवारजन और श्रद्धालु लोटे से सूप के आगे जल या दूध की धार अर्पित करते हैं।",
          en: "The vrati holds the prasad-filled soop in both hands towards the setting sun. Family members and devotees pour a stream of water or milk from a lota in front of it.",
        },
        why: {
          hi: "मान्यता है कि यह सूर्य देव और छठी मइया के प्रति कृतज्ञता और परिवार के कल्याण की प्रार्थना है।",
          en: "It is believed to be gratitude to Surya and Chhathi Maiya and a prayer for the family's well-being.",
        },
        how: {
          hi: [
            "एक-एक कर हर सूप से अर्घ्य दिया जाता है।",
            "लोटे से जल या दूध की धार सूप के सामने से।",
            "कई व्रती अर्घ्य के बाद जल में ही परिक्रमा की तरह घूमकर प्रणाम करते हैं — यह रीति हर जगह नहीं है।",
          ],
          en: [
            "Arghya is offered with each soop in turn.",
            "Water or milk is poured from a lota in front of the soop.",
            "Some vratis turn around in the water in obeisance after the arghya — this is not done everywhere.",
          ],
        },
        when: { hi: "सूर्यास्त के समय (2026 में पटना के आसपास लगभग 5 बजे)।", en: "At sunset (around 5 pm near Patna in 2026)." },
        objects: ["soop", "arghya", "coconut", "fruits", "thekua", "diya"],
        regionalNotes: [
          {
            kind: "care",
            text: {
              hi: "इस दृश्य में हाथों की मुद्रा सरल रखी गई है: सूप दोनों हाथों में, सूर्य की ओर। हमने कोई विशेष विधि-मुद्रा नहीं गढ़ी है।",
              en: "Hand positions here are kept simple: the soop held in both hands, towards the sun. No special ritual gesture has been invented.",
            },
          },
        ],
        sources: ["wikipedia", "britannica", "gac"],
        visualDescription: {
          hi: "नज़दीकी दृश्य: जल में खड़ी व्रती दोनों हाथों में सजा सूप थामे हैं। पास खड़ा परिजन लोटे से जल की धार गिरा रहा है। पीछे लाल सूरज क्षितिज छू रहा है।",
          en: "Close-up: a vrati in the water holds a laden soop in both hands. A family member pours a stream from a lota. Behind, a red sun touches the horizon.",
        },
      },
      {
        id: "sandhya-samapan",
        index: 5,
        title: { hi: "संध्या का समापन", en: "Close of the evening" },
        caption: { hi: "दीयों से भरा घाट, लौटते परिवार।", en: "A ghat full of lamps, families returning." },
        stage: { environment: "ghat", timeOfDay: 17.7, camera: "ghat-wide", animation: "evening-close", duration: 12 },
        what: {
          hi: "सूर्य अस्त हो चुका है, आकाश गहराता है और घाट दीयों से जगमगा उठता है। परिवार सामान समेटकर घर लौटते हैं; व्रत अब भी जारी है।",
          en: "The sun has set, the sky deepens and the ghat glows with lamps. Families gather their things and return home; the fast continues.",
        },
        why: {
          hi: "अगली भोर उषा अर्घ्य होगा। रात भर व्रत और प्रतीक्षा — छठ की ये घड़ियाँ लोक-स्मृति में गहराई से बसी हैं।",
          en: "Usha Arghya will come at dawn. The night of fasting and waiting is deeply rooted in folk memory.",
        },
        how: {
          hi: [
            "दीये जलते छोड़कर या जल में प्रवाहित कर परिवार लौटते हैं (प्रवाह की रीति स्थानीय नियमों पर भी निर्भर)।",
            "कुछ परिवार घर लौटकर आँगन या छत पर ‘कोसी भरते’ हैं — गन्नों का मंडप, नीचे दीये और प्रसाद।",
            "रात में छठ गीत गाए जाते हैं।",
          ],
          en: [
            "Families return, leaving lamps lit or floating them on the water (floating depends on local rules too).",
            "Some families ‘fill the kosi’ at home — a canopy of sugarcane with diyas and prasad beneath it.",
            "Chhath songs are sung into the night.",
          ],
        },
        when: { hi: "सूर्यास्त के बाद, रात भर।", en: "After sunset, through the night." },
        objects: ["diya", "sugarcane"],
        regionalNotes: [
          {
            kind: "variation",
            region: { hi: "कोसी भरना", en: "Kosi bharna" },
            text: {
              hi: "कोसी भरना मुख्यतः उन परिवारों में होता है जिनकी कोई मन्नत पूरी हुई हो; यह हर घर की परंपरा नहीं है।",
              en: "Kosi bharna is mainly performed by families whose vow has been fulfilled; it is not every household's tradition.",
            },
          },
        ],
        sources: ["gac", "wikipedia"],
        visualDescription: {
          hi: "गहरे नीले आकाश के नीचे घाट की सीढ़ियाँ और पानी का किनारा सैकड़ों दीयों से चमक रहा है। एक ओर गन्नों का कोसी-मंडप है।",
          en: "Under a deep blue sky, the ghat steps and waterline shine with hundreds of diyas. On one side stands a kosi canopy of sugarcane.",
        },
      },
    ],
  },

  // ───────────────────────────── DAY 4 ─────────────────────────────
  {
    id: 4,
    slug: "usha-arghya",
    title: { hi: "उषा अर्घ्य", en: "Usha Arghya" },
    subtitle: { hi: "चौथा दिन", en: "Day four" },
    theme: { hi: "उगते सूर्य से नई आशा", en: "New hope with the rising sun" },
    tithi: { hi: "कार्तिक शुक्ल सप्तमी", en: "Kartik Shukla Saptami" },
    date2026: "2026-11-16",
    accent: "#F6B93B",
    environment: "ghat",
    description: {
      hi: "भोर से पहले परिवार फिर घाट पहुँचते हैं। व्रती जल में खड़े होकर उगते सूर्य की प्रतीक्षा करते हैं और पहली किरण के साथ अर्घ्य देते हैं। इसके बाद पारण — व्रत का समापन — और प्रसाद का वितरण होता है।",
      en: "Before dawn families return to the ghat. Standing in the water, the vrati awaits the rising sun and offers arghya with its first rays. Then comes paran — the end of the fast — and the sharing of prasad.",
    },
    timeControl: { kind: "scroll", min: 3.9, max: 7.4, label: { hi: "स्क्रॉल से सूर्योदय", en: "Scroll to raise the sun" } },
    ritualObjects: ["soop", "daura", "arghya", "prasad", "thekua", "diya", "fruits", "ghat"],
    culturalNotes: [
      {
        kind: "symbolism",
        text: {
          hi: "डूबते और उगते — दोनों सूर्यों को अर्घ्य देकर व्रत पूरा होता है। बहुत लोग इसे अंत और आरंभ, दोनों के सम्मान के रूप में देखते हैं।",
          en: "The vrat is complete only with arghya to both the setting and the rising sun. Many see this as honouring both endings and beginnings.",
        },
      },
    ],
    scenes: [
      {
        id: "bhor-ki-taiyari",
        index: 0,
        title: { hi: "भोर की तैयारी", en: "Before dawn" },
        caption: { hi: "अँधेरे में फिर से दउरा उठता है।", en: "In the dark, the daura is lifted again." },
        stage: { environment: "courtyard", timeOfDay: 3.9, camera: "courtyard-night", animation: "dawn-gather", duration: 10 },
        what: {
          hi: "रात के अंतिम पहर में परिवार उठकर सूप में ताज़ा प्रसाद और फल सजाता है, दीये तैयार करता है और फिर से घाट जाने को एकत्र होता है।",
          en: "In the last hours of night the family rises, refreshes the soops with prasad and fruit, readies diyas and gathers to go to the ghat once more.",
        },
        why: {
          hi: "उषा अर्घ्य सूर्योदय के क्षण में होता है, इसलिए घाट पर सूर्य निकलने से पहले पहुँचना ज़रूरी है।",
          en: "Usha Arghya happens at the moment of sunrise, so the family must reach the ghat before the sun appears.",
        },
        how: {
          hi: ["सूप में प्रसाद को फिर से सजाना।", "दउरा, दीये, कलश तैयार।", "ठंडी कार्तिक भोर में शॉल-चादर के साथ प्रस्थान।"],
          en: ["Re-arranging prasad in the soops.", "Daura, diyas and kalash readied.", "Setting out in the chilly Kartik dawn with shawls."],
        },
        when: { hi: "चौथे दिन सुबह लगभग 3–4 बजे।", en: "Around 3–4 am on day four." },
        objects: ["daura", "soop", "diya"],
        regionalNotes: [],
        sources: ["gac", "wikipedia"],
        visualDescription: {
          hi: "अँधेरा आँगन, दीयों की हल्की रोशनी में परिवार सूप सजा रहा है।",
          en: "A dark courtyard; by soft lamplight the family arranges the soops.",
        },
      },
      {
        id: "ghat-par-aagman",
        index: 1,
        title: { hi: "घाट पर आगमन", en: "Arriving at the ghat" },
        caption: { hi: "कोहरे में दीयों की कतार।", en: "A line of lamps in the mist." },
        stage: { environment: "ghat", timeOfDay: 4.9, camera: "ghat-path", animation: "dawn-arrive", duration: 12 },
        what: {
          hi: "कोहरे से ढके घाट पर परिवार अपनी जगह पहुँचते हैं, दीये जलाते हैं। व्रती जल में उतरकर पूर्व दिशा की ओर मुख करके खड़े हो जाते हैं।",
          en: "Families reach their spots on the mist-covered ghat and light diyas. The vrati enters the water and stands facing east.",
        },
        why: {
          hi: "सूर्योदय की प्रतीक्षा जल में खड़े होकर ही की जाती है — यह प्रतीक्षा भी व्रत का अंग है।",
          en: "The wait for sunrise is spent standing in the water — the waiting itself is part of the vrat.",
        },
        how: {
          hi: ["सूप-दउरा पिछली शाम वाली जगह पर।", "दीये जलाना।", "व्रती जल में, पूर्व की ओर मुख।"],
          en: ["Soops and daura at the previous evening's spot.", "Lighting diyas.", "The vrati in the water, facing east."],
        },
        when: { hi: "सूर्योदय से लगभग एक घंटा पहले।", en: "About an hour before sunrise." },
        objects: ["ghat", "diya"],
        regionalNotes: [],
        sources: ["gac"],
        visualDescription: {
          hi: "नीले-धूसर कोहरे में घाट; पानी के किनारे दीयों की कतार; दूर व्रतियों की आकृतियाँ।",
          en: "The ghat in blue-grey mist; a row of diyas at the waterline; distant figures of vratis.",
        },
      },
      {
        id: "usha-arghya",
        index: 2,
        title: { hi: "उषा अर्घ्य", en: "The dawn arghya" },
        caption: { hi: "पहली किरण के साथ अर्घ्य।", en: "Arghya with the first ray." },
        stage: { environment: "ghat", timeOfDay: 6.05, camera: "ghat-closeup", closeCamera: "ghat-closeup", animation: "usha-arghya", duration: 14 },
        what: {
          hi: "क्षितिज पर सूर्य दिखते ही व्रती सूप थामकर उगते सूर्य को अर्घ्य देते हैं; परिजन लोटे से जल या दूध अर्पित करते हैं।",
          en: "As the sun appears on the horizon, the vrati holds up the soop to the rising sun; family members offer water or milk from a lota.",
        },
        why: {
          hi: "मान्यता है कि उगते सूर्य को अर्घ्य देकर व्रती नए दिन, स्वास्थ्य और परिवार की ख़ुशहाली की प्रार्थना करते हैं — इसी से व्रत पूर्ण होता है।",
          en: "It is believed that by offering arghya to the rising sun the vrati prays for a new day, health and the family's happiness — and with it the vrat is fulfilled.",
        },
        how: {
          hi: ["सूर्योदय के क्षण में, संध्या अर्घ्य की ही तरह।", "हर सूप से अर्घ्य।", "प्रार्थना और प्रणाम।"],
          en: ["At the moment of sunrise, as in the evening arghya.", "Arghya with each soop.", "Prayer and obeisance."],
        },
        when: { hi: "सूर्योदय (2026 में पटना के आसपास लगभग 6 बजे)।", en: "Sunrise (around 6 am near Patna in 2026)." },
        objects: ["soop", "arghya", "fruits", "thekua"],
        regionalNotes: [
          {
            kind: "variation",
            text: {
              hi: "कोहरे में कभी सूर्य देर से दिखता है; तब व्रती पंचांग के सूर्योदय-समय या सूर्य दिखने तक प्रतीक्षा करते हैं — यह परिवार की रीति पर निर्भर है।",
              en: "In fog the sun may appear late; vratis then go by the almanac's sunrise time or wait until it is seen — depending on family custom.",
            },
          },
        ],
        sources: ["wikipedia", "britannica"],
        visualDescription: {
          hi: "पूर्व में सुनहरा सूर्य कोहरे से उठ रहा है। जल में खड़ी व्रती सूप थामे हैं, लोटे से जल की धार गिर रही है, नदी पर सुनहरी रेखा।",
          en: "A golden sun rises through the mist in the east. A vrati in the water holds the soop as water flows from a lota; a golden path lies across the river.",
        },
      },
      {
        id: "ashirwad-prasad",
        index: 3,
        title: { hi: "आशीर्वाद और प्रसाद", en: "Blessings and prasad" },
        caption: { hi: "व्रती से आशीर्वाद, सबको प्रसाद।", en: "Blessings from the vrati, prasad for all." },
        stage: { environment: "ghat", timeOfDay: 6.6, camera: "ghat-steps", animation: "blessing", duration: 12 },
        what: {
          hi: "अर्घ्य के बाद व्रती घाट पर पूजा पूरी करते हैं। परिवार के लोग व्रती के पैर छूकर आशीर्वाद लेते हैं और घाट पर आए लोगों में प्रसाद बँटता है।",
          en: "After the arghya the vrati completes the worship at the ghat. Family members touch the vrati's feet for blessings and prasad is shared with those at the ghat.",
        },
        why: {
          hi: "व्रती को इस समय विशेष आदर से देखा जाता है; उनसे प्रसाद और आशीर्वाद पाना शुभ माना जाता है।",
          en: "Vratis are held in special respect at this moment; receiving prasad and blessings from them is considered auspicious.",
        },
        how: {
          hi: ["परिवारजन व्रती को प्रणाम करते हैं।", "ठेकुआ और फल का प्रसाद बँटता है।", "कई विवाहित महिलाएँ इस अवसर पर नाक से माँग तक लंबा सिंदूर लगाती हैं।"],
          en: ["Family members bow to the vrati.", "Thekua and fruit are shared as prasad.", "Many married women wear long sindoor from the nose to the hair parting on this occasion."],
        },
        when: { hi: "उषा अर्घ्य के तुरंत बाद।", en: "Right after Usha Arghya." },
        objects: ["prasad", "thekua"],
        regionalNotes: [],
        sources: ["gac", "hindutone-prasad"],
        visualDescription: {
          hi: "सुबह की गुलाबी-सुनहरी रोशनी में घाट की सीढ़ियाँ; एक युवा व्रती को प्रणाम कर रहा है, बच्चों को ठेकुआ दिया जा रहा है।",
          en: "The ghat steps in rosy-gold morning light; a young man bows to the vrati, children receive thekua.",
        },
      },
      {
        id: "paran",
        index: 4,
        title: { hi: "पारण", en: "Paran — breaking the fast" },
        caption: { hi: "व्रत पूर्ण।", en: "The vrat is complete." },
        stage: { environment: "ghat", timeOfDay: 7.3, camera: "ghat-wide", animation: "paran", duration: 12 },
        what: {
          hi: "उषा अर्घ्य और पूजा के बाद व्रती प्रसाद ग्रहण करके लगभग 36 घंटे का निर्जला व्रत तोड़ते हैं। इसे पारण कहते हैं।",
          en: "After Usha Arghya and the puja, the vrati eats prasad and ends the roughly 36-hour waterless fast. This is called paran.",
        },
        why: {
          hi: "पारण के साथ चार दिनों का संकल्प पूरा होता है। प्रसाद को घर, पड़ोस और रिश्तेदारों तक पहुँचाना पर्व की समापन-ख़ुशी है।",
          en: "With paran the four-day vow is complete. Taking prasad to home, neighbours and relatives is the closing joy of the festival.",
        },
        how: {
          hi: [
            "पारण घाट पर या घर लौटकर — परिवार की रीति अनुसार।",
            "व्रती प्रसाद और जल/शरबत से व्रत खोलते हैं; पहले क्या लिया जाए, यह परिवार-परिवार में अलग है।",
            "फिर हल्का, सादा भोजन।",
          ],
          en: [
            "Paran at the ghat or after returning home — by family custom.",
            "The vrati breaks the fast with prasad and water or sherbet; what is taken first differs between families.",
            "Then a light, simple meal.",
          ],
        },
        when: { hi: "उषा अर्घ्य के बाद, चौथे दिन सुबह।", en: "Morning of day four, after Usha Arghya." },
        objects: ["prasad", "thekua", "fruits"],
        regionalNotes: [
          {
            kind: "care",
            text: {
              hi: "लंबे निर्जला व्रत के बाद परिवार व्रती को धीरे-धीरे और हल्का आहार देते हैं।",
              en: "After a long waterless fast, families help the vrati eat slowly and lightly.",
            },
          },
        ],
        sources: ["et-vrat-rules", "hindutone-prasad"],
        visualDescription: {
          hi: "पूरा दृश्य: नदी के ऊपर उठ चुका सूर्य, सुनहरा पानी, घाट पर लौटने की तैयारी करते परिवार।",
          en: "Wide view: the sun risen above the river, golden water, families preparing to return.",
        },
      },
    ],
  },
];

export const daysBySlug: Record<string, Day> = Object.fromEntries(days.map((d) => [d.slug, d]));
export const daySlugs = days.map((d) => d.slug);
