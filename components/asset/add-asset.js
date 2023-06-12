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
    <label class="input-label" for="amount">Amount:</label><hk-input id="amount" placeholder="E.g. 5.5" type="number" invalid />
  </li>
  <li>
    <label class="input-label" for="should-custom-value">Fixed Value:</label><input type="checkbox" id="should-custom-value"/>
  </li>
  <li id="custom-value-section" style="display:none">
    <label class="input-label" for="custom-value">Value:</label><hk-input id="custom-value" placeholder="E.g. 4500" type="number" />
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
    this.shouldCustomValueInput = this.shadowRoot.querySelector(
      "#should-custom-value"
    );
    this.customValueInput = this.shadowRoot.querySelector("#custom-value");
    this.customValueSection = this.shadowRoot.querySelector(
      "#custom-value-section"
    );

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
      this._setNumberInputValidationState(this.amountInput);
    });
    this.amountInput.addEventListener("input", (ev) => {
      this._setNumberInputValidationState(this.amountInput);
    });

    this.customValueInput.addEventListener("blur", (ev) => {
      this._setNumberInputValidationState(this.customValueInput);
    });
    this.customValueInput.addEventListener("input", (ev) => {
      this._setNumberInputValidationState(this.customValueInput);
      this._setSymbolInputValidationState(true);
    });

    this.shouldCustomValueInput.addEventListener("change", (ev) => {
      if (this.shouldCustomValueInput.checked) {
        this.customValueSection.style.display = "flex";
      } else {
        this.customValueSection.style.display = "none";
        this.customValueInput.removeAttribute("invalid");
      }
      this.customValueInput.value = "";
    });

    this.addButton.addEventListener("click", () => {
      const addAsset = {
        symbol: this.symbolInput.value,
        asset: this.assetInput.value,
        category: this.categoryInput.value,
        amount: this.amountInput.value,
        fixedValue: this.customValueInput.value,
      };

      store.dispatchEvent(
        new CustomEvent(EVENT_ADD_ASSET, { detail: addAsset })
      );
      this._clearInputs();
    });
  }

  _setNumberInputValidationState(input) {
    if (input.value === "") {
      this._invalidate(input, VALIDATION_REQUIRED);
    } else if (isNaN(input.value)) {
      this._invalidate(input, VALIDATION_INVALID_NUMBER);
    } else {
      this._validate(input);
    }
  }

  async _setSymbolInputValidationState(validateSymbol) {
    if (this.symbolInput.value === "") {
      this._invalidate(this.symbolInput, VALIDATION_REQUIRED);
    }
    // If customValue has been set, it does not matter if a price could be found.
    else if (validateSymbol && !this.customValueInput.value) {
      const symbolExists = await priceFetcher.testAssetByCategory(
        this.symbolInput.value,
        this.categoryInput.value
      );
      if (!symbolExists) {
        this._invalidate(this.symbolInput, "Invalid Symbol!");
        return;
      }
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
    this.addButton.setAttribute("flair", "danger");
  }

  _validate(input) {
    input.removeAttribute("invalid");
    for (let input of this.inputsToValidate) {
      if (input.getAttribute("invalid") !== null) return;
    }
    this.addButton.removeAttribute("disabled");
    this.addButton.setAttribute("flair", "nice");
  }

  _clearInputs() {
    this.addButton.setAttribute("disabled", "");
    this.addButton.setAttribute("flair", "");
    this.assetInput.value = "";
    this.symbolInput.value = "";
    this.categoryInput.value = CATEGORY_STOCK;
    this.amountInput.value = "";
    this.customValueInput.value = "";
  }
}

customElements.define("hk-add-asset", AddAsset);
