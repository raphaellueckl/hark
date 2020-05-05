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

    button {
        border: 1px solid black;
        border-radius: 10px;
        width: 80px;
        height: 50px;
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
