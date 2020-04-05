import { databaseConnector } from "../../data/database-connector.js";
import { store } from "../../store.js";
import { resetUL } from "../../css-globals.js";

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
    // const assets = databaseConnector.getFiatTransactions() || [];

    // this._updateList(assets);

    // store.addEventListener(
    //   "updated_fiat_transactions",
    //   ({ detail: fiatTransactionList }) => {
    //     this._updateList(fiatTransactionList);
    //   }
    // );
  }

  _updateList(assets) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.textContent = "";
    const listHtml = assets.map((transaction, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<hk-fiat-transaction index="${index}" asset='${JSON.stringify(
        transaction
      )}'></hk-fiat-transaction>`;
      return li;
    });
    listHtml.forEach(asset => ul.appendChild(asset));
  }
}

customElements.define("hk-fiat-transaction-list", AssetList);
