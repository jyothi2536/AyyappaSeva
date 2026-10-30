import Sanscript from '@indic-transliteration/sanscript';

export type AshtottaraLanguage = 'en' | 'te' | 'ta' | 'kn';

/** Sri Subrahmanya Ashtottara Sata Namavali (108 names), IAST. Source: vignanam.org / stotranidhi.com. */
const names = [
  'skandāya',
  'guhāya',
  'ṣaṇmukhāya',
  'phālanētrasutāya',
  'prabhavē',
  'piṅgalāya',
  'kr̥ttikāsūnavē',
  'śikhivāhāya',
  'dviṣaḍbhujāya',
  'dviṣaṇṇētrāya',
  'śaktidharāya',
  'piśitāśaprabhañjanāya',
  'tārakāsurasaṁhāriṇē',
  'rakṣōbalavimardanāya',
  'mattāya',
  'pramattāya',
  'unmattāya',
  'surasainyasurakṣakāya',
  'dēvasēnāpatayē',
  'prājñāya',
  'kr̥pālavē',
  'bhaktavatsalāya',
  'umāsutāya',
  'śaktidharāya',
  'kumārāya',
  'krauñcadāraṇāya',
  'sēnānyē',
  'agnijanmanē',
  'viśākhāya',
  'śaṅkarātmajāya',
  'śivasvāminē',
  'gaṇasvāminē',
  'sarvasvāminē',
  'sanātanāya',
  'anantaśaktayē',
  'akṣōbhyāya',
  'pārvatīpriyanandanāya',
  'gaṅgāsutāya',
  'śarōdbhūtāya',
  'āhūtāya',
  'pāvakātmajāya',
  'jr̥mbhāya',
  'prajr̥mbhāya',
  'ujjr̥mbhāya',
  'kamalāsanasaṁstutāya',
  'ēkavarṇāya',
  'dvivarṇāya',
  'trivarṇāya',
  'sumanōharāya',
  'caturvarṇāya',
  'pañcavarṇāya',
  'prajāpatayē',
  'aharpatayē',
  'agnigarbhāya',
  'śamīgarbhāya',
  'viśvarētasē',
  'surārighnē',
  'haridvarṇāya',
  'śubhakarāya',
  'vaṭavē',
  'vaṭuvēṣabhr̥tē',
  'pūṣṇē',
  'gabhastayē',
  'gahanāya',
  'candravarṇāya',
  'kalādharāya',
  'māyādharāya',
  'mahāmāyinē',
  'kaivalyāya',
  'śaṅkarātmajāya',
  'viśvayōnayē',
  'amēyātmanē',
  'tējōnidhayē',
  'anāmayāya',
  'paramēṣṭhinē',
  'parabrahmaṇē',
  'vēdagarbhāya',
  'virāṭsutāya',
  'pulindakanyābhartrē',
  'mahāsārasvatāvr̥tāya',
  'āśritākhiladātrē',
  'cōraghnāya',
  'rōganāśanāya',
  'anantamūrtayē',
  'ānandāya',
  'śikhaṇḍikr̥takētanāya',
  'ḍambhāya',
  'paramaḍambhāya',
  'mahāḍambhāya',
  'vr̥ṣākapayē',
  'kāraṇōpāttadēhāya',
  'kāraṇātītavigrahāya',
  'anīśvarāya',
  'amr̥tāya',
  'prāṇāya',
  'prāṇāyāmaparāyaṇāya',
  'viruddhahantrē',
  'vīraghnāya',
  'raktāsyāya',
  'śyāmakandharāya',
  'subrahmaṇyāya',
  'guhāya',
  'prītāya',
  'brahmaṇyāya',
  'brāhmaṇapriyāya',
  'vaṁśavr̥ddhikarāya',
  'vēdavēdyāya',
  'akṣayaphalapradāya',
];

const scriptByLanguage = { te: 'telugu', ta: 'tamil', kn: 'kannada' } as const;

const ui = {
  en: { title: 'Subrahmanya Ashtottara Sata Namavali', subtitle: '108 sacred names of Lord Subrahmanya', offline: 'Available offline', intro: 'Om Saravanabhava', source: 'Source: vignanam.org' },
  te: { title: 'శ్రీ సుబ్రహ్మణ్య అష్టోత్తర శత నామావళి', subtitle: 'శ్రీ సుబ్రహ్మణ్య స్వామి 108 నామాలు', offline: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది', intro: 'ఓం శరవణభవ', source: 'మూలం: vignanam.org' },
  ta: { title: 'ஸ்ரீ சுப்ரஹ்மண்ய அஷ்டோத்தர சத நாமாவளி', subtitle: 'ஸ்ரீ சுப்ரமணியர் 108 நாமங்கள்', offline: 'ஆஃப்லைனில் கிடைக்கும்', intro: 'ஓம் சரவணபவ', source: 'ஆதாரம்: vignanam.org' },
  kn: { title: 'ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟೋತ್ತರ ಶತ ನಾಮಾವಳಿ', subtitle: 'ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ 108 ನಾಮಗಳು', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ', intro: 'ಓಂ ಶರವಣಭವ', source: 'ಮೂಲ: vignanam.org' },
} as const;

/** Map the Dravidian-style IAST used on the source site to standard IAST for transliteration. */
function toIast(text: string) {
  return text
    .replace(/ō/g, 'o').replace(/ē/g, 'e').replace(/ṁ/g, 'ṃ')
    .replace(/r̥/g, 'ṛ').replace(/Ō/g, 'O').replace(/Ē/g, 'E');
}

export function getSubrahmanyaAshtottara(language: AshtottaraLanguage) {
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
