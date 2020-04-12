import { store } from "../store.js";
import { resetUL } from "../css-globals.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
    li {
        display: flex;
        justify-content: space-between;
    }

    .remove-button-container{
      justify-content: flex-end;
    }

    ${resetUL}
</style>
<ul>
    <!-- generated -->
</ul>`;

class Asset extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["asset", "index"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "index") {
      this.indexOfAsset = +newValue;
    } else if (name === "asset") {
      //   this.shadowRoot.querySelector("h2").textContent = newValue;
      const asset = JSON.parse(newValue);
      const ul = this.shadowRoot.querySelector("ul");
      ul.innerText = "";
      Object.keys(asset).forEach(property => {
        const li = document.createElement("li");
        li.innerHTML = `<label for="${this.indexOfAsset}">${property}:</label><input id="${this.indexOfAsset}" value="${asset[property]}">`;
        ul.appendChild(li);
      });
      const li = document.createElement("li");
      li.classList.add("remove-button-container");
      const button = document.createElement("button");
      button.textContent = "remov";
      button.addEventListener("click", e => {
        store.dispatchEvent(
          new CustomEvent("removeassetbyindex", { detail: this.indexOfAsset })
        );
      });
      li.appendChild(button);
      ul.appendChild(li);
    }
  }
}

customElements.define("hk-manage-asset-row", Asset);
