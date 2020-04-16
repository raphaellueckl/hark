import { store } from "../../store.js";
import { resetUL } from "../../css-globals.js";
import { EVENT_UPDATE_FIAT_TRANSACTION } from "../../globals.js";

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
    <label for="symbol">Currency:</label><input id="symbol">
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
    this.symbolInput = this.shadowRoot.querySelector("#symbol");
    this.amountInput = this.shadowRoot.querySelector("#amount");

    button.addEventListener("click", () => {
      const addTransaction = {
        symbol: this.symbolInput.value,
        amount: this.amountInput.value,
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
    this.symbolInput.value = "";
    this.amountInput.value = "";
  }
}

customElements.define("hk-add-fiat-transaction", AddAsset);
