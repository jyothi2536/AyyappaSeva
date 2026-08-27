import Sanscript from '@indic-transliteration/sanscript';

export type SaranamLanguage = 'en' | 'te' | 'ta' | 'kn';

const names = [
  'Swamiye', 'Harihara Suthane', 'Kannimoola Mahaa Ganapathy Bhagavaane', 'Shakti Vadivelan Sodarane',
  'Maalikaippurattu Manjamma Devi Lokamathave', 'Vaavar Swamiye', 'Karuppanna Swamiye', 'Periya Kadutta Swamiye',
  'Cheriya Kadutta Swamiye', 'Vana Devathamaare', 'Durga Bhagavathi Maare', 'Achchan Kovil Arase',
  'Anaadha Rakshagane', 'Annadhaana Prabhuve', 'Achcham Thavirpavane', 'Ambalathu Aasane',
  'Abhaya Dayakane', 'Ahandai Azhippavane', 'Ashta Siddhi Dayagane', 'Andinorai Aadarikkum Deivame',
  'Azhuthayil Vaasane', 'Aaryankaavu Ayyaave', 'Aapath Baandhavane', 'Ananda Jyotiye',
  'Aatma Swaroopiye', 'Aanaimukhan Thambiye', 'Irumudi Priyane', 'Innalai Theerppavane',
  'Iha Para Sukha Daayakane', 'Hrudaya Kamala Vaasane', 'Eedillaa Inbam Alippavane', 'Umaiyaval Baalakane',
  'Umaikku Arul Purindavane', 'Uzhvinai Akatruvone', 'Ukkam Alippavane', 'Engum Niraindhone',
  'Enillaa Roopane', 'En Kula Deivame', 'En Guru Naathane', 'Erumeli Vaazhum Kiraata Shasthaave',
  'Engum Nirainda Naada Brahmame', 'Ellorkkum Arul Puribavane', 'Etrumaanoorappan Magane', 'Ekaantha Vaasiye',
  'Ezhaikkarul Puriyum Eesane', 'Aindhumalai Vaasane', 'Aiyyangal Theerppavane', 'Oppillaa Maanikkame',
  'Omkaara Parabrahmame', 'Kaliyuga Varadane', 'Kan Kanda Deivame', 'Kambankudiku Udaiya Naathane',
  'Karunaa Samudrame', 'Karpoora Jyotiye', 'Sabari Giri Vaasane', 'Shathru Samhaara Moorthiye',
  'Sharanaagatha Rakshakane', 'Sharana Ghosha Priyane', 'Shabarikku Arul Purindavane', 'Shambhu Kumaarane',
  'Satya Swaroopane', 'Sankatam Theerppavane', 'Sanchalam Azhippavane', 'Shanmukha Sodarane',
  'Dhanvantari Moorthiye', 'Nambinorai Kaakkum Deivame', 'Narttana Priyane', 'Pandala Raajakumaarane',
  'Pambai Baalakane', 'Parasuraama Poojithane', 'Bhakta Jana Rakshakane', 'Bhakta Vatsalane',
  'Paramashivan Puthirane', 'Pambaa Vaasane', 'Parama Dayaalane', 'Manikanda Porule',
  'Makara Jyotiye', 'Vaikkathu Appan Makane', 'Kaanaka Vaasane', 'Kulathupuzhai Baalakane',
  'Guruvaayoorappan Makane', 'Kaivalya Pada Daayakane', 'Jaathi Matha Bhedam Illathavane', 'Shiva Shakti Aikya Swaroopane',
  'Sevipparku Aananda Moorthiye', 'Dushtar Bhayam Neekkuvone', 'Devaadi Devane', 'Devarkal Thuyaram Theerthavane',
  'Devendra Poojithane', 'Narayanan Mainthane', 'Neyyabhisheka Priyane', 'Pranava Swaroopane',
  'Paapa Samhaara Moorthiye', 'Paayasanna Priyane', 'Vanpuli Vaahanane', 'Varapradaayakane',
  'Bhaagavathothamane', 'Ponnambala Vaasane', 'Mohini Suthane', 'Mohana Roopane',
  'Villan Vilaali Veerane', 'Veeramani Kantane', 'Sadguru Naathane', 'Sarva Roga Nivaarakane',
  'Satchidaananda Swaroopiye', 'Sarvaabheeshta Daayakane', 'Saaswatha Padam Alippavane', 'Pathinettam Padikkutaiya Naathane',
] as const;

const scriptByLanguage: Record<Exclude<SaranamLanguage, 'en'>, string> = {
  te: 'telugu', ta: 'tamil', kn: 'kannada',
};

const ui = {
  en: { title: '108 Saranams', subtitle: 'Complete Sarana Ghosham', offline: 'Available offline', intro: 'Om Swamiye Saranam Ayyappa', source: 'Traditional list verified with Arulmigu Ananda Ayyappan Temple' },
  te: { title: '108 శరణాలు', subtitle: 'సంపూర్ణ శరణ ఘోషం', offline: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది', intro: 'ఓం స్వామియే శరణం అయ్యప్ప', source: 'అరుళ్మిగు ఆనంద అయ్యప్పన్ ఆలయ జాబితాతో ధృవీకరించబడింది' },
  ta: { title: '108 சரணங்கள்', subtitle: 'முழுமையான சரண கோஷம்', offline: 'ஆஃப்லைனில் கிடைக்கும்', intro: 'ஓம் ஸ்வாமியே சரணம் ஐயப்பா', source: 'அருள்மிகு ஆனந்த ஐயப்பன் கோவில் பட்டியலுடன் சரிபார்க்கப்பட்டது' },
  kn: { title: '108 ಶರಣಗಳು', subtitle: 'ಸಂಪೂರ್ಣ ಶರಣ ಘೋಷ', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ', intro: 'ಓಂ ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ', source: 'ಅರುಳ್ಮಿಗು ಆನಂದ ಅಯ್ಯಪ್ಪನ್ ದೇವಾಲಯದ ಪಟ್ಟಿಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
} as const;

function toItrans(text: string) {
  return text.toLowerCase()
    .replace(/aa/g, 'A').replace(/ee/g, 'I').replace(/oo/g, 'U')
    .replace(/zh/g, 'L').replace(/sh/g, 'sh');
}

export function getAyyappa108(language: SaranamLanguage) {
  const suffix = language === 'en'
    ? 'Saranam Ayyappa'
    : Sanscript.t('sharaNaM ayyappA', 'itrans_dravidian', scriptByLanguage[language]);
  const lines = names.map((name, index) => {
    const renderedName = language === 'en'
      ? name
      : Sanscript.t(toItrans(name), 'itrans_dravidian', scriptByLanguage[language]);
    return `${index + 1}. ${renderedName} — ${suffix}`;
  });
  return { ...ui[language], lines };
}

