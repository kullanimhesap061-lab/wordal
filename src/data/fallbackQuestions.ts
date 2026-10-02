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
];

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
    {
      question: "She _____ to London three times this year.",
      options: ["has been", "is gone", "was been", "has went"],
      answer: 0,
      topic: "Tenses",
      explanation: "We use the Present Perfect 'has been' for experiences within an unfinished time period."
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
    {
      question: "If I _____ his number, I would call him immediately.",
      options: ["knew", "know", "have known", "will know"],
      answer: 0,
      topic: "Conditionals",
      explanation: "Second conditional uses 'if + past simple' to express hypothetical present/future."
    },
    {
      question: "If you heat water to 100 degrees Celsius, it _____.",
      options: ["boils", "would boil", "will boil", "boiled"],
      answer: 0,
      topic: "Conditionals",
      explanation: "Zero conditional ('if + present simple, present simple') is used for scientific facts."
    },
    {
      question: "You _____ wear a helmet while riding a motorcycle; it's the law.",
      options: ["must", "might", "can", "could"],
      answer: 0,
      topic: "Modals",
      explanation: "'Must' is used for strict rules and legal requirements."
    },
    {
      question: "You _____ see a doctor if your fever continues.",
      options: ["should", "would", "must to", "ought"],
      answer: 0,
      topic: "Modals",
      explanation: "'Should' expresses helpful advice or recommendation."
    },
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
  topic?: string
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
      matched = specific;
    }
  }

  // Shuffle
  const shuffled = [...matched].sort(() => Math.random() - 0.5);
  const result: Question[] = [];
  let index = 0;
  while (result.length < count) {
    const item = shuffled[index % shuffled.length];
    result.push({
      ...item,
      id: `fb-${result.length + 1}-${Date.now()}`,
    });
    index++;
  }
  return result;
}
