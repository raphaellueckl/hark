const template = document.createElement("template");
template.innerHTML = `
<style>
    input {
        border: 1px solid black;
        border-radius: 3px;
        padding: 5px;
    }
</style>
<input />
`;

class Input extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.input = this.shadowRoot.querySelector("input");
  }

  static get observedAttributes() {
    return ["placeholder", "value"];
  }

  get value() {
    return this.input.value;
  }

  set value(newValue) {
    this.input.value = newValue;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "placeholder") {
      this.input.setAttribute(name, newValue);
    } else if (name === "value") {
      this.input.value = newValue;
    }
  }
}

customElements.define("hk-input", Input);
