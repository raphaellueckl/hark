import { numberToLocal } from "../../globals.js";
import { widgetContainerStyles } from "../../css-globals.js";

import "../spinner.js";

const BAR_END = 100;
const BAR_START = 295;
const CENTER_X = 125;
const BAR_MAX_HEIGHT = BAR_START - BAR_END;

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${widgetContainerStyles}

  .total-return {
    display: flex;
    justify-content: space-between;
    width: 60%;
    margin-bottom: -18px;
  }

  .total-return > span {
    font-weight: 600;
    font-size: 16px;
    max-width: 250px;
  }

  .after-loaded {
    display: none;
  }

  .withdrawn {
    stroke:#1FA3F0;
  }

  .total-assets-value {
    stroke:#09d64a;
  }

  .data-line {
    stroke-width:45;
    transition: stroke-width 0.2s, font-size 0.2s;
  }

  .data-line:hover {
    stroke-width:60;
    font-size: 20px;
  }

  .negative {
    stroke:rgb(255,0,0);
  }
  
  text {
    text-anchor: middle;
  }

  #bottom-line {
    stroke:#000;
    stroke-width:2;
  }

  svg {
    margin-bottom: 10px;
  }

  #difference {
    font-weight: 600;
    font-size: 20px;
    max-width: 250px;
    word-break: break-word;
  }

  .hidden {
    display: none;
  }
</style>

<div class="widget-container">
  <h2></h2>
  <hk-spinner></hk-spinner>
  <div class="total-return hidden">
    <span id="total-return-multiplicator"></span>
    <span id="total-return-percentage"></span>
  </div>
  <svg height="335" width="250" class="hidden">
    <text id="difference" x="125" y="50"></text>
    <g class="data-line">
      <line class="withdrawn" x1="80" y1="${BAR_END}" x2="80" y2="${BAR_START}" />
      <line class="total-assets-value" x1="80" y1="${BAR_END}" x2="80" y2="${BAR_START}" />
      <text id="positive" x="80" y="${BAR_START + 20}"></text>
    </g>
    <g class="data-line">
      <line class="negative" x1="170" y1="${BAR_END}" x2="170" y2="${BAR_START}" />
      <text id="negative" x="170" y="${BAR_START + 20}"></text>
    </g>
    <line id="bottom-line" x1="20" y1="${BAR_START}" x2="230" y2="${BAR_START}" />
  </svg>
</div>`;

class HistogramChart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.titleEl = this.shadowRoot.querySelector("h2");
    this.totalAssetsValueBarEl = this.shadowRoot.querySelector(
      ".total-assets-value"
    );
    this.withdrawnBarEl = this.shadowRoot.querySelector(".withdrawn");
    this.negativeBarEl = this.shadowRoot.querySelector(".negative");
    this.positiveTextEl = this.shadowRoot.querySelector("#positive");
    this.negativeTextEl = this.shadowRoot.querySelector("#negative");
    this.bottomLineEl = this.shadowRoot.querySelector("#bottom-line");
    this.totalReturnMultiplicator = this.shadowRoot.querySelector(
      "#total-return-multiplicator"
    );
    this.totalReturnPercentage = this.shadowRoot.querySelector(
      "#total-return-percentage"
    );
  }

  static get observedAttributes() {
    return ["title", "data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title") {
      this.titleEl.textContent = newValue;
    } else if (name === "data") {
      /**
       * data: {name, value, weight, key}
       */
      this.shadowRoot.querySelector("hk-spinner").classList.add("hidden");
      this.shadowRoot.querySelector("svg").classList.remove("hidden");
      this.shadowRoot.querySelector(".total-return").classList.remove("hidden");
      let chartData = undefined;

      try {
        const {
          totalValue,
          redBar,
          inputOutputDelta,
          deposited,
          withdrawn,
          combinedAssetsValue,
        } = JSON.parse(newValue) || {};
        if (totalValue && redBar && inputOutputDelta) {
          this._chartUpdater(
            totalValue,
            redBar,
            deposited,
            withdrawn,
            combinedAssetsValue
          );
          this._updateTotalReturn(totalValue, inputOutputDelta);
        } else {
          this.shadowRoot
            .querySelector(".widget-container")
            .classList.add("hidden");
        }
      } catch (e) {
        console.error("Failed to update chart data.", e);
      }
    }
  }

  _chartUpdater(
    totalValue,
    redBarValue,
    deposited,
    withdrawn,
    combinedAssetsValue
  ) {
    const highestDataNumber =
      totalValue > redBarValue ? totalValue : redBarValue;
    const multiplicator = BAR_MAX_HEIGHT / highestDataNumber;
    const withdrawnHeight = withdrawn * multiplicator;
    const totalAssetsValueHeight = combinedAssetsValue * multiplicator;
    const negativeHeight = redBarValue * multiplicator;

    const withdrawnYEnd = BAR_START - withdrawnHeight;
    const totalAssetsValueYEnd = withdrawnYEnd - totalAssetsValueHeight;
    const negativeYEnd = BAR_START - negativeHeight;
    this.withdrawnBarEl.setAttribute("y1", withdrawnYEnd);
    this.totalAssetsValueBarEl.setAttribute("y2", withdrawnYEnd);
    this.totalAssetsValueBarEl.setAttribute("y1", totalAssetsValueYEnd);
    this.negativeBarEl.setAttribute("y1", negativeYEnd);
    this.positiveTextEl.textContent = numberToLocal(totalValue.toFixed(2));
    this.negativeTextEl.textContent = numberToLocal(redBarValue.toFixed(2));
    this.shadowRoot.querySelector("#difference").textContent = `${
      totalValue - redBarValue > 0 ? "+" : "-"
    } ${numberToLocal(Math.abs(totalValue - redBarValue).toFixed(2))} CHF`;

    if (redBarValue <= 0) {
      this.withdrawnBarEl.setAttribute("x1", CENTER_X);
      this.withdrawnBarEl.setAttribute("x2", CENTER_X);
      this.totalAssetsValueBarEl.setAttribute("x1", CENTER_X);
      this.totalAssetsValueBarEl.setAttribute("x2", CENTER_X);
      this.positiveTextEl.setAttribute("x", CENTER_X);
      this.negativeTextEl.style.display = "none";
      this.negativeBarEl.style.display = "none";
      this.bottomLineEl.setAttribute("x1", "60");
      this.bottomLineEl.setAttribute("x2", "190");
    }
  }

  _updateTotalReturn(totalValue, inputOutputDelta) {
    let multiplicator = 0;
    let percentage = 0;
    multiplicator = totalValue / Math.abs(inputOutputDelta);
    if (inputOutputDelta > 0) {
      this.totalReturnMultiplicator.textContent = `∞x`;
      this.totalReturnPercentage.textContent = `∞%`;
    } else {
      percentage = (multiplicator * 100).toFixed(0);
      multiplicator = multiplicator.toFixed(1);
      this.totalReturnMultiplicator.textContent = `${multiplicator}x`;
      this.totalReturnPercentage.textContent = `${percentage}%`;
    }
  }
}

customElements.define("hk-histogram-chart", HistogramChart);
