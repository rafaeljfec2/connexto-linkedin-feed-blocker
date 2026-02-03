import { initElements, elements } from "./dom.js";
import { escapeHtml } from "./utils.js";
import { initTabs } from "./tabs.js";
import {
  saveKeywords,
  exportKeywords,
  importAdd,
  renderSuggestions,
} from "./keywords.js";
import {
  loadBlockedList,
  clearBlockedList,
  exportBlockedList,
  renderBlockedList,
} from "./blocked.js";
import {
  loadSettings,
  getSettingsFromUI,
  saveParams,
  loadStats,
  renderStats,
  exportConfig,
  importConfig,
  restoreDefaults,
  clearAllData,
  bindToggles,
} from "./params.js";
import { renderInsights } from "./insights.js";
import { renderDashboard } from "./dashboard.js";

initElements();

initTabs(elements);
loadSettings(elements);
loadBlockedList(elements);
loadStats(elements);
renderSuggestions(elements, escapeHtml);
bindToggles(elements);
renderInsights(elements);
renderDashboard(elements);

elements.blockedListFilterEl?.addEventListener("input", () =>
  loadBlockedList(elements)
);
elements.tabDashboard?.addEventListener("click", () =>
  renderDashboard(elements)
);
elements.tabInsights?.addEventListener("click", () => renderInsights(elements));

document.addEventListener("keydown", (e) => {
  if (
    e.ctrlKey &&
    e.key === "Enter" &&
    elements.panelKeywords?.classList.contains("active")
  ) {
    const settings = getSettingsFromUI(elements);
    if (settings.popupShortcutsEnabled) saveKeywords(elements);
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.blockedPosts) {
    const filterStr = elements.blockedListFilterEl?.value ?? "";
    const groupBy = elements.blockedGroupByEl?.value ?? "none";
    renderBlockedList(
      elements,
      changes.blockedPosts.newValue ?? [],
      filterStr,
      groupBy
    );
  }
  if (areaName === "local" && changes.statsByKeyword) {
    renderStats(elements, changes.statsByKeyword.newValue ?? {});
  }
  if (
    areaName === "local" &&
    (changes.sessionStats ?? changes.feedInsights ?? changes.countByKeywordDay)
  ) {
    renderInsights(elements);
    renderDashboard(elements);
  }
});

elements.saveBtn?.addEventListener("click", () => saveKeywords(elements));
elements.clearBlockedBtn?.addEventListener("click", () => {
  clearBlockedList(elements);
  loadStats(elements);
});
elements.exportBlockedBtn?.addEventListener("click", () =>
  exportBlockedList(elements)
);
elements.saveParamsBtn?.addEventListener("click", () => saveParams(elements));

let paramsDebounceTimer = null;
function scheduleParamsSave() {
  if (paramsDebounceTimer !== null) clearTimeout(paramsDebounceTimer);
  paramsDebounceTimer = setTimeout(() => {
    paramsDebounceTimer = null;
    saveParams(elements);
  }, 400);
}

elements.timeFilterStartEl?.addEventListener("change", () =>
  saveParams(elements)
);
elements.timeFilterEndEl?.addEventListener("change", () =>
  saveParams(elements)
);
elements.limitKeywordMaxEl?.addEventListener("change", () =>
  saveParams(elements)
);
elements.rulePriorityEl?.addEventListener("change", () => saveParams(elements));
elements.undoDurationEl?.addEventListener("change", () => saveParams(elements));
elements.blockedGroupByEl?.addEventListener("change", () => {
  saveParams(elements);
  loadBlockedList(elements);
});
elements.badgeWhenPausedEl?.addEventListener("change", () =>
  saveParams(elements)
);
elements.blockedAuthorsEl?.addEventListener("input", scheduleParamsSave);
elements.blockedAuthorsEl?.addEventListener("blur", () => {
  if (paramsDebounceTimer !== null) {
    clearTimeout(paramsDebounceTimer);
    paramsDebounceTimer = null;
    saveParams(elements);
  }
});
elements.exportKeywordsBtn?.addEventListener("click", () =>
  exportKeywords(elements)
);
elements.importAddBtn?.addEventListener("click", () => importAdd(elements));
elements.exportConfigBtn?.addEventListener("click", () =>
  exportConfig(elements)
);
elements.importConfigBtn?.addEventListener("click", () =>
  importConfig(elements, () => {
    loadSettings(elements);
    loadBlockedList(elements);
    loadStats(elements);
  })
);
elements.restoreDefaultsBtn?.addEventListener("click", () =>
  restoreDefaults(elements)
);
elements.clearAllDataBtn?.addEventListener("click", () =>
  clearAllData(elements)
);
