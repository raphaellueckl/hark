import { store } from "../../store.js";
import { resetUL } from "../../css-globals.js";
import {
  EVENT_ADD_FIAT_TRANSACTION,
  TYPE_DEPOSIT,
  TYPE_WITHDRAWAL,
} from "../../globals.js";
import { databaseConnector } from "../../data/database-connector.js";

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
    <label for="amount">Amount:</label>
    <input id="amount" placeholder="E.g. 10.5">
  </li>
  <li>
    <label for="date">Date:</label>
    <input id="date" placeholder="yyyy-mm-dd">
  </li>
  <li>
    <label for="exchange">Exchange:</label>
    <input id="exchange" placeholder="E.g. Kraken">
  </li>
  <li>
    <label for="symbol">Currency:</label>
    <input id="symbol" placeholder="E.g. USD">
  </li>
  <li>
    <label>Type:</label>
    <div>
      <label for="deposit">Deposit</label>
      <input name="type" id="deposit" type="radio" value="${TYPE_DEPOSIT}">
      <label for="withdrawal">Withdrawal</label>
      <input name="type" id="withdrawal" type="radio" value="${TYPE_WITHDRAWAL}">
    </div>
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
    this.dateInput = this.shadowRoot.querySelector("#date");
    this.symbolInput = this.shadowRoot.querySelector("#symbol");
    this.amountInput = this.shadowRoot.querySelector("#amount");
    this.exchangeInput = this.shadowRoot.querySelector("#exchange");
    this.depositInput = this.shadowRoot.querySelector("#deposit");
    this.depositInput.checked = true;

    this.symbolInput.value = databaseConnector.getMostUsedCurrency();

    const button = this.shadowRoot.querySelector("button");

    button.addEventListener("click", () => {
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
    this.exchangeInput = "";
    this.depositInput.checked = true;
  }
}

customElements.define("hk-add-fiat-transaction", AddAsset);
