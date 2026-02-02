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

initElements();

initTabs(elements);
loadSettings(elements);
loadBlockedList(elements);
loadStats(elements);
renderSuggestions(elements, escapeHtml);
bindToggles(elements);
renderInsights(elements);

elements.blockedListFilterEl?.addEventListener("input", () =>
  loadBlockedList(elements)
);
elements.blockedGroupByEl?.addEventListener("change", () =>
  loadBlockedList(elements)
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
