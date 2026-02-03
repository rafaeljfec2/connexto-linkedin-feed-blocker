import { t } from "../i18n.js";

function getParamsPanelHTML() {
  const phAuthor = t("placeholderAuthorNames").replaceAll("\n", "&#10;");
  const phPaste = t("placeholderPasteAndAdd").replaceAll('"', "&quot;");
  return `
<section id="panel-params" class="panel params-panel" role="tabpanel">
  <details class="params-group" open>
    <summary>${t("summaryBlocking")}</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>${t("sectionBehavior")}</h2>
        <div class="param-row">
          <label for="toggle-paused">${t("labelPauseBlocking")}</label>
          <button type="button" class="toggle" id="toggle-paused" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-whitelist">${t("labelWhitelistMode")}</label>
          <button type="button" class="toggle" id="toggle-whitelist" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-regex">${t("labelUseRegex")}</label>
          <button type="button" class="toggle" id="toggle-regex" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-collapse">${t(
            "labelCollapseInsteadOfHide"
          )}</label>
          <button type="button" class="toggle" id="toggle-collapse" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-notification">${t("labelNotificationOnly")}</label>
          <button type="button" class="toggle" id="toggle-notification" aria-pressed="false"></button>
        </div>
      </div>
      <div class="params-section">
        <h2>${t("sectionBlockByAuthor")}</h2>
        <label for="blocked-authors">${t("labelNamesOnePerLine")}</label>
        <textarea id="blocked-authors" placeholder="${phAuthor}"></textarea>
      </div>
      <div class="params-section">
        <h2>${t("sectionPriority")}</h2>
        <label for="rule-priority">${t("labelWhenAuthorAndWordMatch")}</label>
        <select id="rule-priority">
          <option value="keywordFirst">${t("optionKeywordFirst")}</option>
          <option value="authorFirst">${t("optionAuthorFirst")}</option>
        </select>
      </div>
      <div class="params-section">
        <h2>${t("sectionTime")}</h2>
        <div class="param-row">
          <label for="toggle-time-filter">${t("labelTimeFilter")}</label>
          <button type="button" class="toggle" id="toggle-time-filter" aria-pressed="false"></button>
        </div>
        <p class="hint">${t("hintTimeFilter")}</p>
        <div class="param-row">
          <label for="time-filter-start">${t("labelTimeFrom")}</label>
          <input type="time" id="time-filter-start" value="09:00" />
        </div>
        <div class="param-row">
          <label for="time-filter-end">${t("labelTimeTo")}</label>
          <input type="time" id="time-filter-end" value="18:00" />
        </div>
      </div>
      <div class="params-section">
        <h2>${t("sectionLimits")}</h2>
        <div class="param-row">
          <label for="toggle-limit-keyword">${t("labelLimitPerKeyword")}</label>
          <button type="button" class="toggle" id="toggle-limit-keyword" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="limit-keyword-max">${t(
            "labelMaxBlocksPerKeyword"
          )}</label>
          <input type="number" id="limit-keyword-max" min="1" max="999" value="10" />
        </div>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>${t("summaryKeywords")}</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>${t("sectionImportExport")}</h2>
        <button type="button" id="export-keywords">${t(
          "btnExportKeywords"
        )}</button>
        <label for="import-keywords">${t("labelPasteToImport")}</label>
        <textarea id="import-keywords" placeholder="${phPaste}"></textarea>
        <div class="actions">
          <button type="button" id="import-add" class="primary">${t(
            "btnAddToKeywords"
          )}</button>
        </div>
      </div>
      <div class="params-section">
        <h2>${t("sectionSuggestions")}</h2>
        <p class="hint">${t("hintClickToAdd")}</p>
        <div class="suggestions" id="suggestions"></div>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>${t("summaryInterfaceFeed")}</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>${t("sectionFeedUndo")}</h2>
        <div class="param-row">
          <label for="toggle-feed-counter">${t("labelFeedCounter")}</label>
          <button type="button" class="toggle" id="toggle-feed-counter" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="toggle-undo">${t("labelUndoButton")}</label>
          <button type="button" class="toggle" id="toggle-undo" aria-pressed="false"></button>
        </div>
        <div class="param-row">
          <label for="undo-duration">${t("labelUndoDuration")}</label>
          <input type="number" id="undo-duration" min="1" max="60" value="5" />
        </div>
        <div class="param-row">
          <label for="toggle-tooltip">${t("labelTooltipCollapsed")}</label>
          <button type="button" class="toggle" id="toggle-tooltip" aria-pressed="false"></button>
        </div>
      </div>
      <div class="params-section">
        <h2>${t("postsBlockedCount")}</h2>
        <label for="blocked-group-by">${t("labelGroupBy")}</label>
        <select id="blocked-group-by">
          <option value="none">${t("optionGroupFlatList")}</option>
          <option value="keyword">${t("optionGroupKeyword")}</option>
        </select>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>${t("summaryPopupExt")}</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>${t("sectionShortcutsNotify")}</h2>
        <div class="param-row">
          <label for="toggle-shortcuts">${t("labelCtrlEnterSave")}</label>
          <button type="button" class="toggle" id="toggle-shortcuts" aria-pressed="true"></button>
        </div>
        <div class="param-row">
          <label for="badge-when-paused">${t("labelBadgeWhenPaused")}</label>
          <select id="badge-when-paused">
            <option value="hide">${t("optionBadgeHide")}</option>
            <option value="showPaused">${t("optionBadgeShow")}</option>
          </select>
        </div>
        <div class="param-row">
          <label for="toggle-notify-save">${t("labelNotifyOnSave")}</label>
          <button type="button" class="toggle" id="toggle-notify-save" aria-pressed="false"></button>
        </div>
      </div>
    </div>
  </details>
  <details class="params-group">
    <summary>${t("summaryDataPrivacy")}</summary>
    <div class="params-group-content">
      <div class="params-section">
        <h2>${t("sectionPrivacy")}</h2>
        <div class="param-row">
          <label for="toggle-dont-store">${t("labelDontStoreSnippet")}</label>
          <button type="button" class="toggle" id="toggle-dont-store" aria-pressed="false"></button>
        </div>
        <p class="hint">${t("hintPrivacyNoSnippets")}</p>
      </div>
      <div class="params-section">
        <h2>${t("sectionBackupRestore")}</h2>
        <button type="button" id="export-config">${t("btnExportAll")}</button>
        <label for="import-config-file">${t("labelRestoreFromFile")}</label>
        <input type="file" id="import-config-file" accept=".json" />
        <button type="button" id="import-config-btn" class="primary">${t(
          "btnImportConfigRestore"
        )}</button>
      </div>
      <div class="params-section">
        <h2>${t("sectionClearData")}</h2>
        <button type="button" id="restore-defaults">${t(
          "btnRestoreDefaults"
        )}</button>
        <button type="button" id="clear-all-data">${t(
          "btnClearAllData"
        )}</button>
      </div>
      <div class="params-section">
        <h2>${t("sectionStats")}</h2>
        <ul class="stats-list" id="stats-list"></ul>
        <p class="stats-empty" id="stats-empty">${t("statsEmpty")}</p>
      </div>
    </div>
  </details>
  <div class="actions">
    <button type="button" id="save-params" class="primary">${t(
      "btnSaveParams"
    )}</button>
    <span class="feedback" id="feedback-params"></span>
  </div>
</section>`;
}

customElements.define(
  "params-panel",
  class ParamsPanel extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = getParamsPanelHTML();
    }
  }
);
