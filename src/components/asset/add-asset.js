import { store } from "../../store.js";
import { resetUL, ITEM_BACKGROUND } from "../../css-globals.js";
import {
  EVENT_ADD_ASSET,
  CATEGORY_STOCK,
  CATEGORY_CRYPTO,
  CATEGORY_RESOURCE,
  CATEGORY_CURRENCY,
} from "../../globals.js";

import "../input.js";
import "../button.js";

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

    background-color: ${ITEM_BACKGROUND};
    border-radius: 15px;
    padding: 20px;
    margin: 20px;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin: 5px 0;
  }

  .input-label {
    margin-right: 5px;
  }

  .add-button-container{
    justify-content: flex-end;
  }

  select {
    width: 150px;
    height: 28px;
    padding: 5px;
    border: 1px solid black;
  }
</style>

<ul class="menu-container">
  <li>
    <label class="input-label" for="asset">Asset:</label><hk-input id="asset" placeholder="E.g. Google" error-msg="hallo" invalid />
  </li>
  <li>
    <label class="input-label" for="symbol">Symbol:</label><hk-input id="symbol" placeholder="E.g. GOOGL" />
  </li>
  <li>
    <label class="input-label" for="category">Category:</label>
    <select id="category">
      <option value="${CATEGORY_STOCK}">Stock</option>
      <option value="${CATEGORY_CRYPTO}">Crypto</option>
      <option value="${CATEGORY_RESOURCE}">Resource</option>
      <option value="${CATEGORY_CURRENCY}">Currency</option>
</select>
  </li>
  <li>
    <label class="input-label" for="amount">Amount:</label><hk-input id="amount" placeholder="E.g. 5.5" />
  </li>
  <li class="add-button-container">
    <hk-button>Add</hk-button>
  </li>
</ul>`;

class AddAsset extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector("hk-button");
    this.assetInput = this.shadowRoot.querySelector("#asset");
    this.symbolInput = this.shadowRoot.querySelector("#symbol");
    this.categoryInput = this.shadowRoot.querySelector("#category");
    this.amountInput = this.shadowRoot.querySelector("#amount");

    const requiredInputs = [
      this.assetInput,
      this.symbolInput,
      this.categoryInput,
      this.amountInput,
    ];

    button.addEventListener("click", () => {
      let validationErrors = false;
      for (let input of requiredInputs) {
        if (!input.value) {
          input.setAttribute("error-msg", "Required filed");
          input.setAttribute("invalid", "");
          validationErrors = true;
        } else {
          input.removeAttribute("invalid");
        }
      }
      if (validationErrors) return;

      const addAsset = {
        symbol: this.symbolInput.value,
        asset: this.assetInput.value,
        category: this.categoryInput.value,
        amount: this.amountInput.value,
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
