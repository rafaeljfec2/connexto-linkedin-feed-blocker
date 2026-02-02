customElements.define(
  "blocked-panel",
  class BlockedPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <section id="panel-blocked" class="panel blocked-panel" role="tabpanel">
      <h2>Posts bloqueados (<span id="blocked-count-panel">0</span>)</h2>
      <input
        type="text"
        id="blocked-list-filter"
        placeholder="Filtrar por palavra ou texto..."
        class="blocked-filter"
      />
      <ul class="blocked-list" id="blocked-list"></ul>
      <p class="blocked-empty" id="blocked-empty">
        Nenhum post bloqueado ainda.
      </p>
      <div class="blocked-actions">
        <button type="button" id="clear-blocked">Limpar lista</button>
        <button type="button" id="export-blocked">Exportar (JSON)</button>
      </div>
    </section>`;
    }
  }
);
