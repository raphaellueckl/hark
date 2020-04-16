import { databaseConnector } from "../data/database-connector.js";
import { store } from "../store.js";
import { resetUL } from "../css-globals.js";
import { EVENT_ASSETS_UPDATED } from "../globals.js";

import "./manage-asset-row.js";

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

    store.addEventListener(EVENT_ASSETS_UPDATED, ({ detail: assetList }) => {
      this._updateList(assetList);
    });
  }

  _updateList(assets) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.textContent = "";
    const listHtml = assets.map((asset, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<hk-manage-asset-row index="${index}" asset='${JSON.stringify(
        asset
      )}'></hk-manage-asset-row>`;
      return li;
    });
    listHtml.forEach((asset) => ul.appendChild(asset));
  }
}

customElements.define("hk-manage-assets", AssetList);