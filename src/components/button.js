const template = document.createElement("template");
template.innerHTML = `
<style>
    :host {
        display: block;
        height: 30px;
    }

    button {
        border: 1px solid black;
        border-radius: 10px;
        width: 80px;
        height: inherit;
        background-color: rgba(33, 33, 33, 0.2);
    }
</style>
<button>
    <slot></slot>
</button>
`;

class Button extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("hk-button", Button);
