const STORAGE_KEYS = Object.freeze({
  entries: "cpt304_budget_entries_v1",
  consent: "cpt304_budget_storage_consent_v1",
  language: "cpt304_budget_language_v1",
});

function canUseLocalStorage() {
  try {
    const testKey = "__budget_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function hasStorageConsent() {
  if (!canUseLocalStorage()) return false;
  return localStorage.getItem(STORAGE_KEYS.consent) === "accepted";
}

export function setStorageConsent(value) {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(STORAGE_KEYS.consent, value ? "accepted" : "declined");
}

export function getStoredConsentChoice() {
  if (!canUseLocalStorage()) return null;
  return localStorage.getItem(STORAGE_KEYS.consent);
}

export function loadEntries() {
  if (!hasStorageConsent()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.entries);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  if (!hasStorageConsent()) return false;
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
  return true;
}

export function clearStoredEntries() {
  if (!canUseLocalStorage()) return;
  localStorage.removeItem(STORAGE_KEYS.entries);
}

export function loadLanguage(defaultLanguage = "en") {
  if (!canUseLocalStorage()) return defaultLanguage;
  return localStorage.getItem(STORAGE_KEYS.language) || defaultLanguage;
}

export function saveLanguage(language) {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(STORAGE_KEYS.language, language);
}

export { STORAGE_KEYS };
