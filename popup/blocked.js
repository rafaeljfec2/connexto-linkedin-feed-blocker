import { SNIPPET_MAX_LENGTH, EXPORT_BLOCKED_FILENAME } from "./constants.js";
import { applyFilterAndGroup, escapeHtml, downloadBlob } from "./utils.js";

let lastBlockedListRaw = [];

export function renderBlockedList(elements, list, filterStr, groupBy) {
  lastBlockedListRaw = Array.isArray(list) ? list : [];
  const filtered = applyFilterAndGroup(lastBlockedListRaw, filterStr, groupBy);
  const { blockedCountEl, blockedCountPanelEl, blockedListEl, blockedEmptyEl } =
    elements;
  if (blockedCountEl)
    blockedCountEl.textContent = String(lastBlockedListRaw.length);
  if (blockedCountPanelEl)
    blockedCountPanelEl.textContent = String(lastBlockedListRaw.length);

  if (lastBlockedListRaw.length === 0) {
    if (blockedEmptyEl) blockedEmptyEl.style.display = "block";
    if (blockedListEl) {
      blockedListEl.style.display = "none";
      blockedListEl.innerHTML = "";
    }
    return;
  }
  if (blockedEmptyEl) blockedEmptyEl.style.display = "none";
  if (blockedListEl) blockedListEl.style.display = "block";

  if (
    groupBy === "keyword" &&
    typeof filtered === "object" &&
    !Array.isArray(filtered)
  ) {
    const entries = Object.entries(filtered);
    blockedListEl.innerHTML = entries
      .map(([kw, groupItems]) => {
        const lis = (groupItems ?? [])
          .map((item) => {
            const snip = item.snippet ?? "";
            const display =
              snip.length > SNIPPET_MAX_LENGTH
                ? snip.slice(0, SNIPPET_MAX_LENGTH) + "…"
                : snip;
            return `<li><span class="keyword">${escapeHtml(
              item.keyword ?? ""
            )}</span>${escapeHtml(display)}</li>`;
          })
          .join("");
        return `<li class="blocked-group"><span class="keyword">${escapeHtml(
          kw
        )}</span> (${groupItems.length})<ul>${lis}</ul></li>`;
      })
      .join("");
    return;
  }

  const items = Array.isArray(filtered) ? filtered : [];
  blockedListEl.innerHTML = items
    .map((item) => {
      const snip = item.snippet ?? "";
      const display =
        snip.length > SNIPPET_MAX_LENGTH
          ? snip.slice(0, SNIPPET_MAX_LENGTH) + "…"
          : snip;
      return `<li><span class="keyword">${escapeHtml(
        item.keyword ?? ""
      )}</span>${escapeHtml(display)}</li>`;
    })
    .join("");
}

export function loadBlockedList(elements) {
  chrome.storage.local.get(["blockedPosts"], (result) => {
    const list = result.blockedPosts ?? [];
    const filterStr = elements.blockedListFilterEl?.value ?? "";
    const groupBy = elements.blockedGroupByEl?.value ?? "none";
    renderBlockedList(elements, list, filterStr, groupBy);
  });
}

export function clearBlockedList(elements) {
  chrome.storage.local.set({
    blockedPosts: [],
    statsByKeyword: {},
    countByKeywordDay: {},
  });
  renderBlockedList(elements, [], "", "none");
}

export function exportBlockedList(elements) {
  chrome.storage.local.get(["blockedPosts"], (result) => {
    const list = result.blockedPosts ?? [];
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, EXPORT_BLOCKED_FILENAME);
  });
}
