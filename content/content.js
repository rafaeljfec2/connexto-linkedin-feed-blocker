let keywords = [];
let blockedAuthors = [];
let settings = { ...DEFAULT_SETTINGS };
let processDebounceTimer = null;

function normalizeList(raw) {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeKeywords(raw) {
  const list = normalizeList(raw);
  return settings.useRegex ? list : list.map((s) => s.toLowerCase());
}

function matchKeyword(text, kw) {
  if (settings.useRegex) {
    try {
      return new RegExp(kw, "i").test(text);
    } catch {
      return text.toLowerCase().includes(kw.toLowerCase());
    }
  }
  return text.toLowerCase().includes(kw);
}

function getMatchingKeyword(text) {
  if (!keywords.length) return null;
  const found = keywords.find((kw) => matchKeyword(text, kw));
  return found ?? null;
}

function getMatchingAuthor(text) {
  if (!blockedAuthors.length) return null;
  const lower = text.toLowerCase();
  return blockedAuthors.find((a) => lower.includes(a.toLowerCase())) ?? null;
}

function shouldBlockByKeyword(text) {
  const match = getMatchingKeyword(text);
  return settings.whitelistMode ? match === null : match !== null;
}

function shouldBlockByAuthor(text) {
  return getMatchingAuthor(text) !== null;
}

function shouldBlock(text) {
  if (settings.whitelistMode) {
    const keywordMatch = getMatchingKeyword(text) !== null;
    const authorMatch = shouldBlockByAuthor(text);
    return !keywordMatch || authorMatch;
  }
  return shouldBlockByKeyword(text) || shouldBlockByAuthor(text);
}

function getBlockReason(text) {
  const kw = getMatchingKeyword(text);
  if (kw !== null && !settings.whitelistMode) {
    return { type: "keyword", value: kw };
  }
  const author = getMatchingAuthor(text);
  if (author !== null) {
    return { type: "author", value: author };
  }
  if (settings.whitelistMode && getMatchingKeyword(text) === null) {
    return { type: "whitelist", value: "" };
  }
  return null;
}

function appendBlockedPost(snippet, keyword) {
  chrome.storage.local.get(["blockedPosts", "statsByKeyword"], (result) => {
    const list = Array.isArray(result.blockedPosts) ? result.blockedPosts : [];
    list.unshift({ snippet, keyword, at: Date.now() });
    const prev = result.statsByKeyword ?? null;
    const stats =
      prev && typeof prev === "object" && !Array.isArray(prev)
        ? { ...prev }
        : {};
    stats[keyword] = (stats[keyword] ?? 0) + 1;
    chrome.storage.local.set({
      blockedPosts: list.slice(0, BLOCKED_LIST_MAX),
      statsByKeyword: stats,
    });
  });
}

function collapsePost(element, reason) {
  if (element.querySelector(".linkedin-feed-blocker-bar")) return;
  const bar = document.createElement("div");
  bar.className = "linkedin-feed-blocker-bar";
  bar.style.cssText =
    "padding:12px;background:#24282e;color:#9aa0a6;font-size:13px;border-radius:8px;margin-bottom:8px;";
  bar.textContent = reason ? `Post ocultado por: ${reason}` : "Post ocultado";
  const btn = document.createElement("button");
  btn.textContent = "Expandir";
  btn.style.cssText =
    "margin-left:12px;padding:4px 10px;cursor:pointer;background:#0a66c2;color:#fff;border:none;border-radius:6px;font-size:12px;";
  const wrapper = document.createElement("div");
  wrapper.style.display = "none";
  while (element.firstChild) {
    wrapper.appendChild(element.firstChild);
  }
  btn.addEventListener("click", () => {
    bar.remove();
    wrapper.style.display = "";
  });
  bar.appendChild(btn);
  element.appendChild(bar);
  element.appendChild(wrapper);
}

function processPost(element) {
  if (element.getAttribute(BLOCKED_ATTR) !== null) return;
  const text = element.textContent ?? "";
  const reason = getBlockReason(text);
  if (reason === null) return;
  element.setAttribute(BLOCKED_ATTR, "1");
  let keywordLabel = "lista branca";
  if (reason.type === "keyword") keywordLabel = reason.value;
  else if (reason.type === "author") keywordLabel = `autor: ${reason.value}`;
  const snippet = text.trim().slice(0, 80).replaceAll(/\s+/g, " ");
  appendBlockedPost(snippet, keywordLabel);

  if (settings.notificationOnly) {
    element.style.borderLeft = "4px solid #f59e0b";
    element.style.opacity = "0.85";
    return;
  }
  if (settings.collapseInsteadOfHide) {
    collapsePost(element, keywordLabel);
    return;
  }
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
    for (const post of collectPosts(node)) processPost(post);
  }
}

function runProcess() {
  processDebounceTimer = null;
  if (settings.paused) return;
  const feed = document.querySelector("main");
  if (!feed) return;
  feed.querySelectorAll(POST_SELECTOR).forEach(processPost);
}

function scheduleProcess(mutations) {
  if (settings.paused) return;
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

function loadConfig() {
  chrome.storage.sync.get(
    ["keywords", "settings", "blockedAuthors"],
    (result) => {
      const nextSettings = result.settings ?? null;
      settings =
        nextSettings && typeof nextSettings === "object"
          ? { ...settings, ...nextSettings }
          : settings;
      keywords = normalizeKeywords(result.keywords ?? []);
      blockedAuthors = normalizeList(result.blockedAuthors ?? []);
      startObserver();
    }
  );
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;
  const newSettings = changes.settings?.newValue ?? null;
  if (newSettings && typeof newSettings === "object") {
    settings = { ...settings, ...newSettings };
  }
  if (changes.keywords) {
    keywords = normalizeKeywords(changes.keywords.newValue ?? []);
  }
  if (changes.blockedAuthors) {
    blockedAuthors = normalizeList(changes.blockedAuthors.newValue ?? []);
  }
});

loadConfig();
