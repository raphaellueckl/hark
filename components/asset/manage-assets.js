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

  .minimized-input {
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
  <label class="minimized-input">
    Minimized:
    <input type="checkbox" id="minimize-input" checked/>
  </label>
  
  <ul>
    <!-- generated -->
  </ul>
</div>`;

class AssetList extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const minimizeButton = this.shadowRoot.querySelector("#minimize-input");
    minimizeButton.addEventListener("change", (ev) => this._handleMinimize(ev));
    this._handleMinimize({ target: { checked: true } });

    const assets = databaseConnector.getAssets() || [];

    this._updateList(assets);

    store.addEventListener(EVENT_ASSETS_UPDATED, ({ detail: assetList }) => {
      this._updateList(assetList);
    });
  }

  _handleMinimize(ev) {
    const checked = ev.target.checked;
    setTimeout(() => {
      const allRows = [
        ...this.shadowRoot.querySelectorAll("hk-manage-asset-row"),
      ];

      if (checked) {
        allRows.forEach((mar) => mar.removeAttribute("large"));
      } else {
        allRows.forEach((mar) => mar.setAttribute("large", ""));
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
      )}' large></hk-manage-asset-row>`;
      return li;
    });
    listHtml.forEach((asset) => ul.appendChild(asset));
  }
}

customElements.define("hk-manage-assets", AssetList);
