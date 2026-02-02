const PARAMS_PANEL_HTML = `
<section id="panel-params" class="panel params-panel" role="tabpanel">
  <details class="params-group" open>
    <summary>Bloqueio</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>Comportamento</h2>
        <div class="param-row">
          <label for="toggle-paused">Pausar bloqueio</label>
          <button type="button" class="toggle" id="toggle-paused" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-whitelist">Modo lista branca (só mostrar posts com palavra-chave)</label>
          <button type="button" class="toggle" id="toggle-whitelist" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-regex">Usar regex nas palavras</label>
          <button type="button" class="toggle" id="toggle-regex" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-collapse">Colapsar em vez de esconder</label>
          <button type="button" class="toggle" id="toggle-collapse" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-notification">Só notificação (marcar sem esconder)</label>
          <button type="button" class="toggle" id="toggle-notification" aria-pressed="false"></button>
        </div>
      </div>
      <div class="params-section">
        <h2>Bloquear por autor</h2>
        <label for="blocked-authors">Nomes ou textos (um por linha)</label>
        <textarea id="blocked-authors" placeholder="Nome do perfil&#10;empresa X"></textarea>
      </div>
      <div class="params-section">
        <h2>Prioridade</h2>
        <label for="rule-priority">Quando autor e palavra casam</label>
        <select id="rule-priority">
          <option value="keywordFirst">Palavra primeiro</option>
          <option value="authorFirst">Autor primeiro</option>
        </select>
      </div>
      <div class="params-section">
        <h2>Horário</h2>
        <div class="param-row">
          <label for="toggle-time-filter">Filtrar por horário</label>
          <button type="button" class="toggle" id="toggle-time-filter" aria-pressed="false"></button>
        </div>
        <p class="hint">Quando ativo: bloquear só fora do intervalo (ex.: não bloquear 9h–18h).</p>
        <div class="param-row">
          <label for="time-filter-start">Das</label>
          <input type="time" id="time-filter-start" value="09:00" />
        </div>
        <div class="param-row">
          <label for="time-filter-end">Até</label>
          <input type="time" id="time-filter-end" value="18:00" />
        </div>
      </div>
      <div class="params-section">
        <h2>Limites</h2>
        <div class="param-row">
          <label for="toggle-limit-keyword">Limite por palavra/dia</label>
          <button type="button" class="toggle" id="toggle-limit-keyword" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="limit-keyword-max">Máx. bloqueios por palavra/dia</label>
          <input type="number" id="limit-keyword-max" min="1" max="999" value="10" />
        </div>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>Palavras-chave</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>Importar / exportar palavras</h2>
        <button type="button" id="export-keywords">Exportar palavras (.txt)</button>
        <label for="import-keywords">Colar texto para importar (uma por linha)</label>
        <textarea id="import-keywords" placeholder="Cole aqui e clique em Adicionar"></textarea>
        <div class="actions">
          <button type="button" id="import-add" class="primary">Adicionar às palavras</button>
        </div>
      </div>
      <div class="params-section">
        <h2>Sugestões</h2>
        <p class="hint">Clique para adicionar à lista de palavras-chave.</p>
        <div class="suggestions" id="suggestions"></div>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>Interface no feed</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>Feed e desfazer</h2>
        <div class="param-row">
          <label for="toggle-feed-counter">Contador no feed (X ocultados)</label>
          <button type="button" class="toggle" id="toggle-feed-counter" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-undo">Botão Desfazer ao ocultar</label>
          <button type="button" class="toggle" id="toggle-undo" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="undo-duration">Duração Desfazer (seg)</label>
          <input type="number" id="undo-duration" min="1" max="60" value="5" />
        </div>
        <div class="param-row">
          <label for="toggle-tooltip">Tooltip em post colapsado</label>
          <button type="button" class="toggle" id="toggle-tooltip" aria-pressed="false"></button>
        </div>
      </div>
      <div class="params-section">
        <h2>Lista bloqueados</h2>
        <label for="blocked-group-by">Agrupar por</label>
        <select id="blocked-group-by">
          <option value="none">Lista plana</option>
          <option value="keyword">Palavra-chave</option>
        </select>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>Popup e extensão</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>Atalhos e notificações</h2>
        <div class="param-row">
          <label for="toggle-shortcuts">Ctrl+Enter salva (popup)</label>
          <button type="button" class="toggle" id="toggle-shortcuts" aria-pressed="true"></button>
        </div>
        <div class="param-row">
          <label for="badge-when-paused">Badge quando pausado</label>
          <select id="badge-when-paused">
            <option value="hide">Ocultar</option>
            <option value="showPaused">Mostrar &quot;OFF&quot;</option>
          </select>
        </div>
        <div class="param-row">
          <label for="toggle-notify-save">Notificação ao salvar</label>
          <button type="button" class="toggle" id="toggle-notify-save" aria-pressed="false"></button>
        </div>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>Dados e privacidade</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>Privacidade</h2>
        <div class="param-row">
          <label for="toggle-dont-store">Não guardar texto na lista bloqueados</label>
          <button type="button" class="toggle" id="toggle-dont-store" aria-pressed="false"></button>
        </div>
        <p class="hint">Só conta nas estatísticas; a lista não mostra trechos.</p>
      </div>
      <div class="params-section">
        <h2>Backup e restauro</h2>
        <button type="button" id="export-config">Exportar tudo (JSON)</button>
        <label for="import-config-file">Restaurar de arquivo</label>
        <input type="file" id="import-config-file" accept=".json" />
        <button type="button" id="import-config-btn" class="primary">Restaurar configuração</button>
      </div>
      <div class="params-section">
        <h2>Limpar dados</h2>
        <button type="button" id="restore-defaults">Restaurar parâmetros padrão</button>
        <button type="button" id="clear-all-data">Limpar todos os dados</button>
      </div>
      <div class="params-section">
        <h2>Estatísticas</h2>
        <ul class="stats-list" id="stats-list"></ul>
        <p class="stats-empty" id="stats-empty">Nenhum bloqueio registrado.</p>
      </div>
    </div>
  </details>
  <div class="actions">
    <button type="button" id="save-params" class="primary">Salvar parâmetros</button>
    <span class="feedback" id="feedback-params"></span>
  </div>
</section>`;

customElements.define(
  "params-panel",
  class ParamsPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = PARAMS_PANEL_HTML;
    }
  }
);
