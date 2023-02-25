const template = document.createElement("template");
template.innerHTML = `
<style>
    div {
        display: flex;
        flex-direction: column;
    }

    ::slotted(label) {
        margin-bottom: 2px;
    }

    input {
        border: 1px solid black;
        border-radius: 3px;
        padding: 5px;
        width: 138px;
        height: 16px;
    }

    span {
      display: block;
      overflow: hidden;
      transition: max-height 0.3s;
      color: #de071c;
      margin-top: 2px;
    }

    #warn {
      color: #eb7a34
    }
</style>
<div>
    <slot></slot>
    <input />
    <span id="validation"></span>
    <span id="warn"></span>
</div>
`;

class Input extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.input = this.shadowRoot.querySelector("input");
  }

  static get observedAttributes() {
    return [
      "placeholder",
      "value",
      "error-msg",
      "warn-msg",
      "invalid",
      "disabled",
    ];
  }

  get value() {
    return this.input.value;
  }

  set value(newValue) {
    this.input.value = newValue;
  }

  get disabled() {
    return this.input.disabled;
  }

  set disabled(isDisabled) {
    this.input.disabled = isDisabled;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "placeholder") {
      this.input.setAttribute(name, newValue);
    } else if (name === "value") {
      this.input.value = newValue;
    } else if (name === "error-msg") {
      this.shadowRoot.querySelector("#validation").textContent = newValue;
    } else if (name === "warn-msg") {
      this.shadowRoot.querySelector("#warn").textContent = newValue;
      this.shadowRoot.querySelector("#warn").style.maxHeight = "20px";
      setTimeout(() => {
        this.shadowRoot.querySelector("#warn").style.maxHeight = 0;
      }, 5000);
    } else if (name === "invalid") {
      if (newValue === "") {
        this.shadowRoot.querySelector("#validation").style.maxHeight = "20px";
      } else {
        this.shadowRoot.querySelector("#validation").style.maxHeight = 0;
      }
    } else if (name === "disabled") {
      this.input.disabled = newValue === "" ? true : false;
    }
  }

  connectedCallback() {
    this.input.addEventListener("change", (ev) => {
      this.dispatchEvent(
        new CustomEvent("hk-change", { detail: ev.target.value })
      );
    });
  }
}

customElements.define("hk-input", Input);
