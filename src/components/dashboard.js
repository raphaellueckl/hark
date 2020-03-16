import { databaseConnector } from "../data/database-connector.js";
import { priceFetcher } from "../data/price-fetcher.js";

class DashboardList extends HTMLElement {
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
    </ul>
  `;
    // const assets = databaseConnector.getAssets() || [];
    const ul = this.shadowRoot.querySelector("ul");

    priceFetcher.enrichAssetsWithPrice().then(assets => {
      const listHtml = assets.map(asset => {
        const li = document.createElement("li");
        li.innerHTML = `
                <label>Asset: <input value="${asset.asset}"></label>
                <label>Symbol: <input value="${asset.symbol}"></label>
                <label>Category: <input value="${asset.category}"></label>
                <label>Amount: <input value="${asset.amount}"></label>
                <label>Value: <input value="${asset.value}"></label>`;
        return li;
      });
      listHtml.forEach(asset => ul.appendChild(asset));
    });
  }
}

customElements.define("hk-dashboard", DashboardList);
