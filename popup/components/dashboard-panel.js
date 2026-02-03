import { t } from "../i18n.js";

customElements.define(
  "dashboard-panel",
  class DashboardPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <section id="panel-dashboard" class="panel dashboard-panel active" role="tabpanel">
      <h2>${t("dashboardTitle")}</h2>
      <div id="dashboard-session" class="dashboard-block"></div>
      <div id="dashboard-blocking-chart" class="dashboard-block"></div>
      <div id="dashboard-keywords-chart" class="dashboard-block"></div>
      <div id="dashboard-category-chart" class="dashboard-block"></div>
      <div id="dashboard-authors-chart" class="dashboard-block"></div>
    </section>`;
    }
  }
);
