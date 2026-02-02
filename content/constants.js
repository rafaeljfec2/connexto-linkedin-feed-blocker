const BLOCKED_ATTR = "data-linkedin-feed-blocker";
const INSIGHT_ATTR = "data-linkedin-feed-blocker-insight";
const POST_SELECTOR = 'main div[data-urn^="urn:li:activity"]';
const DEBOUNCE_MS = 100;
const BLOCKED_LIST_MAX = 50;
const INSIGHTS_THROTTLE_MS = 1500;
const FEED_INSIGHTS_AUTHORS_MAX = 50;

const DEFAULT_SETTINGS = {
  paused: false,
  whitelistMode: false,
  useRegex: false,
  collapseInsteadOfHide: false,
  notificationOnly: false,
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
