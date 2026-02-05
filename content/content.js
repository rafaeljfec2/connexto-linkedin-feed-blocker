let keywords = [];
let blockedAuthors = [];
let settings = { ...DEFAULT_SETTINGS };
let processDebounceTimer = null;
let processRerunTimer = null;
let feedCounterEl = null;
let insightPending = {
  authors: {},
  categories: {},
  postsSeen: 0,
  postsBlocked: 0,
};
let insightFlushTimer = null;

function isExtensionContextValid() {
  try {
    return Boolean(chrome?.runtime?.id);
  } catch {
    return false;
  }
}

function isContextInvalidatedError(e) {
  try {
    const msg = String(e?.message ?? "");
    return msg.includes("invalidated");
  } catch {
    return true;
  }
}

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
  const author = getMatchingAuthor(text);
  const hasKw = kw !== null && !settings.whitelistMode;
  const hasAuthor = author !== null;
  if (settings.rulePriority === "authorFirst" && hasAuthor) {
    return { type: "author", value: author };
  }
  if (hasKw) {
    return { type: "keyword", value: kw };
  }
  if (hasAuthor) {
    return { type: "author", value: author };
  }
  if (settings.whitelistMode && getMatchingKeyword(text) === null) {
    return { type: "whitelist", value: "" };
  }
  return null;
}

function isInsideBlockWindow() {
  if (!settings.timeFilterEnabled) return false;
  const now = new Date();
  const [sh, sm] = (settings.timeFilterStart ?? "09:00").split(":").map(Number);
  const [eh, em] = (settings.timeFilterEnd ?? "18:00").split(":").map(Number);
  const min = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const inside =
    startMin <= endMin
      ? min >= startMin && min <= endMin
      : min >= startMin || min <= endMin;
  return settings.timeFilterBlockOutside ? !inside : inside;
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function getAuthorFromPost(element) {
  if (!element?.querySelector)
    return chrome.i18n.getMessage("contentUnknownAuthor") ?? "Desconhecido";
  const link = element.querySelector('a[href*="/in/"]');
  const name = link?.textContent?.trim().slice(0, 80) ?? "";
  return (
    name || (chrome.i18n.getMessage("contentUnknownAuthor") ?? "Desconhecido")
  );
}

function getCategoryFromPost(element) {
  try {
    if (!element?.querySelector) return "text";
    if (element.querySelector("video")) return "video";
    if (
      element.querySelector('[data-urn*="job"], [data-id*="job"], .job-card') ||
      element.querySelector('a[href*="/jobs/"]')
    )
      return "job";
    const hasArticleCard =
      element.querySelector(".feed-shared-article") ||
      element.querySelector('[data-urn*="share"] img') ||
      (element.querySelector("img") &&
        element.querySelector('a[href^="http"]'));
    if (hasArticleCard) return "article";
    if (element.querySelector("img")) return "image";
    return "text";
  } catch (e) {
    if (isContextInvalidatedError(e)) return "text";
    throw e;
  }
}

function flushInsightsToStorage() {
  insightFlushTimer = null;
  try {
    if (!isExtensionContextValid()) return;
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
  try {
    chrome.storage.local.get(["sessionStats", "feedInsights"], (result) => {
      try {
        if (!isExtensionContextValid()) return;
        const session = result.sessionStats ?? {};
        const feed = result.feedInsights ?? {};
        const feedAuthors = feed.authors ?? {};
        const feedCategories = feed.categories ?? {};
        const nextSession = {
          postsSeen: (session.postsSeen ?? 0) + insightPending.postsSeen,
          postsBlocked:
            (session.postsBlocked ?? 0) + insightPending.postsBlocked,
          lastUpdated: Date.now(),
        };
        const nextAuthors = { ...feedAuthors };
        for (const [name, delta] of Object.entries(insightPending.authors)) {
          nextAuthors[name] = (nextAuthors[name] ?? 0) + delta;
        }
        const entries = Object.entries(nextAuthors).sort((a, b) => b[1] - a[1]);
        const trimmed = Object.fromEntries(
          entries.slice(0, FEED_INSIGHTS_AUTHORS_MAX)
        );
        const nextCategories = { ...feedCategories };
        for (const [cat, delta] of Object.entries(insightPending.categories)) {
          nextCategories[cat] = (nextCategories[cat] ?? 0) + delta;
        }
        chrome.storage.local.set({
          sessionStats: nextSession,
          feedInsights: {
            authors: trimmed,
            categories: nextCategories,
            lastUpdated: Date.now(),
          },
        });
        insightPending.authors = {};
        insightPending.categories = {};
        insightPending.postsSeen = 0;
        insightPending.postsBlocked = 0;
      } catch (e) {
        if (isContextInvalidatedError(e)) return;
        throw e;
      }
    });
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
}

function scheduleInsightsFlush() {
  try {
    if (!isExtensionContextValid()) return;
    if (insightFlushTimer !== null) return;
    insightFlushTimer = setTimeout(
      flushInsightsToStorage,
      INSIGHTS_THROTTLE_MS
    );
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
}

function recordPostForInsights(element) {
  try {
    if (!isExtensionContextValid()) return;
    const author = getAuthorFromPost(element);
    const category = getCategoryFromPost(element);
    insightPending.postsSeen += 1;
    insightPending.authors[author] = (insightPending.authors[author] ?? 0) + 1;
    insightPending.categories[category] =
      (insightPending.categories[category] ?? 0) + 1;
    scheduleInsightsFlush();
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
}

function recordSessionBlocked() {
  insightPending.postsBlocked += 1;
  scheduleInsightsFlush();
}

function appendBlockedPost(snippet, keyword) {
  try {
    if (!isExtensionContextValid()) return;
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
  const storeInList = !settings.dontStoreSnippet;
  try {
    chrome.storage.local.get(
      ["blockedPosts", "statsByKeyword", "countByKeywordDay"],
      (result) => {
        try {
          if (!isExtensionContextValid()) return;
          const list = Array.isArray(result.blockedPosts)
            ? result.blockedPosts
            : [];
          if (storeInList) {
            list.unshift({ snippet, keyword, at: Date.now() });
          }
          const prev = result.statsByKeyword ?? null;
          const stats =
            prev && typeof prev === "object" && !Array.isArray(prev)
              ? { ...prev }
              : {};
          stats[keyword] = (stats[keyword] ?? 0) + 1;
          const dayKey = getTodayKey();
          const countKey = `${keyword}:${dayKey}`;
          const countPrev = result.countByKeywordDay ?? {};
          const countNext = {
            ...countPrev,
            [countKey]: (countPrev[countKey] ?? 0) + 1,
          };
          chrome.storage.local.set({
            blockedPosts: storeInList
              ? list.slice(0, BLOCKED_LIST_MAX)
              : result.blockedPosts ?? [],
            statsByKeyword: stats,
            countByKeywordDay: countNext,
          });
        } catch (e) {
          if (isContextInvalidatedError(e)) return;
          throw e;
        }
      }
    );
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
}

function checkLimitThenBlock(keywordLabel, callback) {
  if (!settings.limitPerKeywordEnabled) {
    callback(true);
    return;
  }
  const dayKey = getTodayKey();
  const countKey = `${keywordLabel}:${dayKey}`;
  try {
    if (!isExtensionContextValid()) {
      callback(true);
      return;
    }
    chrome.storage.local.get(["countByKeywordDay"], (result) => {
      try {
        if (!isExtensionContextValid()) return;
        const counts = result.countByKeywordDay ?? {};
        const count = counts[countKey] ?? 0;
        const max = Math.max(1, settings.limitPerKeywordMax ?? 10);
        callback(count < max);
      } catch (e) {
        if (isContextInvalidatedError(e)) return;
        throw e;
      }
    });
  } catch (e) {
    if (isContextInvalidatedError(e)) {
      callback(true);
      return;
    }
    throw e;
  }
}

function updateFeedCounter() {
  if (!settings.showFeedCounter) {
    if (feedCounterEl) {
      feedCounterEl.remove();
      feedCounterEl = null;
    }
    return;
  }
  const feed = document.querySelector("main");
  if (!feed) return;
  const count = feed.querySelectorAll(`[${BLOCKED_ATTR}="1"]`).length;
  if (!feedCounterEl) {
    feedCounterEl = document.createElement("div");
    feedCounterEl.className = "linkedin-feed-blocker-counter";
    feedCounterEl.style.cssText =
      "padding:8px 12px;margin-bottom:8px;background:#24282e;color:#9aa0a6;font-size:12px;border-radius:6px;";
    feed.insertBefore(feedCounterEl, feed.firstChild);
  }
  const noPosts =
    chrome.i18n.getMessage("contentNoPostsHidden") ?? "Nenhum post ocultado.";
  const withCount =
    chrome.i18n.getMessage("contentPostsHiddenCount", [String(count)]) ??
    `${count} post(s) ocultado(s) nesta sessão.`;
  feedCounterEl.textContent = count === 0 ? noPosts : withCount;
}

function collapsePost(element, reason, snippet) {
  if (element.querySelector(".linkedin-feed-blocker-bar")) return;
  const bar = document.createElement("div");
  bar.className = "linkedin-feed-blocker-bar";
  bar.style.cssText =
    "padding:12px;background:#24282e;color:#9aa0a6;font-size:13px;border-radius:8px;margin-bottom:8px;";
  const blockedMsg =
    chrome.i18n.getMessage("contentBlockedMessage") ??
    "Conteúdo bloqueado pelo usuário através do LinkedIn Feed Blocker";
  const hiddenBy = chrome.i18n.getMessage("contentHiddenBy") ?? "Ocultado por";
  const msgSpan = document.createElement("span");
  msgSpan.textContent = reason
    ? `${blockedMsg} (${hiddenBy}: ${reason})`
    : blockedMsg;
  bar.appendChild(msgSpan);
  if (settings.tooltipOnBlocked && snippet) {
    bar.title = snippet;
  }
  const btn = document.createElement("button");
  btn.textContent = chrome.i18n.getMessage("contentExpand") ?? "Expandir";
  btn.style.cssText =
    "margin-left:12px;padding:4px 10px;cursor:pointer;background:#0a66c2;color:#fff;border:none;border-radius:6px;font-size:12px;";
  bar.appendChild(btn);
  const wrapper = document.createElement("div");
  wrapper.style.display = "none";
  while (element.firstChild) {
    wrapper.appendChild(element.firstChild);
  }
  btn.addEventListener("click", () => {
    bar.remove();
    wrapper.style.display = "";
  });
  element.appendChild(bar);
  element.appendChild(wrapper);
}

function showUndoBar(element, keywordLabel, durationSec) {
  const bar = document.createElement("div");
  bar.className = "linkedin-feed-blocker-undo-bar";
  bar.style.cssText =
    "padding:8px 12px;margin-bottom:4px;background:#1a1d21;color:#9aa0a6;font-size:12px;border-radius:6px;";
  const postHidden =
    chrome.i18n.getMessage("contentPostHidden") ?? "Post ocultado.";
  bar.textContent = postHidden + " ";
  const btn = document.createElement("button");
  btn.textContent = chrome.i18n.getMessage("contentUndo") ?? "Desfazer";
  btn.style.cssText =
    "margin-left:8px;padding:2px 8px;cursor:pointer;background:#0a66c2;color:#fff;border:none;border-radius:4px;font-size:11px;";
  btn.addEventListener("click", () => {
    element.style.display = "";
    element.setAttribute(BLOCKED_ATTR, "undone");
    bar.remove();
    updateFeedCounter();
  });
  bar.appendChild(btn);
  element.parentNode?.insertBefore(bar, element);
  setTimeout(() => bar.remove(), durationSec * 1000);
}

function applyBlock(element, reason, keywordLabel, snippet) {
  element.setAttribute(BLOCKED_ATTR, "1");
  appendBlockedPost(settings.dontStoreSnippet ? "" : snippet, keywordLabel);

  if (settings.notificationOnly) {
    element.style.borderLeft = "6px solid #f59e0b";
    element.style.boxShadow = "2px 0 12px rgba(245, 158, 11, 0.45)";
    element.style.opacity = "0.92";
    updateFeedCounter();
    return;
  }
  if (settings.collapseInsteadOfHide) {
    collapsePost(element, keywordLabel, snippet);
    updateFeedCounter();
    return;
  }
  element.style.display = "none";
  if (settings.undoEnabled && settings.undoDurationSeconds > 0) {
    showUndoBar(
      element,
      keywordLabel,
      Math.min(60, Math.max(1, settings.undoDurationSeconds ?? 5))
    );
  }
  updateFeedCounter();
}

function processPost(element) {
  if (element.getAttribute(BLOCKED_ATTR) !== null) return;
  const ancestorPost = element.parentElement?.closest?.(POST_SELECTOR);
  if (
    ancestorPost &&
    ancestorPost !== element &&
    ancestorPost.getAttribute(BLOCKED_ATTR) !== null
  )
    return;

  if (element.getAttribute(INSIGHT_ATTR) === null) {
    recordPostForInsights(element);
    element.setAttribute(INSIGHT_ATTR, "1");
  }

  const text = element.textContent ?? "";
  const reason = getBlockReason(text);
  if (reason === null) return;
  if (isInsideBlockWindow()) return;

  let keywordLabel = "lista branca";
  if (reason.type === "keyword") keywordLabel = reason.value;
  else if (reason.type === "author") keywordLabel = `autor: ${reason.value}`;
  const snippet = text.trim().slice(0, 80).replaceAll(/\s+/g, " ");

  checkLimitThenBlock(keywordLabel, (allowed) => {
    if (!allowed) return;
    recordSessionBlocked();
    applyBlock(element, reason, keywordLabel, snippet);
  });
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
  updateFeedCounter();
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
    processDebounceTimer = null;
    processNodes(added);
    runProcess();
    if (processRerunTimer !== null) clearTimeout(processRerunTimer);
    processRerunTimer = setTimeout(() => {
      processRerunTimer = null;
      runProcess();
    }, REPROCESS_DELAY_MS);
  }, DEBOUNCE_MS);
}

function startObserver() {
  const feed = document.querySelector("main");
  if (!feed) {
    setTimeout(startObserver, 500);
    return;
  }
  runProcess();
  if (processRerunTimer !== null) clearTimeout(processRerunTimer);
  processRerunTimer = setTimeout(() => {
    processRerunTimer = null;
    runProcess();
  }, REPROCESS_DELAY_MS);
  const observer = new MutationObserver(scheduleProcess);
  observer.observe(feed, { childList: true, subtree: true });
}

function loadConfig() {
  try {
    if (!isExtensionContextValid()) return;
    chrome.storage.sync.get(
      ["keywords", "settings", "blockedAuthors"],
      (result) => {
        try {
          if (!isExtensionContextValid()) return;
          const nextSettings = result.settings ?? null;
          settings =
            nextSettings && typeof nextSettings === "object"
              ? { ...settings, ...nextSettings }
              : settings;
          keywords = normalizeKeywords(result.keywords ?? []);
          blockedAuthors = normalizeList(result.blockedAuthors ?? []);
          startObserver();
        } catch (e) {
          if (isContextInvalidatedError(e)) return;
          throw e;
        }
      }
    );
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  try {
    if (!isExtensionContextValid()) return;
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
  } catch (e) {
    if (isContextInvalidatedError(e)) return;
    throw e;
  }
});

loadConfig();
