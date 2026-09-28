VIRENDRA PORTFOLIO - COMPLETE SMART AI (24 Sep 2026)

1. ZIP Extract करें; जिस फोल्डर में package.json है उसे VS Code में खोलें.
2. PowerShell Terminal 1: npm.cmd install ; npm.cmd run dev . Terminal में दिखा localhost URL खोलें.
3. इसी folder में .env.example को Copy-Item .env.example .env से .env बनाएं; OPENAI_API_KEY= अपनी private API key डालें. API Key ZIP/GitHub/chat में न डालें. Terminal 2: npm.cmd run chat .
4. Voice mic नीचे-दाईं तरफ एक छोटा गोल बटन है; उसे एक बार click करें और Browser microphone permission Allow करें. Assistant खुलने पर यह छोटा ~292 x 392 px panel रहता है. उसे बंद करने के लिए X दबाएं.
5. बिना दूसरे क्लिक के voice-confirmation के बाद NEW TAB के लिए browser extension एक बार install करना जरूरी है. Edge: edge://extensions -> Developer mode ON -> पुरानी Virendra Voice Tab extension Remove -> Load unpacked -> इसी project का पूरा voice-tab-extension folder चुनें (manifest.json उसी के अंदर है). Chrome: chrome://extensions . Portfolio का localhost tab refresh करें; panel में Voice Tab Extension जुड़ा है दिखना चाहिए. यह extension LOCAL 5173/5174 पर काम करती है.
6. 'Instagram खोलो' -> AI: 'Instagram नए टैब में खोलूँ? हाँ या ना बोलिए' -> 'हाँ' -> extension new tab खोलेगी. Portfolio अपने टैब में रहेगा; returning to background portfolio may require mic restart due to browser restrictions. पहले से installed extension change करने पर Reload करें.
7. Recipe, geography, broad questions -> AI backend /api/chat; web_search tool enabled by default when model deems online info relevant. यह Google page scraping नहीं है. Online search requires supported model, API permissions/credits and internet. अगर web search feature उपलब्ध नहीं है, WEB_SEARCH_ENABLED=0 कर backend restart करें; general AI बिना live search फिर भी चलेगी.
8. Normal API and browser mic are separate; an 'API key supplied' console line does NOT confirm API billing or success. Quick checks: http://127.0.0.1:3001/api/health; website Console F12.
9. Project includes original pages, separate CSS, images, downloadable resume, project links, frontend, backend, extension and test files. No .env/API key or node_modules included.

IMPORTANT: public hosting on Vercel static frontend doesn't run this local Node backend or localhost-only extension. Real production would need deployed backend + configured CORS and extension host allowlist. Public API cost/abuse controls need stronger measures.
