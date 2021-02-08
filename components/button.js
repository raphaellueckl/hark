const template = document.createElement("template");
template.innerHTML = `
<style>
    :host {
        display: block;
        height: 30px;
        width: 80px;
    }

    button {
        border: 1px solid black;
        border-radius: 10px;
        width: inherit;
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

    this.button = this.shadowRoot.querySelector("button");
  }

  static get observedAttributes() {
    return ["disabled"];
  }

  addEventListener(event, func) {
    this.button.addEventListener(event, () => {
      if (!this.disabled) {
        func();
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "disabled") {
      if (newValue === "") {
        this.disabled = true;
        this.button.setAttribute(name, newValue);
      } else {
        this.disabled = false;
        this.button.removeAttribute(name);
      }
    }
  }
}

customElements.define("hk-button", Button);
