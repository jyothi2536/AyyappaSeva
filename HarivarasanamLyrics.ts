export type LyricsLanguage = 'en' | 'te' | 'ta' | 'kn';

export const harivarasanamUi: Record<LyricsLanguage, { video: string; lyrics: string; offline: string; source: string }> = {
  en: { video: 'Video', lyrics: 'Lyrics', offline: 'Available offline', source: 'Temple-provided devotional text' },
  te: { video: 'వీడియో', lyrics: 'సాహిత్యం', offline: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది', source: 'ఆలయం అందించిన భక్తి సాహిత్యం' },
  ta: { video: 'காணொளி', lyrics: 'பாடல் வரிகள்', offline: 'ஆஃப்லைனில் கிடைக்கும்', source: 'கோவில் வழங்கிய பக்திப் பாடல்' },
  kn: { video: 'ವೀಡಿಯೊ', lyrics: 'ಸಾಹಿತ್ಯ', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ', source: 'ದೇವಾಲಯ ನೀಡಿದ ಭಕ್ತಿ ಸಾಹಿತ್ಯ' },
};

export const harivarasanamLyrics: Record<LyricsLanguage, string> = {
  en: `Harivarasanam Viswamohanam
Haridadhiswaram Aaradhyapadukam
Arivimardanam Nityanartanam
Hariharatmajam Devamashraye || 1 ||

Sharanam Ayyappa, Swami Sharanam Ayyappa

Sharanakirtanam Shaktamanasam
Bharanalolupam Nartanalasam
Arunabhasuram Bhutanayakam
Hariharatmajam Devamashraye || 2 ||

Pranayasatyakam Prananayakam
Pranatakalpakam Suprabhanchitam
Pranavamandiram Kirtanapriyam
Hariharatmajam Devamashraye || 3 ||

Sharanam Ayyappa, Swami Sharanam Ayyappa

Turagavahanam Sundarananam
Varagadayudham Vedavarnitam
Gurukripakaram Kirtanapriyam
Hariharatmajam Devamashraye || 4 ||

Tribhuvanarchitam Devatatmakam
Trinayanam Prabhum Divyadesikam
Tridasapujitam Chintitapradam
Hariharatmajam Devamashraye || 5 ||

Sharanam Ayyappa, Swami Sharanam Ayyappa

Bhavabhayapaham Bhavukavaham
Bhuvanamohanam Bhutibhushanam
Dhavalavahanam Divyavaranam
Hariharatmajam Devamashraye || 6 ||

Kalamridusmitam Sundarananam
Kalabhakomalam Gatramohanam
Kalabhakesari Vajivahanam
Hariharatmajam Devamashraye || 7 ||

Sharanam Ayyappa, Swami Sharanam Ayyappa

Sritajanapriyam Chintitapradam
Srutivibhushanam Sadhujeevanam
Srutimanoharam Geetalalasam
Hariharatmajam Devamashraye || 8 ||

Sharanam Ayyappa, Swami Sharanam Ayyappa`,

  te: `హరివరాసనం విశ్వమోహనం
హరిదధీశ్వరం ఆరాధ్యపాదుకం
అరివిమర్దనం నిత్యనర్తనం
హరిహరాత్మజం దేవమాశ్రయే || 1 ||

శరణం అయ్యప్ప, స్వామి శరణం అయ్యప్ప

శరణకీర్తనం శక్తమానసం
భరణలోలుపం నర్తనాలసం
అరుణభాసురం భూతనాయకం
హరిహరాత్మజం దేవమాశ్రయే || 2 ||

ప్రణయసత్యకం ప్రాణనాయకం
ప్రణతకల్పకం సుప్రభాంచితం
ప్రణవమందిరం కీర్తనప్రియం
హరిహరాత్మజం దేవమాశ్రయే || 3 ||

శరణం అయ్యప్ప, స్వామి శరణం అయ్యప్ప

తురగవాహనం సుందరాననం
వరగదాయుధం వేదవర్ణితం
గురుకృపాకరం కీర్తనప్రియం
హరిహరాత్మజం దేవమాశ్రయే || 4 ||

త్రిభువనార్చితం దేవతాత్మకం
త్రినయనం ప్రభుం దివ్యదేశికం
త్రిదశపూజితం చింతితప్రదం
హరిహరాత్మజం దేవమాశ్రయే || 5 ||

శరణం అయ్యప్ప, స్వామి శరణం అయ్యప్ప

భవభయాపహం భావుకావహం
భువనమోహనం భూతిభూషణం
ధవళవాహనం దివ్యవారణం
హరిహరాత్మజం దేవమాశ్రయే || 6 ||

కళమృదుస్మితం సుందరాననం
కళభకోమలం గాత్రమోహనం
కళభకేసరి వాజివాహనం
హరిహరాత్మజం దేవమాశ్రయే || 7 ||

శరణం అయ్యప్ప, స్వామి శరణం అయ్యప్ప

శ్రితజనప్రియం చింతితప్రదం
శృతివిభూషణం సాధుజీవనం
శృతిమనోహరం గీతలాలసం
హరిహరాత్మజం దేవమాశ్రయే || 8 ||

శరణం అయ్యప్ప, స్వామి శరణం అయ్యప్ప`,

  ta: `ஹரிவராஸனம் விஸ்வமோஹனம்
ஹரிததீஸ்வரம் ஆராத்யபாதுகம்
அரிவிமர்தனம் நித்யநர்தனம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 1 ||

சரணம் ஐயப்பா, ஸ்வாமி சரணம் ஐயப்பா

சரணகீர்த்தனம் சக்தமானஸம்
பரணலோலுபம் நர்த்தனாலஸம்
அருணபாஸுரம் பூதநாயகம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 2 ||

ப்ரணயஸத்யகம் ப்ராணநாயகம்
ப்ரணதகல்பகம் ஸுப்ரபாஞ்சிதம்
ப்ரணவமந்திரம் கீர்த்தனப்ரியம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 3 ||

சரணம் ஐயப்பா, ஸ்வாமி சரணம் ஐயப்பா

துரகவாஹனம் ஸுந்தரானனம்
வரகதாயுதம் வேதவர்ணிதம்
குருக்ருபாகரம் கீர்த்தனப்ரியம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 4 ||

த்ரிபுவனார்ச்சிதம் தேவதாத்மகம்
த்ரிநயனம் ப்ரபும் திவ்யதேசிகம்
த்ரிதசபூஜிதம் சிந்திதப்ரதம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 5 ||

சரணம் ஐயப்பா, ஸ்வாமி சரணம் ஐயப்பா

பவபயாபஹம் பாவுகாவஹம்
புவனமோஹனம் பூதிபூஷணம்
தவளவாஹனம் திவ்யவாரணம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 6 ||

கலம்ருதுஸ்மிதம் ஸுந்தரானனம்
கலபகோமலம் காத்ரமோஹனம்
கலபகேஸரி வாஜிவாஹனம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 7 ||

சரணம் ஐயப்பா, ஸ்வாமி சரணம் ஐயப்பா

ஸ்ரிதஜனப்ரியம் சிந்திதப்ரதம்
ஸ்ருதிவிபூஷணம் ஸாதுஜீவனம்
ஸ்ருதிமனோஹரம் கீதலாலஸம்
ஹரிஹராத்மஜம் தேவமாஸ்ரயே || 8 ||

சரணம் ஐயப்பா, ஸ்வாமி சரணம் ஐயப்பா`,

  kn: `ಹರಿವರಾಸನಂ ವಿಶ್ವಮೋಹನಂ
ಹರಿದಧೀಶ್ವರಂ ಆರಾಧ್ಯಪಾದುಕಂ
ಅರಿವಿಮರ್ದನಂ ನಿತ್ಯನರ್ತನಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 1 ||

ಶರಣಂ ಅಯ್ಯಪ್ಪ, ಸ್ವಾಮಿ ಶರಣಂ ಅಯ್ಯಪ್ಪ

ಶರಣಕೀರ್ತನಂ ಶಕ್ತಮಾನಸಂ
ಭರಣಲೋಲುಪಂ ನರ್ತನಾಲಸಂ
ಅರುಣಭಾಸುರಂ ಭೂತನಾಯಕಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 2 ||

ಪ್ರಣಯಸತ್ಯಕಂ ಪ್ರಾಣನಾಯಕಂ
ಪ್ರಣತಕಲ್ಪಕಂ ಸುಪ್ರಭಾಂಚಿತಂ
ಪ್ರಣವಮಂದಿರಂ ಕೀರ್ತನಪ್ರಿಯಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 3 ||

ಶರಣಂ ಅಯ್ಯಪ್ಪ, ಸ್ವಾಮಿ ಶರಣಂ ಅಯ್ಯಪ್ಪ

ತುರಗವಾಹನಂ ಸುಂದರಾನನಂ
ವರಗದಾಯುಧಂ ವೇದವರ್ಣಿತಂ
ಗುರುಕೃಪಾಕರಂ ಕೀರ್ತನಪ್ರಿಯಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 4 ||

ತ್ರಿಭುವನಾರ್ಚಿತಂ ದೇವತಾತ್ಮಕಂ
ತ್ರಿನಯನಂ ಪ್ರಭುಂ ದಿವ್ಯದೇಶಿಕಂ
ತ್ರಿದಶಪೂಜಿತಂ ಚಿಂತಿತಪ್ರದಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 5 ||

ಶರಣಂ ಅಯ್ಯಪ್ಪ, ಸ್ವಾಮಿ ಶರಣಂ ಅಯ್ಯಪ್ಪ

ಭವಭಯಾಪಹಂ ಭಾವುಕಾವಹಂ
ಭುವನಮೋಹನಂ ಭೂತಿಭೂಷಣಂ
ಧವಳವಾಹನಂ ದಿವ್ಯವಾರಣಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 6 ||

ಕಲಮೃದುಸ್ಮಿತಂ ಸುಂದರಾನನಂ
ಕಲಭಕೋಮಲಂ ಗಾತ್ರಮೋಹನಂ
ಕಲಭಕೇಸರಿ ವಾಜಿವಾಹನಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 7 ||

ಶರಣಂ ಅಯ್ಯಪ್ಪ, ಸ್ವಾಮಿ ಶರಣಂ ಅಯ್ಯಪ್ಪ

ಶ್ರಿತಜನಪ್ರಿಯಂ ಚಿಂತಿತಪ್ರದಂ
ಶ್ರುತಿವಿಭೂಷಣಂ ಸಾಧುಜೀವನಂ
ಶ್ರುತಿಮನೋಹರಂ ಗೀತಲಾಲಸಂ
ಹರಿಹರಾತ್ಮಜಂ ದೇವಮಾಶ್ರಯೇ || 8 ||

ಶರಣಂ ಅಯ್ಯಪ್ಪ, ಸ್ವಾಮಿ ಶರಣಂ ಅಯ್ಯಪ್ಪ`,
};
