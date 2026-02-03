import { t } from "../i18n.js";

customElements.define(
  "tab-nav",
  class TabNav extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <nav class="tabs">
      <button
        type="button"
        class="tab active"
        role="tab"
        id="tab-dashboard"
        aria-selected="true"
        aria-controls="panel-dashboard"
      >
        ${t("tabDashboard")}
      </button>
      <button
        type="button"
        class="tab"
        role="tab"
        id="tab-keywords"
        aria-selected="false"
        aria-controls="panel-keywords"
      >
        ${t("tabKeywords")}
      </button>
      <button
        type="button"
        class="tab"
        role="tab"
        id="tab-blocked"
        aria-selected="false"
        aria-controls="panel-blocked"
      >
        ${t("tabBlocked")} (<span id="blocked-count">0</span>)
      </button>
      <button
        type="button"
        class="tab"
        role="tab"
        id="tab-insights"
        aria-selected="false"
        aria-controls="panel-insights"
      >
        ${t("tabInsights")}
      </button>
      <button
        type="button"
        class="tab"
        role="tab"
        id="tab-params"
        aria-selected="false"
        aria-controls="panel-params"
      >
        ${t("tabParams")}
      </button>
    </nav>`;
    }
  }
);
