# LinkedIn Feed Blocker

Extensão para Chrome (Manifest V3) que oculta posts do feed do LinkedIn quando contêm palavras ou frases definidas pelo usuário. Funciona apenas em `https://www.linkedin.com/feed/*`.

## Estrutura do projeto

```
connexto-linkedin-feed-blocker/
├── manifest.json           # Manifest da extensão (MV3)
├── background.js           # Service worker: badge com contagem de bloqueados
├── _locales/               # Internacionalização (pt-BR, es, en)
│   ├── pt_BR/
│   │   └── messages.json
│   ├── es/
│   │   └── messages.json
│   └── en/
│       └── messages.json
├── popup/
│   ├── popup.html          # Shell do popup (custom elements)
│   ├── popup.css           # Estilos do popup
│   ├── main.js             # Ponto de entrada e orquestração
│   ├── i18n.js             # Helper de tradução (chrome.i18n)
│   ├── dom.js              # Referências aos elementos do DOM
│   ├── tabs.js             # Navegação entre abas
│   ├── constants.js        # Constantes do popup
│   ├── utils.js            # Utilitários (feedback, parse, etc.)
│   ├── keywords.js         # Palavras-chave: salvar, exportar, importar
│   ├── blocked.js          # Lista de posts bloqueados
│   ├── params.js           # Parâmetros: carregar, salvar, bind, backup
│   ├── dashboard.js        # Renderização do dashboard (gráficos em CSS)
│   ├── insights.js         # Renderização da aba Insights
│   └── components/         # Web Components (painéis e navegação)
│       ├── header.js
│       ├── footer.js
│       ├── tabs.js         # Tab nav (Dashboard, Palavras-chave, etc.)
│       ├── dashboard-panel.js
│       ├── keywords-panel.js
│       ├── blocked-panel.js
│       ├── params-panel.js
│       └── insights-panel.js
├── content/
│   ├── constants.js        # Constantes (seletor, debounce, defaults)
│   └── content.js          # Observador do feed e lógica de bloqueio
├── assets/                 # Ícones da extensão
├── scripts/
│   ├── load-in-chrome.sh   # Abre extensões e exibe caminho (Linux/macOS)
│   └── load-in-chrome.bat  # O mesmo para Windows
├── docs/                   # Imagens do passo a passo de instalação
└── README.md
```

## Idiomas (internacionalização)

A extensão usa a API de mensagens do Chrome (`chrome.i18n`) e suporta:

- **pt_BR** (padrão) – Português do Brasil
- **es** – Español
- **en** – English (US)

O idioma exibido segue o idioma da interface do Chrome. Os arquivos de tradução ficam em `_locales/<locale>/messages.json`.

## Instalador / distribuição

O Chrome não oferece instalador tradicional (ex.: .exe/.msi) para extensões. Você tem duas opções:

- **Chrome Web Store (instalação em um clique)**  
  Empacote a extensão em um zip e [publique na Chrome Web Store](https://developer.chrome.com/docs/webstore/publish). Os usuários instalam com "Adicionar ao Chrome" na página da loja. Há uma taxa única de registro.

- **Modo desenvolvedor (descompactado)**  
  Carregue a pasta do projeto como extensão descompactada. Siga as instruções abaixo para o seu sistema.

### Instruções de instalação (Linux, Windows, macOS)

Depois dos passos do seu sistema, faça no Chrome:

1. Ative o **Modo do desenvolvedor** (alternador no canto superior direito da página de extensões).

   ![Página Extensões do Chrome com o alternador Modo do desenvolvedor](docs/extensoes-modo-desenvolvedor.png)

2. Clique em **Carregar sem compactação** (o botão aparece com o Modo do desenvolvedor ativado).

   ![Botões Carregar sem compactação, Compactar extensão e Atualizar na página de extensões](docs/extensoes-carregar-sem-compactacao.png)

3. Selecione a pasta da extensão (a que contém o `manifest.json`).
4. A extensão aparecerá na barra de ferramentas e na lista de extensões (ícone de quebra-cabeça).

   ![LinkedIn Feed Blocker instalado na lista de extensões do Chrome](docs/extensao-instalada.png)

#### Linux

1. Abra um terminal e vá até a pasta do projeto:  
   `cd /caminho/para/connexto-linkedin-feed-blocker`
2. Torne o script executável (uma vez):  
   `chmod +x scripts/load-in-chrome.sh`
3. Execute:  
   `./scripts/load-in-chrome.sh`
4. O script exibe o caminho completo da pasta da extensão e tenta abrir o Chrome em `chrome://extensions`. Se o Chrome não abrir, acesse `chrome://extensions` manualmente.
5. Siga os passos do Chrome acima (Modo do desenvolvedor → Carregar sem compactação → selecione o caminho da pasta exibido pelo script).

#### Windows

1. Abra o Explorador de Arquivos e vá até a pasta do projeto (onde está o `manifest.json`).
2. Dê um duplo clique em `scripts\load-in-chrome.bat`, ou abra o Prompt de Comando / PowerShell nessa pasta e execute:  
   `scripts\load-in-chrome.bat`
3. O script exibe o caminho completo da pasta da extensão e abre o Chrome em `chrome://extensions`.
4. Siga os passos do Chrome acima (Modo do desenvolvedor → Carregar sem compactação → selecione o caminho da pasta exibido na janela do script).
5. Feche a janela do script quando terminar (pressione qualquer tecla se aparecer "Pressione qualquer tecla para continuar").

#### macOS

1. Abra o Terminal (Aplicativos → Utilitários → Terminal, ou pressione Cmd+Espaço e digite "Terminal").
2. Vá até a pasta do projeto:  
   `cd /caminho/para/connexto-linkedin-feed-blocker`
3. Torne o script executável (uma vez):  
   `chmod +x scripts/load-in-chrome.sh`
4. Execute:  
   `./scripts/load-in-chrome.sh`
5. O script exibe o caminho completo da pasta da extensão e tenta abrir o Chrome em `chrome://extensions`. Se o Chrome não abrir, acesse `chrome://extensions` manualmente no Chrome.
6. Siga os passos do Chrome acima (Modo do desenvolvedor → Carregar sem compactação → selecione o caminho da pasta exibido pelo script).

## Como utilizar

1. Acesse o [Feed do LinkedIn](https://www.linkedin.com/feed/).
2. Clique no ícone da extensão na barra de ferramentas do Chrome para abrir o popup (ou use o atalho **Ctrl+Shift+B** / **Cmd+Shift+B** no Mac).
3. **Dashboard (primeira aba):** resumo da sessão (posts vistos vs. ocultados), bloqueios nos últimos 7 dias, top palavras bloqueadas, categoria que mais recebeu e autor que mais apareceu no feed.
4. **Palavras-chave:** digite uma palavra ou frase por linha e clique em **Salvar**. O feed recarrega e os posts que contêm alguma palavra são ocultados.
5. **Bloqueados:** lista os últimos posts ocultados e a palavra que casou; filtro, agrupamento, exportar (JSON) e limpar lista.
6. **Insights:** métricas do feed (sessão, bloqueios, categoria que mais recebeu, autor que mais apareceu), atualizadas conforme você rola o feed.
7. **Parâmetros (última aba):** configurações; alterações são salvas automaticamente (não é preciso clicar em Salvar). Inclui:
   - **Bloqueio:** pausar bloqueio, modo lista branca, usar regex, colapsar em vez de esconder (mostra a mensagem _Conteúdo bloqueado pelo usuário através do LinkedIn Feed Blocker (Ocultado por: X)_ e botão **Expandir**), só notificação (borda laranja sem esconder), bloquear por autor, prioridade (palavra vs. autor), horário e limites.
   - **Palavras-chave:** importar/exportar e sugestões.
   - **Interface no feed:** contador de ocultados, botão Desfazer, tooltip em post colapsado, agrupar lista bloqueados.
   - **Popup e extensão:** atalho Ctrl+Enter, badge quando pausado, notificação ao salvar.
   - **Dados e privacidade:** não guardar trecho na lista, backup/restaurar e limpar dados.
8. O ícone da extensão exibe um badge com a quantidade de posts bloqueados na lista atual.

## Como atualizar a extensão

Depois de alterar o código (popup, content script, manifest etc.):

1. Abra **chrome://extensions** no Chrome.
2. Localize **LinkedIn Feed Blocker**.
3. Clique no ícone **Atualizar** (seta circular) no card da extensão.

O Chrome recarrega a extensão e as mudanças passam a valer. Se o feed do LinkedIn já estiver aberto, recarregue a página (F5) para o content script ser injetado de novo.

## Requisitos

- Google Chrome compatível com Manifest V3.
- Sem backend, frameworks ou bibliotecas externas; usa apenas APIs do Chrome e o DOM.

## Desenvolvido por

[rafaeljfec2](https://github.com/rafaeljfec2)
