const DEFAULTS = {
  paused: false,
  whitelistMode: false,
  useRegex: false,
  collapseInsteadOfHide: false,
  notificationOnly: false,
  blockedAuthors: [],
};

const SUGGESTIONS = [
  "vagas",
  "recrutamento",
  "promoção",
  "oportunidade",
  "currículo",
  "linkedin premium",
  "parabéns",
  "aniversário",
];

const FEEDBACK_DURATION_MS = 2000;
const SNIPPET_MAX_LENGTH = 60;
const EXPORT_KEYWORDS_FILENAME = "linkedin-feed-blocker-keywords.txt";
const EXPORT_BLOCKED_FILENAME = "linkedin-feed-blocker-blocked.json";

const $ = (id) => document.getElementById(id);

const keywordsEl = $("keywords");
const saveBtn = $("save");
const feedbackEl = $("feedback");
const tabKeywords = $("tab-keywords");
const tabBlocked = $("tab-blocked");
const tabParams = $("tab-params");
const panelKeywords = $("panel-keywords");
const panelBlocked = $("panel-blocked");
const panelParams = $("panel-params");
const blockedCountEl = $("blocked-count");
const blockedCountPanelEl = $("blocked-count-panel");
const blockedListEl = $("blocked-list");
const blockedEmptyEl = $("blocked-empty");
const clearBlockedBtn = $("clear-blocked");
const exportBlockedBtn = $("export-blocked");
const togglePaused = $("toggle-paused");
const toggleWhitelist = $("toggle-whitelist");
const toggleRegex = $("toggle-regex");
const toggleCollapse = $("toggle-collapse");
const toggleNotification = $("toggle-notification");
const blockedAuthorsEl = $("blocked-authors");
const exportKeywordsBtn = $("export-keywords");
const importKeywordsEl = $("import-keywords");
const importAddBtn = $("import-add");
const suggestionsEl = $("suggestions");
const statsListEl = $("stats-list");
const statsEmptyEl = $("stats-empty");
const saveParamsBtn = $("save-params");
const feedbackParamsEl = $("feedback-params");

function parseLines(value) {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function showFeedback(el, text, duration = FEEDBACK_DURATION_MS) {
  el.textContent = text;
  el.classList.add("visible");
  setTimeout(() => {
    el.classList.remove("visible");
    el.textContent = "";
  }, duration);
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function reloadFeedIfActive() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.includes("linkedin.com/feed")) {
      chrome.tabs.reload(tab.id);
    }
  });
}

function showTab(panel) {
  const panels = [panelKeywords, panelBlocked, panelParams];
  const tabs = [tabKeywords, tabBlocked, tabParams];
  const idx = panels.indexOf(panel);
  panels.forEach((p, i) => p.classList.toggle("active", i === idx));
  tabs.forEach((t, i) => {
    t.classList.toggle("active", i === idx);
    t.setAttribute("aria-selected", String(i === idx));
  });
}

function setToggle(btn, value) {
  btn.classList.toggle("on", Boolean(value));
  btn.setAttribute("aria-pressed", String(Boolean(value)));
}

function renderBlockedList(list) {
  const items = Array.isArray(list) ? list : [];
  blockedCountEl.textContent = String(items.length);
  blockedCountPanelEl.textContent = String(items.length);
  blockedEmptyEl.style.display = items.length === 0 ? "block" : "none";
  blockedListEl.style.display = items.length === 0 ? "none" : "block";
  blockedListEl.innerHTML = items
    .map((item) => {
      const snip = item.snippet ?? "";
      const display =
        snip.length > SNIPPET_MAX_LENGTH
          ? snip.slice(0, SNIPPET_MAX_LENGTH) + "…"
          : snip;
      return `<li><span class="keyword">${escapeHtml(
        item.keyword ?? ""
      )}</span>${escapeHtml(display)}</li>`;
    })
    .join("");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function loadBlockedList() {
  chrome.storage.local.get(["blockedPosts"], (result) => {
    renderBlockedList(result.blockedPosts ?? []);
  });
}

function loadSettings() {
  chrome.storage.sync.get(
    ["keywords", "settings", "blockedAuthors"],
    (result) => {
      const raw = result.keywords ?? [];
      keywordsEl.value = Array.isArray(raw)
        ? raw.join("\n")
        : String(raw ?? "");
      const stored = result.settings;
      const settings =
        stored && typeof stored === "object"
          ? { ...DEFAULTS, ...stored }
          : { ...DEFAULTS };
      setToggle(togglePaused, settings.paused);
      setToggle(toggleWhitelist, settings.whitelistMode);
      setToggle(toggleRegex, settings.useRegex);
      setToggle(toggleCollapse, settings.collapseInsteadOfHide);
      setToggle(toggleNotification, settings.notificationOnly);
      const authors = result.blockedAuthors ?? [];
      blockedAuthorsEl.value = Array.isArray(authors)
        ? authors.join("\n")
        : String(authors ?? "");
    }
  );
}

function getSettingsFromUI() {
  return {
    paused: togglePaused.classList.contains("on"),
    whitelistMode: toggleWhitelist.classList.contains("on"),
    useRegex: toggleRegex.classList.contains("on"),
    collapseInsteadOfHide: toggleCollapse.classList.contains("on"),
    notificationOnly: toggleNotification.classList.contains("on"),
    blockedAuthors: parseLines(blockedAuthorsEl.value),
  };
}

function save() {
  const lines = parseLines(keywordsEl.value);
  chrome.storage.sync.set({ keywords: lines });
  showFeedback(feedbackEl, "Salvo.");
  reloadFeedIfActive();
}

function clearBlockedList() {
  chrome.storage.local.set({ blockedPosts: [], statsByKeyword: {} });
  renderBlockedList([]);
  loadStats();
}

function exportBlockedList() {
  chrome.storage.local.get(["blockedPosts"], (result) => {
    const list = result.blockedPosts ?? [];
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, EXPORT_BLOCKED_FILENAME);
  });
}

function saveParams() {
  const ui = getSettingsFromUI();
  chrome.storage.sync.set({
    settings: {
      paused: ui.paused,
      whitelistMode: ui.whitelistMode,
      useRegex: ui.useRegex,
      collapseInsteadOfHide: ui.collapseInsteadOfHide,
      notificationOnly: ui.notificationOnly,
    },
    blockedAuthors: ui.blockedAuthors,
  });
  showFeedback(feedbackParamsEl, "Salvo.");
  reloadFeedIfActive();
}

function exportKeywords() {
  const lines = parseLines(keywordsEl.value);
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  downloadBlob(blob, EXPORT_KEYWORDS_FILENAME);
}

function importAdd() {
  const toAdd = parseLines(importKeywordsEl.value);
  const current = parseLines(keywordsEl.value);
  const combined = [...new Set([...current, ...toAdd])];
  keywordsEl.value = combined.join("\n");
  importKeywordsEl.value = "";
  chrome.storage.sync.set({ keywords: combined });
  showFeedback(feedbackParamsEl, `${toAdd.length} palavra(s) adicionada(s).`);
  reloadFeedIfActive();
}

function addSuggestion(word) {
  chrome.storage.sync.get(["keywords"], (result) => {
    const raw = result.keywords ?? [];
    const current = Array.isArray(raw) ? raw : [];
    if (current.includes(word)) return;
    const combined = [...current, word];
    chrome.storage.sync.set({ keywords: combined });
    keywordsEl.value = combined.join("\n");
    reloadFeedIfActive();
  });
}

function renderSuggestions() {
  suggestionsEl.innerHTML = SUGGESTIONS.map(
    (w) =>
      `<button type="button" data-word="${escapeHtml(w)}">+ ${escapeHtml(
        w
      )}</button>`
  ).join("");
  suggestionsEl.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      addSuggestion(btn.dataset.word ?? "");
    });
  });
}

function renderStats(stats) {
  const entries = Object.entries(stats ?? {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    statsListEl.innerHTML = "";
    statsListEl.style.display = "none";
    statsEmptyEl.style.display = "block";
    return;
  }
  statsEmptyEl.style.display = "none";
  statsListEl.style.display = "block";
  statsListEl.innerHTML = entries
    .map(
      ([kw, count]) =>
        `<li><span>${escapeHtml(kw)}</span><span>${Number(count)}</span></li>`
    )
    .join("");
}

function loadStats() {
  chrome.storage.local.get(["statsByKeyword"], (result) => {
    renderStats(result.statsByKeyword ?? {});
  });
}

function bindToggles() {
  const toggles = [
    [togglePaused, "on"],
    [toggleWhitelist, "on"],
    [toggleRegex, "on"],
    [toggleCollapse, "on"],
    [toggleNotification, "on"],
  ];
  toggles.forEach(([btn]) => {
    btn.addEventListener("click", () => {
      setToggle(btn, !btn.classList.contains("on"));
    });
  });
}

tabKeywords.addEventListener("click", () => showTab(panelKeywords));
tabBlocked.addEventListener("click", () => showTab(panelBlocked));
tabParams.addEventListener("click", () => showTab(panelParams));

loadSettings();
loadBlockedList();
loadStats();
renderSuggestions();
bindToggles();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.blockedPosts) {
    renderBlockedList(changes.blockedPosts.newValue ?? []);
  }
  if (areaName === "local" && changes.statsByKeyword) {
    renderStats(changes.statsByKeyword.newValue ?? {});
  }
});

saveBtn.addEventListener("click", save);
clearBlockedBtn.addEventListener("click", clearBlockedList);
exportBlockedBtn.addEventListener("click", exportBlockedList);
saveParamsBtn.addEventListener("click", saveParams);
exportKeywordsBtn.addEventListener("click", exportKeywords);
importAddBtn.addEventListener("click", importAdd);
