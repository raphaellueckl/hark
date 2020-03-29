import { store } from "../store.js";
import { resetUL } from "../css-globals.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}

  .menu-container {
    display: flex;
    flex-direction: column;
  }

  li {
    display: flex;
    justify-content: space-between;
  }

  .add-button-container{
    justify-content: flex-end;
  }
</style>
<ul class="menu-container">
  <li>
    <label for="asset">Asset:</label><input id="asset">
  </li>
  <li>
    <label for="symbol">Symbol:</label><input id="symbol">
  </li>
  <li>
    <label for="category">Category:</label><input id="category">
  </li>
  <li>
    <label for="amount">Amount:</label><input id="amount">
  </li>
  <li class="add-button-container">
    <button>Add</button>
  </li>
</ul>`;

class AddAsset extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector("button");
    this.assetInput = this.shadowRoot.querySelector("#asset");
    this.symbolInput = this.shadowRoot.querySelector("#symbol");
    this.categoryInput = this.shadowRoot.querySelector("#category");
    this.amountInput = this.shadowRoot.querySelector("#amount");

    button.addEventListener("click", () => {
      const updateAsset = {
        symbol: this.symbolInput.value,
        asset: this.assetInput.value,
        category: this.categoryInput.value,
        amount: this.amountInput.value
      };

      store.dispatchEvent(
        new CustomEvent("updateasset", { detail: updateAsset })
      );
      this._clearInputs();
    });
  }

  _clearInputs() {
    this.assetInput.value = "";
    this.symbolInput.value = "";
    this.categoryInput.value = "";
    this.amountInput.value = "";
  }
}

customElements.define("hk-add-asset", AddAsset);
