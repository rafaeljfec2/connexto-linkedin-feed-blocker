import { escapeHtml } from "./utils.js";
import { t } from "./i18n.js";

const CATEGORY_LABELS = {
  article: "Artigo",
  image: "Imagem",
  video: "Vídeo",
  job: "Vaga",
  text: "Texto",
};

function getLast7DayKeys() {
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`
    );
  }
  return keys;
}

function formatShortDay(dateKey) {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  return `${parts[2]}/${parts[1]}`;
}

function renderSessionSection(elements, sessionStats) {
  const el = elements.dashboardSessionEl;
  if (!el) return;
  const seen = sessionStats?.postsSeen ?? 0;
  const blocked = sessionStats?.postsBlocked ?? 0;
  const pct = seen > 0 ? Math.round((blocked / seen) * 100) : 0;
  if (seen === 0 && blocked === 0) {
    el.innerHTML = `
      <p class="dashboard-chart-title">${t("dashboardCurrentSession")}</p>
      <p class="dashboard-empty">${t("dashboardEmpty")}</p>`;
    return;
  }
  const seenPct = seen > 0 ? Math.round(((seen - blocked) / seen) * 100) : 0;
  const blockedPct = seen > 0 ? Math.min(100, pct) : 0;
  el.innerHTML = `
    <p class="dashboard-chart-title">${t("dashboardCurrentSession")}</p>
    <p class="dashboard-legend">${escapeHtml(
      String(seen)
    )} posts · ${escapeHtml(String(blocked))} ocultados (${escapeHtml(
    String(pct)
  )}%)</p>
    <div class="dashboard-bar-wrap">
      <div class="dashboard-bar dashboard-bar-seen" style="width:${seenPct}%"></div>
      <div class="dashboard-bar dashboard-bar-blocked" style="width:${blockedPct}%"></div>
    </div>`;
}

function renderBlockingChart(elements, countByKeywordDay) {
  const el = elements.dashboardBlockingChartEl;
  if (!el) return;
  const dayKeys = getLast7DayKeys();
  const countByDay = countByKeywordDay ?? {};
  const data = dayKeys.map((day) => {
    let sum = 0;
    for (const [k, v] of Object.entries(countByDay)) {
      const datePart = k.includes(":") ? k.split(":")[1] : "";
      if (datePart === day) sum += Number(v);
    }
    return { day, sum };
  });
  const max = Math.max(1, ...data.map((d) => d.sum));
  const bars = data
    .map(
      (d) =>
        `<div class="dashboard-bar-row">
          <span class="dashboard-bar-label">${escapeHtml(
            formatShortDay(d.day)
          )}</span>
          <div class="dashboard-bar-track"><div class="dashboard-bar dashboard-bar-block" style="width:${
            max > 0 ? (d.sum / max) * 100 : 0
          }%"></div></div>
          <span class="dashboard-bar-value">${d.sum}</span>
        </div>`
    )
    .join("");
  el.innerHTML = `
    <p class="dashboard-chart-title">${t("dashboardBlocksLast7")}</p>
    <div class="dashboard-bars">${bars}</div>`;
}

function renderKeywordsChart(elements, statsByKeyword) {
  const el = elements.dashboardKeywordsChartEl;
  if (!el) return;
  const entries = Object.entries(statsByKeyword ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (entries.length === 0) {
    el.innerHTML = `
      <p class="dashboard-chart-title">${t("dashboardTopBlockedWords")}</p>
      <p class="dashboard-empty">${t("dashboardNoneYet")}</p>`;
    return;
  }
  const max = Math.max(1, ...entries.map(([, n]) => n));
  const rows = entries
    .map(
      ([kw, n]) =>
        `<div class="dashboard-bar-row">
          <span class="dashboard-bar-label">${escapeHtml(kw.slice(0, 20))}${
          kw.length > 20 ? "…" : ""
        }</span>
          <div class="dashboard-bar-track"><div class="dashboard-bar dashboard-bar-keyword" style="width:${
            (n / max) * 100
          }%"></div></div>
          <span class="dashboard-bar-value">${n}</span>
        </div>`
    )
    .join("");
  el.innerHTML = `
    <p class="dashboard-chart-title">${t("dashboardTopBlockedWords")}</p>
    <div class="dashboard-bars">${rows}</div>`;
}

function renderCategoryChart(elements, feedInsights) {
  const el = elements.dashboardCategoryChartEl;
  if (!el) return;
  const categories = feedInsights?.categories ?? {};
  const entries = Object.entries(categories)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    el.innerHTML = `
      <p class="dashboard-chart-title">${t("dashboardMostReceivedCategory")}</p>
      <p class="dashboard-empty">${t("insightsCategoryEmpty")}</p>`;
    return;
  }
  const max = Math.max(1, ...entries.map(([, n]) => n));
  const rows = entries
    .map(
      ([key, n]) =>
        `<div class="dashboard-bar-row">
          <span class="dashboard-bar-label">${escapeHtml(
            CATEGORY_LABELS[key] ?? key
          )}</span>
          <div class="dashboard-bar-track"><div class="dashboard-bar dashboard-bar-category" style="width:${
            (n / max) * 100
          }%"></div></div>
          <span class="dashboard-bar-value">${n}</span>
        </div>`
    )
    .join("");
  el.innerHTML = `
    <p class="dashboard-chart-title">${t("dashboardMostReceivedCategory")}</p>
    <div class="dashboard-bars">${rows}</div>`;
}

function renderAuthorsChart(elements, feedInsights) {
  const el = elements.dashboardAuthorsChartEl;
  if (!el) return;
  const authors = feedInsights?.authors ?? {};
  const entries = Object.entries(authors)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (entries.length === 0) {
    el.innerHTML = `
      <p class="dashboard-chart-title">${t("dashboardAuthorMostSeen")}</p>
      <p class="dashboard-empty">${t("insightsAuthorsEmpty")}</p>`;
    return;
  }
  const max = Math.max(1, ...entries.map(([, n]) => n));
  const rows = entries
    .map(
      ([name, n]) =>
        `<div class="dashboard-bar-row">
          <span class="dashboard-bar-label" title="${escapeHtml(
            name
          )}">${escapeHtml(name)}</span>
          <div class="dashboard-bar-track"><div class="dashboard-bar dashboard-bar-author" style="width:${
            (n / max) * 100
          }%"></div></div>
          <span class="dashboard-bar-value">${n}</span>
        </div>`
    )
    .join("");
  el.innerHTML = `
    <p class="dashboard-chart-title">${t("dashboardAuthorMostSeen")}</p>
    <div class="dashboard-bars">${rows}</div>`;
}

export function renderDashboard(elements) {
  chrome.storage.local.get(
    ["statsByKeyword", "countByKeywordDay", "sessionStats", "feedInsights"],
    (result) => {
      renderSessionSection(elements, result.sessionStats);
      renderBlockingChart(elements, result.countByKeywordDay);
      renderKeywordsChart(elements, result.statsByKeyword);
      renderCategoryChart(elements, result.feedInsights);
      renderAuthorsChart(elements, result.feedInsights);
    }
  );
}
