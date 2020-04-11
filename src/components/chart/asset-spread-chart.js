import { store } from "../../store.js";
import "./chart.js";

const template = document.createElement("template");

template.innerHTML = `
  <hk-chart title="Asset Spread"></hk-chart>`;

class Chart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    store.addEventListener("updated_assets-price", this._chartUpdater);
  }

  _chartUpdater = ({ detail: assetList }) => {
    const sumOfValues = assetList
      .map(v => +v.value * +v.amount)
      .reduce((a, b) => a + b, 0);
    let chartData = assetList.map(asset => ({
      name: asset.asset,
      value: asset.value,
      weight: Number(asset.value * asset.amount)
    }));

    chartData.sort((a, b) => b.value - a.value);

    this.shadowRoot
      .querySelector("hk-chart")
      .setAttribute("data", JSON.stringify({ sumOfValues, data: chartData }));
  };
}

customElements.define("hk-asset-spread-chart", Chart);
