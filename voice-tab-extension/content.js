// Small bridge between the local Portfolio page and extension service worker.
// No click handler is needed: the page sends OPEN_TAB only after spoken YES.
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173", "http://localhost:5174",
  "http://127.0.0.1:5173", "http://127.0.0.1:5174",
]);
if (window === window.top && ALLOWED_ORIGINS.has(window.location.origin)) {
  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    const item = event.data;
    if (item?.type !== "VIRENDRA_VOICE_TAB_REQUEST") return;
    if (typeof item.id !== "string" || item.id.length > 100) return;
    if (item.action !== "PING" && item.action !== "OPEN_TAB") return;
    if (item.action === "OPEN_TAB" &&
        (typeof item.url !== "string" || item.url.length > 2048)) return;

    chrome.runtime.sendMessage(
      { action: item.action, url: item.url || "" },
      (answer) => {
        const ok = !chrome.runtime.lastError && answer?.ok === true;
        window.postMessage({
          type: "VIRENDRA_VOICE_TAB_RESULT",
          id: item.id,
          ok,
          reason: ok ? "opened" : answer?.reason || "extension-error",
        }, window.location.origin);
      }
    );
  });
}
