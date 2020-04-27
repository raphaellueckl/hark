import { priceFetcher } from "../data/price-fetcher.js";
import { resetUL } from "../css-globals.js";
import { store } from "../store.js";
import { numberToLocal } from "../globals.js";

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
      display: flex;
      flex-direction: column;
      padding: 20px;
    }

    label {
      display: flex;
      justify-content: space-between;
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
      const listHtml = assets.map((asset) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <label><span>Asset:</span><span>${asset.asset}</span></label>
          <label><span>Value:</span><span>${numberToLocal(
            Number(asset.value).toFixed(2)
          )}</span></label>
          <label><span>Price:</span><span>${numberToLocal(
            Number(asset.price).toFixed(2)
          )} CHF</span></label>
          <label><span>Amount:</span><span>${numberToLocal(
            asset.amount
          )}</span></label>
          <label><span>Symbol:</span><span>${asset.symbol}</span></label>
          <label><span>Category:</span><span>${asset.category}</span></label>`;

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
