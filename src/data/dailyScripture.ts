// Rotating "Scripture of the Day" verses shown on the Home screen.
// One verse is picked per calendar day, so every devotee sees the same verse
// on the same date and it changes automatically at local midnight.

export type DailyVerse = {
  text: string;
  meaning: string;
  source: string;
};

export const dailyVerses: DailyVerse[] = [
  {
    text: "Bhoothanatha Sadananda Sarvabhootha Dayapara\nRaksha Raksha Mahabaho Shastre Tubhyam Namo Namaha",
    meaning:
      "O Lord of all beings, ever blissful and compassionate to all, O mighty-armed protector — Shasta, salutations to You again and again.",
    source: "Ayyappa Dhyana Shloka",
  },
  {
    text: "Karmanye Vadhikaraste Ma Phaleshu Kadachana",
    meaning:
      "You have a right to perform your duty, but never to the fruits of your actions.",
    source: "Bhagavad Gita 2.47",
  },
  {
    text: "Yada Yada Hi Dharmasya Glanir Bhavati Bharata",
    meaning:
      "Whenever there is a decline of righteousness and a rise of unrighteousness, I manifest Myself.",
    source: "Bhagavad Gita 4.7",
  },
  {
    text: "Sarve Bhavantu Sukhinah Sarve Santu Niramayah",
    meaning: "May all be happy; may all be free from illness.",
    source: "Shanti Mantra",
  },
  {
    text: "Asato Ma Sadgamaya, Tamaso Ma Jyotirgamaya, Mrityor Ma Amritam Gamaya",
    meaning:
      "Lead me from untruth to truth, from darkness to light, from death to immortality.",
    source: "Brihadaranyaka Upanishad 1.3.28",
  },
  {
    text: "Dharmo Rakshati Rakshitah",
    meaning: "Dharma protects those who protect Dharma.",
    source: "Manusmriti 8.15",
  },
  {
    text: "Patram Pushpam Phalam Toyam Yo Me Bhaktya Prayacchati",
    meaning:
      "Whoever offers Me with devotion a leaf, a flower, a fruit or water — that offering of love I accept.",
    source: "Bhagavad Gita 9.26",
  },
  {
    text: "Tat Tvam Asi",
    meaning: "That Thou art — the divine dwells within you.",
    source: "Chandogya Upanishad 6.8.7",
  },
  {
    text: "Vasudhaiva Kutumbakam",
    meaning: "The whole world is one family.",
    source: "Maha Upanishad 6.71",
  },
  {
    text: "Uddhared Atmanatmanam Natmanam Avasadayet",
    meaning:
      "Lift yourself by your own self; do not let yourself fall. The mind is both friend and foe.",
    source: "Bhagavad Gita 6.5",
  },
  {
    text: "Harivarasanam Vishwamohanam Haridadhishwaram Aaradhyapadukam",
    meaning:
      "Hari's resting place, enchanter of the universe, whose holy feet are worthy of worship.",
    source: "Harivarasanam",
  },
  {
    text: "Satyam Vada, Dharmam Chara",
    meaning: "Speak the truth; walk the path of righteousness.",
    source: "Taittiriya Upanishad 1.11.1",
  },
];

/** Returns the verse for the given day (defaults to today, local time). */
export function verseOfTheDay(date: Date = new Date()): DailyVerse {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return dailyVerses[dayNumber % dailyVerses.length]!;
}
