import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { getFallbackQuestions, WORD_BUILD_PUZZLES } from './src/data/fallbackQuestions';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json());

// Initialize server-side Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Picture It High-Quality Image Library for visual questions
const PICTURE_LIBRARY: { topic: string; term: string; url: string; options: string[] }[] = [
  {
    topic: 'Everyday Objects',
    term: 'Headphones',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    options: ['Headphones', 'Microphone', 'Webcam', 'Speaker'],
  },
  {
    topic: 'Everyday Objects',
    term: 'Bicycle',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
    options: ['Bicycle', 'Motorbike', 'Scooter', 'Skateboard'],
  },
  {
    topic: 'Everyday Objects',
    term: 'Camera',
    url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    options: ['Camera', 'Smartphone', 'Binoculars', 'Telescope'],
  },
  {
    topic: 'Everyday Objects',
    term: 'Wristwatch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    options: ['Wristwatch', 'Compass', 'Bracelet', 'Stopwatch'],
  },
  {
    topic: 'Places',
    term: 'Library',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
    options: ['Library', 'Museum', 'Bookstore', 'Classroom'],
  },
  {
    topic: 'Places',
    term: 'Airport',
    url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&auto=format&fit=crop&q=80',
    options: ['Airport', 'Train Station', 'Harbor', 'Subway'],
  },
  {
    topic: 'Places',
    term: 'Hospital',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    options: ['Hospital', 'Pharmacy', 'Hotel', 'Clinic'],
  },
  {
    topic: 'Nature',
    term: 'Mountain',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    options: ['Mountain', 'Desert', 'Valley', 'Volcano'],
  },
  {
    topic: 'Nature',
    term: 'Waterfall',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
    options: ['Waterfall', 'River', 'Lake', 'Glacier'],
  },
  {
    topic: 'Actions',
    term: 'Cooking',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    options: ['Cooking', 'Cleaning', 'Baking', 'Washing'],
  },
  {
    topic: 'Actions',
    term: 'Reading',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    options: ['Reading', 'Writing', 'Drawing', 'Studying'],
  },
  {
    topic: 'People',
    term: 'Doctor',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
    options: ['Doctor', 'Nurse', 'Dentist', 'Scientist'],
  },
];

// Flags Library with real FlagCDN high-res national flags
const FLAG_LIBRARY: { country: string; code: string; url: string; options: string[]; fact: string }[] = [
  {
    country: 'Canada',
    code: 'ca',
    url: 'https://flagcdn.com/w640/ca.png',
    options: ['Canada', 'Australia', 'New Zealand', 'United Kingdom'],
    fact: "Canada's flag features an 11-pointed stylized red maple leaf.",
  },
  {
    country: 'Japan',
    code: 'jp',
    url: 'https://flagcdn.com/w640/jp.png',
    options: ['Japan', 'South Korea', 'Bangladesh', 'Palau'],
    fact: 'The national flag of Japan represents the rising sun (Hinomaru).',
  },
  {
    country: 'United Kingdom',
    code: 'gb',
    url: 'https://flagcdn.com/w640/gb.png',
    options: ['United Kingdom', 'Australia', 'Iceland', 'New Zealand'],
    fact: 'The Union Jack combines the heraldic crosses of England, Scotland, and Northern Ireland.',
  },
  {
    country: 'Germany',
    code: 'de',
    url: 'https://flagcdn.com/w640/de.png',
    options: ['Germany', 'Belgium', 'Austria', 'Netherlands'],
    fact: "Germany's tricolor consists of horizontal bands of black, red, and gold.",
  },
  {
    country: 'Brazil',
    code: 'br',
    url: 'https://flagcdn.com/w640/br.png',
    options: ['Brazil', 'Argentina', 'Colombia', 'Portugal'],
    fact: "Brazil's flag has a yellow rhombus on a green field with a blue starry celestial globe.",
  },
  {
    country: 'France',
    code: 'fr',
    url: 'https://flagcdn.com/w640/fr.png',
    options: ['France', 'Netherlands', 'Italy', 'Russia'],
    fact: 'The French Tricolore has blue, white, and red vertical bands.',
  },
  {
    country: 'Italy',
    code: 'it',
    url: 'https://flagcdn.com/w640/it.png',
    options: ['Italy', 'Ireland', 'Mexico', 'Hungary'],
    fact: "The Italian flag features three equal vertical stripes of green, white, and red.",
  },
  {
    country: 'Turkey',
    code: 'tr',
    url: 'https://flagcdn.com/w640/tr.png',
    options: ['Turkey', 'Tunisia', 'Azerbaijan', 'Pakistan'],
    fact: 'The national flag of Turkey features a white crescent moon and a five-pointed star on a red field.',
  },
  {
    country: 'Australia',
    code: 'au',
    url: 'https://flagcdn.com/w640/au.png',
    options: ['Australia', 'New Zealand', 'Fiji', 'Tuvalu'],
    fact: "Australia's flag features the Union Jack, the Commonwealth Star, and the Southern Cross.",
  },
  {
    country: 'Argentina',
    code: 'ar',
    url: 'https://flagcdn.com/w640/ar.png',
    options: ['Argentina', 'Uruguay', 'Guatemala', 'El Salvador'],
    fact: "Argentina's flag features light blue and white stripes with the Sun of May.",
  },
  {
    country: 'South Korea',
    code: 'kr',
    url: 'https://flagcdn.com/w640/kr.png',
    options: ['South Korea', 'Japan', 'Singapore', 'Thailand'],
    fact: 'The Taegeukgi features a yin-yang circle and four black trigrams.',
  },
  {
    country: 'Spain',
    code: 'es',
    url: 'https://flagcdn.com/w640/es.png',
    options: ['Spain', 'Portugal', 'Colombia', 'Mexico'],
    fact: "Spain's flag consists of red and yellow horizontal stripes with the royal coat of arms.",
  },
  {
    country: 'United States',
    code: 'us',
    url: 'https://flagcdn.com/w640/us.png',
    options: ['United States', 'Liberia', 'Malaysia', 'Puerto Rico'],
    fact: 'The Stars and Stripes contains 50 stars for 50 states and 13 stripes for original colonies.',
  },
  {
    country: 'Greece',
    code: 'gr',
    url: 'https://flagcdn.com/w640/gr.png',
    options: ['Greece', 'Cyprus', 'Finland', 'Israel'],
    fact: "Greece's flag features nine horizontal blue and white stripes and a white cross.",
  },
  {
    country: 'Switzerland',
    code: 'ch',
    url: 'https://flagcdn.com/w640/ch.png',
    options: ['Switzerland', 'Austria', 'Denmark', 'Norway'],
    fact: 'The Swiss flag is an iconic square flag with a bold white cross on a red background.',
  },
  {
    country: 'Sweden',
    code: 'se',
    url: 'https://flagcdn.com/w640/se.png',
    options: ['Sweden', 'Finland', 'Norway', 'Denmark'],
    fact: "Sweden's flag is a yellow Nordic cross on a sky-blue field.",
  },
  {
    country: 'India',
    code: 'in',
    url: 'https://flagcdn.com/w640/in.png',
    options: ['India', 'Ireland', 'Niger', 'Iran'],
    fact: "India's Tiranga tricolor features saffron, white, green, and the navy Ashoka Chakra.",
  },
  {
    country: 'Mexico',
    code: 'mx',
    url: 'https://flagcdn.com/w640/mx.png',
    options: ['Mexico', 'Italy', 'Ireland', 'Peru'],
    fact: "Mexico's flag features an eagle perched on a prickly pear cactus devouring a snake.",
  },
  {
    country: 'South Africa',
    code: 'za',
    url: 'https://flagcdn.com/w640/za.png',
    options: ['South Africa', 'Kenya', 'Jamaica', 'Zimbabwe'],
    fact: "South Africa's colorful flag symbolizes unity with a central horizontal Y-shaped band.",
  },
  {
    country: 'Norway',
    code: 'no',
    url: 'https://flagcdn.com/w640/no.png',
    options: ['Norway', 'Iceland', 'Denmark', 'Sweden'],
    fact: "Norway's flag features an indigo Scandinavian cross outlined in white on a red field.",
  },
];

// Landmarks Library with high-res photographs
const LANDMARK_LIBRARY: { name: string; location: string; url: string; options: string[]; fact: string }[] = [
  {
    name: 'Eiffel Tower',
    location: 'Paris, France',
    url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80',
    options: ['Eiffel Tower', 'Tokyo Tower', 'Blackpool Tower', 'Space Needle'],
    fact: 'The Eiffel Tower in Paris was built for the 1889 World Exhibition.',
  },
  {
    name: 'Colosseum',
    location: 'Rome, Italy',
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    options: ['Colosseum', 'Parthenon', 'Pantheon', 'Arena of Verona'],
    fact: 'The Colosseum in Rome is the largest ancient amphitheatre ever built.',
  },
  {
    name: 'Statue of Liberty',
    location: 'New York, USA',
    url: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=800&auto=format&fit=crop&q=80',
    options: ['Statue of Liberty', 'Christ the Redeemer', 'The Motherland Calls', 'Little Mermaid'],
    fact: 'The Statue of Liberty was a gift of international friendship from France to the USA.',
  },
  {
    name: 'Taj Mahal',
    location: 'Agra, India',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
    options: ['Taj Mahal', 'Sheikh Zayed Mosque', 'Hagia Sophia', 'Blue Mosque'],
    fact: 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river.',
  },
  {
    name: 'Big Ben & Elizabeth Tower',
    location: 'London, UK',
    url: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&auto=format&fit=crop&q=80',
    options: ['Big Ben', 'Parliament Hill', 'Peace Tower', 'Spasskaya Tower'],
    fact: 'Big Ben is the historic bell and landmark clock tower of the Palace of Westminster.',
  },
  {
    name: 'Great Wall of China',
    location: 'Beijing, China',
    url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop&q=80',
    options: ['Great Wall of China', "Hadrian's Wall", 'Berlin Wall', 'Kumbhalgarh Fort'],
    fact: 'The Great Wall extends thousands of miles across ancient northern China.',
  },
  {
    name: 'Sydney Opera House',
    location: 'Sydney, Australia',
    url: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&auto=format&fit=crop&q=80',
    options: ['Sydney Opera House', 'Palau de les Arts', 'Harpa Concert Hall', 'Walt Disney Concert Hall'],
    fact: 'The Sydney Opera House is famous for its soaring sail-like roof design.',
  },
  {
    name: 'Pyramids of Giza',
    location: 'Cairo, Egypt',
    url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop&q=80',
    options: ['Pyramids of Giza', 'Chichen Itza', 'Teotihuacan', 'Tikal'],
    fact: 'The Great Pyramid of Giza is the oldest of the Seven Wonders of the Ancient World.',
  },
  {
    name: 'Machu Picchu',
    location: 'Cusco, Peru',
    url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&auto=format&fit=crop&q=80',
    options: ['Machu Picchu', 'Ollantaytambo', 'Petra', 'Mesa Verde'],
    fact: 'Machu Picchu is an Incan citadel perched high in the Andes mountains.',
  },
];

// Capitals Library for Maps -> Capitals topic
const CAPITALS_LIBRARY: { country: string; capital: string; options: string[]; fact: string }[] = [
  { country: 'Japan', capital: 'Tokyo', options: ['Tokyo', 'Kyoto', 'Osaka', 'Sapporo'], fact: "Tokyo is the world's most populous metropolitan area." },
  { country: 'Australia', capital: 'Canberra', options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'], fact: 'Canberra was chosen as a compromise capital in 1908.' },
  { country: 'Canada', capital: 'Ottawa', options: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'], fact: 'Ottawa was selected by Queen Victoria as the capital in 1857.' },
  { country: 'France', capital: 'Paris', options: ['Paris', 'Lyon', 'Marseille', 'Bordeaux'], fact: 'Paris is divided into 20 administrative arrondissements.' },
  { country: 'Germany', capital: 'Berlin', options: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'], fact: "Berlin is Germany's largest city and political hub." },
  { country: 'Italy', capital: 'Rome', options: ['Rome', 'Milan', 'Florence', 'Naples'], fact: "Rome is known historically as the 'Eternal City'." },
  { country: 'Spain', capital: 'Madrid', options: ['Madrid', 'Barcelona', 'Seville', 'Valencia'], fact: 'Madrid is located in the geographic center of the Iberian Peninsula.' },
  { country: 'Turkey', capital: 'Ankara', options: ['Ankara', 'Istanbul', 'Izmir', 'Bursa'], fact: 'Ankara became the capital of the Republic of Turkey in 1923.' },
  { country: 'United Kingdom', capital: 'London', options: ['London', 'Edinburgh', 'Manchester', 'Birmingham'], fact: 'London is the capital and largest city of the United Kingdom.' },
  { country: 'United States', capital: 'Washington, D.C.', options: ['Washington, D.C.', 'New York City', 'Los Angeles', 'Chicago'], fact: 'Washington, D.C. is a federal district on the Potomac River.' },
  { country: 'Egypt', capital: 'Cairo', options: ['Cairo', 'Alexandria', 'Giza', 'Luxor'], fact: 'Cairo is the largest city in the Arab world on the Nile River.' },
  { country: 'Argentina', capital: 'Buenos Aires', options: ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza'], fact: 'Buenos Aires is situated on the western shore of the Río de la Plata.' },
  { country: 'Brazil', capital: 'Brasília', options: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'], fact: 'Brasília is a planned capital inaugurated in 1960.' },
  { country: 'South Korea', capital: 'Seoul', options: ['Seoul', 'Busan', 'Incheon', 'Daegu'], fact: 'Seoul is the heart of the Seoul Capital Area in South Korea.' },
  { country: 'Greece', capital: 'Athens', options: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion'], fact: 'Athens is the cradle of Western civilization and democracy.' },
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Questions Generation Endpoint
app.post('/api/questions', async (req, res) => {
  try {
    const { category, level, topic, count } = req.body;

    const requestedCount =
      typeof count === 'number' && count >= 3 && count <= 30
        ? count
        : count === 'random' || count === 'Random'
        ? Math.floor(Math.random() * 3) * 5 + 5 // 5, 10, or 15
        : 10;

    const categoryId = category || 'vocabulary';
    const cefrLevel = level || 'B1';
    const chosenTopic = topic || 'General';

    // Special handler for "Word Build"
    if (categoryId === 'word-build') {
      const items = [...WORD_BUILD_PUZZLES].sort(() => Math.random() - 0.5);
      const selected = items.slice(0, requestedCount);
      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: selected.length,
        items: selected,
        isFallback: false,
      });
    }

    // Special handler for "Picture It" with visual images
    if (categoryId === 'picture-it') {
      const filtered = PICTURE_LIBRARY.filter(
        (p) =>
          chosenTopic === 'General' ||
          p.topic.toLowerCase().includes(chosenTopic.toLowerCase())
      );
      const pool = filtered.length >= 3 ? filtered : PICTURE_LIBRARY;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const questions = [];

      for (let i = 0; i < requestedCount; i++) {
        const item = shuffled[i % shuffled.length];
        // Shuffle options and find index of item.term
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.term);
        questions.push({
          id: `pic-${i + 1}-${Date.now()}`,
          question: 'What is shown in the image below?',
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          imageUrl: item.url,
          explanation: `This is a ${item.term}.`,
        });
      }

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: questions.length,
        questions,
        isFallback: false,
      });
    }

    // Special handler for "Flags" in Maps (Visual Flag Photos)
    if (chosenTopic.toLowerCase().includes('flag')) {
      const shuffledFlags = [...FLAG_LIBRARY].sort(() => Math.random() - 0.5);
      const questions = [];

      for (let i = 0; i < requestedCount; i++) {
        const item = shuffledFlags[i % shuffledFlags.length];
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.country);
        questions.push({
          id: `flag-${i + 1}-${Date.now()}`,
          question: "Which country's flag is shown in the picture?",
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          imageUrl: item.url,
          explanation: `${item.country}: ${item.fact}`,
        });
      }

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: questions.length,
        questions,
        isFallback: false,
      });
    }

    // Special handler for "Landmarks" in Maps (Visual Landmark Photos)
    if (chosenTopic.toLowerCase().includes('landmark')) {
      const shuffledLandmarks = [...LANDMARK_LIBRARY].sort(() => Math.random() - 0.5);
      const questions = [];

      for (let i = 0; i < requestedCount; i++) {
        const item = shuffledLandmarks[i % shuffledLandmarks.length];
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.name);
        questions.push({
          id: `landmark-${i + 1}-${Date.now()}`,
          question: 'Which famous landmark is shown in the photograph?',
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          imageUrl: item.url,
          explanation: `${item.name} (${item.location}): ${item.fact}`,
        });
      }

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: questions.length,
        questions,
        isFallback: false,
      });
    }

    // Special handler for "Capitals" in Maps
    if (chosenTopic.toLowerCase().includes('capital')) {
      const shuffledCapitals = [...CAPITALS_LIBRARY].sort(() => Math.random() - 0.5);
      const questions = [];

      for (let i = 0; i < requestedCount; i++) {
        const item = shuffledCapitals[i % shuffledCapitals.length];
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.capital);
        questions.push({
          id: `capital-${i + 1}-${Date.now()}`,
          question: `What is the capital city of ${item.country}?`,
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          explanation: `${item.capital} is the capital of ${item.country}. ${item.fact}`,
        });
      }

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: questions.length,
        questions,
        isFallback: false,
      });
    }

    // If Gemini AI is configured, generate dynamic questions with strict topic adherence
    if (ai) {
      try {
        const prompt = `You are a certified Cambridge/Oxford English language test author creating a fun, interactive Kahoot-style quiz game called "Wordal!".
Generate exactly ${requestedCount} multiple-choice English learning questions.

CRITICAL MANDATORY REQUIREMENT - STRICT TOPIC ADHERENCE:
- Category: "${categoryId}"
- Chosen Topic: "${chosenTopic}" (MANDATORY: Every single question MUST be 100% focused strictly and specifically on the topic "${chosenTopic}". For example, if Topic is "Food", questions MUST be about food and cooking. If Topic is "Travel", questions MUST be about travel and journey. If Topic is "Tenses", test tenses. If Topic is "Conditionals", test conditionals. Never ask about unrelated subjects!)
- CEFR Difficulty Level: ${cefrLevel} (Calibrate grammar and vocabulary to CEFR ${cefrLevel})

STRICT FORMAT RULES:
1. Each question must have:
   - "question": Clear, concise question text directly addressing the topic "${chosenTopic}".
   - "options": Array of EXACTLY 4 distinct, plausible string options.
   - "answer": 0-based integer index (0, 1, 2, or 3) indicating the single correct option.
   - "explanation": Short, 1-sentence helpful explanation.`;

        const generateWithTimeout = async () => {
          return await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'You are an expert English Language Teacher (CELTA/DELTA certified). Always output valid JSON conforming to the requested schema. Ensure exactly 4 options per question and an integer answer index between 0 and 3.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                description: 'List of multiple choice quiz questions',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Exactly 4 distinct choices',
                    },
                    answer: {
                      type: Type.INTEGER,
                      description: 'Index of correct answer 0, 1, 2, or 3',
                    },
                    explanation: { type: Type.STRING },
                  },
                  required: ['question', 'options', 'answer'],
                },
              },
            },
          });
        };

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 7000)
        );

        const response: any = await Promise.race([generateWithTimeout(), timeoutPromise]);

        const rawText = response.text ? response.text.trim() : '';
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Validate each item
            const validatedQuestions = parsed
              .filter((q) => {
                return (
                  typeof q.question === 'string' &&
                  q.question.trim().length > 0 &&
                  Array.isArray(q.options) &&
                  q.options.length === 4 &&
                  typeof q.answer === 'number' &&
                  q.answer >= 0 &&
                  q.answer <= 3
                );
              })
              .map((q, idx) => ({
                id: `ai-${idx + 1}-${Date.now()}`,
                question: q.question.trim(),
                options: q.options.map((opt: string) => String(opt).trim()),
                answer: Math.floor(q.answer),
                explanation: q.explanation || 'Correct answer!',
              }));

            if (validatedQuestions.length >= Math.min(3, requestedCount)) {
              return res.json({
                category: categoryId,
                level: cefrLevel,
                topic: chosenTopic,
                count: validatedQuestions.length,
                questions: validatedQuestions.slice(0, requestedCount),
                isFallback: false,
              });
            }
          }
        }
      } catch (aiError) {
        console.warn('AI question generation encountered an issue, falling back to curated bank:', aiError);
      }
    }

    // Curated Fallback
    const fallback = getFallbackQuestions(categoryId as any, requestedCount, cefrLevel as any, chosenTopic);
    return res.json({
      category: categoryId,
      level: cefrLevel,
      topic: chosenTopic,
      count: fallback.length,
      questions: fallback,
      isFallback: true,
    });
  } catch (error) {
    console.error('Server /api/questions error:', error);
    const fallback = getFallbackQuestions('vocabulary', 10, 'B1', 'General');
    return res.json({
      category: 'vocabulary',
      level: 'B1',
      topic: 'General',
      count: fallback.length,
      questions: fallback,
      isFallback: true,
    });
  }
});

// MULTIPLAYER WEBSOCKET SYSTEM
interface PlayerSession {
  id: string;
  name: string;
  score: number;
  streak: number;
  answered: boolean;
  selectedOption?: number;
  isCorrect?: boolean;
  answerTimeMs?: number;
  ws: WebSocket;
}

interface Room {
  id: string;
  hostWs: WebSocket;
  settings: {
    category: string;
    level: string;
    topic: string;
    count: number;
  };
  state: 'lobby' | 'question' | 'reveal' | 'finished';
  questions: Array<{
    id?: string;
    question: string;
    options: string[];
    answer: number;
    explanation?: string;
    imageUrl?: string;
  }>;
  currentQuestionIndex: number;
  questionStartTime: number;
  questionTimeLimit: number;
  players: Map<string, PlayerSession>;
}

const rooms = new Map<string, Room>();

// Helper to broadcast to all participants in a room
function broadcastToRoom(room: Room, message: unknown) {
  const payload = JSON.stringify(message);
  // Send to host
  if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
    room.hostWs.send(payload);
  }
  // Send to all players
  for (const player of room.players.values()) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(payload);
    }
  }
}

function getSanitizedPlayers(room: Room, reveal = false) {
  return Array.from(room.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    streak: p.streak,
    answered: p.answered,
    selectedOption: reveal ? p.selectedOption : undefined,
    isCorrect: reveal ? p.isCorrect : undefined,
  }));
}

// WebSocket server setup
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  let boundRoomId: string | null = null;
  let boundPlayerId: string | null = null;
  let isHost = false;

  ws.on('message', (data: Buffer | string) => {
    try {
      const msg = JSON.parse(data.toString());

      // 1. Host creates a room
      if (msg.type === 'create_room') {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const roomId = `${randomNum}`;
        boundRoomId = roomId;
        isHost = true;

        const room: Room = {
          id: roomId,
          hostWs: ws,
          settings: {
            category: msg.settings?.category || 'vocabulary',
            level: msg.settings?.level || 'B1',
            topic: msg.settings?.topic || 'General',
            count: Number(msg.settings?.count) || 10,
          },
          state: 'lobby',
          questions: [],
          currentQuestionIndex: 0,
          questionStartTime: 0,
          questionTimeLimit: 20,
          players: new Map(),
        };

        rooms.set(roomId, room);

        ws.send(
          JSON.stringify({
            type: 'room_created',
            roomId,
            settings: room.settings,
          })
        );
        return;
      }

      // 2. Player joins a room
      if (msg.type === 'join_room') {
        const cleanRoomId = String(msg.roomId || '').replace(/^WORDAL-?/i, '').trim();
        const room = rooms.get(cleanRoomId) || rooms.get(`WORDAL-${cleanRoomId}`);

        if (!room) {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Room not found! Check the room code.',
            })
          );
          return;
        }

        if (room.state !== 'lobby') {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Game already in progress!',
            })
          );
          return;
        }

        const playerId = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        boundRoomId = room.id;
        boundPlayerId = playerId;
        isHost = false;

        const playerName = (msg.playerName || 'Player').slice(0, 15).trim() || 'Player';

        const playerSession: PlayerSession = {
          id: playerId,
          name: playerName,
          score: 0,
          streak: 0,
          answered: false,
          ws,
        };

        room.players.set(playerId, playerSession);

        // Tell player they successfully joined
        ws.send(
          JSON.stringify({
            type: 'joined_room',
            roomId: room.id,
            playerId,
            playerName,
            settings: room.settings,
          })
        );

        // Broadcast updated player list to room
        broadcastToRoom(room, {
          type: 'player_list_update',
          players: getSanitizedPlayers(room),
        });
        return;
      }

      // 3. Host starts game with questions
      if (msg.type === 'start_game') {
        const targetRoomId = (msg.roomId || boundRoomId || '').toUpperCase().trim();
        if (!targetRoomId) return;
        const room = rooms.get(targetRoomId);
        if (!room) return;
        room.hostWs = ws; // Bind host socket

        if (Array.isArray(msg.questions) && msg.questions.length > 0) {
          room.questions = msg.questions;
        } else {
          room.questions = getFallbackQuestions(room.settings.category as any, room.settings.count, room.settings.level as any, room.settings.topic);
        }

        room.state = 'question';
        room.currentQuestionIndex = 0;
        room.questionStartTime = Date.now();

        // Reset player round statuses
        for (const p of room.players.values()) {
          p.answered = false;
          delete p.selectedOption;
          delete p.isCorrect;
        }

        const currentQ = room.questions[0];

        // Send question to everyone
        broadcastToRoom(room, {
          type: 'game_started',
          totalQuestions: room.questions.length,
          questionIndex: 0,
          question: {
            question: currentQ.question,
            options: currentQ.options,
            imageUrl: currentQ.imageUrl,
          },
          timeLimit: room.questionTimeLimit,
          players: getSanitizedPlayers(room),
        });
        return;
      }

      // 4. Player submits an answer
      if (msg.type === 'submit_answer') {
        const targetRoomId = (msg.roomId || boundRoomId || '').toUpperCase().trim();
        if (!targetRoomId) return;
        const room = rooms.get(targetRoomId);
        if (!room || room.state !== 'question') return;

        const player = boundPlayerId ? room.players.get(boundPlayerId) : undefined;
        if (!player || player.answered) return;

        const currentQ = room.questions[room.currentQuestionIndex];
        const selectedOpt = Number(msg.optionIndex);
        const isCorrect = selectedOpt === currentQ.answer;

        player.answered = true;
        player.selectedOption = selectedOpt;
        player.isCorrect = isCorrect;

        // Speed points calculation (100 base + up to 50 for quick reply)
        const elapsedSec = (Date.now() - room.questionStartTime) / 1000;
        const speedBonus = Math.max(0, Math.round((room.questionTimeLimit - elapsedSec) * 3));
        const roundPoints = isCorrect ? 100 + speedBonus : 0;

        if (isCorrect) {
          player.score += roundPoints;
          player.streak += 1;
        } else {
          player.streak = 0;
        }

        // Notify the player that answer is locked
        ws.send(
          JSON.stringify({
            type: 'answer_locked',
            selectedOption: selectedOpt,
          })
        );

        // Notify host that player answered
        if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
          room.hostWs.send(
            JSON.stringify({
              type: 'player_answered',
              playerId: player.id,
              playerName: player.name,
              players: getSanitizedPlayers(room),
            })
          );
        }

        // Check if all players answered
        const allAnswered = room.players.size > 0 && Array.from(room.players.values()).every((p) => p.answered);
        if (allAnswered) {
          // Trigger reveal
          triggerReveal(room);
        }
        return;
      }

      // 5. Host forces reveal
      if (msg.type === 'reveal_answer') {
        const targetRoomId = (msg.roomId || boundRoomId || '').toUpperCase().trim();
        if (!targetRoomId) return;
        const room = rooms.get(targetRoomId);
        if (!room || room.state !== 'question') return;
        room.hostWs = ws;
        triggerReveal(room);
        return;
      }

      // 6. Host requests next question
      if (msg.type === 'next_question') {
        const targetRoomId = (msg.roomId || boundRoomId || '').toUpperCase().trim();
        if (!targetRoomId) return;
        const room = rooms.get(targetRoomId);
        if (!room) return;
        room.hostWs = ws;

        room.currentQuestionIndex += 1;

        if (room.currentQuestionIndex >= room.questions.length) {
          // Game finished!
          room.state = 'finished';
          broadcastToRoom(room, {
            type: 'game_finished',
            leaderboard: getSanitizedPlayers(room, true).sort((a, b) => b.score - a.score),
          });
          return;
        }

        // Next Question
        room.state = 'question';
        room.questionStartTime = Date.now();

        for (const p of room.players.values()) {
          p.answered = false;
          delete p.selectedOption;
          delete p.isCorrect;
        }

        const currentQ = room.questions[room.currentQuestionIndex];

        broadcastToRoom(room, {
          type: 'new_question',
          questionIndex: room.currentQuestionIndex,
          totalQuestions: room.questions.length,
          question: {
            question: currentQ.question,
            options: currentQ.options,
            imageUrl: currentQ.imageUrl,
          },
          timeLimit: room.questionTimeLimit,
          players: getSanitizedPlayers(room),
        });
        return;
      }

      // 7. End game
      if (msg.type === 'end_game') {
        if (!boundRoomId) return;
        const room = rooms.get(boundRoomId);
        if (!room) return;
        room.state = 'finished';
        broadcastToRoom(room, {
          type: 'game_finished',
          leaderboard: getSanitizedPlayers(room, true).sort((a, b) => b.score - a.score),
        });
        rooms.delete(boundRoomId);
        return;
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });

  ws.on('close', () => {
    if (boundRoomId) {
      const room = rooms.get(boundRoomId);
      if (room) {
        if (isHost) {
          // If host leaves, end room
          broadcastToRoom(room, {
            type: 'host_left',
            message: 'Host has left the game.',
          });
          rooms.delete(boundRoomId);
        } else if (boundPlayerId) {
          room.players.delete(boundPlayerId);
          broadcastToRoom(room, {
            type: 'player_list_update',
            players: getSanitizedPlayers(room),
          });
        }
      }
    }
  });
});

function triggerReveal(room: Room) {
  room.state = 'reveal';
  const currentQ = room.questions[room.currentQuestionIndex];

  broadcastToRoom(room, {
    type: 'round_revealed',
    correctAnswer: currentQ.answer,
    explanation: currentQ.explanation,
    players: getSanitizedPlayers(room, true).sort((a, b) => b.score - a.score),
  });
}

// Attach Vite middleware in development or serve static build in production
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`Wordal! server running on http://localhost:${PORT}`);
  });
}

startServer();
