import { store } from "../../store.js";
import "./chart.js";

const template = document.createElement("template");

template.innerHTML = `
<style>
  div {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
<div>
  <hk-chart title="Assets"></hk-chart>
  <hk-chart title="Asset Spread"></hk-chart>
</div>`;

class Chart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    store.addEventListener("updated_assets-price", this._updateAssetChart);
    store.addEventListener("updated_assets-price", this._updateSpreadChart);

    this.assetChart = this.shadowRoot.querySelector("hk-chart[title='Assets']");
    store.addEventListener(
      "mouseoverasset",
      this._changeChartAssetHighlighting
    );
    store.addEventListener(
      "mouseleaveasset",
      this._changeChartAssetHighlighting
    );
  }

  _changeChartAssetHighlighting = ({ detail: compoundKey }) => {
    if (compoundKey) {
      this.assetChart.setAttribute("selected", compoundKey);
    } else {
      this.assetChart.removeAttribute("selected");
    }
  };

  /**
   * assetlist: {symbol, asset, category, amount, value}
   */
  _updateAssetChart = ({ detail: assetList }) => {
    const sumOfValues = assetList
      .map(v => +v.value * +v.amount)
      .reduce((a, b) => a + b, 0);
    let chartData = assetList.map(asset => ({
      name: asset.asset,
      value: asset.value,
      weight: Number(asset.value * asset.amount),
      key: asset.category + asset.symbol
    }));
    chartData.sort((a, b) => b.value - a.value);

    this.shadowRoot
      .querySelector("hk-chart[title='Assets']")
      .setAttribute("data", JSON.stringify({ sumOfValues, data: chartData }));
  };

  _updateSpreadChart = ({ detail: assetList }) => {
    const sumOfValues = assetList
      .map(v => +v.value * +v.amount)
      .reduce((a, b) => a + b, 0);

    let chartData = assetList.map(asset => ({
      name: asset.category,
      value: asset.value,
      weight: Number(asset.value * asset.amount)
    }));
    chartData.sort((a, b) => b.value - a.value);

    let accumulatedCryptos = assetList
      .filter(asset => asset.category === "crypto")
      .reduce((accumulation, b) => accumulation + +b.value * +b.amount, 0);
    let accumulatedResources = assetList
      .filter(asset => asset.category === "resource")
      .reduce((accumulation, b) => accumulation + +b.value * +b.amount, 0);
    let accumulatedStocks = assetList
      .filter(asset => asset.category === "stock")
      .reduce((accumulation, b) => accumulation + +b.value * +b.amount, 0);

    this.shadowRoot
      .querySelector("hk-chart[title='Asset Spread']")
      .setAttribute(
        "data",
        JSON.stringify({
          sumOfValues,
          data: [
            {
              name: "crypto",
              value: accumulatedCryptos,
              weight: accumulatedCryptos
            },
            {
              name: "resource",
              value: accumulatedResources,
              weight: accumulatedResources
            },
            {
              name: "stock",
              value: accumulatedStocks,
              weight: accumulatedStocks
            }
          ]
        })
      );
  };
}

customElements.define("hk-asset-spread-chart", Chart);
