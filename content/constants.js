const BLOCKED_ATTR = "data-linkedin-feed-blocker";
const POST_SELECTOR = 'main div[data-urn^="urn:li:activity"]';
const DEBOUNCE_MS = 100;
const BLOCKED_LIST_MAX = 50;

const DEFAULT_SETTINGS = {
  paused: false,
  whitelistMode: false,
  useRegex: false,
  collapseInsteadOfHide: false,
  notificationOnly: false,
};
