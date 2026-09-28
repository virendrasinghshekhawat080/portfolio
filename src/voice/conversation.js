import { interpretVoice, normalizeCommand } from './intent.js';

const question = /\b(?:what|who|why|how|when|where|which|explain|tell me|meaning|define|kya|kaise|kaun|kyun|kyu|kab|kahan|batao|samjhao|about|details|describe)\b|क्या|कैसे|कौन|क्यों|कब|कहाँ|बताओ|समझाओ|मतलब|कितने|क्या-क्या|जानकारी|के बारे/;
const openRequest = /\b(?:open|show|go to|navigate|visit|dikhao|kholo|le chalo|search|find|download|scroll)\b|खोलो|दिखाओ|ले चलो|डाउनलोड|खोजो|स्क्रॉल|पर जाओ/;
const nameOnly = /^(?:hardeep|hardeep singh|हरदीप|हरदीप सिंह|हरदीप जी|हर्दीप|हर्दीप सिंह|hardip)$/;
const factWords = /\b(?:portfolio|projects?|experience|education|skills?|about|virendra|resume|internship|mystore|taskflow|expense|website)\b|पोर्टफोलियो|प्रोजेक्ट|अनुभव|पढ़ाई|शिक्षा|स्किल|वीरेंद्र|रिज्यूमे|इंटर्नशिप|अबाउट/;
export const NO_NAME = 'मेरे पोर्टफोलियो की जानकारी में हरदीप सिंह का नाम नहीं है। आप किस हरदीप सिंह के बारे में पूछ रहे हैं?';

export function classifyUtterance(raw) {
  const phrase = normalizeCommand(raw);
  if (!phrase) return { kind:'empty' };
  if (nameOnly.test(phrase)) return { kind:'unknown-name' };
  // Explanations stay in chat; saying "experience में क्या है" must not scroll.
  if (question.test(phrase) && !openRequest.test(phrase)) return { kind:'chat' };
  const action = interpretVoice(raw);
  if (action.kind === 'fallback') return { kind:'chat' };
  return action;
}

export function localReply(input) {
  const t = normalizeCommand(input);
  if (/\b(?:hardeep|hardip)\b|हरदीप|हर्दीप/.test(t)) return NO_NAME;
  if (/^(?:hi|hello|hey|namaste|hii|नमस्ते|हेलो|नमस्कार)\b/.test(t)) return 'नमस्ते दोस्त! मैं वीरेंद्र के पोर्टफोलियो का AI Voice साथी हूँ। पेज खुलवाएँ या कोई सवाल पूछें।';
  if (/(?:how are you|kaise ho|कैसे हो|क्या हाल)/.test(t)) return 'मैं ठीक हूँ दोस्त! आप बताइए, आज किस बारे में बात करेंगे?';
  if (/(?:your name|tumhara naam|apka naam|आपका नाम|तुम्हारा नाम)/.test(t)) return 'मैं वीरेंद्र के पोर्टफोलियो का AI Voice साथी हूँ।';
  if (/(?:who is virendra|virendra kaun|वीरेंद्र कौन|virendra ke bare|वीरेंद्र के बारे)/.test(t)) return 'वीरेंद्र सिंह शेखावत जयपुर के Frontend और MERN Stack Developer हैं। उन्होंने 2026 में B.Tech CSE किया और Techno Derivation में डेवलपर इंटर्नशिप की।';
  if (factWords.test(t) && question.test(t)) {
    if (/\b(?:taskflow|task flow)\b|टास्क फ्लो/.test(t)) return 'TaskFlow React में बनाया गया टास्क मैनेजर है। इसमें टास्क जोड़ना, एडिट करना, पूरा करना, डिलीट करना, सर्च और फिल्टर करना और localStorage में टास्क सेव रखना शामिल है।';
    if (/\b(?:mystore|my store)\b|माय स्टोर/.test(t)) return 'MyStore फुल-स्टैक ई-कॉमर्स प्रोजेक्ट है। इसमें React वाला प्रोडक्ट इंटरफेस, अकाउंट और एडमिन वर्कफ्लो तथा Node, Express और MongoDB Backend का उपयोग किया गया है।';
    if (/\b(?:expense|finance)\b|एक्सपेंस|खर्च/.test(t)) return 'Expense Tracker एक React फाइनेंस डैशबोर्ड है। इसमें खर्च जोड़ना, कैटेगरी, सर्च, मासिक एनालिटिक्स, Recharts से ग्राफ और localStorage से डेटा सेव रखना शामिल है।';
    if (/\b(?:ecommerce sit|e commerce website|ecommerce website)\b|ई कॉमर्स वेबसाइट/.test(t)) return 'E-Commerce Website React और Vite में बनी responsive storefront है। इसमें प्रोडक्ट ब्राउजिंग, कैटेगरी, सर्च और पुनः इस्तेमाल होने वाले React components हैं।';
    if (/\b(?:projects?|mystore|taskflow|expense)\b|प्रोजेक्ट|कौन कौन से प्रोजेक्ट/.test(t)) return 'वीरेंद्र के चार प्रोजेक्ट हैं: MyStore फुल-स्टैक ई-कॉमर्स, E-Commerce Website, TaskFlow टास्क मैनेजर और Expense Tracker फाइनेंस डैशबोर्ड। इनके लाइव डेमो Projects सेक्शन में हैं।';
    if (/\b(?:experience|internship)\b|अनुभव|एक्सपीरियंस|इंटर्नशिप/.test(t)) return 'वीरेंद्र ने Techno Derivation Private Limited, जयपुर में MERN Stack Developer Intern के रूप में React UI, REST APIs और Node.js, Express तथा MongoDB पर काम किया है।';
    if (/\b(?:education|college|study|degree)\b|पढ़ाई|शिक्षा|कॉलेज/.test(t)) return 'वीरेंद्र ने Shree Balaji College of Engineering and Technology, जयपुर से 2026 में कंप्यूटर साइंस में B.Tech किया। बारहवीं Shree Shyam Public Senior Secondary School से की।';
    if (/\b(?:skills?|technology|tech stack)\b|स्किल|टेक्नोलॉजी/.test(t)) return 'मुख्य स्किल्स React, JavaScript, HTML, CSS और Responsive Design हैं। Backend में Node.js, Express, MongoDB और REST APIs पर भी काम किया है।';
    if (/\b(?:about|portfolio|website)\b|अबाउट|पोर्टफोलियो|वेबसाइट/.test(t)) return 'इस पोर्टफोलियो में वीरेंद्र का परिचय, Frontend और MERN स्किल्स, चार लाइव प्रोजेक्ट, इंटर्नशिप, शिक्षा, कॉन्टैक्ट और रिज्यूमे हैं। आप इन सेक्शन को बोलकर खुलवा सकते हैं।';
    if (/\bresume\b|रिज्यूमे/.test(t)) return 'रिज्यूमे में वीरेंद्र की शिक्षा, React और MERN स्किल्स, Techno Derivation की इंटर्नशिप और प्रोजेक्ट्स की जानकारी है। Home पर Download CV बटन से इसे खोल सकते हैं।';
  }
  return null;
}
