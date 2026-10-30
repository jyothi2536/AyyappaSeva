import Sanscript from '@indic-transliteration/sanscript';

export type AshtottaraLanguage = 'en' | 'te' | 'ta' | 'kn';

/** Sri Ganesha Ashtottara Sata Namavali (108 names), IAST. Source: vignanam.org / stotranidhi.com. */
const names = [
  'vināyakāya',
  'vighnarājāya',
  'gaurīputrāya',
  'gaṇēśvarāya',
  'skandāgrajāya',
  'avyayāya',
  'pūtāya',
  'dakṣāya',
  'adhyakṣāya',
  'dvijapriyāya',
  'agnigarvacchidē',
  'indraśrīpradāya',
  'vāṇīpradāyakāya',
  'sarvasiddhipradāya',
  'śarvatanayāya',
  'śarvarīpriyāya',
  'sarvātmakāya',
  'sr̥ṣṭikartrē',
  'dēvānīkārcitāya',
  'śivāya',
  'siddhibuddhipradāya',
  'śāntāya',
  'brahmacāriṇē',
  'gajānanāya',
  'dvaimāturāya',
  'munistutyāya',
  'bhaktavighnavināśanāya',
  'ēkadantāya',
  'caturbāhavē',
  'caturāya',
  'śaktisamyutāya',
  'lambōdarāya',
  'śūrpakarṇāya',
  'harayē',
  'brahmaviduttamāya',
  'kāvyāya',
  'grahapatayē',
  'kāminē',
  'sōmasūryāgnilōcanāya',
  'pāśāṅkuśadharāya',
  'caṇḍāya',
  'guṇātītāya',
  'nirañjanāya',
  'akalmaṣāya',
  'svayaṁ siddhāya',
  'siddhārcitapadāmbujāya',
  'bījāpūraphalāsaktāya',
  'varadāya',
  'śāśvatāya',
  'kr̥tinē',
  'dvijapriyāya',
  'vītabhayāya',
  'gadinē',
  'cakriṇē',
  'ikṣucāpadhr̥tē',
  'śrīdāya',
  'ajāya',
  'utpalakarāya',
  'śrīpatistutiharṣitāya',
  'kulādribhēttrē',
  'jaṭilāya',
  'candracūḍāya',
  'amarēśvarāya',
  'nāgayajñōpavītavatē',
  'kalikalmaṣanāśanāya',
  'sthūlakaṇṭhāya',
  'svayaṅkartrē',
  'sāmaghōṣapriyāya',
  'parāya',
  'sthūlatuṇḍāya',
  'agraṇyāya',
  'dhīrāya',
  'vāgīśāya',
  'siddhidāyakāya',
  'dūrvābilvapriyāya',
  'kāntāya',
  'pāpahāriṇē',
  'samāhitāya',
  'āśritaśrīkarāya',
  'saumyāya',
  'bhaktavāñchitadāyakāya',
  'śāntāya',
  'acyutārcyāya',
  'kaivalyāya',
  'saccidānandavigrahāya',
  'jñāninē',
  'dayāyutāya',
  'dāntāya',
  'brahmadvēṣavivarjitāya',
  'pramattadaityabhayadāya',
  'vyaktamūrtayē',
  'amūrtimatē',
  'śailēndratanujōtsaṅgakhēlanōtsukamānasāya',
  'svalāvaṇyasudhāsārajitamanmathavigrahāya',
  'samastajagadādhārāya',
  'māyinē',
  'mūṣakavāhanāya',
  'ramārcitāya',
  'vidhayē',
  'śrīkaṇṭhāya',
  'vibudhēśvarāya',
  'cintāmaṇidvīpapatayē',
  'paramātmanē',
  'gajānanāya',
  'hr̥ṣṭāya',
  'tuṣṭāya',
  'prasannātmanē',
  'sarvasiddhipradāyakāya',
];

const scriptByLanguage = { te: 'telugu', ta: 'tamil', kn: 'kannada' } as const;

const ui = {
  en: { title: 'Ganesha Ashtottara Sata Namavali', subtitle: '108 sacred names of Lord Ganesha', offline: 'Available offline', intro: 'Om Gam Ganapataye Namaha', source: 'Source: vignanam.org' },
  te: { title: 'శ్రీ గణేశ అష్టోత్తర శత నామావళి', subtitle: 'శ్రీ గణేశుని 108 నామాలు', offline: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది', intro: 'ఓం గం గణపతయే నమః', source: 'మూలం: vignanam.org' },
  ta: { title: 'ஸ்ரீ கணேச அஷ்டோத்தர சத நாமாவளி', subtitle: 'ஸ்ரீ கணேசர் 108 நாமங்கள்', offline: 'ஆஃப்லைனில் கிடைக்கும்', intro: 'ஓம் கம் கணபதயே நம:', source: 'ஆதாரம்: vignanam.org' },
  kn: { title: 'ಶ್ರೀ ಗಣೇಶ ಅಷ್ಟೋತ್ತರ ಶತ ನಾಮಾವಳಿ', subtitle: 'ಶ್ರೀ ಗಣೇಶನ 108 ನಾಮಗಳು', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ', intro: 'ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ', source: 'ಮೂಲ: vignanam.org' },
} as const;

/** Map the Dravidian-style IAST used on the source site to standard IAST for transliteration. */
function toIast(text: string) {
  return text
    .replace(/ō/g, 'o').replace(/ē/g, 'e').replace(/ṁ/g, 'ṃ')
    .replace(/r̥/g, 'ṛ').replace(/Ō/g, 'O').replace(/Ē/g, 'E');
}

export function getGaneshaAshtottara(language: AshtottaraLanguage) {
  const lines = names.map((name, index) => {
    const full = `ōṁ ${name} namaḥ`;
    const rendered =
      language === 'en'
        ? full
        : Sanscript.t(toIast(full), 'iast', scriptByLanguage[language]);
    return `${index + 1}. ${rendered}`;
  });
  return { ...ui[language], lines };
}
