import Sanscript from '@indic-transliteration/sanscript';

export type AshtottaraLanguage = 'en' | 'te' | 'ta' | 'kn';

/** Sri Durga Ashtottara Sata Namavali (108 names), IAST. Source: vignanam.org / stotranidhi.com. */
const names = [
  'durgāyai',
  'śivāyai',
  'mahālakṣmyai',
  'mahāgauryai',
  'caṇḍikāyai',
  'sarvajñāyai',
  'sarvalōkēśyai',
  'sarvakarmaphalapradāyai',
  'sarvatīrthamayyai',
  'puṇyāyai',
  'dēvayōnayē',
  'ayōnijāyai',
  'bhūmijāyai',
  'nirguṇāyai',
  'ādhāraśaktyai',
  'anīśvaryai',
  'nirguṇāyai',
  'nirahaṅkārāyai',
  'sarvagarvavimardinyai',
  'sarvalōkapriyāyai',
  'vāṇyai',
  'sarvavidyādhidēvatāyai',
  'pārvatyai',
  'dēvamātrē',
  'vanīśāyai',
  'vindhyavāsinyai',
  'tējōvatyai',
  'mahāmātrē',
  'kōṭisūryasamaprabhāyai',
  'dēvatāyai',
  'vahnirūpāyai',
  'sadaujasē',
  'varṇarūpiṇyai',
  'guṇāśrayāyai',
  'guṇamayyai',
  'guṇatrayavivarjitāyai',
  'karmajñānapradāyai',
  'kāntāyai',
  'sarvasaṁhārakāriṇyai',
  'dharmajñānāyai',
  'dharmaniṣṭhāyai',
  'sarvakarmavivarjitāyai',
  'kāmākṣyai',
  'kāmasaṁhartryai',
  'kāmakrōdhavivarjitāyai',
  'śāṅkaryai',
  'śāmbhavyai',
  'śāntāyai',
  'candrasūryāgnilōcanāyai',
  'sujayāyai',
  'jayabhūmiṣṭhāyai',
  'jāhnavyai',
  'janapūjitāyai',
  'śāstrāyai',
  'śāstramayāyai',
  'nityāyai',
  'śubhāyai',
  'candrārdhamastakāyai',
  'bhāratyai',
  'bhrāmaryai',
  'kalpāyai',
  'karālyai',
  'kr̥ṣṇapiṅgalāyai',
  'brāhmyai',
  'nārāyaṇyai',
  'raudryai',
  'candrāmr̥tapariśrutāyai',
  'jyēṣṭhāyai',
  'indirāyai',
  'mahāmāyāyai',
  'jagatsr̥ṣṭyādikāriṇyai',
  'brahmāṇḍakōṭisaṁsthānāyai',
  'kāminyai',
  'kamalālayāyai',
  'kātyāyanyai',
  'kalātītāyai',
  'kālasaṁhārakāriṇyai',
  'yōganiṣṭhāyai',
  'yōgigamyāyai',
  'yōgidhyēyāyai',
  'tapasvinyai',
  'jñānarūpāyai',
  'nirākārāyai',
  'bhaktābhīṣṭaphalapradāyai',
  'bhūtātmikāyai',
  'bhūtamātrē',
  'bhūtēśāyai',
  'bhūtadhāriṇyai',
  'svadhānārīmadhyagatāyai',
  'ṣaḍādhārādivartinyai',
  'mōhadāyai',
  'aṁśubhavāyai',
  'śubhrāyai',
  'sūkṣmāyai',
  'mātrāyai',
  'nirālasāyai',
  'nimnagāyai',
  'nīlasaṅkāśāyai',
  'nityānandāyai',
  'harāyai',
  'parāyai',
  'sarvajñānapradāyai',
  'anantāyai',
  'satyāyai',
  'durlabharūpiṇyai',
  'sarasvatyai',
  'sarvagatāyai',
  'sarvābhīṣṭapradāyinyai',
];

const scriptByLanguage = { te: 'telugu', ta: 'tamil', kn: 'kannada' } as const;

const ui = {
  en: { title: 'Durga Ashtottara Sata Namavali', subtitle: '108 sacred names of Goddess Durga', offline: 'Available offline', intro: 'Jai Maa Durga', source: 'Source: vignanam.org' },
  te: { title: 'శ్రీ దుర్గా అష్టోత్తర శత నామావళి', subtitle: 'శ్రీ దుర్గాదేవి 108 నామాలు', offline: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది', intro: 'జై మా దుర్గా', source: 'మూలం: vignanam.org' },
  ta: { title: 'ஸ்ரீ துர்கா அஷ்டோத்தர சத நாமாவளி', subtitle: 'ஸ்ரீ துர்கா தேவி 108 நாமங்கள்', offline: 'ஆஃப்லைனில் கிடைக்கும்', intro: 'ஜெய் மா துர்கா', source: 'ஆதாரம்: vignanam.org' },
  kn: { title: 'ಶ್ರೀ ದುರ್ಗಾ ಅಷ್ಟೋತ್ತರ ಶತ ನಾಮಾವಳಿ', subtitle: 'ಶ್ರೀ ದುರ್ಗಾದೇವಿ 108 ನಾಮಗಳು', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ', intro: 'ಜೈ ಮಾ ದುರ್ಗಾ', source: 'ಮೂಲ: vignanam.org' },
} as const;

/** Map the Dravidian-style IAST used on the source site to standard IAST for transliteration. */
function toIast(text: string) {
  return text
    .replace(/ō/g, 'o').replace(/ē/g, 'e').replace(/ṁ/g, 'ṃ')
    .replace(/r̥/g, 'ṛ').replace(/Ō/g, 'O').replace(/Ē/g, 'E');
}

export function getDurgaAshtottara(language: AshtottaraLanguage) {
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
