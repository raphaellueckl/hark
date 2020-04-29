import { store } from "../store.js";
import { resetUL } from "../css-globals.js";
import {
  EVENT_ADD_ASSET,
  CATEGORY_STOCK,
  CATEGORY_CRYPTO,
  CATEGORY_RESOURCE
} from "../globals.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}

  :host {
    display: block;
  }

  .menu-container {
    display: flex;
    flex-direction: column;
    width: 250px;
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
    <label for="asset">Asset:</label><input id="asset" placeholder="E.g. Google">
  </li>
  <li>
    <label for="symbol">Symbol:</label><input id="symbol" placeholder="E.g. GOOGL">
  </li>
  <li>
    <label for="category">Category:</label>
    <select id="category">
      <option value="${CATEGORY_STOCK}">Stock</option>
      <option value="${CATEGORY_CRYPTO}">Crypto</option>
      <option value="${CATEGORY_RESOURCE}">Resource</option>
</select>
  </li>
  <li>
    <label for="amount">Amount:</label><input id="amount" placeholder="E.g. 5.5">
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
      const addAsset = {
        symbol: this.symbolInput.value,
        asset: this.assetInput.value,
        category: this.categoryInput.value,
        amount: this.amountInput.value
      };

      store.dispatchEvent(
        new CustomEvent(EVENT_ADD_ASSET, { detail: addAsset })
      );
      this._clearInputs();
    });
  }

  _clearInputs() {
    this.assetInput.value = "";
    this.symbolInput.value = "";
    this.categoryInput.value = CATEGORY_STOCK;
    this.amountInput.value = "";
  }
}

customElements.define("hk-add-asset", AddAsset);
