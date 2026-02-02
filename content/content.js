const BLOCKED_ATTR = "data-linkedin-feed-blocker";
const POST_SELECTOR = 'main div[data-urn^="urn:li:activity"]';

let keywords = [];
let processDebounceTimer = null;
const DEBOUNCE_MS = 100;

function normalizeKeywords(raw) {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split("\n")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

function shouldBlock(text) {
  if (!keywords.length) return false;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function processPost(element) {
  if (element.getAttribute(BLOCKED_ATTR) !== null) return;
  element.setAttribute(BLOCKED_ATTR, "1");
  const text = element.textContent ?? "";
  if (!shouldBlock(text)) return;
  element.style.display = "none";
}

function collectPosts(root) {
  if (!root || !(root instanceof Element)) return [];
  if (root.matches?.(POST_SELECTOR)) return [root];
  return Array.from(root.querySelectorAll?.(POST_SELECTOR) ?? []);
}

function processNodes(nodes) {
  for (const node of nodes) {
    if (!(node instanceof Element)) continue;
    const posts = collectPosts(node);
    for (const post of posts) processPost(post);
  }
}

function runProcess() {
  processDebounceTimer = null;
  const feed = document.querySelector("main");
  if (!feed) return;
  const posts = feed.querySelectorAll(POST_SELECTOR);
  posts.forEach(processPost);
}

function scheduleProcess(mutations) {
  const added = [];
  for (const m of mutations) {
    if (m.addedNodes) {
      for (const n of m.addedNodes) added.push(n);
    }
  }
  if (added.length === 0) return;
  if (processDebounceTimer !== null) clearTimeout(processDebounceTimer);
  processDebounceTimer = setTimeout(() => {
    processNodes(added);
    runProcess();
  }, DEBOUNCE_MS);
}

function startObserver() {
  const feed = document.querySelector("main");
  if (!feed) {
    setTimeout(startObserver, 500);
    return;
  }
  runProcess();
  const observer = new MutationObserver(scheduleProcess);
  observer.observe(feed, { childList: true, subtree: true });
}

function loadKeywords() {
  chrome.storage.sync.get(["keywords"], (result) => {
    keywords = normalizeKeywords(result.keywords ?? []);
    startObserver();
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes.keywords) return;
  const newValue = changes.keywords.newValue;
  keywords = normalizeKeywords(newValue ?? []);
});

loadKeywords();
