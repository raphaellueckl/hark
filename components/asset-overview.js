import { priceFetcher } from "../data/price-fetcher.js";
import { resetUL, ITEM_BACKGROUND } from "../css-globals.js";
import { store } from "../store.js";
import { numberToLocal } from "../globals.js";
import { databaseConnector } from "../data/database-connector.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    ${resetUL}

    ul {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }

    li {
      width: 200px;
      padding: 20px;
      margin: 10px;
      background-color: ${ITEM_BACKGROUND};
      border-radius: 15px;

      display: grid;
      grid-gap: 0 10px;
      grid-template-columns: 1fr 2fr;
      justify-content: space-between;
    }

    .outdated {
      background-color: blue;
    }

    label {
      display: flex;
      justify-content: space-between;
    }

    .value {
      display: flex;
      justify-content: flex-end;
      word-break: break-all;
    }
  </style>
  <ul>
      <!-- generated -->
  </ul>
`;

class DashboardList extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const ul = this.shadowRoot.querySelector("ul");

    priceFetcher.enrichAssetsWithPrice().then((assets) => {
      assets.sort((a, b) =>
        a.value > b.value ? -1 : b.value > a.value ? 1 : 0
      );
      const listHtml = assets.map((asset) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>Asset:</span><span class="value">${asset.asset}</span>
          <span>Value:</span><span class="value">${numberToLocal(
            Number(asset.fixedValue ? asset.fixedValue : asset.value).toFixed(2)
          )} CHF</span>
          <span>Price:</span><span class="value">${numberToLocal(
            Number(asset.price).toFixed(2)
          )} CHF</span>
          <span>Amount:</span><span class="value">${numberToLocal(
            asset.amount
          )}</span>
          <span>Symbol:</span><span class="value">${asset.symbol}</span>
          <span>Category:</span><span class="value">${asset.category}</span>`;

        // Those events will highlight the asset in the chart
        li.addEventListener("mouseover", () => {
          store.dispatchEvent(
            new CustomEvent("mouseoverasset", {
              detail: asset.category + asset.symbol,
            })
          );
        });
        li.addEventListener("mouseleave", () => {
          store.dispatchEvent(new CustomEvent("mouseleaveasset"));
        });

        return li;
      });
      listHtml.forEach((asset) => ul.appendChild(asset));
    });
  }
}

customElements.define("hk-asset-overview", DashboardList);
