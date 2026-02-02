export const DEFAULTS = {
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

export const SUGGESTIONS = [
  "vagas",
  "recrutamento",
  "promoção",
  "oportunidade",
  "currículo",
  "linkedin premium",
  "parabéns",
  "aniversário",
];

export const FEEDBACK_DURATION_MS = 2000;
export const SNIPPET_MAX_LENGTH = 60;
export const EXPORT_KEYWORDS_FILENAME = "linkedin-feed-blocker-keywords.txt";
export const EXPORT_BLOCKED_FILENAME = "linkedin-feed-blocker-blocked.json";
export const EXPORT_CONFIG_FILENAME = "linkedin-feed-blocker-config.json";
