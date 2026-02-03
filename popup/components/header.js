import { t } from "../i18n.js";

customElements.define(
  "extension-header",
  class ExtensionHeader extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <header class="header">
      <h1>${t("extName")}</h1>
      <p>${t("extDescription")}</p>
    </header>`;
    }
  }
);
