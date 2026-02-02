const keywordsEl = document.getElementById("keywords");
const saveBtn = document.getElementById("save");
const feedbackEl = document.getElementById("feedback");
const blockedCountEl = document.getElementById("blocked-count");
const blockedListEl = document.getElementById("blocked-list");
const clearBlockedBtn = document.getElementById("clear-blocked");

chrome.storage.sync.get(["keywords"], (result) => {
  const raw = result.keywords ?? [];
  const value = Array.isArray(raw) ? raw.join("\n") : String(raw ?? "");
  keywordsEl.value = value;
});

function renderBlockedList(list) {
  const items = Array.isArray(list) ? list : [];
  blockedCountEl.textContent = String(items.length);
  blockedListEl.innerHTML = items
    .map((item) => {
      const snip = item.snippet ?? "";
      const display = snip.length > 60 ? snip.slice(0, 60) + "…" : snip;
      return `<li><span class="keyword">${escapeHtml(
        item.keyword ?? ""
      )}</span>${escapeHtml(display)}</li>`;
    })
    .join("");
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function loadBlockedList() {
  chrome.storage.local.get(["blockedPosts"], (result) => {
    renderBlockedList(result.blockedPosts ?? []);
  });
}

function save() {
  const lines = keywordsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  chrome.storage.sync.set({ keywords: lines });
  feedbackEl.classList.add("visible");
  setTimeout(() => feedbackEl.classList.remove("visible"), 2000);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.includes("linkedin.com/feed")) {
      chrome.tabs.reload(tab.id);
    }
  });
}

function clearBlockedList() {
  chrome.storage.local.set({ blockedPosts: [] });
  renderBlockedList([]);
}

loadBlockedList();
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.blockedPosts) {
    renderBlockedList(changes.blockedPosts.newValue ?? []);
  }
});

saveBtn.addEventListener("click", save);
clearBlockedBtn.addEventListener("click", clearBlockedList);
