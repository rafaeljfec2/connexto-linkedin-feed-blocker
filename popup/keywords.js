import { SUGGESTIONS, EXPORT_KEYWORDS_FILENAME } from "./constants.js";
import {
  parseLines,
  showFeedback,
  reloadFeedIfActive,
  downloadBlob,
} from "./utils.js";

export function saveKeywords(elements) {
  const lines = parseLines(elements.keywordsEl?.value ?? "");
  chrome.storage.sync.set({ keywords: lines });
  showFeedback(elements.feedbackEl, "Salvo.");
  chrome.storage.sync.get(["settings"], (r) => {
    if (r.settings?.notifyOnSave && chrome.notifications) {
      chrome.notifications
        .create({
          type: "basic",
          title: "LinkedIn Feed Blocker",
          message: "Palavras salvas.",
        })
        .catch(() => {});
    }
  });
  reloadFeedIfActive();
}

export function exportKeywords(elements) {
  const lines = parseLines(elements.keywordsEl?.value ?? "");
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  downloadBlob(blob, EXPORT_KEYWORDS_FILENAME);
}

export function importAdd(elements, escapeHtml) {
  const toAdd = parseLines(elements.importKeywordsEl?.value ?? "");
  const current = parseLines(elements.keywordsEl?.value ?? "");
  const combined = [...new Set([...current, ...toAdd])];
  if (elements.keywordsEl) elements.keywordsEl.value = combined.join("\n");
  if (elements.importKeywordsEl) elements.importKeywordsEl.value = "";
  chrome.storage.sync.set({ keywords: combined });
  showFeedback(
    elements.feedbackParamsEl,
    `${toAdd.length} palavra(s) adicionada(s).`
  );
  reloadFeedIfActive();
}

export function addSuggestion(elements, word) {
  chrome.storage.sync.get(["keywords"], (result) => {
    const raw = result.keywords ?? [];
    const current = Array.isArray(raw) ? raw : [];
    if (current.includes(word)) return;
    const combined = [...current, word];
    chrome.storage.sync.set({ keywords: combined });
    if (elements.keywordsEl) {
      elements.keywordsEl.value = combined.join("\n");
    }
    reloadFeedIfActive();
  });
}

export function renderSuggestions(elements, escapeHtml) {
  const el = elements.suggestionsEl;
  if (!el) return;
  el.innerHTML = SUGGESTIONS.map(
    (w) =>
      `<button type="button" data-word="${escapeHtml(w)}">+ ${escapeHtml(
        w
      )}</button>`
  ).join("");
  el.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () =>
      addSuggestion(elements, btn.dataset.word ?? "")
    );
  });
}
