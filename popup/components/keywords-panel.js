customElements.define(
  "keywords-panel",
  class KeywordsPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <main id="panel-keywords" class="panel active" role="tabpanel">
      <label for="keywords">Palavras-chave (uma por linha)</label>
      <textarea
        id="keywords"
        placeholder="ex: promoção&#10;vagas&#10;recrutamento"
      ></textarea>
      <p class="hint">
        Não diferencia maiúsculas de minúsculas. Salve e o feed recarrega.
      </p>
      <div class="actions">
        <button type="button" id="save" class="primary">Salvar</button>
        <span class="feedback" id="feedback">Salvo.</span>
      </div>
    </main>`;
    }
  }
);
