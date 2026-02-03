import { FEEDBACK_DURATION_MS } from "./constants.js";

export function parseLines(value) {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function showFeedback(el, text, duration = FEEDBACK_DURATION_MS) {
  if (!el) return;
  el.textContent = text;
  el.classList.add("visible");
  setTimeout(() => {
    el.classList.remove("visible");
    el.textContent = "";
  }, duration);
}

export function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

export function reloadFeedIfActive() {}

export function setToggle(btn, value) {
  if (!btn) return;
  btn.classList.toggle("on", Boolean(value));
  btn.setAttribute("aria-pressed", String(Boolean(value)));
}

export function applyFilterAndGroup(list, filterStr, groupBy) {
  let items = Array.isArray(list) ? list : [];
  const q = (filterStr ?? "").trim().toLowerCase();
  if (q) {
    items = items.filter(
      (item) =>
        (item.keyword ?? "").toLowerCase().includes(q) ||
        (item.snippet ?? "").toLowerCase().includes(q)
    );
  }
  if (groupBy === "keyword") {
    const byKw = {};
    for (const item of items) {
      const k = item.keyword ?? "";
      if (!byKw[k]) byKw[k] = [];
      byKw[k].push(item);
    }
    return byKw;
  }
  return items;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
