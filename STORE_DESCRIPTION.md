# Chrome Web Store — Listing Copy

Use the content below when submitting the extension to the Chrome Web Store. Replace placeholders if needed (e.g. support URL).

---

## Short description (max 132 characters)

**English:**  
Filter your LinkedIn feed by keywords and authors. Hide or collapse matching posts. All settings and data stay on your device.

**Character count:** 99

---

**Portuguese (pt_BR):**  
Filtre o feed do LinkedIn por palavras e autores. Oculte ou recolha posts que correspondem. Tudo fica no seu dispositivo.

**Character count:** 98

---

## Long description

**English**

LinkedIn Feed Blocker lets you filter posts on the LinkedIn feed (https://www.linkedin.com/feed/) by keywords and by author.

**What it does:**

- You define a list of keywords (one per line). Posts that contain any of these words can be hidden, collapsed with a short message, or only marked with a border.
- You can optionally block posts from specific authors (by name or identifier).
- You can use plain text or regular expressions for keyword matching.
- You can switch to whitelist mode so that only posts containing at least one of your keywords are shown.
- Optional features: time-based filter, limit how many posts per keyword are blocked, undo recent blocks, dashboard with session stats, export/import of keywords and blocked list.

**How it works:**

- The extension runs only on the LinkedIn feed page. It reads the visible feed, applies your rules locally, and hides or collapses matching posts. No data is sent to any server. Your keywords, blocked authors, and settings are stored only in Chrome storage on your device (sync storage for settings, local storage for session data like the list of blocked posts).

**Requirements:**

- Chrome (Manifest V3). The extension needs access to the LinkedIn feed URL to apply filters there, and uses Chrome storage to save your preferences.

---

**Portuguese (pt_BR)**

O LinkedIn Feed Blocker permite filtrar posts do feed do LinkedIn (https://www.linkedin.com/feed/) por palavras-chave e por autor.

**O que faz:**

- Você define uma lista de palavras-chave (uma por linha). Posts que contêm alguma dessas palavras podem ser ocultados, recolhidos com uma mensagem curta ou apenas marcados com uma borda.
- Você pode opcionalmente bloquear posts de autores específicos (por nome ou identificador).
- É possível usar texto simples ou expressões regulares nas palavras-chave.
- Há modo lista branca: apenas posts que contêm pelo menos uma das suas palavras são exibidos.
- Recursos opcionais: filtro por horário, limite de bloqueios por palavra-chave, desfazer bloqueios recentes, dashboard com estatísticas da sessão, exportar/importar palavras e lista de bloqueados.

**Funcionamento:**

- A extensão atua apenas na página do feed do LinkedIn. Ela lê o feed visível, aplica suas regras localmente e oculta ou recolhe os posts correspondentes. Nenhum dado é enviado a servidores. Suas palavras-chave, autores bloqueados e configurações ficam apenas no armazenamento do Chrome no seu dispositivo (storage sync para configurações, local para dados da sessão).

**Requisitos:**

- Chrome (Manifest V3). A extensão precisa de acesso à URL do feed do LinkedIn para aplicar os filtros e usa o armazenamento do Chrome para salvar suas preferências.

---

## Single-language short description (if only one locale)

If you submit with a single language, you can use:

**EN:**  
Filter your LinkedIn feed by keywords and authors. Hide or collapse matching posts. All settings and data stay on your device.

**PT-BR:**  
Filtre o feed do LinkedIn por palavras e autores. Oculte ou recolha posts que correspondem. Tudo fica no seu dispositivo.

---

## Chrome Web Store submission checklist

Use this list before and during submission.

**Manifest & permissions**

- [ ] Manifest V3 (`manifest_version: 3`)
- [ ] `permissions`: only `["storage"]`
- [ ] `host_permissions`: only `["https://www.linkedin.com/feed/*"]`
- [ ] No `tabs`, `notifications`, `<all_urls>`, or unnecessary permissions

**Code**

- [ ] No `eval`, `new Function`, or remote code execution
- [ ] No `fetch`/XHR to external domains; all processing local
- [ ] Data only in `chrome.storage` (sync/local); nothing sent to servers
- [ ] No unnecessary logging of user data

**Privacy**

- [ ] PRIVACY.md (or PRIVACY_POLICY.md) states: no personal data collected, all processing local, no sharing
- [ ] Store listing links to or summarizes the same commitments
- [ ] No promises of “anonymity” or “total security”; only factual statements

**Listing**

- [ ] Short description matches what the extension does (filter by keywords/authors, local only)
- [ ] Long description describes behavior accurately, no exaggerated claims
- [ ] Screenshots/icons reflect the actual extension

**Compliance**

- [ ] Description matches code (no features described that don’t exist)
- [ ] Permissions match code (no unused permissions)
- [ ] No user data processed in a way that would violate LGPD/GDPR (no collection, no transfer; local-only handling)

**After upload**

- [ ] Test the packaged extension (load unpacked or install from store draft)
- [ ] Confirm popup, content script on feed, and storage work as expected
