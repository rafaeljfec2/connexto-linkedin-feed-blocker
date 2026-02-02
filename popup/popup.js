const DEFAULTS = {
  paused: false,
  whitelistMode: false,
  useRegex: false,
  collapseInsteadOfHide: false,
  notificationOnly: false,
  blockedAuthors: [],
  timeFilterEnabled: false,
  timeFilterStart: "09:00",
  timeFilterEnd: "18:00",
  timeFilterBlockOutside: true,
  limitPerKeywordEnabled: false,
  limitPerKeywordMax: 10,
  rulePriority: "keywordFirst",
  showFeedCounter: false,
  undoEnabled: false,
  undoDurationSeconds: 5,
  tooltipOnBlocked: false,
  blockedListGroupBy: "none",
  popupShortcutsEnabled: true,
  badgeWhenPaused: "hide",
  notifyOnSave: false,
  dontStoreSnippet: false,
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
const EXPORT_CONFIG_FILENAME = "linkedin-feed-blocker-config.json";

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
const blockedListFilterEl = $("blocked-list-filter");
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
const toggleTimeFilter = $("toggle-time-filter");
const timeFilterStartEl = $("time-filter-start");
const timeFilterEndEl = $("time-filter-end");
const toggleLimitKeyword = $("toggle-limit-keyword");
const limitKeywordMaxEl = $("limit-keyword-max");
const rulePriorityEl = $("rule-priority");
const toggleFeedCounter = $("toggle-feed-counter");
const toggleUndo = $("toggle-undo");
const undoDurationEl = $("undo-duration");
const toggleTooltip = $("toggle-tooltip");
const blockedGroupByEl = $("blocked-group-by");
const toggleShortcuts = $("toggle-shortcuts");
const badgeWhenPausedEl = $("badge-when-paused");
const toggleNotifySave = $("toggle-notify-save");
const toggleDontStore = $("toggle-dont-store");
const exportConfigBtn = $("export-config");
const importConfigFileEl = $("import-config-file");
const importConfigBtn = $("import-config-btn");
const restoreDefaultsBtn = $("restore-defaults");
const clearAllDataBtn = $("clear-all-data");

let lastBlockedListRaw = [];

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
  if (!btn) return;
  btn.classList.toggle("on", Boolean(value));
  btn.setAttribute("aria-pressed", String(Boolean(value)));
}

function applyFilterAndGroup(list, filterStr, groupBy) {
  let items = Array.isArray(list) ? list : [];
  const q = (filterStr ?? "").trim().toLowerCase();
  if (q) {
    items = items.filter(
      (item) =>
        (item.keyword ?? "").toLowerCase().includes(q) ||
        (item.snippet ?? "").toLowerCase().includes(q)
    );
  }
  if (groupBy === "keyword") {
    const byKw = {};
    for (const item of items) {
      const k = item.keyword ?? "";
      if (!byKw[k]) byKw[k] = [];
      byKw[k].push(item);
    }
    return byKw;
  }
  return items;
}

function renderBlockedList(list, filterStr, groupBy) {
  lastBlockedListRaw = Array.isArray(list) ? list : [];
  const filtered = applyFilterAndGroup(lastBlockedListRaw, filterStr, groupBy);
  blockedCountEl.textContent = String(lastBlockedListRaw.length);
  blockedCountPanelEl.textContent = String(lastBlockedListRaw.length);

  if (lastBlockedListRaw.length === 0) {
    blockedEmptyEl.style.display = "block";
    blockedListEl.style.display = "none";
    blockedListEl.innerHTML = "";
    return;
  }
  blockedEmptyEl.style.display = "none";
  blockedListEl.style.display = "block";

  if (
    groupBy === "keyword" &&
    typeof filtered === "object" &&
    !Array.isArray(filtered)
  ) {
    const entries = Object.entries(filtered);
    blockedListEl.innerHTML = entries
      .map(([kw, groupItems]) => {
        const lis = (groupItems ?? [])
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
        return `<li class="blocked-group"><span class="keyword">${escapeHtml(
          kw
        )}</span> (${groupItems.length})<ul>${lis}</ul></li>`;
      })
      .join("");
    return;
  }

  const items = Array.isArray(filtered) ? filtered : [];
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
    const list = result.blockedPosts ?? [];
    const filterStr = blockedListFilterEl?.value ?? "";
    const groupBy = blockedGroupByEl?.value ?? "none";
    renderBlockedList(list, filterStr, groupBy);
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
      setToggle(toggleTimeFilter, settings.timeFilterEnabled);
      if (timeFilterStartEl)
        timeFilterStartEl.value = settings.timeFilterStart ?? "09:00";
      if (timeFilterEndEl)
        timeFilterEndEl.value = settings.timeFilterEnd ?? "18:00";
      setToggle(toggleLimitKeyword, settings.limitPerKeywordEnabled);
      if (limitKeywordMaxEl)
        limitKeywordMaxEl.value = String(settings.limitPerKeywordMax ?? 10);
      if (rulePriorityEl)
        rulePriorityEl.value = settings.rulePriority ?? "keywordFirst";
      setToggle(toggleFeedCounter, settings.showFeedCounter);
      setToggle(toggleUndo, settings.undoEnabled);
      if (undoDurationEl)
        undoDurationEl.value = String(settings.undoDurationSeconds ?? 5);
      setToggle(toggleTooltip, settings.tooltipOnBlocked);
      if (blockedGroupByEl)
        blockedGroupByEl.value = settings.blockedListGroupBy ?? "none";
      setToggle(toggleShortcuts, settings.popupShortcutsEnabled);
      if (badgeWhenPausedEl)
        badgeWhenPausedEl.value = settings.badgeWhenPaused ?? "hide";
      setToggle(toggleNotifySave, settings.notifyOnSave);
      setToggle(toggleDontStore, settings.dontStoreSnippet);
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
    timeFilterEnabled: toggleTimeFilter?.classList.contains("on") ?? false,
    timeFilterStart: timeFilterStartEl?.value ?? "09:00",
    timeFilterEnd: timeFilterEndEl?.value ?? "18:00",
    timeFilterBlockOutside: true,
    limitPerKeywordEnabled:
      toggleLimitKeyword?.classList.contains("on") ?? false,
    limitPerKeywordMax: Math.max(
      1,
      Number.parseInt(limitKeywordMaxEl?.value ?? "10", 10) || 10
    ),
    rulePriority: rulePriorityEl?.value ?? "keywordFirst",
    showFeedCounter: toggleFeedCounter?.classList.contains("on") ?? false,
    undoEnabled: toggleUndo?.classList.contains("on") ?? false,
    undoDurationSeconds: Math.max(
      1,
      Math.min(60, Number.parseInt(undoDurationEl?.value ?? "5", 10) || 5)
    ),
    tooltipOnBlocked: toggleTooltip?.classList.contains("on") ?? false,
    blockedListGroupBy: blockedGroupByEl?.value ?? "none",
    popupShortcutsEnabled: toggleShortcuts?.classList.contains("on") ?? true,
    badgeWhenPaused: badgeWhenPausedEl?.value ?? "hide",
    notifyOnSave: toggleNotifySave?.classList.contains("on") ?? false,
    dontStoreSnippet: toggleDontStore?.classList.contains("on") ?? false,
  };
}

function save() {
  const lines = parseLines(keywordsEl.value);
  chrome.storage.sync.set({ keywords: lines });
  showFeedback(feedbackEl, "Salvo.");
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

function clearBlockedList() {
  chrome.storage.local.set({
    blockedPosts: [],
    statsByKeyword: {},
    countByKeywordDay: {},
  });
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
  const settingsPayload = {};
  Object.keys(DEFAULTS).forEach((k) => {
    if (k === "blockedAuthors") return;
    if (Object.hasOwn(ui, k)) settingsPayload[k] = ui[k];
  });
  chrome.storage.sync.set({
    settings: settingsPayload,
    blockedAuthors: ui.blockedAuthors,
  });
  showFeedback(feedbackParamsEl, "Salvo.");
  if (ui.notifyOnSave && chrome.notifications) {
    chrome.notifications
      .create({
        type: "basic",
        title: "LinkedIn Feed Blocker",
        message: "Parâmetros salvos.",
      })
      .catch(() => {});
  }
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
    btn.addEventListener("click", () => addSuggestion(btn.dataset.word ?? ""));
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

function exportConfig() {
  Promise.all([
    new Promise((resolve) => chrome.storage.sync.get(null, resolve)),
    new Promise((resolve) =>
      chrome.storage.local.get(
        ["blockedPosts", "statsByKeyword", "countByKeywordDay"],
        resolve
      )
    ),
  ]).then(([syncData, localData]) => {
    const config = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sync: syncData,
      local: localData,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, EXPORT_CONFIG_FILENAME);
    showFeedback(feedbackParamsEl, "Configuração exportada.");
  });
}

function importConfig() {
  const file = importConfigFileEl?.files?.[0];
  if (!file) {
    showFeedback(feedbackParamsEl, "Selecione um arquivo.");
    return;
  }
  file
    .text()
    .then((text) => {
      try {
        const config = JSON.parse(text);
        const sync = config.sync ?? {};
        const local = config.local ?? {};
        chrome.storage.sync.set({
          keywords: sync.keywords ?? [],
          settings: sync.settings ?? {},
          blockedAuthors: sync.blockedAuthors ?? [],
        });
        chrome.storage.local.set({
          blockedPosts: local.blockedPosts ?? [],
          statsByKeyword: local.statsByKeyword ?? {},
          countByKeywordDay: local.countByKeywordDay ?? {},
        });
        loadSettings();
        loadBlockedList();
        loadStats();
        keywordsEl.value = (sync.keywords ?? []).join("\n");
        showFeedback(feedbackParamsEl, "Configuração restaurada.");
        importConfigFileEl.value = "";
        reloadFeedIfActive();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        showFeedback(feedbackParamsEl, "Arquivo inválido. " + msg);
      }
    })
    .catch((err) => {
      showFeedback(feedbackParamsEl, "Erro ao ler arquivo.");
    });
}

function restoreDefaults() {
  const settingsPayload = {};
  Object.keys(DEFAULTS).forEach((k) => {
    if (k === "blockedAuthors") return;
    settingsPayload[k] = DEFAULTS[k];
  });
  chrome.storage.sync.get(["keywords", "blockedAuthors"], (result) => {
    chrome.storage.sync.set({
      keywords: result.keywords ?? [],
      settings: settingsPayload,
      blockedAuthors: result.blockedAuthors ?? [],
    });
    loadSettings();
    showFeedback(feedbackParamsEl, "Parâmetros restaurados.");
    reloadFeedIfActive();
  });
}

function clearAllData() {
  if (
    !confirm(
      "Limpar TODOS os dados (palavras, autores, parâmetros, lista bloqueados e estatísticas)?"
    )
  )
    return;
  const settingsPayload = {};
  Object.keys(DEFAULTS).forEach((k) => {
    if (k === "blockedAuthors") return;
    settingsPayload[k] = DEFAULTS[k];
  });
  chrome.storage.sync.set({
    keywords: [],
    settings: settingsPayload,
    blockedAuthors: [],
  });
  chrome.storage.local.set({
    blockedPosts: [],
    statsByKeyword: {},
    countByKeywordDay: {},
  });
  loadSettings();
  keywordsEl.value = "";
  blockedAuthorsEl.value = "";
  renderBlockedList([]);
  loadStats();
  showFeedback(feedbackParamsEl, "Todos os dados foram limpos.");
  reloadFeedIfActive();
}

function bindToggles() {
  const toggleIds = [
    "toggle-paused",
    "toggle-whitelist",
    "toggle-regex",
    "toggle-collapse",
    "toggle-notification",
    "toggle-time-filter",
    "toggle-limit-keyword",
    "toggle-feed-counter",
    "toggle-undo",
    "toggle-tooltip",
    "toggle-shortcuts",
    "toggle-notify-save",
    "toggle-dont-store",
  ];
  toggleIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () =>
        setToggle(btn, !btn.classList.contains("on"))
      );
    }
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

if (blockedListFilterEl) {
  blockedListFilterEl.addEventListener("input", () => loadBlockedList());
}
if (blockedGroupByEl) {
  blockedGroupByEl.addEventListener("change", () => loadBlockedList());
}

document.addEventListener("keydown", (e) => {
  if (
    e.ctrlKey &&
    e.key === "Enter" &&
    panelKeywords?.classList.contains("active")
  ) {
    const settings = getSettingsFromUI();
    if (settings.popupShortcutsEnabled) save();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.blockedPosts) {
    const filterStr = blockedListFilterEl?.value ?? "";
    const groupBy = blockedGroupByEl?.value ?? "none";
    renderBlockedList(changes.blockedPosts.newValue ?? [], filterStr, groupBy);
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
if (exportConfigBtn) exportConfigBtn.addEventListener("click", exportConfig);
if (importConfigBtn) importConfigBtn.addEventListener("click", importConfig);
if (restoreDefaultsBtn)
  restoreDefaultsBtn.addEventListener("click", restoreDefaults);
if (clearAllDataBtn) clearAllDataBtn.addEventListener("click", clearAllData);
