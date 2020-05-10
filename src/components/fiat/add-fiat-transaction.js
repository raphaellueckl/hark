import { store } from "../../store.js";
import { resetUL, ITEM_BACKGROUND } from "../../css-globals.js";
import {
  EVENT_ADD_FIAT_TRANSACTION,
  TYPE_DEPOSIT,
  TYPE_WITHDRAW,
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
    <hk-input id="amount" placeholder="E.g. 10.5" />
  </li>
  <li>
    <label class="input-label" for="date">Date:</label>
    <hk-input id="date" placeholder="yyyy-mm-dd" />
  </li>
  <li>
    <label class="input-label" for="exchange">Exchange:</label>
    <hk-input id="exchange" placeholder="E.g. Kraken" />
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
    <hk-button>Add</hk-button>
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

    this.symbolInput.value = databaseConnector.getMostUsedCurrency();

    const button = this.shadowRoot.querySelector("hk-button");

    const requiredInputs = [
      this.dateInput,
      this.symbolInput,
      this.amountInput,
      this.exchangeInput,
      this.depositInput,
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

  _clearInputs() {
    this.dateInput.value = "";
    this.symbolInput.value = databaseConnector.getMostUsedCurrency();
    this.amountInput.value = "";
    this.exchangeInput.value = "";
    this.depositInput.checked = true;
  }
}

customElements.define("hk-add-fiat-transaction", AddFiatTransaction);
