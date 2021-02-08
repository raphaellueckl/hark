import { databaseConnector } from "../../data/database-connector.js";
import { store } from "../../store.js";
import {
  resetUL,
  BREAKPOINT_TABLET,
  BREAKPOINT_DESKTOP,
} from "../../css-globals.js";
import { EVENT_UPDATED_FIAT_TRANSACTIONS } from "../../globals.js";

import "./fiat-transaction-row.js";

class AssetList extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>
      ${resetUL}

      @media (min-width: ${BREAKPOINT_TABLET}px) and (max-width: ${
      BREAKPOINT_DESKTOP - 1
    }px) {
        li {
          margin: 0 40px;
        }
      }
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

  _updateList(fiatTransactionList) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.textContent = "";
    const listHtml = fiatTransactionList.map((transaction, index) => {
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
