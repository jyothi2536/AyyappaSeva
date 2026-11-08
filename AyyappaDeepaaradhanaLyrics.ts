import Sanscript from '@indic-transliteration/sanscript';

export type DeepaaradhanaLanguage = 'en' | 'te' | 'ta' | 'kn';

const stanzas = [
  ['Arya Vamsha Sujatha Namo Namo', 'Veera Divya Vilasa Namo Namo', 'Shaswatharchita Deva Namo Namo - Bahukoti'],
  ['Bhootha Vandita Deva Namo Namo', 'Bheethi Nashana Roopa Namo Namo', 'Mohanambhuja Paada Namo Namo - Manikanta'],
  ['Rajasevaka Veera Namo Namo', 'Vaaji Vaarana Vaha Namo Namo', 'Geetha Nrithya Vinoda Namo Namo - Veeraadheera'],
  ['Ghora Papa Vinasha Namo Namo', 'Haara Noopura Dharin Namo Namo', 'Jyotishanchita Peeta Namo Namo - Jayasheela'],
  ['Dhyana Mangala Roopa Namo Namo', 'Kaanananthara Vasa Namo Namo', 'Vaasa Vashritha Deva Namo Namo - Nripadasa'],
  ['Kaantha Shringa Nivasa Namo Namo', 'Shantidayaka Deva Namo Namo', 'Deva Vandhya Gireesha Namo Namo - Paradeva'],
  ['Moolamantra Swaroopa Namo Namo', 'Balavigraha Moola Namo Namo', 'Puthradayaka Deva Namo Namo - Varabaala'],
  ['Eesha Keshava Soono Namo Namo', 'Paasha Janma Vinasha Namo Namo', 'Aarthi Naashana Keerthey Namo Namo - Divya Roopa'],
  ['Deepa Mangala Jyothi Namo Namo', 'Thooyaambala Leela Namo Namo', 'Deva Kunjari Paada Namo Namo.... Aru Thaara!'],
] as const;

const ending = 'Swamiye Sharanam Ayyappa';
const itransStanzas = [
  ['Arya vaMsha sujAtA namO namO', 'vIra divya vilAsA namO namO', 'shAshvatArchita devA namO namO - bahukOTi'],
  ['bhUta vandita devA namO namO', 'bhIti nAshana rUpA namO namO', 'mohanAmbuja pAdA namO namO - maNikaNTA'],
  ['rAjasevaka vIrA namO namO', 'vAji vAraNa vAhA namO namO', 'gIta nRRitya vinOdA namO namO - vIrAdhIrA'],
  ['ghOra pApa vinAshA namO namO', 'hAra nUpura dhArin namO namO', 'jyOtishA~nchita pITA namO namO - jayashIlA'],
  ['dhyAna ma~Ngala rUpA namO namO', 'kAnanAntara vAsA namO namO', 'vAsa vAshrita devA namO namO - nRRipadAsA'],
  ['kAnta shRRi~Nga nivAsA namO namO', 'shAntidAyaka devA namO namO', 'deva vandhya girIshA namO namO - paradevA'],
  ['mUlamantra svarUpA namO namO', 'bAlavigraha mUlA namO namO', 'putradAyaka devA namO namO - varabAlA'],
  ['Isha keshava sUnO namO namO', 'pAsha janma vinAshA namO namO', 'Arti nAshana kIrtE namO namO - divya rUpA'],
  ['dIpa ma~Ngala jyOti namO namO', 'tUyAmbala lIlA namO namO', 'dEva ku~njarI pAda namO namO.... aru tArA!'],
] as const;
const tamilStanzas = [
  ['ஆர்ய வம்ச சுஜதா நமோ நமோ', 'வீர்யாதிவ்ய விளாசா நமோ நமோ', 'சாஷ்வதாஷ்ரித தேவா நமோ நமோ - பகுகோடி'],
  ['பூத வந்திதா தேவா நமோ நமோ', 'பீதி நாஷனாரூபா நமோ நமோ', 'மோகனாம்புஜ பாதா நமோ நமோ - மாணிகந்த'],
  ['ராஜசேவக வீரா நமோ நமோ', 'வாஜி வாரண வாஹா நமோ நமோ', 'கீதா ந்ரத்ய வினோடா நமோ நமோ - வீராதி வீரா'],
  ['கோர பாப வினாஷா நமோ நமோ', 'ஹாரா நூபுர தாரி நமோ நமோ', 'ஜ்யோதிஷார்சித பீதா நமோ நமோ - ஜெயசீல'],
  ['த்யான மங்கள ரூபா நமோ நமோ', 'காநாந்தர வாஸா நமோ நமோ', 'வாஸவார்ஷ்ரித தேவா நமோ நமோ - ந்ருபதாச'],
  ['காந்த ஸ்ரிங்க நிவாசா நமோ நமோ', 'ஷாந்தி தாயகா தேவா நமோ நமோ', 'தேவ வந்த்ய கிரீஷா நமோ நமோ - பரதேவா'],
  ['மூல மந்திர ஸ்வரூபா நமோ நமோ', 'பால விக்ரஹா மூலா நமோ நமோ', 'புத்ரதாயகா தேவா நமோ நமோ - வரபாலா'],
  ['ஈஷ கேசவ சூனா நமோ நமோ', 'பாச ஜன்ம வினாஷா நமோ நமோ', 'ஆர்தி நாஸன மூர்தி நமோ நமோ - திவ்ய ரூபா'],
  ['தீப மங்கள ஜ்யோதி நமோ நமோ', 'தூய அம்பல லீலா நமோ நமோ', 'தேவ குஞ்சரி பாதா நமோ நமோ.... அருள் தாரா!'],
] as const;
const scriptByLanguage: Record<Exclude<DeepaaradhanaLanguage, 'en'>, string> = {
  te: 'telugu', ta: 'tamil', kn: 'kannada',
};

const ui = {
  en: { title: 'Ayyappa Deepaaradhana', subtitle: 'Arya Vamsha Sujatha', offline: 'Available offline', source: 'Temple prayer-book lyrics' },
  te: { title: 'అయ్యప్ప దీపారాధన', subtitle: 'ఆర్య వంశ సుజాత', offline: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది', source: 'ఆలయ ప్రార్థనా పుస్తక సాహిత్యం' },
  ta: { title: 'ஐயப்ப தீபாராதனை', subtitle: 'ஆர்ய வம்ச சுஜாதா', offline: 'ஆஃப்லைனில் கிடைக்கும்', source: 'கோவில் பிரார்த்தனைப் புத்தகப் பாடல்' },
  kn: { title: 'ಅಯ್ಯಪ್ಪ ದೀಪಾರಾಧನೆ', subtitle: 'ಆರ್ಯ ವಂಶ ಸುಜಾತ', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ', source: 'ದೇವಾಲಯದ ಪ್ರಾರ್ಥನಾ ಪುಸ್ತಕದ ಸಾಹಿತ್ಯ' },
} as const;

export function getAyyappaDeepaaradhana(language: DeepaaradhanaLanguage) {
  return {
    ...ui[language],
    stanzas: language === 'en' ? stanzas : language === 'ta' ? tamilStanzas : itransStanzas.map((stanza) => stanza.map((line) => Sanscript.t(line, 'itrans_dravidian', scriptByLanguage[language]))),
    ending: language === 'en' ? ending : language === 'ta' ? 'சுவாமியே சரணம் ஐயப்பா' : Sanscript.t('svAmiye sharaNaM ayyappA', 'itrans_dravidian', scriptByLanguage[language]),
  };
}
