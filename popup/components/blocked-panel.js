import { t } from "../i18n.js";

customElements.define(
  "blocked-panel",
  class BlockedPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <section id="panel-blocked" class="panel blocked-panel" role="tabpanel">
      <h2>${t(
        "postsBlockedCount"
      )} (<span id="blocked-count-panel">0</span>)</h2>
      <input
        type="text"
        id="blocked-list-filter"
        placeholder="${t("placeholderFilterBlocked")}"
        class="blocked-filter"
      />
      <ul class="blocked-list" id="blocked-list"></ul>
      <p class="blocked-empty" id="blocked-empty">${t("noBlockedYet")}</p>
      <div class="blocked-actions">
        <button type="button" id="clear-blocked">${t("btnClearList")}</button>
        <button type="button" id="export-blocked">${t("btnExportJson")}</button>
      </div>
    </section>`;
    }
  }
);
