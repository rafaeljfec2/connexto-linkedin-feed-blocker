import { t } from "../i18n.js";

customElements.define(
  "insights-panel",
  class InsightsPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <section id="panel-insights" class="panel insights-panel" role="tabpanel">
      <h2>${t("insightsTitle")}</h2>
      <div id="insights-session" class="insight-block"></div>
      <div id="insights-blocking" class="insight-block"></div>
      <div id="insights-category" class="insight-block"></div>
      <div id="insights-authors" class="insight-block"></div>
    </section>`;
    }
  }
);
