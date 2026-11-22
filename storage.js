
const FILTER_KEY = "monDexFilter";
const DRAFT_KEY = "monDexDraft";

// LocalStorage
export function saveFilter(type) {
    localStorage.setItem(FILTER_KEY, type);
}

export function getFilter() {
    return localStorage.getItem(FILTER_KEY) || "Tous";
}

// SessionStorage
export function saveDraft(data) {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function getDraft() {
    const draft = sessionStorage.getItem(DRAFT_KEY);

    return draft ? JSON.parse(draft) : null;
}

export function clearDraft() {
    sessionStorage.removeItem(DRAFT_KEY);
}
