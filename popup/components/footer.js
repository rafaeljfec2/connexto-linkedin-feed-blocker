customElements.define(
  "extension-footer",
  class ExtensionFooter extends HTMLElement {
    connectedCallback() {
      if (this.hasChildNodes()) return;
      this.innerHTML = `
    <footer class="footer">
      Desenvolvido por
      <a
        href="https://github.com/rafaeljfec2"
        target="_blank"
        rel="noopener noreferrer"
        >rafaeljfec2</a
      >
    </footer>`;
    }
  }
);
