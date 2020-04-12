import { databaseConnector } from "../data/database-connector.js";
import { store } from "../store.js";

import "./asset-row.js";
import { resetUL } from "../css-globals.js";

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
      li.innerHTML = `<hk-asset index="${index}" asset='${JSON.stringify(
        asset
      )}'></hk-asset>`;
      return li;
    });
    listHtml.forEach(asset => ul.appendChild(asset));
  }
}

customElements.define("hk-manage-assets", AssetList);
