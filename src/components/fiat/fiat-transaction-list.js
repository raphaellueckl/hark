import { databaseConnector } from "../../data/database-connector.js";
import { store } from "../../store.js";
import { resetUL } from "../../css-globals.js";
import { EVENT_UPDATED_FIAT_TRANSACTIONS } from "../../globals.js";

import "./fiat-transaction.js";

class AssetList extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>
      ${resetUL}
    </style>
    <ul>
        <!-- generated -->
    </ul>`;
    const transactions = databaseConnector.getFiatTransactions() || [];

    this._updateList(transactions);

    store.addEventListener(
      EVENT_UPDATED_FIAT_TRANSACTIONS,
      ({ detail: fiatTransactionList }) => {
        this._updateList(fiatTransactionList);
      }
    );
  }

  _updateList(assets) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.textContent = "";
    const listHtml = assets.map((transaction, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<hk-fiat-transaction index="${index}" transaction='${JSON.stringify(
        transaction
      )}'></hk-fiat-transaction>`;
      return li;
    });
    listHtml.forEach((transaction) => ul.appendChild(transaction));
  }
}

customElements.define("hk-fiat-transaction-list", AssetList);
