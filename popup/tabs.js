const panels = (el) => [
  el.panelKeywords,
  el.panelBlocked,
  el.panelParams,
  el.panelInsights,
];
const tabButtons = (el) => [
  el.tabKeywords,
  el.tabBlocked,
  el.tabParams,
  el.tabInsights,
];

export function showTab(elements, panel) {
  const p = panels(elements);
  const t = tabButtons(elements);
  const idx = p.indexOf(panel);
  p.forEach((node, i) => node?.classList.toggle("active", i === idx));
  t.forEach((node, i) => {
    if (node) {
      node.classList.toggle("active", i === idx);
      node.setAttribute("aria-selected", String(i === idx));
    }
  });
}

export function initTabs(elements) {
  const {
    tabKeywords,
    tabBlocked,
    tabParams,
    tabInsights,
    panelKeywords,
    panelBlocked,
    panelParams,
    panelInsights,
  } = elements;
  tabKeywords?.addEventListener("click", () =>
    showTab(elements, panelKeywords)
  );
  tabBlocked?.addEventListener("click", () => showTab(elements, panelBlocked));
  tabParams?.addEventListener("click", () => showTab(elements, panelParams));
  tabInsights?.addEventListener("click", () =>
    showTab(elements, panelInsights)
  );
}
