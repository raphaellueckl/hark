import { databaseConnector } from "../data/database-connector.js";
import { store } from "../store.js";

class AssetList extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>
    </style>
    <ul>
        <!-- generated -->
    </ul>`;
    const assets = databaseConnector.getAssets() || [];

    this._updateList(assets);

    store.addEventListener("updated_assets", ({ detail: assetList }) => {
      this._updateList(assetList);
    });
  }

  _updateList(assets) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.textContent = "";
    const listHtml = assets.map((asset, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
          <label>Asset: <input value="${asset.asset}"></label>
          <label>Symbol: <input value="${asset.symbol}"></label>
          <label>Category: <input value="${asset.category}"></label>
          <label>Amount: <input value="${asset.amount}"></label>
          <button id="${index}">-</button>`;
      return li;
    });
    listHtml.forEach(asset => ul.appendChild(asset));
    [...this.shadowRoot.querySelectorAll("button")].forEach(button =>
      button.addEventListener("click", e => {
        const indexOfAsset = +e.srcElement.id;
        store.dispatchEvent(
          new CustomEvent("removeassetbyindex", { detail: indexOfAsset })
        );
      })
    );
  }
}

customElements.define("hk-asset-list", AssetList);
