const BAR_END = "20";
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
    stroke-width:50;
    transition: stroke-width 0.2s;
  }
  
  .data-line:hover {
    stroke-width:65;
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
    <line class="data-line positive" x1="80" y1="${BAR_END}" x2="80" y2="${BAR_START}" />
    <line class="data-line negative" x1="170" y1="${BAR_END}" x2="170" y2="${BAR_START}" />
    <line id="bottom-line" x1="20" y1="220" x2="230" y2="220" />
    <text id="positive" x="80" y="240">1000</text>
    <text id="negative" x="170" y="240">2000</text>
  </svg>
</div>`;

const ALL_HEX_VALUES = "0123456789ABCDEF";
const DEFAULT_STROKE_WIDTH = "50";
const STEPS_UNTIL_FULL_CIRCLE = 503;

function getRandomizedHex() {
  return `#${[...Array(6)]
    .map(() => ALL_HEX_VALUES.charAt(Math.random() * 16))
    .join("")}`;
}

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

  _highlightEntry = (entry) => {
    entry.style.strokeWidth = "65";
    this.assetName.textContent = entry.assetName;
    this.percentage.textContent = `${entry.percentage.toFixed(1)} %`;
  };

  _unhighlightEntry = (entry) => {
    entry.style.strokeWidth = DEFAULT_STROKE_WIDTH;
    this.assetName.textContent = undefined;
    this.percentage.textContent = undefined;
  };

  /**
   * key: asset.category + asset.symbol
   */
  _highByAssetCompoundKey = (key) => {
    const circleFragments = [...this.shadowRoot.querySelectorAll("circle")];
    for (const asset of circleFragments) {
      if (asset.key !== key) {
        this._unhighlightEntry(asset);
      } else {
        this._highlightEntry(asset);
        break;
      }
    }
  };

  _chartUpdater(positive, negative) {
    const highestDataNumber = positive > negative ? positive : negative;
    const multiplicator = BAR_MAX_HEIGHT / highestDataNumber;
    const positiveHeight = positive * multiplicator;
    const negativeHeight = negative * multiplicator;

    const positiveYEnd = BAR_START - positiveHeight;
    const negativeYEnd = BAR_START - negativeHeight;
    debugger;
    this.shadowRoot.querySelector(".positive").setAttribute("y1", positiveYEnd);
    this.shadowRoot.querySelector(".negative").setAttribute("y1", negativeYEnd);

    //

    // const svg = this.shadowRoot.querySelector("svg");
    // let accumulatedDegree = 0;
    // for (let i = 0; i < chartData.length; i++) {
    //   const entry = document.createElementNS(
    //     "http://www.w3.org/2000/svg",
    //     "circle"
    //   );
    //   entry.setAttribute("class", "value");
    //   entry.setAttribute("cx", "125");
    //   entry.setAttribute("cy", "125");
    //   entry.setAttribute("r", "80");
    //   entry.setAttribute("stroke", getRandomizedHex());
    //   entry.setAttribute("stroke-width", DEFAULT_STROKE_WIDTH);
    //   entry.setAttribute("fill", "none");
    //   entry.setAttribute("stroke-dasharray", STEPS_UNTIL_FULL_CIRCLE);
    //   entry.setAttribute(
    //     "stroke-dashoffset",
    //     STEPS_UNTIL_FULL_CIRCLE -
    //       (STEPS_UNTIL_FULL_CIRCLE / sumOfValues) * chartData[i].weight
    //   );
    //   entry.setAttribute(
    //     "style",
    //     `transform: rotate(${accumulatedDegree}deg);`
    //   );
    //   entry.setAttribute("title", chartData[i].name);
    //   entry.key = chartData[i].key;
    //   entry.percentage = (100 / sumOfValues) * chartData[i].weight;
    //   entry.assetName = chartData[i].name;

    //   entry.addEventListener("mouseenter", () => {
    //     this._highlightEntry(entry);
    //   });

    //   entry.addEventListener("mouseleave", () => {
    //     this._unhighlightEntry(entry);
    //   });

    //   const title = document.createElementNS(
    //     "http://www.w3.org/2000/svg",
    //     "title"
    //   );
    //   title.textContent = chartData[i].name;
    //   entry.appendChild(title);
    //   svg.appendChild(entry);

    //   accumulatedDegree +=
    //     (360 / STEPS_UNTIL_FULL_CIRCLE) *
    //     (STEPS_UNTIL_FULL_CIRCLE / sumOfValues) *
    //     chartData[i].weight;
    // }

    // this.assetName = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "text"
    // );
    // this.assetName.style.color = "#000000";
    // this.assetName.setAttributeNS(null, "x", "50%");
    // this.assetName.setAttributeNS(null, "y", "50%");
    // this.assetName.setAttributeNS(null, "text-anchor", "middle");
    // svg.appendChild(this.assetName);

    // this.percentage = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "text"
    // );
    // this.percentage.style.color = "#000000";
    // this.percentage.setAttributeNS(null, "x", "50%");
    // this.percentage.setAttributeNS(null, "y", "60%");
    // this.percentage.setAttributeNS(null, "text-anchor", "middle");
    // svg.appendChild(this.percentage);
  }
}

customElements.define("hk-histogram-chart", HistogramChart);
