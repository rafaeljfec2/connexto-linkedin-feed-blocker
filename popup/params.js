import { DEFAULTS, EXPORT_CONFIG_FILENAME } from "./constants.js";
import {
  parseLines,
  setToggle,
  showFeedback,
  reloadFeedIfActive,
  downloadBlob,
  escapeHtml,
} from "./utils.js";
import { renderBlockedList, loadBlockedList } from "./blocked.js";

const TOGGLE_IDS = [
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

export function loadSettings(elements) {
  chrome.storage.sync.get(
    ["keywords", "settings", "blockedAuthors"],
    (result) => {
      const raw = result.keywords ?? [];
      if (elements.keywordsEl) {
        elements.keywordsEl.value = Array.isArray(raw)
          ? raw.join("\n")
          : String(raw ?? "");
      }
      const stored = result.settings;
      const settings =
        stored && typeof stored === "object"
          ? { ...DEFAULTS, ...stored }
          : { ...DEFAULTS };
      setToggle(elements.togglePaused, settings.paused);
      setToggle(elements.toggleWhitelist, settings.whitelistMode);
      setToggle(elements.toggleRegex, settings.useRegex);
      setToggle(elements.toggleCollapse, settings.collapseInsteadOfHide);
      setToggle(elements.toggleNotification, settings.notificationOnly);
      setToggle(elements.toggleTimeFilter, settings.timeFilterEnabled);
      if (elements.timeFilterStartEl)
        elements.timeFilterStartEl.value = settings.timeFilterStart ?? "09:00";
      if (elements.timeFilterEndEl)
        elements.timeFilterEndEl.value = settings.timeFilterEnd ?? "18:00";
      setToggle(elements.toggleLimitKeyword, settings.limitPerKeywordEnabled);
      if (elements.limitKeywordMaxEl)
        elements.limitKeywordMaxEl.value = String(
          settings.limitPerKeywordMax ?? 10
        );
      if (elements.rulePriorityEl)
        elements.rulePriorityEl.value = settings.rulePriority ?? "keywordFirst";
      setToggle(elements.toggleFeedCounter, settings.showFeedCounter);
      setToggle(elements.toggleUndo, settings.undoEnabled);
      if (elements.undoDurationEl)
        elements.undoDurationEl.value = String(
          settings.undoDurationSeconds ?? 5
        );
      setToggle(elements.toggleTooltip, settings.tooltipOnBlocked);
      if (elements.blockedGroupByEl)
        elements.blockedGroupByEl.value = settings.blockedListGroupBy ?? "none";
      setToggle(elements.toggleShortcuts, settings.popupShortcutsEnabled);
      if (elements.badgeWhenPausedEl)
        elements.badgeWhenPausedEl.value = settings.badgeWhenPaused ?? "hide";
      setToggle(elements.toggleNotifySave, settings.notifyOnSave);
      setToggle(elements.toggleDontStore, settings.dontStoreSnippet);
      const authors = result.blockedAuthors ?? [];
      if (elements.blockedAuthorsEl) {
        elements.blockedAuthorsEl.value = Array.isArray(authors)
          ? authors.join("\n")
          : String(authors ?? "");
      }
    }
  );
}

export function getSettingsFromUI(elements) {
  return {
    paused: elements.togglePaused?.classList.contains("on") ?? false,
    whitelistMode: elements.toggleWhitelist?.classList.contains("on") ?? false,
    useRegex: elements.toggleRegex?.classList.contains("on") ?? false,
    collapseInsteadOfHide:
      elements.toggleCollapse?.classList.contains("on") ?? false,
    notificationOnly:
      elements.toggleNotification?.classList.contains("on") ?? false,
    blockedAuthors: parseLines(elements.blockedAuthorsEl?.value ?? ""),
    timeFilterEnabled:
      elements.toggleTimeFilter?.classList.contains("on") ?? false,
    timeFilterStart: elements.timeFilterStartEl?.value ?? "09:00",
    timeFilterEnd: elements.timeFilterEndEl?.value ?? "18:00",
    timeFilterBlockOutside: true,
    limitPerKeywordEnabled:
      elements.toggleLimitKeyword?.classList.contains("on") ?? false,
    limitPerKeywordMax: Math.max(
      1,
      Number.parseInt(elements.limitKeywordMaxEl?.value ?? "10", 10) || 10
    ),
    rulePriority: elements.rulePriorityEl?.value ?? "keywordFirst",
    showFeedCounter:
      elements.toggleFeedCounter?.classList.contains("on") ?? false,
    undoEnabled: elements.toggleUndo?.classList.contains("on") ?? false,
    undoDurationSeconds: Math.max(
      1,
      Math.min(
        60,
        Number.parseInt(elements.undoDurationEl?.value ?? "5", 10) || 5
      )
    ),
    tooltipOnBlocked: elements.toggleTooltip?.classList.contains("on") ?? false,
    blockedListGroupBy: elements.blockedGroupByEl?.value ?? "none",
    popupShortcutsEnabled:
      elements.toggleShortcuts?.classList.contains("on") ?? true,
    badgeWhenPaused: elements.badgeWhenPausedEl?.value ?? "hide",
    notifyOnSave: elements.toggleNotifySave?.classList.contains("on") ?? false,
    dontStoreSnippet:
      elements.toggleDontStore?.classList.contains("on") ?? false,
  };
}

export function saveParams(elements) {
  try {
    const ui = getSettingsFromUI(elements);
    const settingsPayload = {};
    Object.keys(DEFAULTS).forEach((k) => {
      if (k === "blockedAuthors") return;
      if (Object.hasOwn(ui, k)) settingsPayload[k] = ui[k];
    });
    chrome.storage.sync.set(
      {
        settings: settingsPayload,
        blockedAuthors: ui.blockedAuthors,
      },
      () => {
        const err = chrome.runtime.lastError;
        if (err) {
          showFeedback(
            elements.feedbackParamsEl,
            "Erro ao salvar: " + (err.message ?? "unknown")
          );
          return;
        }
        showFeedback(elements.feedbackParamsEl, "Salvo.");
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
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    showFeedback(elements.feedbackParamsEl, "Erro: " + msg);
  }
}

export function renderStats(elements, stats) {
  const entries = Object.entries(stats ?? {}).sort((a, b) => b[1] - a[1]);
  const { statsListEl, statsEmptyEl } = elements;
  if (entries.length === 0) {
    if (statsListEl) {
      statsListEl.innerHTML = "";
      statsListEl.style.display = "none";
    }
    if (statsEmptyEl) statsEmptyEl.style.display = "block";
    return;
  }
  if (statsEmptyEl) statsEmptyEl.style.display = "none";
  if (statsListEl) {
    statsListEl.style.display = "block";
    statsListEl.innerHTML = entries
      .map(
        ([kw, count]) =>
          `<li><span>${escapeHtml(kw)}</span><span>${Number(count)}</span></li>`
      )
      .join("");
  }
}

export function loadStats(elements) {
  chrome.storage.local.get(["statsByKeyword"], (result) => {
    renderStats(elements, result.statsByKeyword ?? {});
  });
}

export function exportConfig(elements) {
  Promise.all([
    new Promise((resolve) => chrome.storage.sync.get(null, resolve)),
    new Promise((resolve) =>
      chrome.storage.local.get(
        [
          "blockedPosts",
          "statsByKeyword",
          "countByKeywordDay",
          "sessionStats",
          "feedInsights",
        ],
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
    showFeedback(elements.feedbackParamsEl, "Configuração exportada.");
  });
}

export function importConfig(elements, onSuccess) {
  const file = elements.importConfigFileEl?.files?.[0];
  if (!file) {
    showFeedback(elements.feedbackParamsEl, "Selecione um arquivo.");
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
          sessionStats: local.sessionStats ?? {},
          feedInsights: local.feedInsights ?? { authors: {}, categories: {} },
        });
        onSuccess?.();
        if (elements.keywordsEl) {
          elements.keywordsEl.value = (sync.keywords ?? []).join("\n");
        }
        showFeedback(elements.feedbackParamsEl, "Configuração restaurada.");
        if (elements.importConfigFileEl) elements.importConfigFileEl.value = "";
        reloadFeedIfActive();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        showFeedback(elements.feedbackParamsEl, "Arquivo inválido. " + msg);
      }
    })
    .catch(() => {
      showFeedback(elements.feedbackParamsEl, "Erro ao ler arquivo.");
    });
}

export function restoreDefaults(elements) {
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
    loadSettings(elements);
    showFeedback(elements.feedbackParamsEl, "Parâmetros restaurados.");
    reloadFeedIfActive();
  });
}

export function clearAllData(elements) {
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
    sessionStats: {},
    feedInsights: { authors: {}, categories: {} },
  });
  loadSettings(elements);
  if (elements.keywordsEl) elements.keywordsEl.value = "";
  if (elements.blockedAuthorsEl) elements.blockedAuthorsEl.value = "";
  renderBlockedList(elements, [], "", "none");
  loadStats(elements);
  showFeedback(elements.feedbackParamsEl, "Todos os dados foram limpos.");
  reloadFeedIfActive();
}

export function bindToggles(elements) {
  TOGGLE_IDS.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        setToggle(btn, !btn.classList.contains("on"));
        saveParams(elements);
      });
    }
  });
}

let paramsDebounceTimer = null;
function scheduleParamsSave(elements) {
  if (paramsDebounceTimer !== null) clearTimeout(paramsDebounceTimer);
  paramsDebounceTimer = setTimeout(() => {
    paramsDebounceTimer = null;
    saveParams(elements);
  }, 400);
}

export function bindParamFields(elements) {
  elements.timeFilterStartEl?.addEventListener("change", () =>
    saveParams(elements)
  );
  elements.timeFilterEndEl?.addEventListener("change", () =>
    saveParams(elements)
  );
  elements.limitKeywordMaxEl?.addEventListener("change", () =>
    saveParams(elements)
  );
  elements.rulePriorityEl?.addEventListener("change", () =>
    saveParams(elements)
  );
  elements.undoDurationEl?.addEventListener("change", () =>
    saveParams(elements)
  );
  elements.blockedGroupByEl?.addEventListener("change", () => {
    saveParams(elements);
    loadBlockedList(elements);
  });
  elements.badgeWhenPausedEl?.addEventListener("change", () =>
    saveParams(elements)
  );
  elements.blockedAuthorsEl?.addEventListener("input", () =>
    scheduleParamsSave(elements)
  );
  elements.blockedAuthorsEl?.addEventListener("blur", () => {
    if (paramsDebounceTimer !== null) {
      clearTimeout(paramsDebounceTimer);
      paramsDebounceTimer = null;
      saveParams(elements);
    }
  });
}
