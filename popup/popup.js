const keywordsEl = document.getElementById("keywords");
const saveBtn = document.getElementById("save");
const feedbackEl = document.getElementById("feedback");

chrome.storage.sync.get(["keywords"], (result) => {
  const raw = result.keywords ?? [];
  const value = Array.isArray(raw) ? raw.join("\n") : String(raw ?? "");
  keywordsEl.value = value;
});

function save() {
  const lines = keywordsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  chrome.storage.sync.set({ keywords: lines });
  feedbackEl.classList.add("visible");
  setTimeout(() => feedbackEl.classList.remove("visible"), 2000);
}

saveBtn.addEventListener("click", save);
