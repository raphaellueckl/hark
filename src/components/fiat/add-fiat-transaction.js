import { store } from "../../store.js";
import { resetUL } from "../../css-globals.js";
import {
  EVENT_UPDATE_FIAT_TRANSACTION,
  TYPE_DEPOSIT,
  TYPE_WITHDRAWAL,
} from "../../globals.js";

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
    <label for="date">Date:</label>
    <input id="date">
  </li>
  <li>
    <label for="symbol">Currency:</label>
    <input id="symbol">
  </li>
  <li>
    <label for="amount">Amount:</label>
    <input id="amount">
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
    this.depositInput = this.shadowRoot.querySelector("#deposit");
    this.depositInput.checked = true;

    const button = this.shadowRoot.querySelector("button");

    button.addEventListener("click", () => {
      const type = [
        ...this.shadowRoot.querySelectorAll('input[name="type"]'),
      ].filter((r) => r.checked === true)[0].value;
      const addTransaction = {
        date: this.dateInput.value,
        symbol: this.symbolInput.value,
        amount: this.amountInput.value,
        type,
      };

      store.dispatchEvent(
        new CustomEvent(EVENT_UPDATE_FIAT_TRANSACTION, {
          detail: addTransaction,
        })
      );
      this._clearInputs();
    });
  }

  _clearInputs() {
    this.dateInput.value = "";
    this.symbolInput.value = "";
    this.amountInput.value = "";
    this.depositInput.checked = true;
  }
}

customElements.define("hk-add-fiat-transaction", AddAsset);
