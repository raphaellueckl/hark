import { numberToLocal } from "../../globals.js";

const BAR_END = "50";
const BAR_START = "220";
const BAR_MAX_HEIGHT = BAR_START - BAR_END;

const template = document.createElement("template");
template.innerHTML = `
<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 250px;
  }

  .positive {
    stroke:#09d64a;
  }
  
  .data-line {
    stroke-width:45;
    transition: stroke-width 0.2s;
  }
  
  .data-line:hover {
    stroke-width:60;
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
</style>

<div>
  <h2></h2>
  <svg height="250" width="250">
    <text id="difference" x="125" y="30"></text>
    <line class="data-line positive" x1="80" y1="${BAR_END}" x2="80" y2="${BAR_START}" />
    <line class="data-line negative" x1="170" y1="${BAR_END}" x2="170" y2="${BAR_START}" />
    <line id="bottom-line" x1="20" y1="220" x2="230" y2="220" />
    <text id="positive" x="80" y="240"></text>
    <text id="negative" x="170" y="240"></text>
  </svg>
</div>`;

class HistogramChart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["title", "data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title") {
      this.shadowRoot.querySelector("h2").textContent = newValue;
    } else if (name === "data") {
      /**
       * data: {name, value, weight, key}
       */
      let chartData = undefined;
      try {
        chartData = JSON.parse(newValue);
        this._chartUpdater(chartData.positive, chartData.negative);
      } catch (e) {
        console.error("Failed to update chart data.", e);
      }
    }
  }

  _chartUpdater(positive, negative) {
    const highestDataNumber = positive > negative ? positive : negative;
    const multiplicator = BAR_MAX_HEIGHT / highestDataNumber;
    const positiveHeight = positive * multiplicator;
    const negativeHeight = negative * multiplicator;

    const positiveYEnd = BAR_START - positiveHeight;
    const negativeYEnd = BAR_START - negativeHeight;
    this.shadowRoot.querySelector(".positive").setAttribute("y1", positiveYEnd);
    this.shadowRoot.querySelector(".negative").setAttribute("y1", negativeYEnd);
    this.shadowRoot.querySelector("#positive").textContent = numberToLocal(
      positive.toFixed(2)
    );
    this.shadowRoot.querySelector("#negative").textContent = numberToLocal(
      negative.toFixed(2)
    );
    this.shadowRoot.querySelector("#difference").textContent = `${
      positive - negative > 0 ? "+" : "-"
    } ${numberToLocal(Math.abs(positive - negative).toFixed(2))} CHF`;
  }
}

customElements.define("hk-histogram-chart", HistogramChart);
