customElements.define(
  "extension-header",
  class ExtensionHeader extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <header class="header">
      <h1>LinkedIn Feed Blocker</h1>
      <p>Palavras ou frases que ocultam posts no feed</p>
    </header>`;
    }
  }
);
