import { t } from "../i18n.js";

customElements.define(
  "keywords-panel",
  class KeywordsPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      const placeholder = t("placeholderKeywords").replaceAll("\n", "&#10;");
      this.innerHTML = `
    <main id="panel-keywords" class="panel" role="tabpanel">
      <label for="keywords">${t("labelKeywordsOnePerLine")}</label>
      <textarea id="keywords" placeholder="${placeholder}"></textarea>
      <p class="hint">${t("hintCaseInsensitive")}</p>
      <div class="actions">
        <button type="button" id="save" class="primary">${t("btnSave")}</button>
        <span class="feedback" id="feedback">${t("feedbackSaved")}</span>
      </div>
    </main>`;
    }
  }
);
