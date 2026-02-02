import { escapeHtml } from "./utils.js";

const CATEGORY_LABELS = {
  article: "Artigo",
  image: "Imagem",
  video: "Vídeo",
  job: "Vaga",
  text: "Texto",
};

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

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

function renderSessionBlock(elements, sessionStats) {
  const el = elements.insightsSessionEl;
  if (!el) return;
  const seen = sessionStats?.postsSeen ?? 0;
  const blocked = sessionStats?.postsBlocked ?? 0;
  const pct = seen > 0 ? Math.round((blocked / seen) * 100) : 0;
  if (seen === 0 && blocked === 0) {
    el.innerHTML = `<p class="insight-title">Sessão atual</p><p class="insight-empty">Nenhum dado nesta sessão. Role o feed no LinkedIn para ver métricas.</p>`;
    return;
  }
  el.innerHTML = `
    <p class="insight-title">Sessão atual</p>
    <p class="insight-text">${escapeHtml(
      String(seen)
    )} posts no feed · ${escapeHtml(String(blocked))} ocultados (${escapeHtml(
    String(pct)
  )}%)</p>`;
}

function renderBlockingBlock(elements, statsByKeyword, countByKeywordDay) {
  const el = elements.insightsBlockingEl;
  if (!el) return;
  const total = Object.values(statsByKeyword ?? {}).reduce((a, b) => a + b, 0);
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  let todayTotal = 0;
  let yesterdayTotal = 0;
  const countByDay = countByKeywordDay ?? {};
  for (const [k, v] of Object.entries(countByDay)) {
    const datePart = k.includes(":") ? k.split(":")[1] : "";
    if (datePart === todayKey) todayTotal += Number(v);
    if (datePart === yesterdayKey) yesterdayTotal += Number(v);
  }
  const topKeywords = Object.entries(statsByKeyword ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const dayKeys = getLast7DayKeys();
  const last7 = dayKeys.map((day) => {
    let sum = 0;
    for (const [k, v] of Object.entries(countByDay)) {
      const datePart = k.includes(":") ? k.split(":")[1] : "";
      if (datePart === day) sum += Number(v);
    }
    return { day, sum };
  });

  el.innerHTML = `
    <p class="insight-title">Bloqueios</p>
    <p class="insight-text">Total: ${escapeHtml(
      String(total)
    )} · Hoje: ${escapeHtml(String(todayTotal))} · Ontem: ${escapeHtml(
    String(yesterdayTotal)
  )}</p>
    ${
      topKeywords.length > 0
        ? `<p class="insight-sub">Top palavras: ${topKeywords
            .map(([kw, n]) => `${escapeHtml(kw)} (${n})`)
            .join(", ")}</p>`
        : ""
    }
    ${
      last7.some((d) => d.sum > 0)
        ? `<ul class="insight-days">${last7
            .map((d) => `<li>${escapeHtml(d.day)}: ${d.sum}</li>`)
            .join("")}</ul>`
        : ""
    }`;
}

function renderCategoryBlock(elements, feedInsights) {
  const el = elements.insightsCategoryEl;
  if (!el) return;
  const categories = feedInsights?.categories ?? {};
  const entries = Object.entries(categories)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    el.innerHTML = `<p class="insight-title">Categoria que mais recebi</p><p class="insight-empty">Role o feed para ver tipos de conteúdo.</p>`;
    return;
  }
  const list = entries
    .map(
      ([key, n], i) =>
        `${i + 1}º ${escapeHtml(CATEGORY_LABELS[key] ?? key)} – ${n} posts`
    )
    .join("<br/>");
  el.innerHTML = `
    <p class="insight-title">Categoria que mais recebi</p>
    <p class="insight-text">${list}</p>`;
}

function renderAuthorsBlock(elements, feedInsights) {
  const el = elements.insightsAuthorsEl;
  if (!el) return;
  const authors = feedInsights?.authors ?? {};
  const entries = Object.entries(authors)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  if (entries.length === 0) {
    el.innerHTML = `<p class="insight-title">Autor que mais apareceu</p><p class="insight-empty">Role o feed para ver autores.</p>`;
    return;
  }
  const list = entries
    .map(
      ([name, n], i) =>
        `${i + 1}º ${escapeHtml(name)} – ${escapeHtml(String(n))} posts`
    )
    .join("<br/>");
  el.innerHTML = `
    <p class="insight-title">Autor que mais apareceu no feed</p>
    <p class="insight-text">${list}</p>`;
}

export function renderInsights(elements) {
  chrome.storage.local.get(
    [
      "blockedPosts",
      "statsByKeyword",
      "countByKeywordDay",
      "sessionStats",
      "feedInsights",
    ],
    (result) => {
      renderSessionBlock(elements, result.sessionStats);
      renderBlockingBlock(
        elements,
        result.statsByKeyword,
        result.countByKeywordDay
      );
      renderCategoryBlock(elements, result.feedInsights);
      renderAuthorsBlock(elements, result.feedInsights);
    }
  );
}
