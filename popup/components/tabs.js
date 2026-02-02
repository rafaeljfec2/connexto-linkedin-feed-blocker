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
        id="tab-keywords"
        aria-selected="true"
        aria-controls="panel-keywords"
      >
        Palavras-chave
      </button>
      <button
        type="button"
        class="tab"
        role="tab"
        id="tab-blocked"
        aria-selected="false"
        aria-controls="panel-blocked"
      >
        Bloqueados (<span id="blocked-count">0</span>)
      </button>
      <button
        type="button"
        class="tab"
        role="tab"
        id="tab-params"
        aria-selected="false"
        aria-controls="panel-params"
      >
        Parâmetros
      </button>
    </nav>`;
    }
  }
);
