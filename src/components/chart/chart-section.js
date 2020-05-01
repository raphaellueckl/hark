import { store } from "../../store.js";
import "./pie-chart.js";
import "./histogram-chart.js";
import {
  EVENT_ASSETS_UPDATED,
  EVENT_UPDATED_FIAT_TRANSACTIONS,
  TYPE_DEPOSIT,
  TYPE_WITHDRAW,
  CATEGORY_CRYPTO,
  CATEGORY_RESOURCE,
  CATEGORY_STOCK,
  CATEGORY_CURRENCY
} from "../../globals.js";
import { databaseConnector } from "../../data/database-connector.js";

const ATTRIBUTE_TOTAL_RETURN = 'title="Total Return (CHF)"';
const ATTRIBUTE_ASSETS = 'title="Assets"';
const ATTRIBUTE_ASSETS_SPREAD = 'title="Asset Spread"';

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
  <hk-histogram-chart ${ATTRIBUTE_TOTAL_RETURN}></hk-histogram-chart>
  <hk-chart ${ATTRIBUTE_ASSETS}></hk-chart>
  <hk-chart ${ATTRIBUTE_ASSETS_SPREAD}></hk-chart>
</div>`;

class Chart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    store.addEventListener(EVENT_ASSETS_UPDATED, this._updateAssetChart);
    store.addEventListener(EVENT_ASSETS_UPDATED, this._updateSpreadChart);
    store.addEventListener(
      EVENT_UPDATED_FIAT_TRANSACTIONS,
      this._updateTotalReturnChartByTransactions
    );
    store.addEventListener(
      EVENT_ASSETS_UPDATED,
      this._updateTotalReturnChartByAssets
    );

    const transactions = databaseConnector.getFiatTransactions();
    this._updateTotalReturnChartByTransactions({ detail: transactions });

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
    const sumOfValues = assetList.map(v => +v.value).reduce((a, b) => a + b, 0);
    let chartData = assetList.map(asset => ({
      name: asset.asset,
      value: asset.value,
      weight: Number(asset.value),
      key: asset.category + asset.symbol
    }));
    chartData.sort((a, b) => b.value - a.value);

    this.shadowRoot
      .querySelector(`hk-chart[${ATTRIBUTE_ASSETS}]`)
      .setAttribute("data", JSON.stringify({ sumOfValues, data: chartData }));
  };

  _updateTotalReturnChartByTransactions = ({ detail: transactionList }) => {
    this.combinedDepositsValue = transactionList
      .filter(tr => tr.type === TYPE_DEPOSIT)
      .map(tr => +tr.amount)
      .reduce((a, b) => a + b, 0);
    this.combinedWithdrawalsValue = transactionList
      .filter(tr => tr.type === TYPE_WITHDRAW)
      .map(tr => +tr.amount)
      .reduce((a, b) => a + b, 0);

    if (isNaN(this.combinedAssetsTotalValue)) return;

    const totalValue =
      this.combinedWithdrawalsValue + this.combinedAssetsTotalValue;
    this.shadowRoot
      .querySelector(`hk-histogram-chart[${ATTRIBUTE_TOTAL_RETURN}]`)
      .setAttribute(
        "data",
        JSON.stringify({
          positive: totalValue,
          negative: this.combinedDepositsValue
        })
      );
  };

  _updateTotalReturnChartByAssets = ({ detail: assetList }) => {
    this.combinedAssetsTotalValue = assetList
      .map(a => +a.value)
      .reduce((a, b) => a + b, 0);

    if (isNaN(this.combinedWithdrawalsValue)) return;

    const totalValue =
      this.combinedWithdrawalsValue + this.combinedAssetsTotalValue;
    this.shadowRoot
      .querySelector(`hk-histogram-chart[${ATTRIBUTE_TOTAL_RETURN}]`)
      .setAttribute(
        "data",
        JSON.stringify({
          positive: totalValue,
          negative: this.combinedDepositsValue
        })
      );
  };

  _updateSpreadChart = ({ detail: assetList }) => {
    const sumOfValues = assetList.map(v => +v.value).reduce((a, b) => a + b, 0);

    let chartData = assetList.map(asset => ({
      name: asset.category,
      value: asset.value,
      weight: Number(asset.value)
    }));
    chartData.sort((a, b) => b.value - a.value);

    let accumulatedCryptos = assetList
      .filter(asset => asset.category === CATEGORY_CRYPTO)
      .reduce((accumulation, b) => accumulation + +b.value, 0);
    let accumulatedResources = assetList
      .filter(asset => asset.category === CATEGORY_RESOURCE)
      .reduce((accumulation, b) => accumulation + +b.value, 0);
    let accumulatedStocks = assetList
      .filter(asset => asset.category === CATEGORY_STOCK)
      .reduce((accumulation, b) => accumulation + +b.value, 0);
    let accumulatedCurrencies = assetList
      .filter(asset => asset.category === CATEGORY_CURRENCY)
      .reduce((accumulation, b) => accumulation + +b.value, 0);

    this.shadowRoot
      .querySelector(`hk-chart[${ATTRIBUTE_ASSETS_SPREAD}]`)
      .setAttribute(
        "data",
        JSON.stringify({
          sumOfValues,
          data: [
            {
              name: CATEGORY_CRYPTO,
              value: accumulatedCryptos,
              weight: accumulatedCryptos
            },
            {
              name: CATEGORY_RESOURCE,
              value: accumulatedResources,
              weight: accumulatedResources
            },
            {
              name: CATEGORY_STOCK,
              value: accumulatedStocks,
              weight: accumulatedStocks
            },
            {
              name: CATEGORY_CURRENCY,
              value: accumulatedCurrencies,
              weight: accumulatedCurrencies
            }
          ]
        })
      );
  };
}

customElements.define("hk-asset-spread-chart", Chart);
