import Sanscript from '@indic-transliteration/sanscript';

export type AshtottaraLanguage = 'en' | 'te' | 'ta' | 'kn';

/** Sri Ayyappa Ashtottara Sata Namavali (108 names), IAST. Source: vignanam.org / stotranidhi.com. */
const names = [
  'mahāśāstrē', 'mahādēvāya', 'mahādēvasutāya', 'avyayāya', 'lōkakartrē', 'lōkabhartrē', 'lōkahartrē', 'parātparāya', 'trilōkarakṣakāya',
  'dhanvinē', 'tapasvinē', 'bhūtasainikāya', 'mantravēdinē', 'mahāvēdinē', 'mārutāya', 'jagadīśvarāya', 'lōkādhyakṣāya', 'agraṇyē',
  'śrīmatē', 'apramēyaparākramāya', 'siṁhārūḍhāya', 'gajārūḍhāya', 'hayārūḍhāya', 'mahēśvarāya', 'nānāśastradharāya', 'anarghāya', 'nānāvidyāviśāradāya',
  'nānārūpadharāya', 'vīrāya', 'nānāprāṇiniṣēvitāya', 'bhūtēśāya', 'bhūtidāya', 'bhṛtyāya', 'bhujaṅgābharaṇōttamāya', 'ikṣudhanvinē', 'puṣpabāṇāya',
  'mahārūpāya', 'mahāprabhavē', 'māyādēvīsutāya', 'mānyāya', 'mahānītāya', 'mahāguṇāya', 'mahāśaivāya', 'mahārudrāya', 'vaiṣṇavāya',
  'viṣṇupūjakāya', 'vighnēśāya', 'vīrabhadrēśāya', 'bhairavāya', 'ṣaṇmukhadhruvāya', 'mēruśṛṅgasamāsīnāya', 'munisaṅghaniṣēvitāya', 'dēvāya', 'bhadrāya',
  'jagannāthāya', 'gaṇanāthāya', 'gaṇēśvarāya', 'mahāyōginē', 'mahāmāyinē', 'mahājñāninē', 'mahāsthirāya', 'dēvaśāstrē', 'bhūtaśāstrē',
  'bhīmahāsaparākramāya', 'nāgahārāya', 'nāgakēśāya', 'vyōmakēśāya', 'sanātanāya', 'saguṇāya', 'nirguṇāya', 'nityāya', 'nityatṛptāya',
  'nirāśrayāya', 'lōkāśrayāya', 'gaṇādhīśāya', 'catuṣṣaṣṭikalāmayāya', 'ṛgyajuḥsāmarūpiṇē', 'mallakāsurabhañjanāya', 'trimūrtayē', 'daityamathanāya', 'prakṛtayē',
  'puruṣōttamāya', 'kālajñāninē', 'mahājñāninē', 'kāmadāya', 'kamalēkṣaṇāya', 'kalpavṛkṣāya', 'mahāvṛkṣāya', 'vidyāvṛkṣāya', 'vibhūtidāya',
  'saṁsāratāpavicchēttrē', 'paśulōkabhayaṅkarāya', 'rōgahantrē', 'prāṇadātrē', 'paragarvavibhañjanāya', 'sarvaśāstrārthatatvajñāya', 'nītimatē', 'pāpabhañjanāya', 'puṣkalāpūrṇasamyuktāya',
  'paramātmāya', 'satāṅgatayē', 'anantādityasaṅkāśāya', 'subrahmaṇyānujāya', 'balinē', 'bhaktānukampinē', 'dēvēśāya', 'bhagavatē', 'bhaktavatsalāya',
];

const scriptByLanguage = { te: 'telugu', ta: 'tamil', kn: 'kannada' } as const;

const ui = {
  en: { title: 'Ayyappa Ashtottara Sata Namavali', subtitle: '108 sacred names of Lord Ayyappa', offline: 'Available offline', intro: 'Swamiye Saranam Ayyappa', source: 'Source: vignanam.org' },
  te: { title: 'శ్రీ అయ్యప్ప అష్టోత్తర శత నామావళి', subtitle: 'శ్రీ అయ్యప్ప స్వామి 108 నామాలు', offline: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది', intro: 'స్వామియే శరణం అయ్యప్ప', source: 'మూలం: vignanam.org' },
  ta: { title: 'ஸ்ரீ அய்யப்ப அஷ்டோத்தர சத நாமாவளி', subtitle: 'ஸ்ரீ ஐயப்பன் 108 நாமங்கள்', offline: 'ஆஃப்லைனில் கிடைக்கும்', intro: 'ஸ்வாமியே சரணம் ஐயப்பா', source: 'ஆதாரம்: vignanam.org' },
  kn: { title: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಅಷ್ಟೋತ್ತರ ಶತ ನಾಮಾವಳಿ', subtitle: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ 108 ನಾಮಗಳು', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ', intro: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ', source: 'ಮೂಲ: vignanam.org' },
} as const;

/** Map the Dravidian-style IAST used on the source site to standard IAST for transliteration. */
function toIast(text: string) {
  return text
    .replace(/ō/g, 'o').replace(/ē/g, 'e').replace(/ṁ/g, 'ṃ')
    .replace(/r̥/g, 'ṛ').replace(/Ō/g, 'O').replace(/Ē/g, 'E');
}

export function getAyyappaAshtottara(language: AshtottaraLanguage) {
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
