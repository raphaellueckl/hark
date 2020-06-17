import { store } from "../../store.js";
import { resetUL, ITEM_BACKGROUND } from "../../css-globals.js";
import {
  EVENT_ADD_FIAT_TRANSACTION,
  TYPE_DEPOSIT,
  TYPE_WITHDRAW,
  isValidIsoDateString,
  VALIDATION_REQUIRED,
  VALIDATION_INVALID_NUMBER,
} from "../../globals.js";
import { databaseConnector } from "../../data/database-connector.js";

import "../input.js";
import "../button.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}

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

  .type-container {
    display: flex;
    flex-direction: column;
    width: 150px;
  }
</style>
<ul class="menu-container">
  <li>
    <label class="input-label" for="amount">Amount:</label>
    <hk-input id="amount" placeholder="E.g. 10.5" invalid />
  </li>
  <li>
    <label class="input-label" for="date">Date:</label>
    <hk-input id="date" placeholder="yyyy-mm-dd" invalid />
  </li>
  <li>
    <label class="input-label" for="exchange">Exchange:</label>
    <hk-input id="exchange" placeholder="E.g. Kraken" invalid />
  </li>
  <li>
    <label class="input-label" for="symbol">Currency:</label>
    <hk-input id="symbol" placeholder="E.g. USD" />
  </li>
  <li>
    <label>Type:</label>
    <div class="type-container">
      <div>
      <input name="type" id="deposit" type="radio" value="${TYPE_DEPOSIT}">
        <label class="input-label" for="deposit">Deposit</label>
      </div>
      <div>
      <input name="type" id="withdrawal" type="radio" value="${TYPE_WITHDRAW}">
        <label class="input-label" for="withdrawal">Withdrawal</label>
      <div>
    </div>
  </li>
  <li class="add-button-container">
    <hk-button disabled>Add</hk-button>
  </li>
</ul>`;

class AddFiatTransaction extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.dateInput = this.shadowRoot.querySelector("#date");
    this.symbolInput = this.shadowRoot.querySelector("#symbol");
    this.amountInput = this.shadowRoot.querySelector("#amount");
    this.exchangeInput = this.shadowRoot.querySelector("#exchange");
    this.depositInput = this.shadowRoot.querySelector("#deposit");
    this.depositInput.checked = true;

    const mostUsedCurrency = databaseConnector.getMostUsedCurrency();
    this.symbolInput.value = mostUsedCurrency;
    if (!mostUsedCurrency) {
      this.symbolInput.setAttribute("invalid", "");
    }

    this.addButton = this.shadowRoot.querySelector("hk-button");

    this.inputsToValidate = [
      this.dateInput,
      this.symbolInput,
      this.amountInput,
      this.exchangeInput,
    ];

    this.dateInput.addEventListener("blur", (ev) => {
      if (this.dateInput.value === "") {
        this._invalidate(this.dateInput, VALIDATION_REQUIRED);
      } else if (!isValidIsoDateString(this.dateInput.value)) {
        this._invalidate(this.dateInput, "Invalid date format");
      } else {
        this._validate(this.dateInput);
      }
    });

    this.amountInput.addEventListener("blur", (ev) => {
      if (this.amountInput.value === "") {
        this._invalidate(this.amountInput, VALIDATION_REQUIRED);
      } else if (isNaN(this.amountInput.value)) {
        this._invalidate(this.amountInput, VALIDATION_INVALID_NUMBER);
      } else {
        this._validate(this.amountInput);
      }
    });

    this.exchangeInput.addEventListener("blur", (ev) => {
      if (this.exchangeInput.value === "") {
        this._invalidate(this.exchangeInput, VALIDATION_REQUIRED);
      } else {
        this._validate(this.exchangeInput);
      }
    });

    this.symbolInput.addEventListener("blur", (ev) => {
      if (this.symbolInput.value === "") {
        this._invalidate(this.symbolInput, VALIDATION_REQUIRED);
      } else {
        this._validate(this.symbolInput);
      }
    });

    this.addButton.addEventListener("click", () => {
      const type = [
        ...this.shadowRoot.querySelectorAll('input[name="type"]'),
      ].filter((r) => r.checked === true)[0].value;

      const addTransaction = {
        date: this.dateInput.value,
        symbol: this.symbolInput.value,
        amount: this.amountInput.value,
        exchange: this.exchangeInput.value,
        type,
      };
      store.dispatchEvent(
        new CustomEvent(EVENT_ADD_FIAT_TRANSACTION, {
          detail: addTransaction,
        })
      );
      this._clearInputs();
    });
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
    this.dateInput.value = "";
    this.symbolInput.value = databaseConnector.getMostUsedCurrency();
    this.amountInput.value = "";
    this.exchangeInput.value = "";
    this.depositInput.checked = true;
    this.inputsToValidate.forEach((input) => {
      if (!input.value) input.setAttribute("invalid", "");
    });
  }
}

customElements.define("hk-add-fiat-transaction", AddFiatTransaction);
