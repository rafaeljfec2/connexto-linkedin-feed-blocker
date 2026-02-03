export function t(id, substitutions = null) {
  const msg =
    substitutions == null
      ? chrome.i18n.getMessage(id)
      : chrome.i18n.getMessage(id, substitutions);
  return msg ?? id;
}

export function applyI18n(root = document.body) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.textContent = msg;
    }
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.setAttribute("placeholder", msg);
    }
  });
}
