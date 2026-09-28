import { EMAIL, GITHUB, INSTAGRAM, LINKEDIN, PHONE, PROJECTS, RESUME, TELEGRAM, WHATSAPP } from '../config.js';

// This is a local, rule-based command matcher. It never sends transcripts to our own server.
// Speech-to-text is handled by the browser and may require its online speech service.
export const normalizeCommand = (input = '') => String(input)
  .toLowerCase()
  .normalize('NFKC')
  .replace(/[.,!?।،:;"'“”’]/g, ' ')
  .replace(/[-_]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const has = (text, pattern) => pattern.test(text);
const idProject = (id) => PROJECTS.find((project) => project.id === id);
const STORE = idProject('mystore')?.live?.replace(/\/$/, '') || 'https://mystore-ecommerce-nine.vercel.app';
const inStore = (product = '') => `${STORE}/products${product ? `?search=${encodeURIComponent(product)}` : ''}`;

// Portfolio site has no product database; product searches navigate to the existing MyStore site.
// Add further recognized product names here without changing the UI code.
export const PRODUCT_ALIASES = [
  { search: 'headphones', aliases: /\b(?:head\s?phone?s?|head\s?phon|headset|head\s?set|ear\s?phone?s?|ear\s?buds?|air\s?pods?|hedphone?s?)\b|हेड\s?फोन|हेडफ़ोन|इयर\s?फोन|ईयरबड|इयरबड|हेडफोन्स/ },
  { search: 'laptop', aliases: /\b(?:laptop?s?|lap\s?top?s?|notebook\s?computer)\b|लैपटॉप|लेपटॉप/ },
  { search: 'mobile', aliases: /\b(?:mobiles?|smart\s?phones?|cell\s?phones?)\b|मोबाइल|स्मार्टफोन/ },
  { search: 'watch', aliases: /\b(?:watch(?:es)?|smart\s?watch(?:es)?)\b|घड़ी|घड़ी|वॉच/ },
  { search: 'shoes', aliases: /\b(?:shoe?s?|sneakers?|footwear)\b|जूते|शूज/ },
  { search: 'keyboard', aliases: /\bkey\s?boards?\b|कीबोर्ड/ },
  { search: 'electronics', aliases: /\b(?:electronics?|electronic\s?items?|elec\s?tronic)\b|इलेक्ट्रॉनिक|इलेक्ट्रॉनिक्स/ },
  { search: 'clothing', aliases: /\b(?:clothes|clothing|shirts?|t\s?shirts?|jeans)\b|कपड़े|कपड़े|शर्ट/ },
];

const PRODUCT_WORDS = /\b(?:products?|items?|catalog(?:ue)?|shopping|shop)\b|प्रोडक्ट|प्रोडक्‍ट|प्रोडक्ट्स|सामान|आइटम/;
const VIEW_WORDS = /\b(?:show|find|search|want|need|looking\s?for|open|buy|browse|dikhao|dikha\s?do|chahiye|mujhe|mere\s?ko)\b|दिखाओ|दिखा|चाहिए|खोलो|मुझे|मेरे\s?को/;

export function interpretVoice(input) {
  const phrase = normalizeCommand(input);
  if (!phrase) return { kind: 'fallback', message: 'आवाज़ नहीं सुनी गई। दोबारा बोलें या नीचे कमांड टाइप करें।' };

  if (has(phrase, /^(?:off|turn off|voice off|mic off|stop|stop voice|stop listening|close assistant|cancel|mic band|mic band karo|voice band|band karo|बंद|ऑफ|बंद करो|बंद कर दो|माइक बंद(?: करो)?|वॉइस बंद(?: करो)?|एआई बंद(?: करो)?|आवाज बंद(?: करो)?|आवाज़ बंद(?: करो)?|स्टॉप|रुको|रुक जाओ)$/)) {
    return { kind: 'stop', message: 'Voice Assistant बंद कर दिया गया है।' };
  }
  if (has(phrase, /\b(?:help|commands?|what\s?can\s?you\s?do)\b|क्या\s?बोलूं|मदद|कमांड/)) {
    return { kind: 'help', message: 'बोलें: “About खोलो”, “मेरे projects दिखाओ”, “head phone दिखाओ”, “WhatsApp खोलो” या “TaskFlow GitHub खोलो”।' };
  }

  // 'mere ko head phon dikhao' and 'electronics ke headphones' both search for headphones.
  const product = PRODUCT_ALIASES.find(({ aliases }) => aliases.test(phrase));
  if (product) return { kind: 'external', url: inStore(product.search), message: `MyStore पर “${product.search}” खोज रहे हैं…` };

  // A named project takes priority over generic keywords like GitHub or shopping.
  const namedProjects = [
    { id: 'task', test: /\b(?:task\s?flow|task\s?flo|taskful|task\s?manager)\b|टास्क\s?फ्लो/ },
    { id: 'expense', test: /\b(?:expense\s?tracker|finance\s?dashboard|expense\s?app)\b|एक्सपेंस\s?ट्रैकर|खर्च\s?ट्रैकर/ },
    { id: 'commerce', test: /\b(?:e\s?commerce\s?website|e\s?commerce\s?site|ecommerce\s?sit)\b|ई\s?कॉमर्स\s?वेबसाइट/ },
    { id: 'mystore', test: /\b(?:my\s?store|mystore|my\s?shop)\b|माय\s?स्टोर|माई\s?स्टोर/ },
  ];
  const projectMatch = namedProjects.find(({ test }) => test.test(phrase));
  if (projectMatch) {
    const item = idProject(projectMatch.id);
    const source = has(phrase, /\b(?:github|git\s?hub|source\s?code|repository|repo)\b|गिटहब|सोर्स\s?कोड/);
    if (item) return { kind: 'external', url: source ? item.repo : item.live, message: `${item.title} ${source ? 'Source Code' : 'Live Demo'} खोल रहे हैं…` };
  }

  if (has(phrase, PRODUCT_WORDS) && (has(phrase, VIEW_WORDS) || has(phrase, /\b(?:products?|catalog(?:ue)?|shop|shopping)\b|प्रोडक्ट|आइटम|सामान/))) {
    return { kind: 'external', url: inStore(), message: 'MyStore का product catalog खोल रहे हैं…' };
  }

  const social = [
    { test: /\b(?:whats\s?app|what\s?sap|whatapp|watapp|wats\s?app|vatsap|whatsup)\b|वाट्सएप|व्हाट्सएप|व्हाट्सअप|वॉट्सएप|वॉट्सऐप/, url: WHATSAPP, label: 'WhatsApp' },
    { test: /\b(?:instagram|insta\s?gram|instram|instrakm|insta)\b|इंस्टाग्राम|इन्स्टाग्राम|इंस्टा/, url: INSTAGRAM, label: 'Instagram' },
    { test: /\b(?:telegram|tele\s?gram|teligram|teligraam)\b|टेलीग्राम|टेलिग्राम/, url: TELEGRAM, label: 'Telegram' },
    { test: /\b(?:linked\s?in|linkdin|linkden|link\s?din)\b|लिंक्डइन|लिंकडिन|लिंकडइन/, url: LINKEDIN, label: 'LinkedIn' },
    { test: /\b(?:github|git\s?hub|gitup)\b|गिटहब|गिट\s?हब/, url: GITHUB, label: 'GitHub' },
    { test: /\b(?:email|e\s?mail|mail)\b|ईमेल|मेल\s?करो/, url: `mailto:${EMAIL}`, label: 'Email' },
    { test: /\b(?:call|dial|phone\s?number)\b|कॉल\s?करो|फोन\s?करो/, url: `tel:+91${PHONE}`, label: 'Phone' },
  ];
  const site = social.find(({ test }) => test.test(phrase));
  if (site) return { kind: 'external', url: site.url, message: `${site.label} खोल रहे हैं…` };

  if (has(phrase, /\b(?:resume|resumay|resumy|my\s?cv|download\s?cv|curriculum)\b|रिज्यूमे|रिज़्यूमे|रेज्यूमे|सीवी/)) {
    return { kind: 'external', url: RESUME, message: 'Resume खोल रहे हैं…' };
  }

  // Common ASR variations of About: "abot", "a bot", "abaut", "अबाउट".
  const sections = [
    { test: /\b(?:contact|contac|contact\s?page|reach\s?me)\b|संपर्क|कॉन्टैक्ट|कांटेक्ट/, hash: '#/contact', label: 'Contact Page' },
    { test: /\b(?:projects?|my\s?work|project\s?section|protfolio\s?projects)\b|प्रोजेक्ट|प्रोजेक्ट्स|मेरे\s?काम/, hash: '#projects', label: 'Projects' },
    { test: /\b(?:skills?|technologies|technology|tech\s?stack)\b|स्किल|स्किल्स|टेक्नोलॉजी/, hash: '#skills', label: 'Skills' },
    { test: /\b(?:experience|education|college|qualification|studies)\b|अनुभव|एक्सपीरियंस|शिक्षा|कॉलेज|पढ़ाई/, hash: '#experience', label: 'Experience & Education' },
    { test: /\b(?:about|abot|abaut|abut|a\s?bot|about\s?me|my\s?intro|introduction|who\s?are\s?you)\b|अबाउट|अबाट|मेरे\s?बारे|आपके\s?बारे|परिचय/, hash: '#about', label: 'About Me' },
    { test: /\b(?:home|homepage|home\s?page|start\s?page|top)\b|होम|मुख्य\s?पेज|ऊपर/, hash: '#home', label: 'Home' },
  ];
  const section = sections.find(({ test }) => test.test(phrase));
  if (section) return { kind: 'internal', hash: section.hash, message: `${section.label} खोल रहे हैं…` };

  // Do not guess when the command is unclear. Show exactly what the browser heard.
  return { kind: 'fallback', message: `“${input}” समझ नहीं आया। About, Projects, WhatsApp या Headphones बोलें; या नीचे टाइप करें।` };
}
