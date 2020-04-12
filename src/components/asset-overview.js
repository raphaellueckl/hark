import { priceFetcher } from "../data/price-fetcher.js";
import { resetUL } from "../css-globals.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    ${resetUL}
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

    priceFetcher.enrichAssetsWithPrice().then(assets => {
      const listHtml = assets.map(asset => {
        const li = document.createElement("li");
        li.innerHTML = `
          <label>Asset: <input value="${asset.asset}"></label>
          <label>Symbol: <input value="${asset.symbol}"></label>
          <label>Category: <input value="${asset.category}"></label>
          <label>Amount: <input value="${asset.amount}"></label>
          <label>Price: <input value="${asset.value}"></label>
          <label>Value: <input value="${asset.value * asset.amount}"></label>`;
        return li;
      });
      listHtml.forEach(asset => ul.appendChild(asset));
    });
  }
}

customElements.define("hk-asset-overview", DashboardList);
