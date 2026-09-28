> सबसे पहले `README_पहले_यह_पढ़ें.txt` खोलें: compact chat panel, voice confirmation extension, AI questions और web-search setup.

# Virendra — React Portfolio + AI Voice Assistant (Frontend + Node backend)

यह उसी React/Vite portfolio का अपडेटेड प्रोजेक्ट है। Home, About, Skills, Projects, Experience, Contact, Resume और responsive CSS अलग-अलग फाइलों में हैं। Profile में animated orbit, pointer-responsive 3D tilt, hover glow और section/scroll reveals हैं। `prefers-reduced-motion` पर भारी animation बंद हो जाती है।

## 1. VS Code / PowerShell में चलाएँ

इस फ़ोल्डर को VS Code में खोलें, जिसमें `package.json` है। Node.js 22+ इस्तेमाल करें। **Terminal 1 (Frontend):**

```powershell
npm.cmd install
npm.cmd run dev
```

Vite जो URL बताए उसे खोलें: `http://localhost:5173/` या `http://localhost:5174/`।

**Terminal 2 (AI backend):** इस प्रोजेक्ट की `.env.example` की कॉपी `.env` में बनाएँ:

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env` में `OPENAI_API_KEY=...` के सामने **अपनी** AI API Key डालें। ChatGPT subscription, API credits/key से अलग है। अपनी key किसी को न भेजें, `src/` में न डालें और GitHub पर `.env` अपलोड न करें।

```powershell
npm.cmd run chat
```

Check: `http://localhost:3001/api/health` (ready=true केवल key मौजूद होने का संकेत है, key सही होने/credits की गारंटी नहीं)। फिर वेबसाइट Refresh करें। अगर API Key नहीं है तो site navigation और सामान्य portfolio जानकारी के offline जवाब फिर भी चलेंगे; सामान्य AI सवालों के लिए backend की असली key और billing चाहिए।

## 2. Voice कैसे काम करती है

- नीचे-दाईं तरफ **केवल Mic Icon** पर Click करें। Browser के permission popup में Allow दबाएँ। उसी समय साइड में conversation panel खुलेगा।
- एक वाक्य पूरा होने पर recognition आम तौर पर रुकती है। Assistant जवाब *बोलते समय* listening रोककर जवाब पूरा होने पर अगले सवाल के लिए recognition दोबारा शुरू करने की कोशिश करता है। आप "बंद", "ऑफ", "stop listening" बोलकर या Mic/× दबाकर session बंद कर सकते हैं।
- Home, About, Skills, Projects, Experience और Contact उसी Portfolio tab में खुलेंगे। बोलें: "होम", "कॉन्टैक्ट खोलो", "एक्सपीरियंस दिखाओ", "About में क्या लिखा है?", "मेरे Projects के बारे में बताओ"।
- WhatsApp, LinkedIn, GitHub, Telegram, Instagram, project demos और Resume **अलग tab** में खुलेंगे; Portfolio tab बचा रहेगा। Browser कभी-कभी Speech Recognition event से popup खोलने की अनुमति नहीं देता। ऐसे में चैट में "नए टैब में खोलें" का सुरक्षित link दिखता है; उसे click करें। Browser से force करके popup blocker bypass नहीं किया जा सकता।
- General questions ("GitHub कैसे चलाएँ?", "सेब क्या है?", "विराट कोहली के बारे में बताइए") के लिए configured AI backend इस्तेमाल होता है। Browser की speech synthesis जवाब बोलकर सुनाती है। Live news, route distance या अन्य current facts के लिए AI का उत्तर अलग से verify करें: WEB_SEARCH_ENABLED=1 पर OpenAI web_search tool उपलब्ध होने पर current जानकारी खोज सकता है; यह Google page scraping नहीं है।
- नए टैब पर जाते ही उस **नए tab** में portfolio assistant नहीं चलता। Browser पुराने Portfolio tab को background में रोक सकता है; वापस आने पर यह सुनना पुनः शुरू करने की कोशिश करेगा। कोई भी browser बिना रोक-टोक हमेशा mic चालू रहने की गारंटी नहीं देता।

## 3. Data / Privacy

Chat transcript की पिछली अधिकतम 40 entries आपके **अपने browser localStorage** में सेव रहती हैं, database में नहीं। "Chat साफ करें" दबाकर local copy हटाएँ। AI सवाल भेजने पर पहचाना हुआ text और हाल के कुछ messages backend के जरिए AI API को भेजे जाते हैं; raw mic audio backend को नहीं भेजा जाता। Browser अपनी speech recognition service में audio भेज सकता है। Visitors को visible privacy note दिखता है।

Backend एक minimal Node HTTP API है: `GET /api/health`, `POST /api/chat`, secure server-side `OPENAI_API_KEY`, per-IP rate limit, size limits, upstream timeout, configured CORS allowlist. कोई MongoDB या database **ज़रूरी नहीं** है जब तक आपको visitor chat centrally save/admin dashboard में देखना न हो। Public hosting पर abuse/cost protection (auth/captcha/rate-limiting, quotas) अलग से configure करें।

## 4. Frontend/Backend अलग deploy कैसे करें

Frontend के लिए Vite build:

```powershell
npm.cmd run build
```

`dist/` को Vercel/Netlify पर host कर सकते हैं। Backend `server.mjs` को Node hosting पर host करें; `HOST=0.0.0.0`, backend host के अनुसार `PORT`/`CHAT_PORT`, `OPENAI_API_KEY`, और `ALLOWED_ORIGIN=https://your-portfolio.example` server environment variables में सेट करें। Site पर browser से Backend कॉल करने के लिए Frontend build से पहले root `.env` में **सिर्फ public backend URL** सेट करें:

```env
VITE_AI_API_URL=https://your-ai-backend.example.com
```

`VITE_` prefixed environment variables frontend में public होती हैं: इसमें **कभी भी** API Key मत रखिए। दोबारा frontend build/deploy करें। GitHub Pages static hosting अकेले Node backend नहीं चला सकती।

## 5. आगे बदलाव कहाँ करने हैं

| Feature | File |
| --- | --- |
| Mic, continuous conversation, chat UI | `src/VoiceAssistant.jsx` |
| Chat panel/mic animation | `src/styles/Agent.css` |
| Voice commands | `src/voice/intent.js` |
| Portfolio questions/offline replies | `src/voice/conversation.js` |
| Social links, Telegram public username | `src/config.js` |
| Profile animation/tilt | `src/components/Hero.jsx`, `src/styles/Motion.css` |
| Home/About and separate CSS | `src/components/Hero.jsx`, `src/components/About.jsx`, `src/styles/Hero.css`, `src/styles/About.css` |
| Backend instructions and chat API | `server.mjs`, `.env` |

**Telegram note:** `t.me/+919521051315` लिंक Telegram privacy settings पर निर्भर करता है। बेहतर direct opening के लिए `src/config.js` में `TELEGRAM` को अपने verified public `https://t.me/username` से बदलें।

## 6. Tests

```powershell
npm.cmd run test:voice
npm.cmd run test:server
npm.cmd run build
```

Backend tests AI API को mock करते हैं; वास्तविक API Key और mic के साथ browser end-to-end validation आपको Windows Chrome/Edge में करनी होगी।
