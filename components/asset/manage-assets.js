import { databaseConnector } from "../../data/database-connector.js";
import { store } from "../../store.js";
import {
  resetUL,
  BREAKPOINT_TABLET,
  BREAKPOINT_DESKTOP,
} from "../../css-globals.js";
import { EVENT_ASSETS_UPDATED } from "../../globals.js";

import "./manage-asset-row.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}
  
  .manage-assets {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .enlarged-input {
    margin-bottom: 12px;
  }

  @media (min-width: ${BREAKPOINT_TABLET}px) and (max-width: ${
  BREAKPOINT_DESKTOP - 1
}px) {
    li {
      margin: 0 40px;
    }
  }
</style>
<div class="manage-assets">
  <label class="enlarged-input">
    Detailed View:
    <input type="checkbox" id="enlarged-input" />
  </label>
  
  <ul>
    <!-- generated -->
  </ul>
</div>`;

let enlarge = false;

class AssetList extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const minimizeButton = this.shadowRoot.querySelector("#enlarged-input");
    minimizeButton.addEventListener("change", (ev) => this._handleEnlarge(ev));
    if (enlarge) {
      minimizeButton.setAttribute("checked", "");
    }

    const assets = databaseConnector.getAssets() || [];

    this._updateList(assets);

    store.addEventListener(EVENT_ASSETS_UPDATED, ({ detail: assetList }) => {
      this._updateList(assetList);
    });
  }

  _handleEnlarge(ev) {
    enlarge = ev.target.checked;
    setTimeout(() => {
      const allRows = [
        ...this.shadowRoot.querySelectorAll("hk-manage-asset-row"),
      ];

      if (enlarge) {
        allRows.forEach((mar) => mar.setAttribute("large", ""));
      } else {
        allRows.forEach((mar) => mar.removeAttribute("large"));
      }
    });
  }

  _updateList(assets) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.textContent = "";
    const listHtml = assets.map((asset, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<hk-manage-asset-row index="${index}" asset='${JSON.stringify(
        asset
      )}' ${enlarge ? "large" : "barsche"}></hk-manage-asset-row>`;
      return li;
    });
    listHtml.forEach((asset) => ul.appendChild(asset));
  }
}

customElements.define("hk-manage-assets", AssetList);
