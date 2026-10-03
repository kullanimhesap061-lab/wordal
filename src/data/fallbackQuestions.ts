import { CategoryId, CategoryInfo, CefrLevel, Question, WordBuildItem } from '../types/quiz';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'vocabulary',
    name: 'Vocabulary',
    icon: '📚',
    description: 'Master essential English words, idioms, and definitions',
    color: 'from-amber-500 to-orange-600',
    badge: 'Popular',
    topics: [
      'General',
      'Food',
      'Travel',
      'School',
      'Technology',
      'Daily Life',
      'Nature',
      'Jobs',
      'Health',
      'Shopping',
    ],
  },
  {
    id: 'grammar',
    name: 'Grammar',
    icon: '✏️',
    description: 'Tenses, sentence structures, conditionals, and syntax',
    color: 'from-blue-600 to-indigo-700',
    badge: 'Core',
    topics: [
      'Tenses',
      'Conditionals',
      'Modals',
      'Passive Voice',
      'Reported Speech',
      'Articles',
      'Prepositions',
    ],
  },
  {
    id: 'complete-it',
    name: 'Complete It',
    icon: '🧩',
    description: 'Fill in the missing words in real conversations and dialogues',
    color: 'from-emerald-500 to-teal-700',
    badge: 'Dialogue',
    topics: [
      'Daily Conversations',
      'Phrases',
      'Situations',
      'Common Expressions',
    ],
  },
  {
    id: 'picture-it',
    name: 'Picture It',
    icon: '🖼️',
    description: 'Look at the image and choose the correct English term',
    color: 'from-pink-500 to-rose-600',
    badge: 'Visual',
    topics: [
      'Everyday Objects',
      'Places',
      'Actions',
      'People',
      'Nature',
    ],
  },
  {
    id: 'maps',
    name: 'Maps',
    icon: '🗺️',
    description: 'Global geography, capitals, landmarks, and country facts',
    color: 'from-violet-600 to-purple-800',
    badge: 'Geo Trivia',
    topics: [
      'Countries',
      'Capitals',
      'Flags',
      'Continents',
      'Cities',
      'Landmarks',
    ],
  },
  {
    id: 'word-build',
    name: 'Word Build',
    icon: '🔤',
    description: 'Unscramble mixed letters to assemble the correct word',
    color: 'from-cyan-500 to-blue-600',
    badge: 'Tile Game',
    topics: [
      'General',
      'Vocabulary',
      'Daily Life',
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: '🚩',
    description: 'World flags, countries, capitals, and national symbols',
    color: 'from-rose-500 to-red-600',
    badge: 'Visual Quiz',
    topics: [
      'Countries',
      'World Flags',
      'Capitals',
      'Continents',
    ],
  },
];

export const CEFR_GRAMMAR_TOPICS: Record<CefrLevel, string[]> = {
  A1: [
    'Present Simple',
    'Present Continuous',
    'Pronouns & Possessives',
    'Articles (A/An/The)',
    'Plural Nouns',
    'Prepositions of Place',
    'Can / Can\'t',
    'Question Words',
  ],
  A2: [
    'Past Simple',
    'Past Continuous',
    'Future (going to & will)',
    'Comparative & Superlative',
    'Countable & Uncountable',
    'Modals (must, should)',
    'Present Perfect (ever/never)',
    'Prepositions of Movement',
  ],
  B1: [
    'Present Perfect',
    'Present Perfect vs Past Simple',
    'Present Perfect Continuous',
    'Conditionals (Zero, 1st, 2nd)',
    'Modals of Advice & Obligation',
    'Passive Voice',
    'Relative Clauses',
    'Used to / Would',
    'Reported Speech',
  ],
  B2: [
    'Third & Mixed Conditionals',
    'Passive Voice (Advanced)',
    'Modals of Deduction',
    'Reported Speech & Reporting Verbs',
    'Relative Clauses (Defining & Non-defining)',
    'Future Perfect & Continuous',
    'Gerunds & Infinitives',
    'Wish / If Only',
    'Discourse Markers',
  ],
  C1: [
    'Inversion & Negative Adverbials',
    'Advanced Conditionals & Alternatives to If',
    'Cleft Sentences',
    'Subjunctive & Formulaic Forms',
    'Participle Clauses',
    'Complex Passive Structures',
    'Nuanced Modals & Speculation',
  ],
  C2: [
    'Stylistic Inversion & Fronting',
    'Complex Hypothetical Structures',
    'Academic & Formal Syntax',
    'Advanced Cohesion & Ellipsis',
    'Subtle Aspectual & Modal Distinctions',
  ],
};

export function getTopicsForCategoryAndLevel(category: CategoryId, level: CefrLevel): string[] {
  if (category === 'grammar') {
    return CEFR_GRAMMAR_TOPICS[level] || CEFR_GRAMMAR_TOPICS.B1;
  }
  const cat = CATEGORIES.find((c) => c.id === category);
  return cat ? cat.topics : ['General'];
}

export const CEFR_LEVELS: { level: CefrLevel; title: string; desc: string; color: string }[] = [
  { level: 'A1', title: 'Beginner', desc: 'Basic everyday expressions and simple phrases', color: 'bg-emerald-500' },
  { level: 'A2', title: 'Elementary', desc: 'Routine tasks and direct exchange of information', color: 'bg-teal-500' },
  { level: 'B1', title: 'Intermediate', desc: 'Main points of clear standard input on familiar matters', color: 'bg-blue-500' },
  { level: 'B2', title: 'Upper Intermediate', desc: 'Complex text, technical discussions, and fluent conversation', color: 'bg-indigo-500' },
  { level: 'C1', title: 'Advanced', desc: 'Demanding, longer texts, flexible and spontaneous language', color: 'bg-purple-600' },
  { level: 'C2', title: 'Proficient', desc: 'Effortless understanding, nuance, precision and mastery', color: 'bg-rose-600' },
];

export const QUESTION_COUNTS = [5, 10, 15, 20, 25, 'Random'] as const;

// Fallback questions dictionary by category
export const FALLBACK_QUESTIONS: Record<CategoryId, Question[]> = {
  vocabulary: [
    {
      question: "Which word means 'a journey made by air in an airplane'?",
      options: ["Flight", "Cruise", "Voyage", "Hike"],
      answer: 0,
      topic: "Travel",
      explanation: "A flight is a journey made through the air, especially in a plane."
    },
    {
      question: "What is a document that gives official permission to enter a foreign country?",
      options: ["Visa", "Receipt", "Diploma", "License"],
      answer: 0,
      topic: "Travel",
      explanation: "A visa is an endorsement on a passport indicating that the holder is allowed to enter."
    },
    {
      question: "What word refers to the money you pay to travel on a bus or train?",
      options: ["Fare", "Fine", "Tip", "Fee"],
      answer: 0,
      topic: "Travel",
      explanation: "Fare is the price of passage on a bus, train, or airplane."
    },
    {
      question: "Which term describes food that is prepared quickly and easily sold in restaurants?",
      options: ["Fast food", "Gourmet meal", "Home cooking", "Buffet"],
      answer: 0,
      topic: "Food",
      explanation: "Fast food is food designed to be served rapidly."
    },
    {
      question: "Which appliance in the kitchen is used to keep food cold and fresh?",
      options: ["Refrigerator", "Microwave", "Toaster", "Kettle"],
      answer: 0,
      topic: "Food",
      explanation: "A refrigerator cools and preserves perishable groceries."
    },
    {
      question: "What is the cooking method of preparing food in hot oil or fat?",
      options: ["Frying", "Steaming", "Boiling", "Freezing"],
      answer: 0,
      topic: "Food",
      explanation: "Frying involves cooking food in hot oil or melted fat."
    },
    {
      question: "What do you call a person who designs and constructs buildings?",
      options: ["Architect", "Electrician", "Mechanic", "Surgeon"],
      answer: 0,
      topic: "Jobs",
      explanation: "An architect is someone who designs buildings and oversees their construction."
    },
    {
      question: "Which professional performs operations on patients in a hospital?",
      options: ["Surgeon", "Pharmacist", "Paramedic", "Therapist"],
      answer: 0,
      topic: "Jobs",
      explanation: "A surgeon is a medical practitioner qualified to practice surgery."
    },
    {
      question: "What piece of hardware is known as the 'brain' of a computer system?",
      options: ["CPU (Processor)", "Keyboard", "Monitor", "Webcam"],
      answer: 0,
      topic: "Technology",
      explanation: "The Central Processing Unit (CPU) executes computing instructions."
    },
    {
      question: "Which term refers to malicious software designed to disrupt computers?",
      options: ["Malware", "Firewall", "Firmware", "Browser"],
      answer: 0,
      topic: "Technology",
      explanation: "Malware is software that is specifically designed to disrupt, damage, or gain unauthorized access."
    },
    {
      question: "What room in a school or university is used for scientific experiments?",
      options: ["Laboratory", "Cafeteria", "Gymnasium", "Auditorium"],
      answer: 0,
      topic: "School",
      explanation: "A laboratory is a room equipped for scientific research and experiments."
    },
    {
      question: "What is the term for a natural disaster with violently rotating wind columns?",
      options: ["Tornado", "Tsunami", "Drought", "Earthquake"],
      answer: 0,
      topic: "Nature",
      explanation: "A tornado is a violently rotating column of air touching the ground."
    },
    {
      question: "What medical paper does a doctor write so you can purchase medicine?",
      options: ["Prescription", "Receipt", "Invoice", "Brochure"],
      answer: 0,
      topic: "Health",
      explanation: "A prescription is an instruction written by a medical practitioner."
    },
    {
      question: "When a store lowers the price of items, what do we call this deduction?",
      options: ["Discount", "Penalty", "Tax", "Deposit"],
      answer: 0,
      topic: "Shopping",
      explanation: "A discount is a deduction from the usual cost of an item."
    },
    {
      question: "What is the opposite of 'generous'?",
      options: ["Stingy", "Courageous", "Gentle", "Cautious"],
      answer: 0,
      topic: "General",
      explanation: "Stingy means unwilling to give or spend; the opposite of generous."
    },
    {
      question: "What is the synonym of 'lucid'?",
      options: ["Clear", "Confusing", "Dark", "Murky"],
      answer: 0,
      topic: "General",
      explanation: "Lucid means expressed clearly; easy to understand."
    }
  ],
  grammar: [
    // Present Perfect & Tenses (B1)
    {
      question: "She _____ to London three times this year.",
      options: ["has been", "is gone", "was been", "has went"],
      answer: 0,
      topic: "Present Perfect",
      explanation: "We use the Present Perfect 'has been' for experiences within an unfinished time period."
    },
    {
      question: "I _____ my keys! Have you seen them anywhere?",
      options: ["have lost", "lost", "am losing", "had lose"],
      answer: 0,
      topic: "Present Perfect",
      explanation: "Present Perfect is used when a past action has a direct result in the present."
    },
    {
      question: "They _____ in this apartment since 2018.",
      options: ["have lived", "lived", "are living", "were lived"],
      answer: 0,
      topic: "Present Perfect",
      explanation: "We use 'since' with Present Perfect to indicate an action starting in the past continuing to now."
    },
    {
      question: "Have you _____ tried Japanese sushi?",
      options: ["ever", "never", "already", "yet"],
      answer: 0,
      topic: "Present Perfect",
      explanation: "'Ever' is used in questions with Present Perfect to ask about life experiences."
    },
    {
      question: "We haven't received the delivery _____.",
      options: ["yet", "already", "still", "just"],
      answer: 0,
      topic: "Present Perfect",
      explanation: "'Yet' is placed at the end of negative Present Perfect sentences."
    },
    {
      question: "I have _____ finished my homework, so I can go out now.",
      options: ["already", "yet", "ever", "never"],
      answer: 0,
      topic: "Present Perfect",
      explanation: "'Already' indicates that an action happened sooner than expected."
    },
    {
      question: "He _____ his leg yesterday while playing football.",
      options: ["broke", "has broken", "had broken", "was breaking"],
      answer: 0,
      topic: "Present Perfect vs Past Simple",
      explanation: "A specific past time marker ('yesterday') requires Past Simple ('broke'), not Present Perfect."
    },
    {
      question: "I _____ in Spain for two years before moving to France in 2020.",
      options: ["lived", "have lived", "have been living", "live"],
      answer: 0,
      topic: "Present Perfect vs Past Simple",
      explanation: "Completed past situations with finished time periods use Past Simple."
    },
    {
      question: "How long _____ for the train?",
      options: ["have you been waiting", "are you waiting", "do you wait", "did you waiting"],
      answer: 0,
      topic: "Present Perfect Continuous",
      explanation: "Present Perfect Continuous emphasizes the ongoing duration of an activity."
    },
    {
      question: "By this time tomorrow, we _____ our final exams.",
      options: ["will have finished", "will finish", "are finishing", "have finished"],
      answer: 0,
      topic: "Tenses",
      explanation: "Future Perfect ('will have + past participle') indicates completion before a point in the future."
    },
    {
      question: "While she _____ dinner, the telephone rang.",
      options: ["was cooking", "is cooking", "cooked", "cooks"],
      answer: 0,
      topic: "Tenses",
      explanation: "Past continuous is used for an action in progress interrupted by past simple."
    },
    // Conditionals
    {
      question: "If I _____ his number, I would call him immediately.",
      options: ["knew", "know", "have known", "will know"],
      answer: 0,
      topic: "Conditionals (Zero, 1st, 2nd)",
      explanation: "Second conditional uses 'if + past simple' to express hypothetical present/future."
    },
    {
      question: "If you heat water to 100 degrees Celsius, it _____.",
      options: ["boils", "would boil", "will boil", "boiled"],
      answer: 0,
      topic: "Conditionals (Zero, 1st, 2nd)",
      explanation: "Zero conditional ('if + present simple, present simple') is used for scientific facts."
    },
    {
      question: "If it rains tomorrow, we _____ the picnic.",
      options: ["will cancel", "would cancel", "cancel", "cancelled"],
      answer: 0,
      topic: "Conditionals (Zero, 1st, 2nd)",
      explanation: "First conditional ('if + present, will + base form') is used for real future possibilities."
    },
    {
      question: "If I _____ you, I would take that job offer.",
      options: ["were", "was", "am", "would be"],
      answer: 0,
      topic: "Conditionals (Zero, 1st, 2nd)",
      explanation: "In formal second conditional advice, 'If I were you' is standard."
    },
    // Modals
    {
      question: "You _____ wear a helmet while riding a motorcycle; it's the law.",
      options: ["must", "might", "can", "could"],
      answer: 0,
      topic: "Modals of Advice & Obligation",
      explanation: "'Must' is used for strict rules and legal requirements."
    },
    {
      question: "You _____ see a doctor if your fever continues.",
      options: ["should", "would", "must to", "ought"],
      answer: 0,
      topic: "Modals of Advice & Obligation",
      explanation: "'Should' expresses helpful advice or recommendation."
    },
    {
      question: "Students _____ speak during the examination.",
      options: ["must not", "don't have to", "might not", "should"],
      answer: 0,
      topic: "Modals of Advice & Obligation",
      explanation: "'Must not' expresses prohibition."
    },
    // Passive Voice
    {
      question: "The historic castle _____ by thousands of tourists every summer.",
      options: ["is visited", "visited", "is visiting", "has visit"],
      answer: 0,
      topic: "Passive Voice",
      explanation: "Present simple passive: 'is/are + past participle' (is visited)."
    },
    {
      question: "The novel _____ by George Orwell in 1949.",
      options: ["was written", "wrote", "is written", "was write"],
      answer: 0,
      topic: "Passive Voice",
      explanation: "Past simple passive: 'was/were + past participle' (was written)."
    },
    {
      question: "All flights _____ due to dense fog yesterday.",
      options: ["were cancelled", "are cancelled", "cancelled", "had cancelled"],
      answer: 0,
      topic: "Passive Voice",
      explanation: "Past passive requires 'were + past participle' (were cancelled)."
    },
    // Reported Speech
    {
      question: "He asked me where I _____ the previous night.",
      options: ["had stayed", "did stay", "have stayed", "staying"],
      answer: 0,
      topic: "Reported Speech",
      explanation: "In reported speech, past simple shifts back to past perfect ('had stayed')."
    },
    {
      question: "She said that she _____ never been abroad before.",
      options: ["had", "has", "is", "was"],
      answer: 0,
      topic: "Reported Speech",
      explanation: "Reported speech shifts present perfect to past perfect ('had never been')."
    },
    // Relative Clauses & Used to
    {
      question: "The girl _____ won the science competition is my classmate.",
      options: ["who", "which", "whose", "whom"],
      answer: 0,
      topic: "Relative Clauses",
      explanation: "We use 'who' as a relative pronoun referring to people."
    },
    {
      question: "I _____ live in London, but now I live in Manchester.",
      options: ["used to", "use to", "was used to", "am used to"],
      answer: 0,
      topic: "Used to / Would",
      explanation: "'Used to' expresses a past habit or state that is no longer true."
    },
    // Prepositions & Articles
    {
      question: "I am interested _____ learning computer programming.",
      options: ["in", "on", "at", "for"],
      answer: 0,
      topic: "Prepositions",
      explanation: "The adjective 'interested' is followed by the preposition 'in'."
    },
    {
      question: "She arrives _____ the airport at noon.",
      options: ["at", "on", "in", "to"],
      answer: 0,
      topic: "Prepositions",
      explanation: "We arrive 'at' a specific building or point like an airport."
    },
    {
      question: "Mount Everest is _____ highest mountain on Earth.",
      options: ["the", "a", "an", "no article"],
      answer: 0,
      topic: "Articles",
      explanation: "Superlative adjectives take the definite article 'the'."
    }
  ],
  flags: [
    {
      question: "Which country's flag is shown in the picture?",
      options: ["Canada", "Australia", "New Zealand", "United Kingdom"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/ca.png",
      topic: "Countries",
      explanation: "Canada's flag features an 11-pointed stylized red maple leaf."
    },
    {
      question: "Which country does this national flag belong to?",
      options: ["Japan", "South Korea", "Bangladesh", "Palau"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/jp.png",
      topic: "Countries",
      explanation: "The flag of Japan represents the rising sun (Hinomaru)."
    },
    {
      question: "Identify the country of this national flag:",
      options: ["United Kingdom", "Australia", "Iceland", "Norway"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/gb.png",
      topic: "Countries",
      explanation: "The Union Jack combines the heraldic crosses of England, Scotland, and Northern Ireland."
    },
    {
      question: "Which country flies this national flag?",
      options: ["Germany", "Belgium", "Austria", "Netherlands"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/de.png",
      topic: "Countries",
      explanation: "Germany's tricolor consists of horizontal bands of black, red, and gold."
    },
    {
      question: "Which country does this green and yellow flag belong to?",
      options: ["Brazil", "Argentina", "Colombia", "Portugal"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/br.png",
      topic: "Countries",
      explanation: "Brazil's flag has a yellow rhombus on a green field with a blue starry celestial globe."
    },
    {
      question: "Which nation's flag has a white crescent and star on a red field?",
      options: ["Turkey", "Tunisia", "Azerbaijan", "Pakistan"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/tr.png",
      topic: "Countries",
      explanation: "The national flag of Turkey features a white crescent moon and a five-pointed star on a red field."
    },
    {
      question: "Which country does this blue, white, and red vertical tricolor represent?",
      options: ["France", "Netherlands", "Italy", "Russia"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/fr.png",
      topic: "Countries",
      explanation: "The French Tricolore has blue, white, and red vertical bands."
    },
    {
      question: "Which country does this flag belong to?",
      options: ["Italy", "Ireland", "Mexico", "Hungary"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/it.png",
      topic: "Countries",
      explanation: "The Italian flag features three equal vertical stripes of green, white, and red."
    },
    {
      question: "Which country flies this flag with the Southern Cross constellation?",
      options: ["Australia", "New Zealand", "Fiji", "Tuvalu"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/au.png",
      topic: "Countries",
      explanation: "Australia's flag features the Union Jack, the Commonwealth Star, and the Southern Cross."
    },
    {
      question: "Which country's flag features the 'Sun of May' in the center?",
      options: ["Argentina", "Uruguay", "Guatemala", "El Salvador"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/ar.png",
      topic: "Countries",
      explanation: "Argentina's flag features light blue and white stripes with the Sun of May."
    },
    {
      question: "Which country does this flag belong to?",
      options: ["South Korea", "Japan", "Singapore", "Thailand"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/kr.png",
      topic: "Countries",
      explanation: "The Taegeukgi features a yin-yang circle and four black trigrams."
    },
    {
      question: "Which nation's flag has red and yellow horizontal stripes?",
      options: ["Spain", "Portugal", "Colombia", "Mexico"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/es.png",
      topic: "Countries",
      explanation: "Spain's flag consists of red and yellow horizontal stripes with the royal coat of arms."
    },
    {
      question: "Which country flies the Stars and Stripes?",
      options: ["United States", "Liberia", "Malaysia", "Puerto Rico"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/us.png",
      topic: "Countries",
      explanation: "The Stars and Stripes contains 50 stars for 50 states and 13 stripes for original colonies."
    },
    {
      question: "Which country's flag features nine blue and white stripes?",
      options: ["Greece", "Cyprus", "Finland", "Israel"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/gr.png",
      topic: "Countries",
      explanation: "Greece's flag features nine horizontal blue and white stripes and a white cross."
    },
    {
      question: "Which country has an iconic square flag with a bold white cross?",
      options: ["Switzerland", "Austria", "Denmark", "Norway"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/ch.png",
      topic: "Countries",
      explanation: "The Swiss flag is an iconic square flag with a bold white cross on a red background."
    },
    {
      question: "Which country flies a yellow Nordic cross on a sky-blue field?",
      options: ["Sweden", "Finland", "Norway", "Denmark"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/se.png",
      topic: "Countries",
      explanation: "Sweden's flag is a yellow Nordic cross on a sky-blue field."
    },
    {
      question: "Which country's Tiranga tricolor features the Ashoka Chakra?",
      options: ["India", "Ireland", "Niger", "Iran"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/in.png",
      topic: "Countries",
      explanation: "India's Tiranga tricolor features saffron, white, green, and the navy Ashoka Chakra."
    },
    {
      question: "Which nation's flag features an eagle perched on a cactus devouring a snake?",
      options: ["Mexico", "Italy", "Ireland", "Peru"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/mx.png",
      topic: "Countries",
      explanation: "Mexico's flag features an eagle perched on a prickly pear cactus devouring a snake."
    },
    {
      question: "Which country's flag has a horizontal Y-shaped band symbolizing unity?",
      options: ["South Africa", "Kenya", "Jamaica", "Zimbabwe"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/za.png",
      topic: "Countries",
      explanation: "South Africa's colorful flag symbolizes unity with a central horizontal Y-shaped band."
    },
    {
      question: "Which country flies an indigo Scandinavian cross outlined in white on a red field?",
      options: ["Norway", "Iceland", "Denmark", "Sweden"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/no.png",
      topic: "Countries",
      explanation: "Norway's flag features an indigo Scandinavian cross outlined in white on a red field."
    },
    {
      question: "Which country does this flag belong to with horizontal red, white, and blue stripes?",
      options: ["Netherlands", "France", "Russia", "Luxembourg"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/nl.png",
      topic: "Countries",
      explanation: "The Netherlands uses a horizontal tricolor of bright red, white, and cobalt blue."
    },
    {
      question: "Which country's flag features green and red fields with an armillary sphere?",
      options: ["Portugal", "Spain", "Brazil", "Italy"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/pt.png",
      topic: "Countries",
      explanation: "Portugal's flag features green and red vertical bands with the national coat of arms."
    },
    {
      question: "Which country does this green, white, and orange vertical tricolor belong to?",
      options: ["Ireland", "Italy", "India", "Ivory Coast"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/ie.png",
      topic: "Countries",
      explanation: "The Irish tricolor symbolizes peace between the green and orange traditions."
    },
    {
      question: "Which country flies a Nordic white cross on a red field (Dannebrog)?",
      options: ["Denmark", "Norway", "Sweden", "Finland"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/dk.png",
      topic: "Countries",
      explanation: "Denmark's Dannebrog is recognized as the oldest continuously used national flag in the world."
    },
    {
      question: "Which country flies a blue Nordic cross on a white background?",
      options: ["Finland", "Sweden", "Iceland", "Greece"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/fi.png",
      topic: "Countries",
      explanation: "Finland's flag represents the blue lakes and white snow of the nation."
    }
  ],
  'complete-it': [
    {
      question: "A: 'Could you give me a hand with this suitcase?' \nB: '_____!'",
      options: ["Sure, with pleasure", "I disagree", "Never again", "It's my fault"],
      answer: 0,
      explanation: "'Sure, with pleasure' is a polite and enthusiastic way to accept helping someone."
    },
    {
      question: "A: 'I just passed my driving test on the first try!' \nB: '_____!'",
      options: ["Congratulations! That's wonderful!", "Better luck next time!", "What a pity!", "Take your time."],
      answer: 0,
      explanation: "Congratulating someone is the natural response to passing a test."
    },
    {
      question: "Customer: 'Could I have the bill, please?' \nWaiter: 'Certainly, _____.'",
      options: ["I'll bring it right away", "You can't have it", "Pay me yesterday", "Here was your soup"],
      answer: 0,
      explanation: "Waiters typically say 'I'll bring it right away' or 'Right away, sir/ma'am'."
    },
    {
      question: "Doctor: 'How long have you been feeling unwell?' \nPatient: '_____.'",
      options: ["Since Tuesday morning", "Tomorrow afternoon", "At the pharmacy", "Three pills daily"],
      answer: 0,
      explanation: "'How long' asks for duration or starting point, answered by 'Since Tuesday morning'."
    },
    {
      question: "A: 'Would you mind if I opened the window?' \nB: '_____, go right ahead.'",
      options: ["Not at all", "Yes, I do", "Please mind", "I agree with you"],
      answer: 0,
      explanation: "'Not at all' means 'I do not mind', allowing the other person to open it."
    },
    {
      question: "A: 'Sorry I'm late, there was terrible traffic.' \nB: '_____.'",
      options: ["No worries, we just started", "You are fired immediately", "I don't know you", "Never go there"],
      answer: 0,
      explanation: "'No worries, we just started' politely reassures a late friend."
    }
  ],
  'picture-it': [
    {
      question: "Identify the object shown in the photograph:",
      options: ["Headphones", "Camera", "Microscope", "Compass"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      explanation: "These are over-ear audio headphones for listening to music."
    },
    {
      question: "Which mode of transport is depicted in this picture?",
      options: ["Bicycle", "Motorcycle", "Helicopter", "Submarine"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80",
      explanation: "A bicycle with two wheels and handlebars."
    },
    {
      question: "What beverage is served in this ceramic cup?",
      options: ["Coffee", "Lemonade", "Orange Juice", "Milkshake"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      explanation: "A freshly brewed cup of black coffee."
    },
    {
      question: "What natural landscape is visible in this photograph?",
      options: ["Mountain range", "Desert sand dune", "Tropical swamp", "Urban subway"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
      explanation: "Majestic snowy mountain peaks under blue skies."
    },
    {
      question: "What fruit is displayed in this close-up picture?",
      options: ["Red Apple", "Banana", "Watermelon", "Pineapple"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
      explanation: "A shiny, crisp red apple."
    },
    {
      question: "Which animal is featured in this image?",
      options: ["Lion", "Elephant", "Penguin", "Kangaroo"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop&q=80",
      explanation: "A wild lion in its natural savannah habitat."
    }
  ],
  maps: [
    {
      question: "Which country's flag is shown in the picture?",
      options: ["Canada", "Australia", "New Zealand", "United Kingdom"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/ca.png",
      explanation: "Canada's national flag features a stylized red maple leaf with 11 points."
    },
    {
      question: "Which country does this national flag belong to?",
      options: ["Japan", "South Korea", "Bangladesh", "Palau"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/jp.png",
      explanation: "The flag of Japan (Nisshōki/Hinomaru) features a red circle on a white background representing the sun."
    },
    {
      question: "Identify the country of this national flag:",
      options: ["United Kingdom", "Australia", "Iceland", "Norway"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/gb.png",
      explanation: "The Union Jack is the national flag of the United Kingdom."
    },
    {
      question: "Which country flies this national flag?",
      options: ["Germany", "Belgium", "Austria", "Netherlands"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/de.png",
      explanation: "Germany's flag consists of three horizontal bands of black, red, and gold."
    },
    {
      question: "Which country does this green and yellow flag belong to?",
      options: ["Brazil", "Argentina", "Colombia", "Portugal"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/br.png",
      explanation: "Brazil's flag has a yellow rhombus on a green field with a starry celestial globe."
    },
    {
      question: "Which nation's flag has a white crescent and star on a red field?",
      options: ["Turkey", "Tunisia", "Azerbaijan", "Pakistan"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/tr.png",
      explanation: "The national flag of Turkey features a white crescent moon and a five-pointed star."
    },
    {
      question: "Which country does this blue, white, and red vertical tricolor represent?",
      options: ["France", "Netherlands", "Italy", "Russia"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/fr.png",
      explanation: "The French Tricolore has blue, white, and red vertical bands."
    },
    {
      question: "Which country does this flag belong to?",
      options: ["Italy", "Ireland", "Mexico", "Hungary"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/it.png",
      explanation: "Italy's flag is the Il Tricolore with green, white, and red vertical stripes."
    },
    {
      question: "Which country flies this flag with the Southern Cross constellation?",
      options: ["Australia", "New Zealand", "Fiji", "Tuvalu"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/au.png",
      explanation: "Australia's flag displays the Union Jack, the Commonwealth Star, and the Southern Cross."
    },
    {
      question: "Which country's flag features the 'Sun of May' in the center?",
      options: ["Argentina", "Uruguay", "Guatemala", "El Salvador"],
      answer: 0,
      imageUrl: "https://flagcdn.com/w640/ar.png",
      explanation: "Argentina's flag features light blue and white stripes with the Sun of May."
    },
    {
      question: "Which famous landmark is shown in the photograph?",
      options: ["Eiffel Tower", "Tokyo Tower", "Blackpool Tower", "Space Needle"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80",
      explanation: "The Eiffel Tower is a wrought-iron lattice tower located on the Champ de Mars in Paris, France."
    },
    {
      question: "What ancient Roman amphitheatre is shown in this picture?",
      options: ["Colosseum", "Parthenon", "Pantheon", "Arena of Verona"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
      explanation: "The Colosseum in Rome was used for gladiatorial contests and public spectacles."
    },
    {
      question: "Identify this iconic monument in New York Harbor:",
      options: ["Statue of Liberty", "Christ the Redeemer", "The Motherland Calls", "Little Mermaid"],
      answer: 0,
      imageUrl: "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=800&auto=format&fit=crop&q=80",
      explanation: "The Statue of Liberty is a neoclassical sculpture on Liberty Island in New York Harbor."
    },
    {
      question: "What is the capital city of Australia?",
      options: ["Canberra", "Sydney", "Melbourne", "Brisbane"],
      answer: 0,
      explanation: "Canberra is the federal capital of Australia, chosen as a compromise between Sydney and Melbourne."
    },
    {
      question: "Which is the largest continent on Earth by both land area and population?",
      options: ["Asia", "Africa", "North America", "Europe"],
      answer: 0,
      explanation: "Asia covers about 30% of Earth's total land area and holds 60% of the world's population."
    },
    {
      question: "Which river flows through Paris, France?",
      options: ["Seine", "Thames", "Danube", "Rhine"],
      answer: 0,
      explanation: "The Seine river divides Paris into the Right Bank and Left Bank."
    }
  ],
  'word-build': [
    {
      question: "Rearrange the letters to form the name of a common red fruit:",
      options: ["APPLE", "LEMON", "GRAPE", "PEACH"],
      answer: 0,
      explanation: "APPLE unscrambles from P, L, A, E, P."
    },
    {
      question: "Unscramble these letters: C O M P U T E R",
      options: ["COMPUTER", "CUSTOMER", "CONSUMER", "COMPOUND"],
      answer: 0,
      explanation: "COMPUTER is an electronic device for storing and processing data."
    }
  ]
};

export const WORD_BUILD_PUZZLES: WordBuildItem[] = [
  {
    id: 'wb-1',
    word: 'APPLE',
    hint: 'A sweet and crisp fruit that keeps the doctor away',
    scrambled: ['P', 'L', 'A', 'E', 'P'],
    level: 'A1',
    topic: 'Food',
    meaning: 'A round fruit with red, green, or yellow skin and firm white flesh.'
  },
  {
    id: 'wb-2',
    word: 'TRAVEL',
    hint: 'To make a journey, typically of some length',
    scrambled: ['R', 'A', 'T', 'L', 'V', 'E'],
    level: 'A2',
    topic: 'Travel',
    meaning: 'Going from one place to another, especially over a significant distance.'
  },
  {
    id: 'wb-3',
    word: 'GUITAR',
    hint: 'A musical instrument usually having six strings',
    scrambled: ['U', 'I', 'T', 'G', 'R', 'A'],
    level: 'A1',
    topic: 'General',
    meaning: 'A fretted musical instrument that usually has six strings.'
  },
  {
    id: 'wb-4',
    word: 'LIBRARY',
    hint: 'A building or room containing collections of books for reading',
    scrambled: ['B', 'R', 'A', 'L', 'I', 'Y', 'R'],
    level: 'A2',
    topic: 'School',
    meaning: 'A quiet place where books, periodicals, and media are kept for study.'
  },
  {
    id: 'wb-5',
    word: 'EXPLORE',
    hint: 'Travel in or through an unfamiliar area to learn about it',
    scrambled: ['P', 'L', 'O', 'E', 'X', 'E', 'R'],
    level: 'B1',
    topic: 'Travel',
    meaning: 'To investigate systematically or travel through unknown territory.'
  },
  {
    id: 'wb-6',
    word: 'HARMONY',
    hint: 'The combination of simultaneously sounded musical notes',
    scrambled: ['M', 'O', 'N', 'Y', 'H', 'A', 'R'],
    level: 'B2',
    topic: 'Vocabulary',
    meaning: 'Agreement, concord, or pleasing combination of elements in music or life.'
  },
  {
    id: 'wb-7',
    word: 'RESILIENT',
    hint: 'Able to withstand or recover quickly from difficult conditions',
    scrambled: ['S', 'I', 'L', 'I', 'E', 'R', 'T', 'N', 'E'],
    level: 'C1',
    topic: 'Vocabulary',
    meaning: 'Capacity to recover quickly from difficulties; toughness.'
  },
  {
    id: 'wb-8',
    word: 'ELOQUENT',
    hint: 'Fluent or persuasive in speaking or writing',
    scrambled: ['Q', 'U', 'E', 'L', 'T', 'O', 'N', 'E'],
    level: 'C1',
    topic: 'Vocabulary',
    meaning: 'Clearly expressing or indicating something in a moving, fluent way.'
  },
  {
    id: 'wb-9',
    word: 'SUNSHINE',
    hint: 'Direct sunlight unbroken by cloud',
    scrambled: ['N', 'S', 'H', 'I', 'S', 'U', 'N', 'E'],
    level: 'A1',
    topic: 'Nature',
    meaning: 'The light and warmth given by the sun.'
  },
  {
    id: 'wb-10',
    word: 'KNOWLEDGE',
    hint: 'Facts, information, and skills acquired through experience or education',
    scrambled: ['W', 'L', 'E', 'D', 'G', 'K', 'N', 'O', 'E'],
    level: 'B2',
    topic: 'School',
    meaning: 'Understanding gained through experience or study.'
  }
];

export function getFallbackQuestions(
  category: CategoryId,
  count: number,
  _level?: CefrLevel,
  topic?: string,
  previousQuestions?: string[]
): Question[] {
  const pool = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS.vocabulary;

  // Filter strictly by topic when topic is provided and not 'General'
  let matched = pool;
  if (topic && topic !== 'General') {
    const keyword = topic.toLowerCase();
    const specific = pool.filter((q) =>
      (q.topic && q.topic.toLowerCase() === keyword) ||
      (q.topic && q.topic.toLowerCase().includes(keyword)) ||
      q.question.toLowerCase().includes(keyword) ||
      (q.explanation && q.explanation.toLowerCase().includes(keyword))
    );
    if (specific.length > 0) {
      // If specific items are fewer than count, use specific first, then supplement from general pool
      if (specific.length >= count) {
        matched = specific;
      } else {
        const remaining = pool.filter((q) => !specific.some((s) => s.question === q.question));
        matched = [...specific, ...remaining];
      }
    }
  }

  const prevSet = new Set((previousQuestions || []).map((q) => q.trim().toLowerCase()));

  // Separate into fresh (not in previous game) and used (in previous game)
  const fresh = matched.filter((q) => !prevSet.has(q.question.trim().toLowerCase()));
  const used = matched.filter((q) => prevSet.has(q.question.trim().toLowerCase()));

  // Shuffle both
  const shuffledFresh = [...fresh].sort(() => Math.random() - 0.5);
  const shuffledUsed = [...used].sort(() => Math.random() - 0.5);

  const selected: Question[] = [];
  const selectedQuestionsSet = new Set<string>();

  // Add fresh questions first
  for (const item of shuffledFresh) {
    if (selected.length >= count) break;
    const key = item.question.trim().toLowerCase();
    if (!selectedQuestionsSet.has(key)) {
      selectedQuestionsSet.add(key);
      selected.push({
        ...item,
        id: `fb-${selected.length + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      });
    }
  }

  // If not enough fresh, fill with used from previous game (ensuring no duplicates in current game)
  if (selected.length < count) {
    for (const item of shuffledUsed) {
      if (selected.length >= count) break;
      const key = item.question.trim().toLowerCase();
      if (!selectedQuestionsSet.has(key)) {
        selectedQuestionsSet.add(key);
        selected.push({
          ...item,
          id: `fb-${selected.length + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        });
      }
    }
  }

  // If still not enough (e.g. pool has fewer items than count requested),
  // cycle items so the game is NEVER empty, but give them unique IDs
  let cycleIdx = 0;
  while (selected.length < count && matched.length > 0) {
    const item = matched[cycleIdx % matched.length];
    selected.push({
      ...item,
      id: `fb-${selected.length + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });
    cycleIdx++;
  }

  return selected;
}
