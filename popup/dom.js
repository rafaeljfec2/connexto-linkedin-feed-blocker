const $ = (id) => document.getElementById(id);

export const elements = {
  keywordsEl: null,
  saveBtn: null,
  feedbackEl: null,
  tabKeywords: null,
  tabBlocked: null,
  tabParams: null,
  tabInsights: null,
  panelKeywords: null,
  panelBlocked: null,
  panelParams: null,
  panelInsights: null,
  blockedCountEl: null,
  blockedCountPanelEl: null,
  blockedListEl: null,
  blockedListFilterEl: null,
  blockedEmptyEl: null,
  clearBlockedBtn: null,
  exportBlockedBtn: null,
  togglePaused: null,
  toggleWhitelist: null,
  toggleRegex: null,
  toggleCollapse: null,
  toggleNotification: null,
  blockedAuthorsEl: null,
  exportKeywordsBtn: null,
  importKeywordsEl: null,
  importAddBtn: null,
  suggestionsEl: null,
  statsListEl: null,
  statsEmptyEl: null,
  saveParamsBtn: null,
  feedbackParamsEl: null,
  toggleTimeFilter: null,
  timeFilterStartEl: null,
  timeFilterEndEl: null,
  toggleLimitKeyword: null,
  limitKeywordMaxEl: null,
  rulePriorityEl: null,
  toggleFeedCounter: null,
  toggleUndo: null,
  undoDurationEl: null,
  toggleTooltip: null,
  blockedGroupByEl: null,
  toggleShortcuts: null,
  badgeWhenPausedEl: null,
  toggleNotifySave: null,
  toggleDontStore: null,
  exportConfigBtn: null,
  importConfigFileEl: null,
  importConfigBtn: null,
  restoreDefaultsBtn: null,
  clearAllDataBtn: null,
  insightsSessionEl: null,
  insightsBlockingEl: null,
  insightsCategoryEl: null,
  insightsAuthorsEl: null,
};

export function initElements() {
  elements.keywordsEl = $("keywords");
  elements.saveBtn = $("save");
  elements.feedbackEl = $("feedback");
  elements.tabKeywords = $("tab-keywords");
  elements.tabBlocked = $("tab-blocked");
  elements.tabParams = $("tab-params");
  elements.tabInsights = $("tab-insights");
  elements.panelKeywords = $("panel-keywords");
  elements.panelBlocked = $("panel-blocked");
  elements.panelParams = $("panel-params");
  elements.panelInsights = $("panel-insights");
  elements.blockedCountEl = $("blocked-count");
  elements.blockedCountPanelEl = $("blocked-count-panel");
  elements.blockedListEl = $("blocked-list");
  elements.blockedListFilterEl = $("blocked-list-filter");
  elements.blockedEmptyEl = $("blocked-empty");
  elements.clearBlockedBtn = $("clear-blocked");
  elements.exportBlockedBtn = $("export-blocked");
  elements.togglePaused = $("toggle-paused");
  elements.toggleWhitelist = $("toggle-whitelist");
  elements.toggleRegex = $("toggle-regex");
  elements.toggleCollapse = $("toggle-collapse");
  elements.toggleNotification = $("toggle-notification");
  elements.blockedAuthorsEl = $("blocked-authors");
  elements.exportKeywordsBtn = $("export-keywords");
  elements.importKeywordsEl = $("import-keywords");
  elements.importAddBtn = $("import-add");
  elements.suggestionsEl = $("suggestions");
  elements.statsListEl = $("stats-list");
  elements.statsEmptyEl = $("stats-empty");
  elements.saveParamsBtn = $("save-params");
  elements.feedbackParamsEl = $("feedback-params");
  elements.toggleTimeFilter = $("toggle-time-filter");
  elements.timeFilterStartEl = $("time-filter-start");
  elements.timeFilterEndEl = $("time-filter-end");
  elements.toggleLimitKeyword = $("toggle-limit-keyword");
  elements.limitKeywordMaxEl = $("limit-keyword-max");
  elements.rulePriorityEl = $("rule-priority");
  elements.toggleFeedCounter = $("toggle-feed-counter");
  elements.toggleUndo = $("toggle-undo");
  elements.undoDurationEl = $("undo-duration");
  elements.toggleTooltip = $("toggle-tooltip");
  elements.blockedGroupByEl = $("blocked-group-by");
  elements.toggleShortcuts = $("toggle-shortcuts");
  elements.badgeWhenPausedEl = $("badge-when-paused");
  elements.toggleNotifySave = $("toggle-notify-save");
  elements.toggleDontStore = $("toggle-dont-store");
  elements.exportConfigBtn = $("export-config");
  elements.importConfigFileEl = $("import-config-file");
  elements.importConfigBtn = $("import-config-btn");
  elements.restoreDefaultsBtn = $("restore-defaults");
  elements.clearAllDataBtn = $("clear-all-data");
  elements.insightsSessionEl = $("insights-session");
  elements.insightsBlockingEl = $("insights-blocking");
  elements.insightsCategoryEl = $("insights-category");
  elements.insightsAuthorsEl = $("insights-authors");
}
