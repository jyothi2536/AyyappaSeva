import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export type ScriptureLanguage = 'en' | 'te' | 'ta' | 'kn';

type LocalizedTrack = { title: string; verse: string; meaning: string };
type ScriptureTrack = {
  id: string;
  collection: 'gita' | 'ramayana';
  reference: string;
  duration: string;
  source: number;
  sourceUrl: string;
  copy: Record<ScriptureLanguage, LocalizedTrack>;
};

const palette = { ink: '#0B0B08', surface: '#15150F', gold: '#E9B949', cream: '#FFF3D6', muted: '#A8A38F', line: 'rgba(233,185,73,0.16)', green: '#344D36' };

const ui: Record<ScriptureLanguage, Record<string, string>> = {
  en: { back: 'Sacred library', eyebrow: 'LISTEN OFFLINE', title: 'Sacred scripture audio', intro: 'Listen to Sanskrit recitations while reading the verse and meaning in your chosen language.', gita: 'BHAGAVAD GITA', ramayana: 'VALMIKI RAMAYANA', meaning: 'Meaning', play: 'Listen', pause: 'Pause', replay: 'Replay', offline: 'Included offline', credits: 'Audio sources & licenses', creditBody: 'Gita: NehalDaveND, CC BY-SA 4.0. Ramayana: Sriram Ghanapaati and Harisitarama Murti Ghanapaati, CC BY-SA 2.5 India. Source: Wikimedia Commons.', original: 'Original Sanskrit recitation' },
  te: { back: 'పవిత్ర గ్రంథాలయం', eyebrow: 'ఆఫ్‌లైన్‌లో వినండి', title: 'పవిత్ర గ్రంథాల ఆడియో', intro: 'మీరు ఎంచుకున్న భాషలో శ్లోకం మరియు అర్థాన్ని చదువుతూ సంస్కృత పారాయణాన్ని వినండి.', gita: 'భగవద్గీత', ramayana: 'వాల్మీకి రామాయణం', meaning: 'అర్థం', play: 'వినండి', pause: 'ఆపండి', replay: 'మళ్లీ వినండి', offline: 'ఆఫ్‌లైన్‌లో ఉంది', credits: 'ఆడియో మూలాలు & లైసెన్సులు', creditBody: 'గీత: NehalDaveND, CC BY-SA 4.0. రామాయణం: Sriram Ghanapaati మరియు Harisitarama Murti Ghanapaati, CC BY-SA 2.5 India. మూలం: Wikimedia Commons.', original: 'మూల సంస్కృత పారాయణం' },
  ta: { back: 'புனித நூலகம்', eyebrow: 'ஆஃப்லைனில் கேளுங்கள்', title: 'புனித நூல் ஒலிகள்', intro: 'தேர்ந்தெடுத்த மொழியில் சுலோகத்தையும் பொருளையும் வாசித்தபடி சமஸ்கிருத பாராயணத்தைக் கேளுங்கள்.', gita: 'பகவத் கீதை', ramayana: 'வால்மீகி ராமாயணம்', meaning: 'பொருள்', play: 'கேளுங்கள்', pause: 'இடைநிறுத்து', replay: 'மீண்டும் கேள்', offline: 'ஆஃப்லைனில் உள்ளது', credits: 'ஒலி மூலங்கள் & உரிமங்கள்', creditBody: 'கீதை: NehalDaveND, CC BY-SA 4.0. ராமாயணம்: Sriram Ghanapaati மற்றும் Harisitarama Murti Ghanapaati, CC BY-SA 2.5 India. மூலம்: Wikimedia Commons.', original: 'மூல சமஸ்கிருத பாராயணம்' },
  kn: { back: 'ಪವಿತ್ರ ಗ್ರಂಥಾಲಯ', eyebrow: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕೇಳಿ', title: 'ಪವಿತ್ರ ಗ್ರಂಥಗಳ ಧ್ವನಿ', intro: 'ನೀವು ಆರಿಸಿದ ಭಾಷೆಯಲ್ಲಿ ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥವನ್ನು ಓದುತ್ತಾ ಸಂಸ್ಕೃತ ಪಾರಾಯಣವನ್ನು ಕೇಳಿ.', gita: 'ಭಗವದ್ಗೀತೆ', ramayana: 'ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣ', meaning: 'ಅರ್ಥ', play: 'ಕೇಳಿ', pause: 'ವಿರಾಮ', replay: 'ಮತ್ತೆ ಕೇಳಿ', offline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಇದೆ', credits: 'ಧ್ವನಿ ಮೂಲಗಳು & ಪರವಾನಗಿಗಳು', creditBody: 'ಗೀತೆ: NehalDaveND, CC BY-SA 4.0. ರಾಮಾಯಣ: Sriram Ghanapaati ಮತ್ತು Harisitarama Murti Ghanapaati, CC BY-SA 2.5 India. ಮೂಲ: Wikimedia Commons.', original: 'ಮೂಲ ಸಂಸ್ಕೃತ ಪಾರಾಯಣ' },
};

const tracks: ScriptureTrack[] = [
  {
    id: 'gita-2-47', collection: 'gita', reference: '2.47', duration: '00:16', source: require('./assets/audio/scriptures/gita-2-47-karmanye.wav'), sourceUrl: 'https://commons.wikimedia.org/wiki/File:कर्मण्येवाधिकारस्ते.wav',
    copy: {
      en: { title: 'Your right is to action', verse: "Karmanye vadhikaraste\nma phaleshu kadachana\nma karma-phala-hetur bhur\nma te sango 'stv akarmani", meaning: 'You have a right to perform your duty, but never to its results. Do not act only for reward, and do not become attached to inaction.' },
      te: { title: 'కర్మ చేయడమే నీ అధికారం', verse: 'కర్మణ్యేవాధికారస్తే మా ఫలేషు కదాచన ।\nమా కర్మఫలహేతుర్భూర్మా తే సంగోఽస్త్వకర్మణి ॥', meaning: 'నీకు కర్మ చేయడంలోనే అధికారం ఉంది; ఫలంపై కాదు. ఫలాన్నే ఉద్దేశంగా చేసుకోకు, అకర్మ పట్ల కూడా ఆసక్తి చూపకు.' },
      ta: { title: 'செயலில் மட்டுமே உன் உரிமை', verse: 'கர்மண்யேவாதிகாரஸ்தே மா பலேஷு கதாசன ।\nமா கர்மபலஹேதுர்பூர்மா தே ஸங்கோஸ்த்வகர்மணி ॥', meaning: 'கடமையைச் செய்வதில் உனக்கு உரிமை உண்டு; அதன் பலனில் இல்லை. பலனை மட்டும் நோக்கமாகக் கொள்ளாதே; செயலின்மையிலும் பற்றுக் கொள்ளாதே.' },
      kn: { title: 'ಕರ್ಮ ಮಾಡುವುದೇ ನಿನ್ನ ಅಧಿಕಾರ', verse: 'ಕರ್ಮಣ್ಯೇವಾಧಿಕಾರಸ್ತೇ ಮಾ ಫಲೇಷು ಕದಾಚನ ।\nಮಾ ಕರ್ಮಫಲಹೇತುರ್ಭೂರ್ಮಾ ತೇ ಸಂಗೋಸ್ತ್ವಕರ್ಮಣಿ ॥', meaning: 'ನಿನಗೆ ಕರ್ಮ ಮಾಡುವುದರಲ್ಲಿ ಮಾತ್ರ ಅಧಿಕಾರವಿದೆ; ಫಲದಲ್ಲಿ ಅಲ್ಲ. ಫಲವನ್ನೇ ಉದ್ದೇಶಿಸಬೇಡ ಮತ್ತು ಅಕರ್ಮದಲ್ಲಿಯೂ ಆಸಕ್ತಿ ಹೊಂದಬೇಡ.' },
    },
  },
  {
    id: 'gita-2-20', collection: 'gita', reference: '2.20', duration: '00:19', source: require('./assets/audio/scriptures/gita-2-20-na-jayate.wav'), sourceUrl: 'https://commons.wikimedia.org/wiki/File:न_जायते_म्रियते_वा.wav',
    copy: {
      en: { title: 'The Self is eternal', verse: "Na jayate mriyate va kadachin\nnayam bhutva bhavita va na bhuyah\najo nityah shashvato 'yam purano\nna hanyate hanyamane sharire", meaning: 'The Self is never born and never dies. Unborn, eternal and ancient, it is not destroyed when the body is destroyed.' },
      te: { title: 'ఆత్మ శాశ్వతమైనది', verse: 'న జాయతే మ్రియతే వా కదాచిన్\nనాయం భూత్వా భవితా వా న భూయః ।\nఅజో నిత్యః శాశ్వతోఽయం పురాణో\nన హన్యతే హన్యమానే శరీరే ॥', meaning: 'ఆత్మకు జననమూ మరణమూ లేవు. అది అజన్మ, నిత్య, శాశ్వత, పురాతనమైనది; శరీరం నశించినా ఆత్మ నశించదు.' },
      ta: { title: 'ஆன்மா நித்தியமானது', verse: 'ந ஜாயதே ம்ரியதே வா கதாசித்\nநாயம் பூத்வா பவிதா வா ந பூய: ।\nஅஜோ நித்ய: சாஷ்வதோயம் புராணோ\nந ஹந்யதே ஹந்யமானே சரீரே ॥', meaning: 'ஆன்மா பிறப்பதும் இல்லை, இறப்பதும் இல்லை. பிறப்பற்ற, நித்தியமான, பழமையான அது உடல் அழிந்தாலும் அழிவதில்லை.' },
      kn: { title: 'ಆತ್ಮ ಶಾಶ್ವತವಾದುದು', verse: 'ನ ಜಾಯತೇ ಮ್ರಿಯತೇ ವಾ ಕದಾಚಿನ್\nನಾಯಂ ಭೂತ್ವಾ ಭವಿತಾ ವಾ ನ ಭೂಯಃ ।\nಅಜೋ ನಿತ್ಯಃ ಶಾಶ್ವತೋಯಂ ಪುರಾಣೋ\nನ ಹನ್ಯತೇ ಹನ್ಯಮಾನೇ ಶರೀರೇ ॥', meaning: 'ಆತ್ಮಕ್ಕೆ ಹುಟ್ಟು ಅಥವಾ ಸಾವು ಇಲ್ಲ. ಅದು ಅಜ, ನಿತ್ಯ, ಶಾಶ್ವತ ಮತ್ತು ಪುರಾತನ; ದೇಹ ನಾಶವಾದರೂ ಆತ್ಮ ನಾಶವಾಗುವುದಿಲ್ಲ.' },
    },
  },
  {
    id: 'gita-2-22', collection: 'gita', reference: '2.22', duration: '00:18', source: require('./assets/audio/scriptures/gita-2-22-vasamsi.wav'), sourceUrl: 'https://commons.wikimedia.org/wiki/File:वासांसि_जीर्णानि_यथा.wav',
    copy: {
      en: { title: 'As one changes garments', verse: 'Vasamsi jirnani yatha vihaya\nnavani grihnati naro parani\ntatha sharirani vihaya jirnany\nanyani samyati navani dehi', meaning: 'As a person discards worn-out clothes and puts on new ones, the embodied Self leaves old bodies and enters new ones.' },
      te: { title: 'వస్త్రాలను మార్చినట్లే', verse: 'వాసాంసి జీర్ణాని యథా విహాయ\nనవాని గృహ్ణాతి నరోఽపరాణి ।\nతథా శరీరాణి విహాయ జీర్ణా-\nన్యన్యాని సంయాతి నవాని దేహీ ॥', meaning: 'మనిషి పాత వస్త్రాలను విడిచి కొత్తవి ధరించినట్లే, దేహి పాత శరీరాలను విడిచి కొత్త శరీరాలను పొందుతుంది.' },
      ta: { title: 'ஆடைகளை மாற்றுவது போல', verse: 'வாஸாம்ஸி ஜீர்ணானி யதா விஹாய\nநவானி க்ருஹ்ணாதி நரோபராணி ।\nததா சரீராணி விஹாய ஜீர்ணா-\nந்யன்யானி ஸம்யாதி நவானி தேஹீ ॥', meaning: 'ஒருவர் பழைய ஆடைகளை நீக்கிப் புதியவற்றை அணிவது போல, ஆன்மா பழைய உடல்களை நீக்கிப் புதிய உடல்களை ஏற்கிறது.' },
      kn: { title: 'ವಸ್ತ್ರಗಳನ್ನು ಬದಲಿಸುವಂತೆ', verse: 'ವಾಸಾಂಸಿ ಜೀರ್ಣಾನಿ ಯಥಾ ವಿಹಾಯ\nನವಾನಿ ಗೃಹ್ಣಾತಿ ನರೋಪರಾಣಿ ।\nತಥಾ ಶರೀರಾಣಿ ವಿಹಾಯ ಜೀರ್ಣಾ-\nನ್ಯನ್ಯಾನಿ ಸಂಯಾತಿ ನವಾನಿ ದೇಹೀ ॥', meaning: 'ಮನುಷ್ಯನು ಹಳೆಯ ಬಟ್ಟೆಗಳನ್ನು ಬಿಟ್ಟು ಹೊಸದನ್ನು ಧರಿಸುವಂತೆ, ಆತ್ಮವು ಹಳೆಯ ದೇಹಗಳನ್ನು ಬಿಟ್ಟು ಹೊಸ ದೇಹಗಳನ್ನು ಪಡೆಯುತ್ತದೆ.' },
    },
  },
  {
    id: 'ramayana-1-4', collection: 'ramayana', reference: 'Bala Kanda · Sarga 4', duration: '06:33', source: require('./assets/audio/scriptures/ramayana-bala-kanda-sarga-4.ogg'), sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kanda_1_BK-004-Ramayana_Gaanam.ogg',
    copy: {
      en: { title: 'Lava and Kusha sing the Ramayana', verse: 'Prapta-rajyasya Ramasya\nValmikir Bhagavan rishih\nchakara charitam kritsnam\nvichitra-padam arthavat', meaning: 'Sage Valmiki composed the complete, meaningful story of Rama after Rama attained the kingdom. This passage introduces Lava and Kusha singing the epic before Sri Rama.' },
      te: { title: 'లవకుశులు రామాయణ గానం', verse: 'ప్రాప్తరాజ్యస్య రామస్య\nవాల్మీకిర్భగవానృషిః ।\nచకార చరితం కృత్స్నం\nవిచిత్రపదమర్థవత్ ॥', meaning: 'శ్రీరాముడు రాజ్యాన్ని పొందిన తరువాత వాల్మీకి మహర్షి అర్థవంతమైన సంపూర్ణ రామచరిత్రను రచించారు. ఈ సర్గలో లవకుశులు శ్రీరాముని ముందు రామాయణాన్ని గానం చేస్తారు.' },
      ta: { title: 'லவ குசர் ராமாயணம் பாடுதல்', verse: 'ப்ராப்தராஜ்யஸ்ய ராமஸ்ய\nவால்மீகிர்பகவான்ருஷி: ।\nசகார சரிதம் க்ருத்ஸ்நம்\nவிசித்ரபதமர்த்தவத் ॥', meaning: 'ஸ்ரீராமர் அரசை அடைந்தபின் வால்மீகி முனிவர் பொருள் நிறைந்த முழு ராம சரிதத்தை இயற்றினார். இச்சர்க்கத்தில் லவ குசர் ஸ்ரீராமர் முன் ராமாயணத்தைப் பாடுகின்றனர்.' },
      kn: { title: 'ಲವಕುಶರಿಂದ ರಾಮಾಯಣ ಗಾನ', verse: 'ಪ್ರಾಪ್ತರಾಜ್ಯಸ್ಯ ರಾಮಸ್ಯ\nವಾಲ್ಮೀಕಿರ್ಭಗವಾನೃಷಿಃ ।\nಚಕಾರ ಚರಿತಂ ಕೃತ್ಸ್ನಂ\nವಿಚಿತ್ರಪದಮರ್ಥವತ್ ॥', meaning: 'ಶ್ರೀರಾಮನು ರಾಜ್ಯ ಪಡೆದ ನಂತರ ವಾಲ್ಮೀಕಿ ಮಹರ್ಷಿಯು ಅರ್ಥಪೂರ್ಣವಾದ ಸಂಪೂರ್ಣ ರಾಮಚರಿತೆಯನ್ನು ರಚಿಸಿದರು. ಈ ಸರ್ಗದಲ್ಲಿ ಲವಕುಶರು ಶ್ರೀರಾಮನ ಮುಂದೆ ರಾಮಾಯಣವನ್ನು ಹಾಡುತ್ತಾರೆ.' },
    },
  },
  {
    id: 'ramayana-1-67', collection: 'ramayana', reference: 'Bala Kanda · Sarga 67', duration: '04:22', source: require('./assets/audio/scriptures/ramayana-bala-kanda-sarga-67.ogg'), sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kanda_1_BK-067-Shiva_Dhanur_Bhamgaha.ogg',
    copy: {
      en: { title: "Rama breaks Shiva's bow", verse: 'Tasya shabdo mahan asin\nnirghata-sama-nihsvanah\nbhumi-kampash cha sumahan\nparvatasyeva diryatah', meaning: 'The bow broke with a tremendous sound like a thunderclap; the earth shook as though a mountain were splitting apart.' },
      te: { title: 'శివధనుస్సును విరిచిన శ్రీరాముడు', verse: 'తస్య శబ్దో మహానాసీన్\nనిర్ఘాతసమనిఃస్వనః ।\nభూమికంపశ్చ సుమహాన్\nపర్వతస్యేవ దీర్యతః ॥', meaning: 'ఆ ధనుస్సు పిడుగు వంటి గొప్ప శబ్దంతో విరిగింది; పర్వతం చీలినట్లుగా భూమి బలంగా కంపించింది.' },
      ta: { title: 'சிவ தனுசை முறித்த ஸ்ரீராமர்', verse: 'தஸ்ய சப்தோ மஹானாஸீன்\nநிர்காதஸமநி:ஸ்வன: ।\nபூமிகம்பச்ச ஸுமஹான்\nபர்வதஸ்யேவ தீர்யத: ॥', meaning: 'அந்த வில் இடியொலி போன்ற பெரும் சத்தத்துடன் முறிந்தது; மலை பிளப்பது போல பூமி வலுவாக அதிர்ந்தது.' },
      kn: { title: 'ಶಿವಧನುಸ್ಸನ್ನು ಮುರಿದ ಶ್ರೀರಾಮ', verse: 'ತಸ್ಯ ಶಬ್ದೋ ಮಹಾನಾಸೀನ್\nನಿರ್ಘಾತಸಮನಿಃಸ್ವನಃ ।\nಭೂಮಿಕಂಪಶ್ಚ ಸುಮಹಾನ್\nಪರ್ವತಸ್ಯೇವ ದೀರ್ಯತಃ ॥', meaning: 'ಆ ಧನುಸ್ಸು ಸಿಡಿಲಿನಂತಹ ಭಾರೀ ಶಬ್ದದೊಂದಿಗೆ ಮುರಿಯಿತು; ಪರ್ವತ ಸೀಳಿದಂತೆ ಭೂಮಿ ಬಲವಾಗಿ ಕಂಪಿಸಿತು.' },
    },
  },
];

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function ScriptureAudioScreen({ language, onBack }: { language: ScriptureLanguage; onBack: () => void }) {
  const copy = ui[language];
  const soundRef = useRef<Audio.Sound | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true }).catch(() => {});
    return () => { soundRef.current?.unloadAsync().catch(() => {}); };
  }, []);

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    if (status.didJustFinish) setPlaying(false);
  };

  const toggle = async (track: ScriptureTrack) => {
    try {
      if (activeId === track.id && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.didJustFinish) await soundRef.current.replayAsync();
        else if (status.isLoaded && status.isPlaying) await soundRef.current.pauseAsync();
        else await soundRef.current.playAsync();
        return;
      }
      setLoadingId(track.id);
      if (soundRef.current) await soundRef.current.unloadAsync();
      const created = await Audio.Sound.createAsync(track.source, { shouldPlay: true, progressUpdateIntervalMillis: 250 }, onStatus);
      soundRef.current = created.sound;
      setActiveId(track.id);
      setPosition(0);
    } catch {
      Alert.alert('Audio unavailable', 'This recording could not be played. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const renderCollection = (collection: ScriptureTrack['collection']) => (
    <View>
      <Text style={styles.sectionLabel}>{copy[collection]}</Text>
      {tracks.filter((track) => track.collection === collection).map((track) => {
        const localized = track.copy[language];
        const active = activeId === track.id;
        const progress = active && duration ? Math.min(1, position / duration) : 0;
        return <View key={track.id} style={[styles.card, active && styles.cardActive]}>
          <View style={styles.cardTop}>
            <View style={styles.reference}><Text style={styles.referenceText}>{track.reference}</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.trackTitle}>{localized.title}</Text><Text style={styles.trackMeta}>{copy.original} · {track.duration}</Text></View>
            <View style={styles.offlinePill}><Ionicons name="cloud-done" size={12} color="#A7D0A6" /><Text style={styles.offlineText}>{copy.offline}</Text></View>
          </View>
          <Text selectable style={styles.verse}>{localized.verse}</Text>
          <Text style={styles.meaningLabel}>{copy.meaning!.toUpperCase()}</Text>
          <Text style={styles.meaning}>{localized.meaning}</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
          <View style={styles.playerRow}>
            <Pressable onPress={() => toggle(track)} style={({ pressed }) => [styles.playButton, pressed && { opacity: .72 }]}>
              <Ionicons name={loadingId === track.id ? 'hourglass-outline' : active && playing ? 'pause' : active && position > 0 ? 'refresh' : 'play'} size={18} color={palette.ink} />
              <Text style={styles.playText}>{loadingId === track.id ? '…' : active && playing ? copy.pause : active && position > 0 ? copy.replay : copy.play}</Text>
            </Pressable>
            <Text style={styles.time}>{active ? `${formatTime(position)} / ${formatTime(duration)}` : track.duration}</Text>
            <Pressable onPress={() => Linking.openURL(track.sourceUrl)} style={styles.sourceButton}><Ionicons name="information-circle-outline" size={20} color={palette.gold} /></Pressable>
          </View>
        </View>;
      })}
    </View>
  );

  return <SafeAreaView style={styles.safe}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
      <Pressable accessibilityRole="button" hitSlop={12} style={({ pressed }) => [styles.back, pressed && { opacity: .7 }]} onPress={onBack}><Ionicons name="chevron-back" size={24} color={palette.gold} /><Text style={styles.backText}>{copy.back}</Text></Pressable>
      <View style={styles.heroIcon}><Ionicons name="headset" size={28} color={palette.gold} /></View>
      <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.intro}>{copy.intro}</Text>
      {renderCollection('gita')}
      {renderCollection('ramayana')}
      <View style={styles.credits}><Ionicons name="shield-checkmark-outline" size={23} color="#A7D0A6" /><View style={{ flex: 1 }}><Text style={styles.creditsTitle}>{copy.credits}</Text><Text style={styles.creditsBody}>{copy.creditBody}</Text></View></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.ink }, page: { paddingHorizontal: 17, paddingTop: Platform.OS === 'android' ? 56 : 8, paddingBottom: 60 },
  back: { minHeight: 56, minWidth: 158, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 16, paddingHorizontal: 13, borderRadius: 16, backgroundColor: 'rgba(233,185,73,.1)', borderWidth: 1, borderColor: 'rgba(233,185,73,.24)' }, backText: { color: palette.gold, fontSize: 14, fontWeight: '800' },
  heroIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(233,185,73,.1)', borderWidth: 1, borderColor: palette.line },
  eyebrow: { color: palette.gold, fontSize: 9, fontWeight: '900', letterSpacing: 2.2, marginTop: 18 }, title: { color: palette.cream, fontSize: 29, lineHeight: 35, fontWeight: '900', marginTop: 7 }, intro: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 28 },
  sectionLabel: { color: palette.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginBottom: 11, marginTop: 6 },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 22, padding: 16, marginBottom: 13 }, cardActive: { borderColor: 'rgba(233,185,73,.48)', backgroundColor: '#1C1A11' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, reference: { minWidth: 43, height: 43, paddingHorizontal: 7, borderRadius: 13, backgroundColor: '#3B2D16', alignItems: 'center', justifyContent: 'center' }, referenceText: { color: palette.gold, fontSize: 10, fontWeight: '900' },
  trackTitle: { color: palette.cream, fontSize: 14, lineHeight: 18, fontWeight: '800' }, trackMeta: { color: palette.muted, fontSize: 8, marginTop: 4 }, offlinePill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(72,99,70,.22)', paddingHorizontal: 7, paddingVertical: 6, borderRadius: 99 }, offlineText: { color: '#A7D0A6', fontSize: 7, fontWeight: '800' },
  verse: { color: '#F8E6BB', fontFamily: 'serif', fontSize: 16, lineHeight: 27, marginTop: 18 }, meaningLabel: { color: palette.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.4, marginTop: 18 }, meaning: { color: palette.muted, fontSize: 12, lineHeight: 19, marginTop: 6 },
  progressTrack: { height: 3, borderRadius: 2, backgroundColor: 'rgba(233,185,73,.12)', overflow: 'hidden', marginTop: 18 }, progressFill: { height: '100%', backgroundColor: palette.gold }, playerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  playButton: { height: 42, borderRadius: 13, backgroundColor: palette.gold, flexDirection: 'row', gap: 7, paddingHorizontal: 15, alignItems: 'center' }, playText: { color: palette.ink, fontSize: 11, fontWeight: '900' }, time: { color: palette.muted, fontSize: 10, marginLeft: 12, flex: 1 }, sourceButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  credits: { flexDirection: 'row', gap: 11, borderRadius: 18, padding: 15, marginTop: 12, backgroundColor: 'rgba(72,99,70,.16)', borderWidth: 1, borderColor: 'rgba(135,174,137,.16)' }, creditsTitle: { color: '#C5DFC4', fontSize: 12, fontWeight: '800' }, creditsBody: { color: '#8FA08E', fontSize: 9, lineHeight: 15, marginTop: 5 },
});
