const template = document.createElement("template");
template.innerHTML = `
<style>
</style>
<nav class="menu-container">
    <a href="/#/">Home</a>
    <a href="/#/manage">Manage</a>
</nav>`;

class Navbar extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {}
}

customElements.define("hk-navbar", Navbar);
