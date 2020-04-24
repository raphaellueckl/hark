import { store } from "../../store.js";
import { resetUL } from "../../css-globals.js";
import { EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX } from "../../globals.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}
  
  li {
    display: flex;
    justify-content: space-between;
  }

  .remove-button-container{
    justify-content: flex-end;
  }
</style>
<ul>
  <!-- generated -->
</ul>`;

class FiatTransaction extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["transaction", "index"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "index") {
      this.indexOfAsset = +newValue;
    } else if (name === "transaction") {
      const asset = JSON.parse(newValue);
      const ul = this.shadowRoot.querySelector("ul");
      ul.innerText = "";
      Object.keys(asset).forEach((property) => {
        const li = document.createElement("li");
        li.innerHTML = `<label for="${this.indexOfAsset}">${property}:</label><input id="${this.indexOfAsset}" value="${asset[property]}" disabled>`;
        ul.appendChild(li);
      });
      const li = document.createElement("li");
      li.classList.add("remove-button-container");
      const button = document.createElement("button");
      button.textContent = "remove";
      button.addEventListener("click", (e) => {
        store.dispatchEvent(
          new CustomEvent(EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX, {
            detail: this.indexOfAsset,
          })
        );
      });
      li.appendChild(button);
      ul.appendChild(li);
    }
  }
}

customElements.define("hk-fiat-transaction", FiatTransaction);
