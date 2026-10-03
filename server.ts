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

// Flags Library with real FlagCDN high-res national flags (80 countries)
const FLAG_LIBRARY: { country: string; code: string; url: string; options: string[]; fact: string }[] = [
  { country: 'Canada', code: 'ca', url: 'https://flagcdn.com/w640/ca.png', options: ['Canada', 'Australia', 'New Zealand', 'United Kingdom'], fact: "Canada's flag features an 11-pointed stylized red maple leaf." },
  { country: 'Japan', code: 'jp', url: 'https://flagcdn.com/w640/jp.png', options: ['Japan', 'South Korea', 'Bangladesh', 'Palau'], fact: 'The national flag of Japan represents the rising sun (Hinomaru).' },
  { country: 'United Kingdom', code: 'gb', url: 'https://flagcdn.com/w640/gb.png', options: ['United Kingdom', 'Australia', 'Iceland', 'New Zealand'], fact: 'The Union Jack combines the heraldic crosses of England, Scotland, and Northern Ireland.' },
  { country: 'Germany', code: 'de', url: 'https://flagcdn.com/w640/de.png', options: ['Germany', 'Belgium', 'Austria', 'Netherlands'], fact: "Germany's tricolor consists of horizontal bands of black, red, and gold." },
  { country: 'Brazil', code: 'br', url: 'https://flagcdn.com/w640/br.png', options: ['Brazil', 'Argentina', 'Colombia', 'Portugal'], fact: "Brazil's flag has a yellow rhombus on a green field with a blue starry celestial globe." },
  { country: 'France', code: 'fr', url: 'https://flagcdn.com/w640/fr.png', options: ['France', 'Netherlands', 'Italy', 'Russia'], fact: 'The French Tricolore has blue, white, and red vertical bands.' },
  { country: 'Italy', code: 'it', url: 'https://flagcdn.com/w640/it.png', options: ['Italy', 'Ireland', 'Mexico', 'Hungary'], fact: "The Italian flag features three equal vertical stripes of green, white, and red." },
  { country: 'Turkey', code: 'tr', url: 'https://flagcdn.com/w640/tr.png', options: ['Turkey', 'Tunisia', 'Azerbaijan', 'Pakistan'], fact: 'The national flag of Turkey features a white crescent moon and a five-pointed star on a red field.' },
  { country: 'Australia', code: 'au', url: 'https://flagcdn.com/w640/au.png', options: ['Australia', 'New Zealand', 'Fiji', 'Tuvalu'], fact: "Australia's flag features the Union Jack, the Commonwealth Star, and the Southern Cross." },
  { country: 'Argentina', code: 'ar', url: 'https://flagcdn.com/w640/ar.png', options: ['Argentina', 'Uruguay', 'Guatemala', 'El Salvador'], fact: "Argentina's flag features light blue and white stripes with the Sun of May." },
  { country: 'South Korea', code: 'kr', url: 'https://flagcdn.com/w640/kr.png', options: ['South Korea', 'Japan', 'Singapore', 'Thailand'], fact: 'The Taegeukgi features a yin-yang circle and four black trigrams.' },
  { country: 'Spain', code: 'es', url: 'https://flagcdn.com/w640/es.png', options: ['Spain', 'Portugal', 'Colombia', 'Mexico'], fact: "Spain's flag consists of red and yellow horizontal stripes with the royal coat of arms." },
  { country: 'United States', code: 'us', url: 'https://flagcdn.com/w640/us.png', options: ['United States', 'Liberia', 'Malaysia', 'Puerto Rico'], fact: 'The Stars and Stripes contains 50 stars for 50 states and 13 stripes for original colonies.' },
  { country: 'Greece', code: 'gr', url: 'https://flagcdn.com/w640/gr.png', options: ['Greece', 'Cyprus', 'Finland', 'Israel'], fact: "Greece's flag features nine horizontal blue and white stripes and a white cross." },
  { country: 'Switzerland', code: 'ch', url: 'https://flagcdn.com/w640/ch.png', options: ['Switzerland', 'Austria', 'Denmark', 'Norway'], fact: 'The Swiss flag is an iconic square flag with a bold white cross on a red background.' },
  { country: 'Sweden', code: 'se', url: 'https://flagcdn.com/w640/se.png', options: ['Sweden', 'Finland', 'Norway', 'Denmark'], fact: "Sweden's flag is a yellow Nordic cross on a sky-blue field." },
  { country: 'India', code: 'in', url: 'https://flagcdn.com/w640/in.png', options: ['India', 'Ireland', 'Niger', 'Iran'], fact: "India's Tiranga tricolor features saffron, white, green, and the navy Ashoka Chakra." },
  { country: 'Mexico', code: 'mx', url: 'https://flagcdn.com/w640/mx.png', options: ['Mexico', 'Italy', 'Ireland', 'Peru'], fact: "Mexico's flag features an eagle perched on a prickly pear cactus devouring a snake." },
  { country: 'South Africa', code: 'za', url: 'https://flagcdn.com/w640/za.png', options: ['South Africa', 'Kenya', 'Jamaica', 'Zimbabwe'], fact: "South Africa's colorful flag symbolizes unity with a central horizontal Y-shaped band." },
  { country: 'Norway', code: 'no', url: 'https://flagcdn.com/w640/no.png', options: ['Norway', 'Iceland', 'Denmark', 'Sweden'], fact: "Norway's flag features an indigo Scandinavian cross outlined in white on a red field." },
  { country: 'Egypt', code: 'eg', url: 'https://flagcdn.com/w640/eg.png', options: ['Egypt', 'Syria', 'Iraq', 'Yemen'], fact: "Egypt's tricolor displays the golden Eagle of Saladin in the white stripe." },
  { country: 'Netherlands', code: 'nl', url: 'https://flagcdn.com/w640/nl.png', options: ['Netherlands', 'France', 'Russia', 'Luxembourg'], fact: 'The Netherlands uses a horizontal tricolor of bright red, white, and cobalt blue.' },
  { country: 'Portugal', code: 'pt', url: 'https://flagcdn.com/w640/pt.png', options: ['Portugal', 'Spain', 'Brazil', 'Italy'], fact: "Portugal's flag features green and red vertical bands with the national coat of arms." },
  { country: 'Ireland', code: 'ie', url: 'https://flagcdn.com/w640/ie.png', options: ['Ireland', 'Italy', 'India', 'Ivory Coast'], fact: 'The Irish tricolor symbolizes peace between the green and orange traditions.' },
  { country: 'Belgium', code: 'be', url: 'https://flagcdn.com/w640/be.png', options: ['Belgium', 'Germany', 'Chad', 'Romania'], fact: "Belgium's flag consists of black, yellow, and red vertical bands." },
  { country: 'Denmark', code: 'dk', url: 'https://flagcdn.com/w640/dk.png', options: ['Denmark', 'Norway', 'Sweden', 'Finland'], fact: "Denmark's Dannebrog is recognized as the oldest continuously used national flag." },
  { country: 'Finland', code: 'fi', url: 'https://flagcdn.com/w640/fi.png', options: ['Finland', 'Sweden', 'Iceland', 'Greece'], fact: "Finland's flag represents the blue lakes and white snow of the country." },
  { country: 'Austria', code: 'at', url: 'https://flagcdn.com/w640/at.png', options: ['Austria', 'Latvia', 'Poland', 'Peru'], fact: "Austria's flag is one of the oldest in Europe, with red-white-red horizontal bands." },
  { country: 'Poland', code: 'pl', url: 'https://flagcdn.com/w640/pl.png', options: ['Poland', 'Monaco', 'Indonesia', 'Singapore'], fact: "Poland's flag consists of two horizontal stripes: white on top and red on bottom." },
  { country: 'New Zealand', code: 'nz', url: 'https://flagcdn.com/w640/nz.png', options: ['New Zealand', 'Australia', 'Fiji', 'Samoa'], fact: "New Zealand's flag features four red stars with white borders representing the Southern Cross." },
  { country: 'Chile', code: 'cl', url: 'https://flagcdn.com/w640/cl.png', options: ['Chile', 'Texas', 'Cuba', 'Czech Republic'], fact: "Chile's flag has a lone white star in a blue canton with white and red stripes." },
  { country: 'Colombia', code: 'co', url: 'https://flagcdn.com/w640/co.png', options: ['Colombia', 'Ecuador', 'Venezuela', 'Bolivia'], fact: "Colombia's flag consists of yellow, blue, and red horizontal stripes." },
  { country: 'Peru', code: 'pe', url: 'https://flagcdn.com/w640/pe.png', options: ['Peru', 'Austria', 'Canada', 'Poland'], fact: "Peru's flag features two red vertical bands flanking a central white stripe." },
  { country: 'Uruguay', code: 'uy', url: 'https://flagcdn.com/w640/uy.png', options: ['Uruguay', 'Argentina', 'Greece', 'Honduras'], fact: "Uruguay's flag has nine alternating white and blue stripes with the Sun of May." },
  { country: 'Morocco', code: 'ma', url: 'https://flagcdn.com/w640/ma.png', options: ['Morocco', 'Tunisia', 'Turkey', 'Algeria'], fact: "Morocco's flag is red with a green pentagram star representing the Seal of Solomon." },
  { country: 'Kenya', code: 'ke', url: 'https://flagcdn.com/w640/ke.png', options: ['Kenya', 'South Sudan', 'Ethiopia', 'Uganda'], fact: "Kenya's flag features a traditional Maasai shield and two crossed spears." },
  { country: 'Nigeria', code: 'ng', url: 'https://flagcdn.com/w640/ng.png', options: ['Nigeria', 'Pakistan', 'Saudi Arabia', 'Sierra Leone'], fact: "Nigeria's flag features three equal vertical bands of green, white, and green." },
  { country: 'Ghana', code: 'gh', url: 'https://flagcdn.com/w640/gh.png', options: ['Ghana', 'Senegal', 'Cameroon', 'Mali'], fact: "Ghana's flag features red, gold, and green stripes with a central black star." },
  { country: 'Saudi Arabia', code: 'sa', url: 'https://flagcdn.com/w640/sa.png', options: ['Saudi Arabia', 'Pakistan', 'Algeria', 'Libya'], fact: "Saudi Arabia's flag features the Arabic Shahada inscription and a white sword." },
  { country: 'United Arab Emirates', code: 'ae', url: 'https://flagcdn.com/w640/ae.png', options: ['United Arab Emirates', 'Jordan', 'Kuwait', 'Palestine'], fact: 'The UAE flag uses pan-Arab colors: green, white, black, and red.' },
  { country: 'Thailand', code: 'th', url: 'https://flagcdn.com/w640/th.png', options: ['Thailand', 'Costa Rica', 'North Korea', 'Laos'], fact: "Thailand's Trairanga flag has five horizontal stripes of red, white, blue, white, and red." },
  { country: 'Vietnam', code: 'vn', url: 'https://flagcdn.com/w640/vn.png', options: ['Vietnam', 'China', 'Somalia', 'Morocco'], fact: "Vietnam's flag features a large five-pointed yellow star centered on a red background." },
  { country: 'Singapore', code: 'sg', url: 'https://flagcdn.com/w640/sg.png', options: ['Singapore', 'Indonesia', 'Poland', 'Malaysia'], fact: "Singapore's flag displays a white crescent moon and five white stars." },
  { country: 'Malaysia', code: 'my', url: 'https://flagcdn.com/w640/my.png', options: ['Malaysia', 'United States', 'Liberia', 'Philippines'], fact: "Malaysia's Jalur Gemilang has 14 red and white stripes and a yellow crescent with 14-point star." },
  { country: 'Philippines', code: 'ph', url: 'https://flagcdn.com/w640/ph.png', options: ['Philippines', 'Czech Republic', 'Cuba', 'Chile'], fact: "The Philippine flag features a golden sun with eight primary rays and three stars." },
  { country: 'Indonesia', code: 'id', url: 'https://flagcdn.com/w640/id.png', options: ['Indonesia', 'Monaco', 'Poland', 'Singapore'], fact: "Indonesia's Sang Saka Merah Putih consists of two equal horizontal bands of red and white." },
  { country: 'Pakistan', code: 'pk', url: 'https://flagcdn.com/w640/pk.png', options: ['Pakistan', 'Turkey', 'Algeria', 'Tunisia'], fact: "Pakistan's flag has a green field with a white crescent moon and star, plus a white vertical stripe." },
  { country: 'Iceland', code: 'is', url: 'https://flagcdn.com/w640/is.png', options: ['Iceland', 'Norway', 'Finland', 'Faroe Islands'], fact: "Iceland's flag features a fiery red cross outlined in white on an ultramarine blue field." },
  { country: 'Croatia', code: 'hr', url: 'https://flagcdn.com/w640/hr.png', options: ['Croatia', 'Serbia', 'Slovakia', 'Slovenia'], fact: "Croatia's flag includes the historic red-and-white chequy coat of arms (šahovnica)." },
  { country: 'Czech Republic', code: 'cz', url: 'https://flagcdn.com/w640/cz.png', options: ['Czech Republic', 'Slovakia', 'Philippines', 'Cuba'], fact: "The Czech flag has white and red horizontal bands with a blue isosceles triangle." },
  { country: 'Hungary', code: 'hu', url: 'https://flagcdn.com/w640/hu.png', options: ['Hungary', 'Italy', 'Bulgaria', 'Tajikistan'], fact: "Hungary's tricolor features horizontal bands of red, white, and green." },
  { country: 'Romania', code: 'ro', url: 'https://flagcdn.com/w640/ro.png', options: ['Romania', 'Chad', 'Belgium', 'Moldova'], fact: "Romania's vertical tricolor displays blue, yellow, and red." },
  { country: 'Ukraine', code: 'ua', url: 'https://flagcdn.com/w640/ua.png', options: ['Ukraine', 'Sweden', 'Kazakhstan', 'Bosnia'], fact: "Ukraine's flag has two equal horizontal bands of azure blue and golden yellow." },
  { country: 'Bulgaria', code: 'bg', url: 'https://flagcdn.com/w640/bg.png', options: ['Bulgaria', 'Hungary', 'Russia', 'Belarus'], fact: "Bulgaria's tricolor consists of white, green, and red horizontal stripes." },
  { country: 'Serbia', code: 'rs', url: 'https://flagcdn.com/w640/rs.png', options: ['Serbia', 'Croatia', 'Slovenia', 'Slovakia'], fact: "Serbia's flag features red, blue, and white stripes with the lesser coat of arms." },
  { country: 'Slovakia', code: 'sk', url: 'https://flagcdn.com/w640/sk.png', options: ['Slovakia', 'Slovenia', 'Russia', 'Czech Republic'], fact: "Slovakia's flag features white, blue, and red stripes with the double-cross coat of arms." },
  { country: 'Slovenia', code: 'si', url: 'https://flagcdn.com/w640/si.png', options: ['Slovenia', 'Slovakia', 'Russia', 'Croatia'], fact: "Slovenia's flag has the Mount Triglav crest in the upper hoist corner." },
  { country: 'Estonia', code: 'ee', url: 'https://flagcdn.com/w640/ee.png', options: ['Estonia', 'Botswana', 'Finland', 'Latvia'], fact: "Estonia's flag is an iconic tricolor of blue, black, and white." },
  { country: 'Latvia', code: 'lv', url: 'https://flagcdn.com/w640/lv.png', options: ['Latvia', 'Austria', 'Lebanon', 'Peru'], fact: "Latvia's flag features carmine red bands separated by a narrow white horizontal stripe." },
  { country: 'Lithuania', code: 'lt', url: 'https://flagcdn.com/w640/lt.png', options: ['Lithuania', 'Estonia', 'Latvia', 'Bolivia'], fact: "Lithuania's horizontal tricolor consists of yellow, green, and red." },
  { country: 'Cuba', code: 'cu', url: 'https://flagcdn.com/w640/cu.png', options: ['Cuba', 'Puerto Rico', 'Chile', 'Philippines'], fact: "Cuba's flag has five blue and white stripes with a red triangle and white star." },
  { country: 'Costa Rica', code: 'cr', url: 'https://flagcdn.com/w640/cr.png', options: ['Costa Rica', 'Thailand', 'Guatemala', 'Belize'], fact: "Costa Rica's flag has blue, white, and a broad central red horizontal stripe." },
  { country: 'Panama', code: 'pa', url: 'https://flagcdn.com/w640/pa.png', options: ['Panama', 'Dominican Republic', 'Costa Rica', 'Haiti'], fact: "Panama's flag is divided into four quarters with blue and red stars." },
  { country: 'Ecuador', code: 'ec', url: 'https://flagcdn.com/w640/ec.png', options: ['Ecuador', 'Colombia', 'Venezuela', 'Bolivia'], fact: "Ecuador's flag has yellow, blue, and red stripes with the national coat of arms in the center." },
  { country: 'Jamaica', code: 'jm', url: 'https://flagcdn.com/w640/jm.png', options: ['Jamaica', 'Bahamas', 'Barbados', 'Trinidad and Tobago'], fact: "Jamaica's flag features a golden saltire cross dividing green and black triangles." },
  { country: 'Jordan', code: 'jo', url: 'https://flagcdn.com/w640/jo.png', options: ['Jordan', 'Palestine', 'Kuwait', 'Syria'], fact: "Jordan's flag features pan-Arab stripes and a red chevron with a 7-pointed star." },
  { country: 'Qatar', code: 'qa', url: 'https://flagcdn.com/w640/qa.png', options: ['Qatar', 'Bahrain', 'Oman', 'UAE'], fact: "Qatar's flag is maroon with a broad white serrated band of nine points." },
  { country: 'Nepal', code: 'np', url: 'https://flagcdn.com/w640/np.png', options: ['Nepal', 'Bhutan', 'India', 'Sri Lanka'], fact: "Nepal is the world's only sovereign country with a non-quadrilateral flag." },
  { country: 'Georgia', code: 'ge', url: 'https://flagcdn.com/w640/ge.png', options: ['Georgia', 'England', 'Switzerland', 'Malta'], fact: "Georgia's Five-Cross Flag displays St George's cross and four small Bolnur-Katskhuri crosses." },
  { country: 'Cyprus', code: 'cy', url: 'https://flagcdn.com/w640/cy.png', options: ['Cyprus', 'Kosovo', 'Greece', 'Malta'], fact: "Cyprus's flag features the copper-colored shape of the island and two olive branches." },
  { country: 'Luxembourg', code: 'lu', url: 'https://flagcdn.com/w640/lu.png', options: ['Luxembourg', 'Netherlands', 'France', 'Paraguay'], fact: "Luxembourg's flag has red, white, and sky-blue stripes (lighter than the Dutch flag)." },
  { country: 'Malta', code: 'mt', url: 'https://flagcdn.com/w640/mt.png', options: ['Malta', 'Monaco', 'Poland', 'Indonesia'], fact: "Malta's flag consists of white and red vertical bands with the George Cross in the canton." },
  { country: 'Monaco', code: 'mc', url: 'https://flagcdn.com/w640/mc.png', options: ['Monaco', 'Indonesia', 'Poland', 'Singapore'], fact: "Monaco's flag consists of red and white horizontal stripes in a 4:5 aspect ratio." },
  { country: 'Tunisia', code: 'tn', url: 'https://flagcdn.com/w640/tn.png', options: ['Tunisia', 'Turkey', 'Algeria', 'Libya'], fact: "Tunisia's flag is predominantly red with a white circle containing a red crescent and star." },
  { country: 'Algeria', code: 'dz', url: 'https://flagcdn.com/w640/dz.png', options: ['Algeria', 'Pakistan', 'Turkey', 'Tunisia'], fact: "Algeria's flag consists of green and white vertical halves with a red crescent and star." },
  { country: 'Lebanon', code: 'lb', url: 'https://flagcdn.com/w640/lb.png', options: ['Lebanon', 'Austria', 'Latvia', 'Canada'], fact: "Lebanon's flag features a green cedar tree centered between two red horizontal stripes." },
  { country: 'Azerbaijan', code: 'az', url: 'https://flagcdn.com/w640/az.png', options: ['Azerbaijan', 'Turkey', 'Turkmenistan', 'Uzbekistan'], fact: "Azerbaijan's tricolor of blue, red, and green features an eight-pointed star and crescent." },
  { country: 'Mongolia', code: 'mn', url: 'https://flagcdn.com/w640/mn.png', options: ['Mongolia', 'Kazakhstan', 'China', 'Bhutan'], fact: "Mongolia's flag displays the national Soyombo symbol on the hoist red stripe." },
  { country: 'Senegal', code: 'sn', url: 'https://flagcdn.com/w640/sn.png', options: ['Senegal', 'Mali', 'Guinea', 'Cameroon'], fact: "Senegal's flag features green, yellow, and red vertical bands with a central green star." },
  { country: 'Armenia', code: 'am', url: 'https://flagcdn.com/w640/am.png', options: ['Armenia', 'Colombia', 'Venezuela', 'Ecuador'], fact: "Armenia's tricolor consists of red, blue, and apricot horizontal bands." },
];

// Landmarks Library with high-res photographs
const LANDMARK_LIBRARY: { name: string; location: string; url: string; options: string[]; fact: string }[] = [
  { name: 'Eiffel Tower', location: 'Paris, France', url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80', options: ['Eiffel Tower', 'Tokyo Tower', 'Blackpool Tower', 'Space Needle'], fact: 'The Eiffel Tower in Paris was built for the 1889 World Exhibition.' },
  { name: 'Colosseum', location: 'Rome, Italy', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80', options: ['Colosseum', 'Parthenon', 'Pantheon', 'Arena of Verona'], fact: 'The Colosseum in Rome is the largest ancient amphitheatre ever built.' },
  { name: 'Statue of Liberty', location: 'New York, USA', url: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=800&auto=format&fit=crop&q=80', options: ['Statue of Liberty', 'Christ the Redeemer', 'The Motherland Calls', 'Little Mermaid'], fact: 'The Statue of Liberty was a gift of international friendship from France to the USA.' },
  { name: 'Taj Mahal', location: 'Agra, India', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80', options: ['Taj Mahal', 'Sheikh Zayed Mosque', 'Hagia Sophia', 'Blue Mosque'], fact: 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river.' },
  { name: 'Big Ben & Elizabeth Tower', location: 'London, UK', url: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&auto=format&fit=crop&q=80', options: ['Big Ben', 'Parliament Hill', 'Peace Tower', 'Spasskaya Tower'], fact: 'Big Ben is the historic bell and landmark clock tower of the Palace of Westminster.' },
  { name: 'Great Wall of China', location: 'Beijing, China', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop&q=80', options: ['Great Wall of China', "Hadrian's Wall", 'Berlin Wall', 'Kumbhalgarh Fort'], fact: 'The Great Wall extends thousands of miles across ancient northern China.' },
  { name: 'Sydney Opera House', location: 'Sydney, Australia', url: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&auto=format&fit=crop&q=80', options: ['Sydney Opera House', 'Palau de les Arts', 'Harpa Concert Hall', 'Walt Disney Concert Hall'], fact: 'The Sydney Opera House is famous for its soaring sail-like roof design.' },
  { name: 'Pyramids of Giza', location: 'Cairo, Egypt', url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop&q=80', options: ['Pyramids of Giza', 'Chichen Itza', 'Teotihuacan', 'Tikal'], fact: 'The Great Pyramid of Giza is the oldest of the Seven Wonders of the Ancient World.' },
  { name: 'Machu Picchu', location: 'Cusco, Peru', url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&auto=format&fit=crop&q=80', options: ['Machu Picchu', 'Ollantaytambo', 'Petra', 'Mesa Verde'], fact: 'Machu Picchu is an Incan citadel perched high in the Andes mountains.' },
];

// Capitals Library for Maps -> Capitals topic (40 countries)
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
  { country: 'Netherlands', capital: 'Amsterdam', options: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'], fact: 'Amsterdam is the capital, while the government sits in The Hague.' },
  { country: 'Portugal', capital: 'Lisbon', options: ['Lisbon', 'Porto', 'Braga', 'Coimbra'], fact: 'Lisbon is one of the oldest cities in Western Europe.' },
  { country: 'Ireland', capital: 'Dublin', options: ['Dublin', 'Cork', 'Galway', 'Limerick'], fact: 'Dublin is situated on a bay on the east coast at the mouth of the River Liffey.' },
  { country: 'Belgium', capital: 'Brussels', options: ['Brussels', 'Antwerp', 'Ghent', 'Bruges'], fact: 'Brussels serves as the de facto capital of the European Union.' },
  { country: 'Denmark', capital: 'Copenhagen', options: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'], fact: 'Copenhagen is situated on the eastern coast of the island of Zealand.' },
  { country: 'Finland', capital: 'Helsinki', options: ['Helsinki', 'Espoo', 'Tampere', 'Turku'], fact: 'Helsinki is the northernmost metropolitan area in the European Union.' },
  { country: 'Austria', capital: 'Vienna', options: ['Vienna', 'Salzburg', 'Innsbruck', 'Graz'], fact: "Vienna is known as the 'City of Music' due to its musical heritage." },
  { country: 'Poland', capital: 'Warsaw', options: ['Warsaw', 'Krakow', 'Wroclaw', 'Gdansk'], fact: 'Warsaw stands on the Vistula River in east-central Poland.' },
  { country: 'New Zealand', capital: 'Wellington', options: ['Wellington', 'Auckland', 'Christchurch', 'Queenstown'], fact: 'Wellington is the southernmost capital city in the world.' },
  { country: 'Chile', capital: 'Santiago', options: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena'], fact: 'Santiago is surrounded by the snow-capped Andes mountains.' },
  { country: 'Colombia', capital: 'Bogotá', options: ['Bogotá', 'Medellín', 'Cali', 'Cartagena'], fact: 'Bogotá is located on a high plateau in the Andes at 2,640 meters.' },
  { country: 'Peru', capital: 'Lima', options: ['Lima', 'Cusco', 'Arequipa', 'Trujillo'], fact: 'Lima was founded by Spanish conquistador Francisco Pizarro in 1535.' },
  { country: 'Uruguay', capital: 'Montevideo', options: ['Montevideo', 'Punta del Este', 'Salto', 'Paysandú'], fact: 'Montevideo is the southernmost capital in the Americas.' },
  { country: 'Morocco', capital: 'Rabat', options: ['Rabat', 'Casablanca', 'Marrakech', 'Fes'], fact: 'Rabat is situated on the Atlantic Ocean at the mouth of the Bou Regreg River.' },
  { country: 'Kenya', capital: 'Nairobi', options: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], fact: "Nairobi is known as the 'Green City in the Sun' and has a national park within city limits." },
  { country: 'Nigeria', capital: 'Abuja', options: ['Abuja', 'Lagos', 'Kano', 'Ibadan'], fact: 'Abuja is a planned city built mainly in the 1980s to replace Lagos as capital.' },
  { country: 'Saudi Arabia', capital: 'Riyadh', options: ['Riyadh', 'Jeddah', 'Mecca', 'Medina'], fact: 'Riyadh is located in the center of the an-Nafud desert on the eastern part of the Najd.' },
  { country: 'United Arab Emirates', capital: 'Abu Dhabi', options: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman'], fact: 'Abu Dhabi is the largest of the UAE emirates and center of its government.' },
  { country: 'Thailand', capital: 'Bangkok', options: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'], fact: "Bangkok's ceremonial name is among the longest place names in the world." },
  { country: 'Vietnam', capital: 'Hanoi', options: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Haiphong'], fact: 'Hanoi celebrated its millennium of official founding in October 2010.' },
  { country: 'Singapore', capital: 'Singapore', options: ['Singapore', 'Kuala Lumpur', 'Jakarta', 'Bandar Seri Begawan'], fact: 'Singapore is a global island city-state with no separate capital.' },
  { country: 'Philippines', capital: 'Manila', options: ['Manila', 'Quezon City', 'Cebu City', 'Davao City'], fact: 'Manila is located on the eastern shore of Manila Bay on Luzon island.' },
  { country: 'Indonesia', capital: 'Jakarta', options: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'], fact: 'Jakarta is Indonesia’s historic capital situated on northwest Java.' },
  { country: 'Norway', capital: 'Oslo', options: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'], fact: 'Oslo is situated at the head of the scenic Oslofjord.' },
  { country: 'Sweden', capital: 'Stockholm', options: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'], fact: 'Stockholm is built across 14 islands connected by more than 50 bridges.' },
  { country: 'Switzerland', capital: 'Bern', options: ['Bern', 'Zurich', 'Geneva', 'Basel'], fact: 'Bern is the federal city of Switzerland with an iconic UNESCO old town.' },
];

// Server-side cache to track questions served in recent game per category/topic
const lastServedQuestionsMap = new Map<string, string[]>();

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
    const { category, level, topic, count, previousQuestions, previousGameQuestions } = req.body;

    const requestedCount =
      typeof count === 'number' && count >= 3 && count <= 30
        ? count
        : count === 'random' || count === 'Random'
        ? Math.floor(Math.random() * 3) * 5 + 5 // 5, 10, or 15
        : 10;

    const categoryId = String(category || 'vocabulary').toLowerCase().trim();
    const cefrLevel = level || 'B1';
    const chosenTopic = topic || 'General';

    // Retrieve previous game questions (from client payload or server cache)
    const prevList: string[] = Array.isArray(previousQuestions)
      ? previousQuestions
      : Array.isArray(previousGameQuestions)
      ? previousGameQuestions
      : lastServedQuestionsMap.get(`${categoryId}:${cefrLevel}:${chosenTopic}`) || [];

    const prevSet = new Set(prevList.map((s) => String(s).toLowerCase().trim()));

    // Special handler for "Word Build"
    if (categoryId === 'word-build') {
      const freshPuzzles = WORD_BUILD_PUZZLES.filter(
        (wb) => !prevSet.has(wb.word.toLowerCase())
      );
      const usedPuzzles = WORD_BUILD_PUZZLES.filter(
        (wb) => prevSet.has(wb.word.toLowerCase())
      );

      const shuffledFresh = [...freshPuzzles].sort(() => Math.random() - 0.5);
      const shuffledUsed = [...usedPuzzles].sort(() => Math.random() - 0.5);

      const selected = [...shuffledFresh];
      for (const item of shuffledUsed) {
        if (selected.length >= requestedCount) break;
        if (!selected.some((s) => s.word === item.word)) {
          selected.push(item);
        }
      }

      // If still fewer than requestedCount, wrap around without error
      let idx = 0;
      while (selected.length < requestedCount && WORD_BUILD_PUZZLES.length > 0) {
        selected.push(WORD_BUILD_PUZZLES[idx % WORD_BUILD_PUZZLES.length]);
        idx++;
      }

      const resultItems = selected.slice(0, requestedCount);
      lastServedQuestionsMap.set(
        `${categoryId}:${cefrLevel}:${chosenTopic}`,
        resultItems.map((r) => r.word.toLowerCase())
      );

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: resultItems.length,
        items: resultItems,
        isFallback: false,
      });
    }

    // Special handler for "Flags" (Category 'flags' OR chosenTopic contains 'flag')
    if (
      categoryId === 'flags' ||
      categoryId === 'flag' ||
      chosenTopic.toLowerCase().includes('flag')
    ) {
      const isFlagUsed = (f: typeof FLAG_LIBRARY[0]) => {
        const cLow = f.country.toLowerCase();
        const codeLow = f.code.toLowerCase();
        for (const p of prevList) {
          const pLow = p.toLowerCase();
          if (
            pLow === cLow ||
            pLow === codeLow ||
            pLow.includes(`/${codeLow}.png`) ||
            pLow.startsWith(`${cLow}:`) ||
            pLow.includes(` ${cLow}:`) ||
            pLow.includes(` ${cLow} `) ||
            pLow.includes(`(${cLow})`) ||
            pLow.includes(`[${cLow}]`) ||
            pLow.includes(cLow)
          ) {
            return true;
          }
        }
        return false;
      };

      // Split FLAG_LIBRARY into fresh (not in previous game) and used
      const freshFlags = FLAG_LIBRARY.filter((f) => !isFlagUsed(f));
      const usedFlags = FLAG_LIBRARY.filter((f) => isFlagUsed(f));

      const shuffledFresh = [...freshFlags].sort(() => Math.random() - 0.5);
      const shuffledUsed = [...usedFlags].sort(() => Math.random() - 0.5);

      const chosenItems: typeof FLAG_LIBRARY = [];
      const chosenCountries = new Set<string>();

      // Take fresh flags first
      for (const flag of shuffledFresh) {
        if (chosenItems.length >= requestedCount) break;
        if (!chosenCountries.has(flag.country)) {
          chosenCountries.add(flag.country);
          chosenItems.push(flag);
        }
      }

      // If not enough fresh flags, fill with used flags (no duplicates within this game)
      if (chosenItems.length < requestedCount) {
        for (const flag of shuffledUsed) {
          if (chosenItems.length >= requestedCount) break;
          if (!chosenCountries.has(flag.country)) {
            chosenCountries.add(flag.country);
            chosenItems.push(flag);
          }
        }
      }

      // If requested count is extraordinarily large, wrap around as absolute last resort
      let cycleIdx = 0;
      while (chosenItems.length < requestedCount && FLAG_LIBRARY.length > 0) {
        chosenItems.push(FLAG_LIBRARY[cycleIdx % FLAG_LIBRARY.length]);
        cycleIdx++;
      }

      const questions = chosenItems.map((item, i) => {
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.country);
        return {
          id: `flag-${i + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          question: "Which country's flag is shown in the picture?",
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          imageUrl: item.url,
          explanation: `${item.country}: ${item.fact}`,
          topic: 'Countries',
        };
      });

      // Update server cache
      lastServedQuestionsMap.set(
        `${categoryId}:${cefrLevel}:${chosenTopic}`,
        chosenItems.map((f) => f.country.toLowerCase())
      );

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
      const freshCapitals = CAPITALS_LIBRARY.filter(
        (c) =>
          !prevSet.has(c.country.toLowerCase()) &&
          !prevSet.has(c.capital.toLowerCase()) &&
          !Array.from(prevSet).some((p) => p.includes(c.country.toLowerCase()))
      );
      const usedCapitals = CAPITALS_LIBRARY.filter(
        (c) =>
          prevSet.has(c.country.toLowerCase()) ||
          prevSet.has(c.capital.toLowerCase()) ||
          Array.from(prevSet).some((p) => p.includes(c.country.toLowerCase()))
      );

      const shuffledFresh = [...freshCapitals].sort(() => Math.random() - 0.5);
      const shuffledUsed = [...usedCapitals].sort(() => Math.random() - 0.5);

      const chosenCapitals: typeof CAPITALS_LIBRARY = [];
      const chosenCountries = new Set<string>();

      for (const cap of shuffledFresh) {
        if (chosenCapitals.length >= requestedCount) break;
        if (!chosenCountries.has(cap.country)) {
          chosenCountries.add(cap.country);
          chosenCapitals.push(cap);
        }
      }

      if (chosenCapitals.length < requestedCount) {
        for (const cap of shuffledUsed) {
          if (chosenCapitals.length >= requestedCount) break;
          if (!chosenCountries.has(cap.country)) {
            chosenCountries.add(cap.country);
            chosenCapitals.push(cap);
          }
        }
      }

      let cycleIdx = 0;
      while (chosenCapitals.length < requestedCount && CAPITALS_LIBRARY.length > 0) {
        chosenCapitals.push(CAPITALS_LIBRARY[cycleIdx % CAPITALS_LIBRARY.length]);
        cycleIdx++;
      }

      const questions = chosenCapitals.map((item, i) => {
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.capital);
        return {
          id: `capital-${i + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          question: `What is the capital city of ${item.country}?`,
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          explanation: `${item.capital} is the capital of ${item.country}. ${item.fact}`,
          topic: 'Capitals',
        };
      });

      lastServedQuestionsMap.set(
        `${categoryId}:${cefrLevel}:${chosenTopic}`,
        chosenCapitals.map((c) => c.country.toLowerCase())
      );

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: questions.length,
        questions,
        isFallback: false,
      });
    }

    // Special handler for "Landmarks" in Maps
    if (chosenTopic.toLowerCase().includes('landmark')) {
      const freshLandmarks = LANDMARK_LIBRARY.filter(
        (l) => !prevSet.has(l.name.toLowerCase())
      );
      const usedLandmarks = LANDMARK_LIBRARY.filter(
        (l) => prevSet.has(l.name.toLowerCase())
      );

      const shuffledFresh = [...freshLandmarks].sort(() => Math.random() - 0.5);
      const shuffledUsed = [...usedLandmarks].sort(() => Math.random() - 0.5);

      const chosenLandmarks: typeof LANDMARK_LIBRARY = [];
      const chosenNames = new Set<string>();

      for (const lm of shuffledFresh) {
        if (chosenLandmarks.length >= requestedCount) break;
        if (!chosenNames.has(lm.name)) {
          chosenNames.add(lm.name);
          chosenLandmarks.push(lm);
        }
      }

      if (chosenLandmarks.length < requestedCount) {
        for (const lm of shuffledUsed) {
          if (chosenLandmarks.length >= requestedCount) break;
          if (!chosenNames.has(lm.name)) {
            chosenNames.add(lm.name);
            chosenLandmarks.push(lm);
          }
        }
      }

      let cycleIdx = 0;
      while (chosenLandmarks.length < requestedCount && LANDMARK_LIBRARY.length > 0) {
        chosenLandmarks.push(LANDMARK_LIBRARY[cycleIdx % LANDMARK_LIBRARY.length]);
        cycleIdx++;
      }

      const questions = chosenLandmarks.map((item, i) => {
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.name);
        return {
          id: `landmark-${i + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          question: 'Which famous landmark is shown in the photograph?',
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          imageUrl: item.url,
          explanation: `${item.name} (${item.location}): ${item.fact}`,
          topic: 'Landmarks',
        };
      });

      lastServedQuestionsMap.set(
        `${categoryId}:${cefrLevel}:${chosenTopic}`,
        chosenLandmarks.map((l) => l.name.toLowerCase())
      );

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: questions.length,
        questions,
        isFallback: false,
      });
    }

    // Special handler for "Picture It"
    if (categoryId === 'picture-it') {
      const filtered = PICTURE_LIBRARY.filter(
        (p) =>
          chosenTopic === 'General' ||
          p.topic.toLowerCase().includes(chosenTopic.toLowerCase())
      );
      const pool = filtered.length >= 3 ? filtered : PICTURE_LIBRARY;

      const freshPics = pool.filter((p) => !prevSet.has(p.term.toLowerCase()));
      const usedPics = pool.filter((p) => prevSet.has(p.term.toLowerCase()));

      const shuffledFresh = [...freshPics].sort(() => Math.random() - 0.5);
      const shuffledUsed = [...usedPics].sort(() => Math.random() - 0.5);

      const chosenPics: typeof pool = [];
      const chosenTerms = new Set<string>();

      for (const p of shuffledFresh) {
        if (chosenPics.length >= requestedCount) break;
        if (!chosenTerms.has(p.term)) {
          chosenTerms.add(p.term);
          chosenPics.push(p);
        }
      }

      if (chosenPics.length < requestedCount) {
        for (const p of shuffledUsed) {
          if (chosenPics.length >= requestedCount) break;
          if (!chosenTerms.has(p.term)) {
            chosenTerms.add(p.term);
            chosenPics.push(p);
          }
        }
      }

      let cycleIdx = 0;
      while (chosenPics.length < requestedCount && pool.length > 0) {
        chosenPics.push(pool[cycleIdx % pool.length]);
        cycleIdx++;
      }

      const questions = chosenPics.map((item, i) => {
        const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOpts.indexOf(item.term);
        return {
          id: `pic-${i + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          question: 'What is shown in the image below?',
          options: shuffledOpts,
          answer: correctIndex !== -1 ? correctIndex : 0,
          imageUrl: item.url,
          explanation: `This is a ${item.term}.`,
          topic: item.topic,
        };
      });

      lastServedQuestionsMap.set(
        `${categoryId}:${cefrLevel}:${chosenTopic}`,
        chosenPics.map((p) => p.term.toLowerCase())
      );

      return res.json({
        category: categoryId,
        level: cefrLevel,
        topic: chosenTopic,
        count: questions.length,
        questions,
        isFallback: false,
      });
    }

    // AI Question Generation (Grammar, Vocabulary, Complete It, etc.)
    if (ai) {
      try {
        const prompt = `You are a certified Cambridge/Oxford English language test author creating a fun, interactive Kahoot-style quiz game called "Wordal!".
Generate exactly ${requestedCount} unique multiple-choice English learning questions.

CRITICAL MANDATORY REQUIREMENT - STRICT TOPIC ADHERENCE:
- Category: "${categoryId}"
- Chosen Topic: "${chosenTopic}" (MANDATORY: Every single question MUST be 100% focused strictly and specifically on the topic "${chosenTopic}". For example, if Topic is "Present Perfect", test Present Perfect! If Topic is "Conditionals", test Conditionals! If Topic is "Food", test Food vocabulary! Do not ask about unrelated topics!)
- CEFR Difficulty Level: ${cefrLevel} (Calibrate grammar and vocabulary precisely to CEFR ${cefrLevel})
${prevList.length > 0 ? `- VARIATION REQUIREMENT: Please generate NEW questions. Do NOT repeat or duplicate these questions from the previous game:\n${prevList.slice(0, 15).map((q) => `  * ${q}`).join('\n')}` : ''}

STRICT FORMAT RULES:
1. Each question must have:
   - "question": Clear, concise question text directly testing "${chosenTopic}". Must be unique.
   - "options": Array of EXACTLY 4 distinct, plausible string options.
   - "answer": 0-based integer index (0, 1, 2, or 3) indicating the single correct option.
   - "explanation": Short, 1-sentence helpful explanation.`;

        const generateQuestionsFromAI = async (p: string) => {
          return await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: p,
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

        const timeoutPromise = (ms: number) =>
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI generation timed out')), ms)
          );

        const response: any = await Promise.race([
          generateQuestionsFromAI(prompt),
          timeoutPromise(12000),
        ]);

        const rawText = response.text ? response.text.trim() : '';
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Deduplicate within current batch
            const seenInBatch = new Set<string>();
            const validBatch: any[] = [];
            for (const q of parsed) {
              if (
                typeof q.question === 'string' &&
                q.question.trim().length > 0 &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                typeof q.answer === 'number' &&
                q.answer >= 0 &&
                q.answer <= 3
              ) {
                const normQ = q.question.trim().toLowerCase();
                if (!seenInBatch.has(normQ)) {
                  seenInBatch.add(normQ);
                  validBatch.push(q);
                }
              }
            }

            // Separate into fresh (not in previous game) and repeat
            const freshQuestions = validBatch.filter(
              (q) => !prevSet.has(q.question.trim().toLowerCase())
            );
            const repeatQuestions = validBatch.filter(
              (q) => prevSet.has(q.question.trim().toLowerCase())
            );

            const finalQuestions: any[] = [...freshQuestions];
            const finalSeen = new Set(finalQuestions.map((q) => q.question.trim().toLowerCase()));

            // If we don't have enough fresh questions, try ONE quick supplementary call if needed
            if (finalQuestions.length < requestedCount) {
              const needed = requestedCount - finalQuestions.length;
              try {
                const suppPrompt = `Generate exactly ${needed} additional DIFFERENT English quiz questions for:
Category: "${categoryId}", Topic: "${chosenTopic}", Level: ${cefrLevel}.
Do not repeat these:\n${[...finalSeen, ...Array.from(prevSet).slice(0, 10)].map((s) => `* ${s}`).join('\n')}`;

                const suppResp: any = await Promise.race([
                  generateQuestionsFromAI(suppPrompt),
                  timeoutPromise(6000),
                ]);
                const suppText = suppResp.text ? suppResp.text.trim() : '';
                if (suppText) {
                  const suppParsed = JSON.parse(suppText);
                  if (Array.isArray(suppParsed)) {
                    for (const sq of suppParsed) {
                      if (finalQuestions.length >= requestedCount) break;
                      if (
                        typeof sq.question === 'string' &&
                        sq.question.trim().length > 0 &&
                        Array.isArray(sq.options) &&
                        sq.options.length === 4 &&
                        typeof sq.answer === 'number'
                      ) {
                        const norm = sq.question.trim().toLowerCase();
                        if (!finalSeen.has(norm) && !prevSet.has(norm)) {
                          finalSeen.add(norm);
                          finalQuestions.push(sq);
                        }
                      }
                    }
                  }
                }
              } catch {
                // Ignore supplementary timeout, fall through to fill remaining
              }
            }

            // Rule 4: NEVER LEAVE GAME EMPTY OR UNDERFILLED!
            // If still fewer than requestedCount, fill with non-duplicate questions from repeatQuestions
            if (finalQuestions.length < requestedCount) {
              for (const rq of repeatQuestions) {
                if (finalQuestions.length >= requestedCount) break;
                const norm = rq.question.trim().toLowerCase();
                if (!finalSeen.has(norm)) {
                  finalSeen.add(norm);
                  finalQuestions.push(rq);
                }
              }
            }

            // If STILL fewer than requestedCount, fill with curated fallback questions
            if (finalQuestions.length < requestedCount) {
              const fbPool = getFallbackQuestions(
                categoryId as any,
                requestedCount,
                cefrLevel as any,
                chosenTopic,
                Array.from(finalSeen)
              );
              for (const fb of fbPool) {
                if (finalQuestions.length >= requestedCount) break;
                const norm = fb.question.trim().toLowerCase();
                if (!finalSeen.has(norm)) {
                  finalSeen.add(norm);
                  finalQuestions.push(fb);
                }
              }
            }

            const formatted = finalQuestions.slice(0, requestedCount).map((q, idx) => ({
              id: `ai-${idx + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              question: q.question.trim(),
              options: q.options.map((opt: string) => String(opt).trim()),
              answer: Math.floor(q.answer),
              explanation: q.explanation || 'Correct answer!',
              topic: chosenTopic,
            }));

            // Save to server cache
            lastServedQuestionsMap.set(
              `${categoryId}:${cefrLevel}:${chosenTopic}`,
              formatted.map((q) => q.question.toLowerCase())
            );

            return res.json({
              category: categoryId,
              level: cefrLevel,
              topic: chosenTopic,
              count: formatted.length,
              questions: formatted,
              isFallback: false,
            });
          }
        }
      } catch (aiError) {
        console.warn('AI question generation encountered an issue, falling back to curated bank:', aiError);
      }
    }

    // Curated Fallback
    const fallback = getFallbackQuestions(
      categoryId as any,
      requestedCount,
      cefrLevel as any,
      chosenTopic,
      prevList
    );

    lastServedQuestionsMap.set(
      `${categoryId}:${cefrLevel}:${chosenTopic}`,
      fallback.map((q) => q.question.toLowerCase())
    );

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
          const seen = new Set<string>();
          const deduped: typeof msg.questions = [];
          for (const q of msg.questions) {
            const key = String(q.question || '').trim().toLowerCase() + (q.imageUrl ? `_${q.imageUrl}` : '');
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(q);
            }
          }
          room.questions = deduped.length > 0 ? deduped : msg.questions;
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
