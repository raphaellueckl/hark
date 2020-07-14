import { store } from "../../store.js";
import { resetUL, ITEM_BACKGROUND } from "../../css-globals.js";
import {
  EVENT_ADD_ASSET,
  CATEGORY_STOCK,
  CATEGORY_CRYPTO,
  CATEGORY_RESOURCE,
  CATEGORY_CURRENCY,
  VALIDATION_REQUIRED,
  VALIDATION_INVALID_NUMBER,
} from "../../globals.js";
import { priceFetcher } from "../../data/price-fetcher.js";

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
    <label class="input-label" for="asset">Asset:</label><hk-input id="asset" placeholder="E.g. Google" invalid />
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
    <label class="input-label" for="symbol">Symbol:</label><hk-input id="symbol" placeholder="E.g. GOOGL" invalid />
  </li>
  <li>
    <label class="input-label" for="amount">Amount:</label><hk-input id="amount" placeholder="E.g. 5.5" invalid />
  </li>
  <li class="add-button-container">
    <hk-button disabled>Add</hk-button>
  </li>
</ul>`;

class AddAsset extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.assetInput = this.shadowRoot.querySelector("#asset");
    this.symbolInput = this.shadowRoot.querySelector("#symbol");
    this.categoryInput = this.shadowRoot.querySelector("#category");
    this.amountInput = this.shadowRoot.querySelector("#amount");

    this.addButton = this.shadowRoot.querySelector("hk-button");

    this.inputsToValidate = [
      this.assetInput,
      this.symbolInput,
      this.amountInput,
    ];

    this.assetInput.addEventListener("blur", (ev) => {
      this._setAssetInputValidationState();
    });
    this.assetInput.addEventListener("input", (ev) => {
      this._setAssetInputValidationState();
    });

    this.symbolInput.addEventListener("blur", (ev) => {
      this._setSymbolInputValidationState(true);
    });
    this.symbolInput.addEventListener("input", (ev) => {
      this._setSymbolInputValidationState();
    });

    this.amountInput.addEventListener("blur", (ev) => {
      this._setAmountInputValidationState();
    });
    this.amountInput.addEventListener("input", (ev) => {
      this._setAmountInputValidationState();
    });

    this.addButton.addEventListener("click", () => {
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

  _setAmountInputValidationState() {
    if (this.amountInput.value === "") {
      this._invalidate(this.amountInput, VALIDATION_REQUIRED);
    } else if (isNaN(this.amountInput.value)) {
      this._invalidate(this.amountInput, VALIDATION_INVALID_NUMBER);
    } else {
      this._validate(this.amountInput);
    }
  }

  async _setSymbolInputValidationState(validateSymbol) {
    if (validateSymbol) {
      const symbolExists = await priceFetcher.testAssetByCategory(
        this.symbolInput.value,
        this.categoryInput.value
      );
      if (!symbolExists) {
        this._invalidate(this.symbolInput, "Invalid Symbol!");
        return;
      }
    }

    if (this.symbolInput.value === "") {
      this._invalidate(this.symbolInput, VALIDATION_REQUIRED);
    } else {
      this._validate(this.symbolInput);
    }
  }

  _setAssetInputValidationState() {
    if (this.assetInput.value === "") {
      this._invalidate(this.assetInput, VALIDATION_REQUIRED);
    } else {
      this._validate(this.assetInput);
    }
  }

  _invalidate(input, msg) {
    input.setAttribute("error-msg", msg);
    input.setAttribute("invalid", "");
    this.addButton.setAttribute("disabled", "");
  }

  _validate(input) {
    input.removeAttribute("invalid");
    for (let input of this.inputsToValidate) {
      if (input.getAttribute("invalid") !== null) return;
    }
    this.addButton.removeAttribute("disabled");
  }

  _clearInputs() {
    this.addButton.setAttribute("disabled", "");
    this.assetInput.value = "";
    this.symbolInput.value = "";
    this.categoryInput.value = CATEGORY_STOCK;
    this.amountInput.value = "";
  }
}

customElements.define("hk-add-asset", AddAsset);
