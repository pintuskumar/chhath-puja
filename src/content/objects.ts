import type { RitualObject } from "./types";

/**
 * Ritual objects, offerings and ingredients.
 * Wording rules used throughout:
 *  - "मान्यता है / it is believed" marks religious belief.
 *  - "प्रतीक / symbolises" marks cultural symbolism (an interpretation, not a fact claim).
 *  - "कई परिवारों में / in many families" marks practice that is common but not universal.
 * No health or "scientific" benefits are claimed.
 */
export const ritualObjects: RitualObject[] = [
  {
    id: "soop",
    hindiName: "सूप",
    englishName: "Soop (bamboo winnowing tray)",
    regionalNames: [
      { name: "सुपली", note: { hi: "छोटे सूप के लिए कई जगह प्रयुक्त", en: "Used in many places for a smaller soop" } },
    ],
    category: "vessel",
    model: "soop",
    description: {
      hi: "बाँस की पतली पट्टियों से बुना हुआ चौड़ा, एक तरफ़ खुला सूप — घरों में अनाज फटकने का यही बरतन छठ में अर्घ्य की थाली बन जाता है।",
      en: "A wide bamboo tray woven from thin strips, open on one side — the household winnowing tray that becomes the arghya tray in Chhath.",
    },
    whenUsed: {
      hi: "तीसरे दिन संध्या अर्घ्य और चौथे दिन उषा अर्घ्य में।",
      en: "At Sandhya Arghya on day three and Usha Arghya on day four.",
    },
    usage: {
      hi: "सूप में ठेकुआ, फल, नारियल, दीया आदि सजाए जाते हैं। व्रती जल में खड़े होकर सूप को सूर्य की ओर थामते हैं और परिजन लोटे से जल या दूध का अर्घ्य देते हैं।",
      en: "Thekua, fruit, coconut and a diya are arranged in it. The vrati holds it towards the sun while standing in water, and family members pour water or milk from a lota as arghya.",
    },
    significance: {
      hi: "रोज़मर्रा की खेती-किसानी के बरतन का पूजा में उपयोग छठ के प्रकृति और फ़सल से जुड़े स्वरूप का प्रतीक माना जाता है। कुछ परिवार पीतल का सूप भी प्रयोग करते हैं।",
      en: "Using an everyday farm implement in worship is widely seen as symbolising Chhath's closeness to nature and the harvest. Some families also use a brass soop.",
    },
    significanceKind: "symbolism",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["gac", "wikipedia", "hindutone-prasad"],
  },
  {
    id: "daura",
    hindiName: "दउरा",
    englishName: "Daura (bamboo basket)",
    regionalNames: [{ name: "डाला / दौरा", note: { hi: "कई क्षेत्रों में प्रचलित उच्चारण", en: "Pronunciations heard in several regions" } }],
    category: "vessel",
    model: "daura",
    description: {
      hi: "बाँस की बड़ी गोल टोकरी, जिसमें सारे सूप, प्रसाद और फल रखकर घाट तक ले जाए जाते हैं।",
      en: "A large round bamboo basket in which all the soops, prasad and fruit are carried to the ghat.",
    },
    whenUsed: {
      hi: "तीसरे दिन दोपहर बाद घाट जाते समय और चौथे दिन भोर में।",
      en: "When leaving for the ghat on the afternoon of day three, and again before dawn on day four.",
    },
    usage: {
      hi: "कई परिवारों में घर के पुरुष दउरा सिर पर रखकर घाट तक ले जाते हैं; रास्ते में इसे भूमि पर न रखने का ध्यान रखा जाता है। पारंपरिक रूप से इसे बहँगी (बाँस का कंधे पर रखा डंडा) पर भी ढोया जाता है।",
      en: "In many families the men carry the daura on their heads to the ghat, taking care not to set it down on the way. Traditionally it may also be carried on a bahangi (a bamboo shoulder pole).",
    },
    significance: {
      hi: "दउरा उठाना परिवार की ओर से व्रत में सहभागिता और सेवा माना जाता है। प्रसिद्ध लोकगीत ‘काँच ही बाँस के बहँगिया’ इसी यात्रा से जुड़ा है।",
      en: "Carrying the daura is regarded as the family's service and share in the vrat. The well-known folk song ‘Kaanch hi baans ke bahangiya’ is about this journey.",
    },
    significanceKind: "practice",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["gac", "wikipedia"],
  },
  {
    id: "thekua",
    hindiName: "ठेकुआ",
    englishName: "Thekua",
    regionalNames: [{ name: "खजूरिया", note: { hi: "कुछ क्षेत्रों में प्रयुक्त नाम", en: "Name used in some areas" } }],
    category: "food",
    model: "thekua",
    description: {
      hi: "गेहूँ के आटे, गुड़ (या चीनी) और घी से बना, साँचे पर छाप देकर घी या तेल में तला हुआ कड़क प्रसाद।",
      en: "A firm prasad of wheat flour, jaggery (or sugar) and ghee, pressed on a carved mould and fried in ghee or oil.",
    },
    whenUsed: {
      hi: "तीसरे दिन सुबह से बनाया जाता है और दोनों अर्घ्य में चढ़ाया जाता है।",
      en: "Made from the morning of day three and offered at both arghyas.",
    },
    usage: {
      hi: "आटा गूँथकर लकड़ी के साँचे पर दबाया जाता है, जिससे सुंदर आकृति बनती है। कई घरों में यह नए चूल्हे पर आम की लकड़ी से बनता है।",
      en: "The dough is pressed onto a wooden mould that leaves a pattern. In many homes it is cooked on a fresh clay stove with mango wood.",
    },
    significance: {
      hi: "ठेकुआ छठ का सबसे पहचाना जाने वाला प्रसाद है; घाट से लौटकर इसे परिवार, पड़ोसियों और मित्रों में बाँटना पर्व की आत्मीयता का हिस्सा है।",
      en: "Thekua is the most recognisable Chhath prasad; sharing it with family, neighbours and friends after the ghat is part of the festival's warmth.",
    },
    significanceKind: "practice",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["hindutone-prasad", "ndtv-food"],
  },
  {
    id: "coconut",
    hindiName: "नारियल",
    englishName: "Coconut",
    category: "offering",
    model: "coconut",
    description: {
      hi: "जटा सहित पूरा नारियल, जिसे सूप में प्रमुख स्थान पर रखा जाता है।",
      en: "A whole coconut, often with its husk fibre, given a central place in the soop.",
    },
    whenUsed: { hi: "संध्या और उषा अर्घ्य में।", en: "At the evening and morning arghya." },
    usage: {
      hi: "सूप या दउरा में फलों के साथ रखा जाता है; कई परिवार इस पर सिंदूर या लाल कपड़ा भी लगाते हैं।",
      en: "Placed in the soop or daura with the fruit; many families also mark it with sindoor or a red cloth.",
    },
    significance: {
      hi: "भारतीय पूजा-परंपराओं में नारियल को शुभ और पूर्ण अर्पण के रूप में देखा जाता है।",
      en: "Across Indian worship traditions the coconut is seen as an auspicious, complete offering.",
    },
    significanceKind: "symbolism",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["hindutone-prasad"],
  },
  {
    id: "sugarcane",
    hindiName: "गन्ना (ईख)",
    englishName: "Sugarcane",
    category: "plant",
    model: "sugarcane",
    description: {
      hi: "पत्तों सहित पूरे गन्ने, जो घाट और आँगन की सजावट तथा अर्पण दोनों में दिखते हैं।",
      en: "Whole sugarcane stalks with leaves, seen both as offering and as decoration at the ghat and courtyard.",
    },
    whenUsed: { hi: "तीसरे और चौथे दिन।", en: "On days three and four." },
    usage: {
      hi: "गन्ने घाट पर खड़े किए जाते हैं या दउरा के साथ ले जाए जाते हैं। जिन परिवारों में ‘कोसी भरने’ की परंपरा है, वहाँ गन्नों को बाँधकर मंडप बनाया जाता है और उसके नीचे दीये जलाए जाते हैं।",
      en: "Stalks are stood up at the ghat or carried with the daura. Families with the ‘kosi bharna’ tradition tie stalks into a canopy and light diyas beneath it.",
    },
    significance: {
      hi: "नई फ़सल का अर्पण — छठ कार्तिक में खरीफ़ फ़सल के बाद आता है, और मौसमी उपज चढ़ाना इसकी पहचान है।",
      en: "An offering of new harvest — Chhath falls in Kartik after the kharif harvest, and offering seasonal produce is one of its hallmarks.",
    },
    significanceKind: "symbolism",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["hindutone-prasad", "wikipedia"],
  },
  {
    id: "diya",
    hindiName: "दीया",
    englishName: "Diya (clay lamp)",
    category: "light",
    model: "diya",
    description: {
      hi: "मिट्टी का दीया, घी या तेल और रुई की बाती से जलाया जाता है।",
      en: "A clay lamp lit with ghee or oil and a cotton wick.",
    },
    whenUsed: {
      hi: "खरना की संध्या पूजा में, सूप में और घाट पर संध्या से भोर तक।",
      en: "At the Kharna evening puja, in the soop, and at the ghat from dusk to dawn.",
    },
    usage: {
      hi: "सूप में एक दीया रखा जाता है, और घाट की सीढ़ियाँ व पानी का किनारा दीयों से सज जाता है।",
      en: "A diya is placed in the soop, and the ghat steps and waterline are lined with lamps.",
    },
    significance: {
      hi: "दीया पूजा में श्रद्धा और प्रकाश का प्रतीक है; जल में झिलमिलाते दीये घाट की सबसे यादगार छवियों में हैं।",
      en: "The lamp symbolises devotion and light; diyas shimmering on the water are among the most remembered images of the ghat.",
    },
    significanceKind: "symbolism",
    days: ["kharna", "sandhya-arghya", "usha-arghya"],
    sources: ["gac"],
  },
  {
    id: "kalash",
    hindiName: "कलश",
    englishName: "Kalash (ritual pot)",
    category: "vessel",
    model: "kalash",
    description: {
      hi: "मिट्टी या धातु का जल-पात्र, जिसे पूजा स्थल पर स्थापित किया जाता है।",
      en: "A clay or metal water pot set up at the place of worship.",
    },
    whenUsed: {
      hi: "कई परिवारों में खरना पूजा और घाट पर; इसका प्रयोग परिवार की परंपरा पर निर्भर करता है।",
      en: "In many families at the Kharna puja and at the ghat; its use depends on family tradition.",
    },
    usage: {
      hi: "जल भरकर, ऊपर आम के पत्ते रखकर पूजा स्थान पर रखा जाता है। कुछ घाटों पर मिट्टी के हाथी के साथ कलश सजाने की परंपरा भी देखी जाती है।",
      en: "Filled with water and topped with mango leaves at the place of worship. At some ghats a clay elephant decorated with kalash is also seen.",
    },
    significance: {
      hi: "हिंदू पूजा में कलश को मंगल और पूर्णता का प्रतीक माना जाता है।",
      en: "In Hindu worship the kalash is regarded as a symbol of auspiciousness and fullness.",
    },
    significanceKind: "symbolism",
    days: ["kharna", "sandhya-arghya", "usha-arghya"],
    sources: ["gac"],
  },
  {
    id: "fruits",
    hindiName: "मौसमी फल",
    englishName: "Seasonal fruit & produce",
    category: "offering",
    model: "fruits",
    description: {
      hi: "केले का घौद, डाभ नींबू (बड़ा नींबू), सिंघाड़ा, शकरकंद, सुथनी, मूली, अदरक और हल्दी के पौधे जैसी उस मौसम की उपज।",
      en: "Produce of the season such as a bunch of bananas, citron (dabh nimbu), water chestnut, sweet potato, suthni, radish, and fresh ginger and turmeric plants.",
    },
    whenUsed: { hi: "दोनों अर्घ्य में।", en: "At both arghyas." },
    usage: {
      hi: "फल पूरे और बिना काटे सूप व दउरा में सजाए जाते हैं। कौन-से फल रखे जाएँ, यह उपलब्धता और घर की रीति पर निर्भर है।",
      en: "Fruit is offered whole and uncut, arranged in soop and daura. Which items are used depends on availability and household custom.",
    },
    significance: {
      hi: "स्थानीय, मौसमी और सादी उपज का अर्पण छठ को प्रकृति-आधारित पर्व के रूप में पहचान देता है।",
      en: "Offering local, seasonal, simple produce is a defining feature of Chhath as a nature-centred festival.",
    },
    significanceKind: "symbolism",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["hindutone-prasad", "britannica"],
  },
  {
    id: "banana",
    hindiName: "केला",
    englishName: "Banana bunch",
    category: "offering",
    model: "banana",
    description: {
      hi: "केले का पूरा घौद — अक्सर कच्चा या पकने को तैयार — प्रसाद का अनिवार्य-सा हिस्सा।",
      en: "A whole bunch of bananas — often green or just ripening — an almost ever-present part of the offering.",
    },
    whenUsed: { hi: "खरना प्रसाद (कुछ घरों में) और दोनों अर्घ्य।", en: "Kharna prasad (in some homes) and both arghyas." },
    usage: {
      hi: "पूरा घौद दउरा में या सूप के साथ रखा जाता है।",
      en: "The whole bunch is placed in the daura or alongside the soop.",
    },
    significance: {
      hi: "प्रसिद्ध छठ गीत ‘केलवा के पात पर उगेलन सुरुज मल’ में भी केले का उल्लेख है — लोक-स्मृति में इसका गहरा स्थान है।",
      en: "The well-known Chhath song ‘Kelwa ke paat par ugelan suruj mal’ mentions the banana — it holds a deep place in folk memory.",
    },
    significanceKind: "practice",
    days: ["kharna", "sandhya-arghya", "usha-arghya"],
    sources: ["hindutone-prasad"],
  },
  {
    id: "chulha",
    hindiName: "मिट्टी का चूल्हा",
    englishName: "Clay stove (chulha)",
    category: "vessel",
    model: "chulha",
    description: {
      hi: "मिट्टी से बनाया और लीपा गया चूल्हा, जिसमें लकड़ी जलाई जाती है।",
      en: "A stove shaped and plastered from clay, fuelled with wood.",
    },
    whenUsed: {
      hi: "नहाय-खाय का भोजन, खरना प्रसाद और ठेकुआ बनाने में।",
      en: "For the Nahay Khay meal, the Kharna prasad and for frying thekua.",
    },
    usage: {
      hi: "कई परिवार व्रत के लिए नया चूल्हा बनाते हैं या पुराने को अच्छी तरह लीपते हैं, और जलावन के लिए आम की लकड़ी का उपयोग करते हैं। शहरों में अलग रखे गए साफ़ गैस-चूल्हे का भी प्रयोग होता है।",
      en: "Many families build a new stove for the vrat or freshly plaster the old one, and burn mango wood. In cities a separate, cleaned gas stove is also used.",
    },
    significance: {
      hi: "व्रत का भोजन शुद्ध और अलग रसोई में बने — यह छठ की शुद्धता-परंपरा का केंद्र है।",
      en: "That the vrat's food is cooked purely, in a separate space, is central to Chhath's purity practice.",
    },
    significanceKind: "practice",
    days: ["nahay-khay", "kharna"],
    sources: ["et-nahaykhay", "wikipedia"],
  },
  {
    id: "handi",
    hindiName: "पारंपरिक बरतन",
    englishName: "Traditional cooking vessels",
    regionalNames: [
      { name: "हाँडी / बटलोही", note: { hi: "मिट्टी व पीतल के पकाने के बरतन", en: "Clay and brass cooking pots" } },
    ],
    category: "vessel",
    model: "handi",
    description: {
      hi: "मिट्टी की हाँडी, पीतल या काँसे के बरतन — जिन्हें व्रत के भोजन के लिए अलग से धोकर रखा जाता है।",
      en: "Clay pots and brass or bell-metal vessels, washed and kept apart for the vrat's cooking.",
    },
    whenUsed: { hi: "पहले दो दिनों के भोजन और प्रसाद बनाने में।", en: "For the food and prasad of the first two days." },
    usage: {
      hi: "भात, दाल, लौकी और खरना की खीर इन्हीं में पकाई जाती है। कई घरों में नए मिट्टी के बरतन लिए जाते हैं।",
      en: "Rice, dal, bottle gourd and the Kharna kheer are cooked in them. Many households buy new clay pots.",
    },
    significance: {
      hi: "बरतनों को अलग और साफ़ रखना उसी शुद्धता का विस्तार है, जिससे पर्व की शुरुआत होती है।",
      en: "Keeping vessels separate and clean extends the purity with which the festival begins.",
    },
    significanceKind: "practice",
    days: ["nahay-khay", "kharna"],
    sources: ["et-nahaykhay"],
  },
  {
    id: "lota",
    hindiName: "लोटा व जल-पात्र",
    englishName: "Lota & water vessels",
    category: "vessel",
    model: "lota",
    description: {
      hi: "पीतल या ताँबे का लोटा और पानी रखने के घड़े।",
      en: "A brass or copper lota and water pots.",
    },
    whenUsed: { hi: "स्नान, भोजन बनाने और दोनों अर्घ्य में।", en: "For bathing, cooking and at both arghyas." },
    usage: {
      hi: "नहाय-खाय पर स्नान के बाद भोजन के लिए स्वच्छ जल भरा जाता है। अर्घ्य के समय लोटे से जल या दूध की धार सूप के आगे से अर्पित की जाती है।",
      en: "After the Nahay Khay bath, clean water is drawn for cooking. At arghya, a stream of water or milk is offered from the lota in front of the soop.",
    },
    significance: {
      hi: "जल छठ के केंद्र में है — नदी, तालाब या घर में बना जलकुंड, सब पर्व का हिस्सा बनते हैं।",
      en: "Water is at the heart of Chhath — river, pond or a pool made at home all become part of the festival.",
    },
    significanceKind: "practice",
    days: ["nahay-khay", "sandhya-arghya", "usha-arghya"],
    sources: ["wikipedia", "gac"],
  },
  {
    id: "lauki",
    hindiName: "कद्दू (लौकी)",
    englishName: "Bottle gourd (kaddu / lauki)",
    category: "food",
    model: "lauki",
    description: {
      hi: "बिहार में ‘कद्दू’ प्रायः लौकी को कहा जाता है। नहाय-खाय के भोजन की यही प्रमुख सब्ज़ी है।",
      en: "In Bihar ‘kaddu’ usually means bottle gourd (lauki). It is the main vegetable of the Nahay Khay meal.",
    },
    whenUsed: { hi: "पहले दिन, नहाय-खाय।", en: "Day one, Nahay Khay." },
    usage: {
      hi: "बिना लहसुन-प्याज़ के, सेंधा नमक या साधारण नमक के साथ सादी सब्ज़ी बनाई जाती है; कई घरों में इसे चना दाल के साथ पकाया जाता है।",
      en: "Cooked simply without garlic or onion, with rock salt or ordinary salt; in many homes together with chana dal.",
    },
    significance: {
      hi: "‘कद्दू-भात’ इतना जुड़ा है कि कई जगह पहले दिन को ही ‘कद्दू-भात’ कहते हैं।",
      en: "The association is so strong that in many places the first day itself is called ‘Kaddu-Bhaat’.",
    },
    significanceKind: "practice",
    days: ["nahay-khay"],
    sources: ["et-nahaykhay", "toi-kharna"],
  },
  {
    id: "chana-dal",
    hindiName: "चना दाल",
    englishName: "Split Bengal gram (chana dal)",
    category: "food",
    model: "dal",
    description: { hi: "चने की दाल, नहाय-खाय की थाली का हिस्सा।", en: "Split Bengal gram, part of the Nahay Khay plate." },
    whenUsed: { hi: "पहले दिन।", en: "Day one." },
    usage: {
      hi: "अकेले या लौकी के साथ, सात्विक ढंग से पकाई जाती है।",
      en: "Cooked plainly in the sattvic style, alone or with the gourd.",
    },
    significance: {
      hi: "सादा, सात्विक भोजन — दिखावे से दूर — पहले दिन की भावना है।",
      en: "Simple, sattvic food — without show — is the spirit of the first day.",
    },
    significanceKind: "practice",
    days: ["nahay-khay"],
    sources: ["et-nahaykhay"],
  },
  {
    id: "arwa-chawal",
    hindiName: "अरवा चावल (भात)",
    englishName: "Arwa rice",
    category: "food",
    model: "rice",
    description: {
      hi: "अरवा यानी बिना उबाले (सेला नहीं) धान से निकला चावल, जिसका भात बनता है।",
      en: "Arwa rice — milled from paddy that has not been parboiled — cooked as bhaat.",
    },
    whenUsed: { hi: "नहाय-खाय का भात और खरना का रसियाव।", en: "Nahay Khay's bhaat and Kharna's rasiyaw." },
    usage: { hi: "अच्छी तरह धोकर, अलग बरतन में पकाया जाता है।", en: "Washed thoroughly and cooked in a separate pot." },
    significance: {
      hi: "छठ के भोजन में अरवा चावल को ही शुद्ध माना जाता है — यह कई परिवारों की दृढ़ रीति है।",
      en: "Many families hold firmly that only arwa rice is suitable for Chhath cooking.",
    },
    significanceKind: "practice",
    days: ["nahay-khay", "kharna"],
    sources: ["et-nahaykhay", "hindutone-prasad"],
  },
  {
    id: "rasiyaw",
    hindiName: "रसियाव (गुड़ की खीर)",
    englishName: "Rasiyaw (jaggery rice-kheer)",
    category: "food",
    model: "kheer",
    description: {
      hi: "अरवा चावल, दूध और गुड़ से बनी खीर — खरना का मुख्य प्रसाद।",
      en: "Kheer of arwa rice, milk and jaggery — the main prasad of Kharna.",
    },
    whenUsed: { hi: "दूसरे दिन संध्या, खरना।", en: "Day two evening, Kharna." },
    usage: {
      hi: "व्रती दिन भर के उपवास के बाद शाम को मिट्टी के चूल्हे पर इसे बनाते हैं और रोटी या पूरी के साथ छठी मइया को अर्पित करते हैं।",
      en: "After fasting all day, the vrati cooks it in the evening on the clay stove and offers it to Chhathi Maiya with roti or puri.",
    },
    significance: {
      hi: "खरना का प्रसाद ग्रहण करने के बाद ही निर्जला व्रत शुरू होता है; परिवार और पड़ोसी भी इस प्रसाद को श्रद्धा से लेते हैं।",
      en: "The nirjala fast begins only after the Kharna prasad; family and neighbours also receive it with reverence.",
    },
    significanceKind: "practice",
    days: ["kharna"],
    sources: ["hindutone-prasad", "et-vrat-rules", "toi-kharna"],
  },
  {
    id: "roti",
    hindiName: "रोटी / पूरी",
    englishName: "Roti or puri",
    category: "food",
    model: "roti",
    description: {
      hi: "गेहूँ की रोटी — कुछ परिवारों में घी लगी, कुछ में पूरी — रसियाव के साथ।",
      en: "Wheat roti — buttered with ghee in some families, puri in others — served with rasiyaw.",
    },
    whenUsed: { hi: "खरना।", en: "Kharna." },
    usage: { hi: "उसी चूल्हे पर बनाई जाती है और प्रसाद के साथ केले के पत्ते पर रखी जाती है।", en: "Made on the same stove and placed with the prasad, often on a banana leaf." },
    significance: {
      hi: "रोटी-रसियाव की यह सादगी खरना की पहचान है।",
      en: "The simplicity of roti and rasiyaw is the signature of Kharna.",
    },
    significanceKind: "practice",
    days: ["kharna"],
    sources: ["toi-kharna", "hindutone-prasad"],
  },
  {
    id: "gur",
    hindiName: "गुड़",
    englishName: "Jaggery (gur)",
    category: "food",
    model: "gur",
    description: {
      hi: "गन्ने के रस से बना गुड़ — खरना की खीर और ठेकुआ की मिठास।",
      en: "Jaggery from sugarcane juice — the sweetness of Kharna kheer and thekua.",
    },
    whenUsed: { hi: "दूसरे और तीसरे दिन।", en: "Days two and three." },
    usage: { hi: "रसियाव और ठेकुआ में घोलकर।", en: "Dissolved into rasiyaw and thekua dough." },
    significance: {
      hi: "गन्ने से गुड़ तक — नई फ़सल का स्वाद ही प्रसाद की मिठास बनता है।",
      en: "From cane to jaggery — the taste of the new harvest becomes the sweetness of prasad.",
    },
    significanceKind: "symbolism",
    days: ["kharna", "sandhya-arghya"],
    sources: ["et-vrat-rules", "hindutone-prasad"],
  },
  {
    id: "gehun",
    hindiName: "गेहूँ (ठेकुआ के लिए)",
    englishName: "Wheat for thekua flour",
    category: "food",
    model: "rice",
    description: {
      hi: "ठेकुआ का आटा बनाने के लिए गेहूँ, जिसे धोकर धूप में सुखाया जाता है।",
      en: "Wheat for the thekua flour, washed and dried in the sun.",
    },
    whenUsed: { hi: "पहले-दूसरे दिन तैयारी में।", en: "Prepared on the first and second days." },
    usage: {
      hi: "कई घरों में गेहूँ धोकर आँगन या छत पर सुखाया जाता है और कोई न कोई उसकी रखवाली करता है ताकि पक्षी उसे जूठा न करें; फिर चक्की में पिसवाया जाता है।",
      en: "In many homes the wheat is washed and dried in the courtyard or on the roof while someone guards it from birds, then taken to be milled.",
    },
    significance: {
      hi: "प्रसाद की शुद्धता उसकी सामग्री से ही शुरू मानी जाती है — इसलिए अनाज की तैयारी भी उतनी ही सावधानी से होती है।",
      en: "Purity of prasad is held to begin with its ingredients — so even preparing the grain is done with care.",
    },
    significanceKind: "practice",
    days: ["nahay-khay", "kharna"],
    sources: ["gac"],
  },
  {
    id: "arghya",
    hindiName: "अर्घ्य (जल व दूध)",
    englishName: "Arghya (offering of water/milk)",
    category: "offering",
    model: "lota",
    description: {
      hi: "अर्घ्य का अर्थ है सम्मानपूर्वक अर्पित किया गया जल। छठ में सूर्य को जल या दूध से अर्घ्य दिया जाता है।",
      en: "Arghya means water offered in reverence. In Chhath it is offered to the sun with water or milk.",
    },
    whenUsed: {
      hi: "तीसरे दिन डूबते सूर्य को और चौथे दिन उगते सूर्य को।",
      en: "To the setting sun on day three and the rising sun on day four.",
    },
    usage: {
      hi: "व्रती नदी या तालाब में कमर तक या उससे कम पानी में खड़े होकर सूर्य की ओर मुख करते हैं और सूप थामते हैं; परिवारजन व अन्य श्रद्धालु लोटे से सूप के आगे जल/दूध की धार अर्पित करते हैं। विधि का क्रम परिवार अनुसार बदलता है।",
      en: "The vrati stands in a river or pond, in water up to the waist or less, faces the sun and holds the soop; family members and others pour a stream of water or milk from a lota in front of it. The exact sequence varies by family.",
    },
    significance: {
      hi: "मान्यता है कि यह सूर्य देव और छठी मइया के प्रति कृतज्ञता व प्रार्थना है — जीवन, प्रकाश और फ़सल के लिए।",
      en: "It is believed to express gratitude and prayer to Surya and Chhathi Maiya — for life, light and harvest.",
    },
    significanceKind: "belief",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["wikipedia", "britannica", "sahapedia"],
  },
  {
    id: "ghat",
    hindiName: "घाट",
    englishName: "Ghat (riverbank steps)",
    category: "plant",
    model: "kalash",
    description: {
      hi: "नदी या तालाब के किनारे की सीढ़ियाँ या साफ़ किया गया तट, जहाँ अर्घ्य दिया जाता है।",
      en: "Steps or a cleared bank at a river or pond, where the arghya is offered.",
    },
    whenUsed: { hi: "तीसरे और चौथे दिन।", en: "Days three and four." },
    usage: {
      hi: "पर्व से पहले समुदाय मिलकर घाट साफ़ करता और सजाता है। कई परिवार अपनी ‘जगह’ पर मिट्टी की वेदी बनाते हैं। जहाँ नदी पास नहीं, वहाँ तालाब, या घर की छत/आँगन में बने जलकुंड में अर्घ्य होता है।",
      en: "Before the festival the community cleans and decorates the ghat together. Many families make a small clay altar at their spot. Where no river is near, a pond, or a pool built on a roof or courtyard is used.",
    },
    significance: {
      hi: "घाट की सफ़ाई और सजावट में मोहल्ले भर की भागीदारी छठ को सामुदायिक पर्व बनाती है।",
      en: "Whole neighbourhoods taking part in cleaning and decorating ghats makes Chhath a community festival.",
    },
    significanceKind: "practice",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["gac", "britannica"],
  },
  {
    id: "prasad",
    hindiName: "छठ प्रसाद",
    englishName: "Chhath prasad",
    category: "offering",
    model: "prasad",
    description: {
      hi: "ठेकुआ, कसार (चावल के आटे और गुड़ के लड्डू), फल और नारियल — पूरा सजा हुआ सूप ही छठ का प्रसाद है।",
      en: "Thekua, kasar (rice-flour and jaggery laddoos), fruit and coconut — the fully arranged soop is the prasad of Chhath.",
    },
    whenUsed: { hi: "दोनों अर्घ्य के बाद बाँटा जाता है।", en: "Distributed after the arghyas." },
    usage: {
      hi: "उषा अर्घ्य के बाद व्रती पारण करते हैं और प्रसाद परिवार, पड़ोस और घाट पर आए लोगों में बाँटा जाता है। कई लोग घाट पर व्रतियों से प्रसाद माँगकर लेते हैं।",
      en: "After Usha Arghya the vrati breaks the fast and the prasad is shared with family, neighbours and people at the ghat. Many people respectfully ask vratis for prasad there.",
    },
    significance: {
      hi: "प्रसाद बाँटना व्रत का समापन है — जिस श्रम और संयम से वह बना, उसका फल सबके साथ साझा होता है।",
      en: "Sharing prasad completes the vrat — what was made with labour and restraint is shared with everyone.",
    },
    significanceKind: "practice",
    days: ["sandhya-arghya", "usha-arghya"],
    sources: ["hindutone-prasad", "gac"],
  },
];

export const objectsById: Record<string, RitualObject> = Object.fromEntries(ritualObjects.map((o) => [o.id, o]));

/** The ten headline objects shown first in the explorer, in the order of the brief. */
export const explorerFeatured = [
  "soop",
  "daura",
  "thekua",
  "coconut",
  "sugarcane",
  "diya",
  "kalash",
  "fruits",
  "handi",
  "prasad",
];
