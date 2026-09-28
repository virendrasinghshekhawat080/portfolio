// Only trusted local Portfolio origins can request a tab.
// Destinations are restricted to the developer's existing social/demo hosts.
const ORIGINS = new Set([
  "http://localhost:5173", "http://localhost:5174",
  "http://127.0.0.1:5173", "http://127.0.0.1:5174",
]);
const HOSTS = new Set([
  "wa.me", "api.whatsapp.com", "web.whatsapp.com", "www.whatsapp.com",
  "instagram.com", "www.instagram.com",
  "linkedin.com", "www.linkedin.com",
  "github.com", "www.github.com", "github.io", "virendrasinghshekhawat080.github.io",
  "t.me", "telegram.me", "web.telegram.org",
  "mystore-ecommerce-nine.vercel.app",
]);
const LOCAL_PORTFOLIO_PORTS = new Set(["5173", "5174"]);

function approvedUrl(raw, senderUrl) {
  try {
    const origin = new URL(senderUrl).origin;
    if (!ORIGINS.has(origin)) return null;
    const target = new URL(raw);
    if (target.origin === origin && target.protocol === "http:" &&
        LOCAL_PORTFOLIO_PORTS.has(target.port)) return target.href;
    if (target.protocol !== "https:" || !HOSTS.has(target.hostname)) return null;
    return target.href;
  } catch { return null; }
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (!message || (message.action !== "PING" && message.action !== "OPEN_TAB")) return false;
  // Never accept messages from other sites, extension pages or child frames.
  const source = sender.tab?.url || sender.url || "";
  let validSender = false;
  try { validSender = sender.frameId === 0 && ORIGINS.has(new URL(source).origin); }
  catch { /* bad sender */ }
  if (!validSender) { respond({ ok: false, reason: "untrusted-source" }); return false; }
  if (message.action === "PING") { respond({ ok: true }); return false; }
  const url = approvedUrl(message.url, source);
  if (!url) { respond({ ok: false, reason: "blocked-destination" }); return false; }
  chrome.tabs.create({ url, active: true }, (tab) => {
    if (chrome.runtime.lastError) {
      respond({ ok: false, reason: "browser-error" });
      return;
    }
    respond({ ok: Boolean(tab?.id), reason: tab?.id ? "opened" : "browser-error" });
  });
  return true;
});
