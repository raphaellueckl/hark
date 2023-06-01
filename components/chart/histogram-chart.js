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
    width: 40%;
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

  .positive {
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
      <line class="positive" x1="80" y1="${BAR_END}" x2="80" y2="${BAR_START}" />
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
    this.positiveBarEl = this.shadowRoot.querySelector(".positive");
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
        const { greenBar, redBar, inputOutputDelta } =
          JSON.parse(newValue) || {};
        if (greenBar && redBar && inputOutputDelta) {
          this._chartUpdater(greenBar, redBar);
          this._updateTotalReturn(greenBar, inputOutputDelta);
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

  _chartUpdater(greenBarValue, redBarValue) {
    const highestDataNumber =
      greenBarValue > redBarValue ? greenBarValue : redBarValue;
    const multiplicator = BAR_MAX_HEIGHT / highestDataNumber;
    const positiveHeight = greenBarValue * multiplicator;
    const negativeHeight = redBarValue * multiplicator;

    const positiveYEnd = BAR_START - positiveHeight;
    const negativeYEnd = BAR_START - negativeHeight;
    this.positiveBarEl.setAttribute("y1", positiveYEnd);
    this.negativeBarEl.setAttribute("y1", negativeYEnd);
    this.positiveTextEl.textContent = numberToLocal(greenBarValue.toFixed(2));
    this.negativeTextEl.textContent = numberToLocal(redBarValue.toFixed(2));
    this.shadowRoot.querySelector("#difference").textContent = `${
      greenBarValue - redBarValue > 0 ? "+" : "-"
    } ${numberToLocal(Math.abs(greenBarValue - redBarValue).toFixed(2))} CHF`;

    if (redBarValue <= 0) {
      this.positiveBarEl.setAttribute("x1", CENTER_X);
      this.positiveBarEl.setAttribute("x2", CENTER_X);
      this.positiveTextEl.setAttribute("x", CENTER_X);
      this.negativeTextEl.style.display = "none";
      this.negativeBarEl.style.display = "none";
      this.bottomLineEl.setAttribute("x1", "60");
      this.bottomLineEl.setAttribute("x2", "190");
    }
  }

  _updateTotalReturn(greenBarValue, inputOutputDelta) {
    let multiplicator = 0;
    let percentage = 0;
    multiplicator = greenBarValue / Math.abs(inputOutputDelta);
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
