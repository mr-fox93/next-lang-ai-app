export type Flashcard = {
  id: string;
  category: string;
  front: {
    word: string;
    phonetic: string;
    example: string;
  };
  back: {
    translation: string;
    example: string;
  };
};

export const sampleFlashcards: Flashcard[] = [
  {
    id: "1",
    category: "Business",
    front: {
      word: "Spotkanie",
      phonetic: "/spɔtˈkaɲɛ/",
      example: "Mam ważne spotkanie z klientem.",
    },
    back: {
      translation: "Meeting",
      example: "I have an important meeting with a client.",
    },
  },
  {
    id: "2",
    category: "Business",
    front: {
      word: "Prezentacja",
      phonetic: "/prɛzɛnˈtat͡sja/",
      example: "Przygotowałem prezentację na jutro.",
    },
    back: {
      translation: "Presentation",
      example: "I prepared a presentation for tomorrow.",
    },
  },
  {
    id: "3",
    category: "Travel",
    front: {
      word: "Lotnisko",
      phonetic: "/lɔtˈɲiskɔ/",
      example: "Muszę być na lotnisku dwie godziny przed odlotem.",
    },
    back: {
      translation: "Airport",
      example: "I need to be at the airport two hours before departure.",
    },
  },
  {
    id: "4",
    category: "Travel",
    front: {
      word: "Bilet",
      phonetic: "/ˈbʲilɛt/",
      example: "Gdzie mogę kupić bilet na pociąg?",
    },
    back: {
      translation: "Ticket",
      example: "Where can I buy a train ticket?",
    },
  },
];

export const categories = Array.from(
  new Set(sampleFlashcards.map((card) => card.category))
);
