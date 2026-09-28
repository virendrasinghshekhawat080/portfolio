// Only predefined developer-owned destinations may reach this function.
// A speech-recognition event is not always considered a user gesture by browsers.
// If the popup is blocked, the UI must show a normal target="_blank" link.
export function isSafeDestination(raw) {
  const url = String(raw || '').trim();
  return /^https:\/\/[^\s]+$/i.test(url) || /^\/(?!\/)[^\s]*$/i.test(url) || /^(?:mailto:|tel:)[^\s]+$/i.test(url);
}

export function openExternalTab(raw, open = (url, name) => window.open(url, name)) {
  if (!isSafeDestination(raw)) return false;
  try {
    const popup = open(raw, '_blank');
    if (!popup) return false;
    try { popup.opener = null; } catch { /* browser may restrict opener */ }
    return true;
  } catch {
    return false;
  }
}
