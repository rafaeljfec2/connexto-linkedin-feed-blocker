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

const keywordsEl = document.getElementById("keywords");
const saveBtn = document.getElementById("save");
const feedbackEl = document.getElementById("feedback");
const tabKeywords = document.getElementById("tab-keywords");
const tabBlocked = document.getElementById("tab-blocked");
const tabParams = document.getElementById("tab-params");
const panelKeywords = document.getElementById("panel-keywords");
const panelBlocked = document.getElementById("panel-blocked");
const panelParams = document.getElementById("panel-params");
const blockedCountEl = document.getElementById("blocked-count");
const blockedCountPanelEl = document.getElementById("blocked-count-panel");
const blockedListEl = document.getElementById("blocked-list");
const blockedEmptyEl = document.getElementById("blocked-empty");
const clearBlockedBtn = document.getElementById("clear-blocked");
const exportBlockedBtn = document.getElementById("export-blocked");
const togglePaused = document.getElementById("toggle-paused");
const toggleWhitelist = document.getElementById("toggle-whitelist");
const toggleRegex = document.getElementById("toggle-regex");
const toggleCollapse = document.getElementById("toggle-collapse");
const toggleNotification = document.getElementById("toggle-notification");
const blockedAuthorsEl = document.getElementById("blocked-authors");
const exportKeywordsBtn = document.getElementById("export-keywords");
const importKeywordsEl = document.getElementById("import-keywords");
const importAddBtn = document.getElementById("import-add");
const suggestionsEl = document.getElementById("suggestions");
const statsListEl = document.getElementById("stats-list");
const statsEmptyEl = document.getElementById("stats-empty");
const saveParamsBtn = document.getElementById("save-params");
const feedbackParamsEl = document.getElementById("feedback-params");

function showTab(panel) {
  const panels = [panelKeywords, panelBlocked, panelParams];
  const tabs = [tabKeywords, tabBlocked, tabParams];
  const idx = panels.indexOf(panel);
  panels.forEach((p, i) => {
    p.classList.toggle("active", i === idx);
  });
  tabs.forEach((t, i) => {
    t.classList.toggle("active", i === idx);
    t.setAttribute("aria-selected", String(i === idx));
  });
}

tabKeywords.addEventListener("click", () => showTab(panelKeywords));
tabBlocked.addEventListener("click", () => showTab(panelBlocked));
tabParams.addEventListener("click", () => showTab(panelParams));

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
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
      const display = snip.length > 60 ? snip.slice(0, 60) + "…" : snip;
      return `<li><span class="keyword">${escapeHtml(
        item.keyword ?? ""
      )}</span>${escapeHtml(display)}</li>`;
    })
    .join("");
}

function loadBlockedList() {
  chrome.storage.local.get(["blockedPosts"], (result) => {
    renderBlockedList(result.blockedPosts ?? []);
  });
}

function save() {
  const lines = keywordsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  chrome.storage.sync.set({ keywords: lines });
  feedbackEl.classList.add("visible");
  setTimeout(() => feedbackEl.classList.remove("visible"), 2000);
  reloadFeedIfActive();
}

function reloadFeedIfActive() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.includes("linkedin.com/feed")) {
      chrome.tabs.reload(tab.id);
    }
  });
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-feed-blocker-blocked.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function setToggle(btn, value) {
  btn.classList.toggle("on", Boolean(value));
  btn.setAttribute("aria-pressed", String(Boolean(value)));
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
  const authorsText = blockedAuthorsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    paused: togglePaused.classList.contains("on"),
    whitelistMode: toggleWhitelist.classList.contains("on"),
    useRegex: toggleRegex.classList.contains("on"),
    collapseInsteadOfHide: toggleCollapse.classList.contains("on"),
    notificationOnly: toggleNotification.classList.contains("on"),
    blockedAuthors: authorsText,
  };
}

togglePaused.addEventListener("click", () => {
  setToggle(togglePaused, !togglePaused.classList.contains("on"));
});
toggleWhitelist.addEventListener("click", () => {
  setToggle(toggleWhitelist, !toggleWhitelist.classList.contains("on"));
});
toggleRegex.addEventListener("click", () => {
  setToggle(toggleRegex, !toggleRegex.classList.contains("on"));
});
toggleCollapse.addEventListener("click", () => {
  setToggle(toggleCollapse, !toggleCollapse.classList.contains("on"));
});
toggleNotification.addEventListener("click", () => {
  setToggle(toggleNotification, !toggleNotification.classList.contains("on"));
});

function saveParams() {
  const settings = getSettingsFromUI();
  chrome.storage.sync.set({
    settings: {
      paused: settings.paused,
      whitelistMode: settings.whitelistMode,
      useRegex: settings.useRegex,
      collapseInsteadOfHide: settings.collapseInsteadOfHide,
      notificationOnly: settings.notificationOnly,
    },
    blockedAuthors: settings.blockedAuthors,
  });
  feedbackParamsEl.textContent = "Salvo.";
  feedbackParamsEl.classList.add("visible");
  setTimeout(() => {
    feedbackParamsEl.classList.remove("visible");
    feedbackParamsEl.textContent = "";
  }, 2000);
  reloadFeedIfActive();
}

function exportKeywords() {
  const lines = keywordsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "linkedin-feed-blocker-keywords.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function importAdd() {
  const toAdd = importKeywordsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const current = keywordsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const combined = [...new Set([...current, ...toAdd])];
  keywordsEl.value = combined.join("\n");
  importKeywordsEl.value = "";
  chrome.storage.sync.set({ keywords: combined });
  feedbackParamsEl.textContent = `${toAdd.length} palavra(s) adicionada(s).`;
  feedbackParamsEl.classList.add("visible");
  setTimeout(() => {
    feedbackParamsEl.classList.remove("visible");
    feedbackParamsEl.textContent = "";
  }, 2000);
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

loadSettings();
loadBlockedList();
loadStats();
renderSuggestions();

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
